import { ErrorObject } from "ajv";
import produce from "immer";
import { v4 } from "uuid";
import Validator, { RootSchemaObject } from "validator";
import { StateCreator, UseStore } from "zustand";
import { Store, StoreListener, StoreStatus } from "./store";

/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 * @param initial The initial value of the store
 */

interface composeStoreProps<DataType> {
    schema: RootSchemaObject,
    initial?: {},
    definition?: string
    validator?: Validator<DataType>
    vanilla?: boolean
}

const composeGenericStore = <StoreType, DataType>(create: (storeCreator: StateCreator<Store<DataType>>) => UseStore<Store<DataType>>, options: composeStoreProps<DataType>) => {
    const { schema, definition, initial } = options;
    const validator = options.validator;
    const collection = definition ? definition : schema.$id ? schema.$id : "errorCollection"
    if (collection === "errorCollection") {
        throw new Error("invalid JSON schema");
    }
    /*
     * validate the initial state and show errors and filter invalid and process data.
     */
    const records: Record<string, DataType> = initial ? initial : {};
    const index: string[] = initial ? Object.keys(initial) : [];

    const status: StoreStatus = "booting"


    // Create the implementation of the store type now that we have the initial values prepared.

    return create((set, store) => ({
        schema,
        workspace: undefined,
        lazyLoadWorkspace: () => {
            return new Promise(async (complete) => {
                if (typeof store().workspace === "undefined") {
                    store().setStatus("warming-workspace");
                    const validator = await store().lazyLoadValidator();
                    const workspace = validator.makeWorkspace();
                    set({ workspace });
                    complete(workspace);
                } else {
                    complete(store().workspace!);
                }
            })
        },
        validator,
        collection,
        index,
        records,
        errors: [],
        statusHistory: [],
        setStatus: (status) => {
            set({ status, statusHistory: [...store().statusHistory.slice(0, 9), status] });
        },
        status,
        lazyLoadValidator: () => {
            return new Promise<Validator<DataType>>((complete, reject) => {
                if (store().status === "warming-validator") {
                    reject(new Error("Can't warm a validator while it's loading, you have a race condition. Wait for the Validator to be loaded instead of trying to lazy load it twice"))
                }
                if (typeof store().validator !== "undefined") {
                    complete(store().validator!);
                } else {
                    store().setStatus("warming-validator");
                    const validator = typeof definition === "string" ?
                        new Validator<DataType>(schema, definition) :
                        new Validator<DataType>(schema);
                    set({ validator });
                    store().setStatus("idle");
                    complete(validator);
                }
            }
            )
        },
        listeners: [],
        search: (query: string) => store()
            .filterIndex(x => Object.values(x).join("").toLowerCase()
                .includes(query.toLowerCase()))
            .map(key => (
                [key, store().retrieve(key)!]
            )),
        filter: (predicate: ((e: DataType) => boolean)) => store()
            .filterIndex(predicate).map(
                matchingItemIndex => store().retrieve(matchingItemIndex)!
            ),
        fetch: (id: string) => {
            store().setStatus("fetching")
            return new Promise<DataType>((resolve, reject) => {
                const cached = store().retrieve(id)
                store().setStatus("idle");
                store().listeners.forEach((listener) => {
                    listener(id, { ...cached }, "fetching");
                })
                if (cached) {
                    resolve(cached);
                } else {
                    reject()
                }
            });
        },
        filterIndex: (predicate: ((e: DataType) => boolean)) => store()
            .index
            .filter(
                itemIndex =>
                    predicate(store().retrieve(itemIndex)!)
            ),

        remove: (idToRemove) => {
            store().setStatus("removing");
            const index = store().index.filter(x => x !== idToRemove);
            if (store().index.length === index.length) {
                return false;
            }
            const records = { ...store().records };
            const oldRecord = { ...records[idToRemove] }
            delete records[idToRemove];
            let active = store().active;
            if (active && active === idToRemove) {
                active = undefined;
            }
            store().listeners.forEach(callback => callback(idToRemove, oldRecord, "removing"))
            set({ index, records, active });
            store().setStatus("idle");
            return true;
        },
        insert: (dataToAdd, optionalItemIndex) => {
            return new Promise<string>(async (resolve, reject) => {
                store().setStatus("inserting");
                const itemIndex = optionalItemIndex ? optionalItemIndex : v4();
                let index = [...store().index];
                const validator = await store().lazyLoadValidator();
                const valid = validator.validate(dataToAdd);
                if (valid) {
                    let records = { ...store().records };
                    records[itemIndex] = dataToAdd;
                    if (!index.includes(itemIndex))
                        index = [...index, itemIndex];
                    set({ index, records });
                    store().listeners.forEach(callback => callback(itemIndex, { ...dataToAdd }, "inserting"))
                    store().setStatus("idle")
                    resolve(itemIndex);
                } else {
                    const errors = validator.validate.errors;
                    if (errors) {
                        set({ errors })
                        store().setStatus("erroring")
                        store().setStatus("idle");
                    }
                    reject(errors?.pop()?.message || collection + " item not valid!");
                }
            })
        },
        insert_and_skip_validatation: (dataToAdd, optionalItemIndex) => {
            store().setStatus("inserting");
            const itemIndex = optionalItemIndex ? optionalItemIndex : v4();
            let index = [...store().index];
            const records = { ...store().records, [itemIndex]: dataToAdd };
            if (!index.includes(itemIndex))
                index = [...index, itemIndex];
            set({ index, records });
            store().listeners.forEach(callback => callback(itemIndex, { ...dataToAdd }, "inserting"))
            store().setStatus("idle")
        }

        , update: (id, itemUpdate) => {
            store().setStatus("updating");
            const newItem = produce<DataType>(store().retrieve(id), itemUpdate);
            return store().insert(newItem, id);
        },

        retrieve: (itemIndex) => {
            return store().records[itemIndex];
        },
        setActive: (active) => {
            store().setStatus("activating");
            store().listeners.forEach(callback => callback(active, store().retrieve(active), "activating"))
            set({ active });
            store().setStatus("idle");
        },
        updateWorkspace: (workspaceUpdate) => {
            store().setStatus("workspacing");
            return new Promise(async (resolve, reject) => {
                const workspace = await store().lazyLoadWorkspace();
                const newWorkspace = produce<DataType>(workspace, workspaceUpdate);
                store().setWorkspaceInstance(newWorkspace);
                store().setStatus("idle");
                resolve()
            });
        },
        setWorkspaceInstance: (workspace) => {
            set({ workspace });
            store().listeners.forEach(callback => callback("workspace", workspace, "workspacing"))
        },
        addListener: (callback: StoreListener<DataType>) => {
            set({ listeners: [...store().listeners, callback] })
        },
        find: (predicate) => {
            return store().filter(predicate).pop();
        },
        findAndRemove: (predicate) => {
            store()
                .index
                .filter(
                    itemIndex =>
                        predicate(store().retrieve(itemIndex))
                ).forEach(index => {
                    store().remove(index);
                });
        },
        findIndex: (predicate: ((e: DataType) => boolean)) => store()
            .index
            .find(
                itemIndex =>
                    predicate(store().retrieve(itemIndex))
            ),
        all: () => {
            return store().filter(x => true);
        },
        activeInstance: () => {
            const { active } = store();
            return active ? store().retrieve(active) : undefined;
        },
        import: (entries, shouldValidate = true, shouldNotify = true) => {
            return new Promise(async (resolve, reject) => {
                store().setStatus("importing");
                const findRecordErrors = async (entries: Record<string, DataType>) => {
                    const validator = await store().lazyLoadValidator();
                    Object.values(entries).forEach(x => {
                        if (!validator.validate(x)) {
                            return validator.validate.errors;
                        }
                    })
                    return [];
                }
                const errors: ErrorObject<string, Record<string, any>>[] = shouldValidate ? await findRecordErrors(records) : [];
                set({ errors, records: entries, index: Object.keys(entries) });
                if (errors.length == 0 && shouldNotify) {
                    Object.entries(entries).forEach(([itemIndex, importItem]) => {
                        store().listeners.forEach(callback => callback(itemIndex, { ...importItem }, "inserting"))
                    })
                }
                store().setStatus("idle");
                errors.length === 0 ? resolve() : reject();
            })
        }, clear: () => {
            store().setStatus("clearing");
            store().import({});
            store().listeners.forEach(callback => callback("", {}, "clearing"))
            store().setStatus("idle");
        },
        export: () => {
            store().setStatus("exporting");
            const result = JSON.stringify(store().records);
            store().setStatus("idle");
            return result;
        },

        exportWorkspace: () => {
            store().setStatus("exporting");
            const workspaceJSON = JSON.stringify(store().workspace);
            store().setStatus("idle");
            return workspaceJSON;
        }
    }))
}


export { composeGenericStore };

