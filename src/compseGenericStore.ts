import { ErrorObject } from "ajv";
import produce from "immer";
import { v4 } from "uuid";
import Validator, { RootSchemaObject } from "validator";
import { StateCreator, StoreApi, UseStore } from "zustand";
import defer from "./defer";
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
    const validatorInstance = options.validator;
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
        workspace: () => {
            if (typeof store().workspaceInstance === "undefined") {
                store().setStatus("warming-workspace");
                const workspaceInstance = store().validator().makeWorkspace();
                defer(() => {
                    set({ workspaceInstance });
                });
                return workspaceInstance;
            } else {
                return store().workspaceInstance!;
            }
        },
        validatorInstance,
        collection,
        index,
        records,
        errors: [],
        statusHistory: [],
        setStatus: (status) => {
            defer(() => {
                set({ status, statusHistory: [...store().statusHistory.slice(0, 9), status] });
            })
        },
        status,
        validator: () => {
            if (typeof store().validatorInstance !== "undefined") {
                return store().validatorInstance!;
            } else {
                store().setStatus("warming-validator");
                const validatorInstance = typeof definition === "string" ?
                    new Validator<DataType>(schema, definition) :
                    new Validator<DataType>(schema);
                defer(() => {
                    set({ validatorInstance });
                    store().setStatus("idle");
                });
                return validatorInstance;
            }
        },
        listeners: [],
        search: (query: string) => store()
            .filterIndex(x => Object.values(x).join("").toLowerCase()
                .includes(query.toLowerCase()))
            .map(key => (
                [key, store().retrieve(key)]
            )),
        filter: (predicate: ((e: DataType) => boolean)) => store()
            .filterIndex(predicate).map(
                matchingItemIndex => store().retrieve(matchingItemIndex)
            ),
        filterIndex: (predicate: ((e: DataType) => boolean)) => store()
            .index
            .filter(
                itemIndex =>
                    predicate(store().retrieve(itemIndex))
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
            const itemIndex = optionalItemIndex ? optionalItemIndex : v4();
            store().setStatus("inserting");
            let index = [...store().index];
            const validator = store().validator();
            const valid = validator.validate(dataToAdd);
            if (valid) {
                let records = { ...store().records };
                records[itemIndex] = dataToAdd;
                if (!index.includes(itemIndex))
                    index = [...index, itemIndex];
                set({ index, records });
                store().listeners.forEach(callback => callback(itemIndex, { ...dataToAdd }, "inserting"))
                store().setStatus("idle")
                return true;
            } else {
                const errors = validator.validate.errors;
                errors && set({ errors }) && store().setStatus("erroring") && store().setStatus("idle");

                return false;
            }

        }, update: (id, itemUpdate) => {
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
        setWorkspace: (workspaceUpdate) => {
            store().setStatus("workspacing");
            const newWorkspace = produce<DataType>(store().workspace(), workspaceUpdate);
            store().setWorkspaceInstance(newWorkspace);
            store().setStatus("idle");
        },
        setWorkspaceInstance: (workspaceInstance) => {
            set({ workspaceInstance });
            store().listeners.forEach(callback => callback("workspace", workspaceInstance, "workspacing"))
            store().setStatus("idle");
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
        import: (entries, shouldValidate = true) => {
            store().setStatus("importing");
            const findRecordErrors = (entries: Record<string, DataType>) => {
                const validator = store().validator();
                Object.values(entries).forEach(x => {
                    if (!validator.validate(x)) {
                        return validator.validate.errors;
                    }
                })
                return [];
            }
            const errors: ErrorObject<string, Record<string, any>>[] = shouldValidate ? findRecordErrors(records) : [];
            set({ errors, records: entries, index: Object.keys(entries) });
            if (errors.length == 0) {
                Object.entries(entries).forEach(([itemIndex, importItem]) => {
                    store().listeners.forEach(callback => callback(itemIndex, { ...importItem }, "inserting"))
                })
            }
            store().setStatus("idle");
            return errors.length == 0;
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
            return JSON.stringify(store().workspace());
            store().setStatus("idle");
        }
    }))
}


export { composeGenericStore };

