import { ErrorObject } from "ajv";
import produce from "immer";
import { v4 } from "uuid";
import Validator from "validator";
import { StateCreator, UseStore } from "zustand";
import { composeStoreOptions } from ".";
import { Store, StoreListener, StoreStatus } from "./store";

/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 * @param initial The initial value of the store
 */


const composeGenericStore = <StoreType, DataType>(create: (storeCreator: StateCreator<Store<DataType>>) => UseStore<Store<DataType>>, options: composeStoreOptions<DataType>) => {
    const { schema, definition, initial, workspace, indexes, fetch } = options;
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

    // const openDB = IndexDBService.please().open(namespace, version, (db) => {
    //     indexes?.forEach(({ name, keypath }) => {
    //         db.createIndex(name, keypath)
    //     })
    // });
    // Create the implementation of the store type now that we have the initial values prepared.
    return create((set, store) => ({
        schema,
        workspace,
        lazyLoadWorkspace: () => {
            return new Promise(async (complete) => {
                if (typeof store().workspace === "undefined" && typeof workspace === "undefined") {
                    store().setStatus("warming-workspace");
                    const validator = await store().lazyLoadValidator();
                    const workspace = validator.makeWorkspace();
                    set({ workspace });
                    complete(workspace);
                } else {
                    complete(store().workspace || workspace);
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
                    const validator = new Validator<DataType>(schema, definition, { uuid: v4 });
                    set({ validator });
                    store().setStatus("idle");
                    complete(validator);
                }
            }
            )
        },
        indexes: {},
        listeners: [
            // (id, item, status) => {
            //     switch (status) {
            //         case "clearing":
            //             break;
            //         case "inserting":
            //             openDB.then((db) => {
            //                 db.put(collection, item, id)
            //             })
            //             break;
            //         case "removing":
            //             openDB.then((db) => {
            //                 db.delete(collection, id)
            //             })
            //             break;
            //         default:
            //             break;
            //     }
            // }
        ],
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
        fetch: fetch ? fetch : (id: string) => {
            return new Promise<DataType | undefined>((resolve) => {
                resolve(store().retrieve(id))
            })
        },
        filterIndex: (predicate: ((e: DataType) => boolean)) => store()
            .index
            .filter(
                itemIndex =>
                    predicate(store().retrieve(itemIndex)!)
            ),

        remove: async (idToRemove) => {
            store().setStatus("removing");
            return new Promise<string>(async (resolve, reject) => {

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
                set({ index, records, active });
                await Promise.all(store().listeners.map(callback => callback(idToRemove, oldRecord, "removing")))
                store().setStatus("idle");
                resolve("succuss");
            })
        },
        insert: (itemIndex, dataToAdd, validate = false) => {
            return new Promise<string>(async (resolve, reject) => {
                store().setStatus("inserting");
                let index = [...store().index];
                const { lazyLoadValidator } = store();
                const valid = validate ? (await lazyLoadValidator()).validate(dataToAdd) : true;
                if (valid) {
                    let records = { ...store().records };
                    records[itemIndex] = dataToAdd;
                    if (!index.includes(itemIndex))
                        index = [...index, itemIndex];
                    set({ index, records });
                    await Promise.all(store().listeners.map(callback => callback(itemIndex, { ...dataToAdd }, "inserting")))
                    store().setStatus("idle")
                    resolve(itemIndex);
                } else {
                    const validator = (await lazyLoadValidator())
                    validator.validate(dataToAdd)
                    const errors = validator.validate.errors;
                    if (errors) {
                        set({ errors })
                        store().setStatus("erroring")
                        store().setStatus("idle");
                    }
                    reject(errors?.pop()?.message || collection + " item not valid!");
                }
            })
        }
        , update: (id, itemUpdate) => {
            store().setStatus("updating");
            const newItem = produce<DataType>(store().retrieve(id)!, itemUpdate);
            return store().insert(id, newItem);
        },

        retrieve: (itemIndex) => {
            const item = store().records[itemIndex]
            if (!item) {
                console.log("Cache Miss", itemIndex, collection)
            }
            return item;
        },
        setActive: async (active) => {
            store().setStatus("activating");
            await store().listeners.map(callback => callback(active, store().retrieve(active)!, "activating"))
            set({ active });
            store().setStatus("idle");
        },
        updateWorkspace: (workspaceUpdate) => {
            store().setStatus("workspacing");
            return new Promise(async (resolve, reject) => {
                const workspace = await store().lazyLoadWorkspace();
                const newWorkspace = produce<DataType>(workspace, workspaceUpdate);
                store().setWorkspaceInstance(newWorkspace);
                Promise.all(store().listeners.map(callback => callback("workspace", newWorkspace, "workspacing"))).then(() => {
                    store().setStatus("idle");
                    resolve()
                }).catch(() => {
                    store().setStatus("erroring")
                    reject()
                })
            });
        },
        setWorkspaceInstance: (workspace, notify = false) => {
            set({ workspace });
            notify && Promise.all(store().listeners.map(callback => callback("workspace", workspace, "workspacing"))).then(() => {
                store().setStatus("idle");
            }).catch(() => {
                store().setStatus("erroring")
            })
                ;
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
                        predicate(store().retrieve(itemIndex)!)
                ).forEach(index => {
                    store().remove(index);
                });
        },
        findIndex: (predicate: ((e: DataType) => boolean)) => store()
            .index
            .find(
                itemIndex =>
                    predicate(store().retrieve(itemIndex)!)
            ),
        all: () => {
            return store().filter(x => true);
        },
        activeInstance: () => {
            const { active } = store();
            return active ? store().retrieve(active) : undefined;
        },
        import: (entries, shouldValidate = true, shouldNotify = false) => {
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
                    Object.entries(entries).forEach(async ([itemIndex, importItem]) => {
                        await Promise.all(store().listeners.map(callback => callback(itemIndex, { ...importItem }, "inserting")))
                    })
                }
                store().setStatus("idle");
                errors.length === 0 ? resolve() : reject();
            })
        }, clear: async () => {
            store().setStatus("clearing");
            store().import({});
            await Promise.all(store().listeners.map(callback => callback("", {}, "clearing")))
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

