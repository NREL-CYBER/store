import { ErrorObject } from "ajv";
import produce from "immer";
import { v4 } from "uuid";
import Validator, { RootSchemaObject } from "validator";
import create from "zustand";
import { Store, StoreListener } from "./store";

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
}


const composeStore = <DataType>(options: composeStoreProps<DataType>) => {
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




    // Create the implementation of the store type now that we have the initial values prepared.
    return create<Store<DataType>>((set, store) => ({
        workspace: () => {
            if (typeof store().workspaceInstance === "undefined") {
                const workspaceInstance = store().validator().makeWorkspace();
                setTimeout(() => set({ workspaceInstance }), 0);
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
        status: "lazy",
        validator: () => {
            if (typeof store().validatorInstance !== "undefined") {
                return store().validatorInstance!;
            } else {
                const validatorInstance = typeof definition === "string" ?
                    new Validator<DataType>(schema, definition) :
                    new Validator<DataType>(schema);
                setTimeout(() => set({ validatorInstance }), 0);
                return validatorInstance;
            }
        },
        listeners: [],
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
            set({ status: "removing" });
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
            set({ index, records, active, status: "idle" });
            return true;
        },
        insert: (dataToAdd, optionalItemIndex) => {
            const itemIndex = optionalItemIndex ? optionalItemIndex : v4();
            set({ status: "inserting" });
            let index = [...store().index];
            const validator = store().validator();
            const valid = validator.validate(dataToAdd);
            if (valid) {
                let records = { ...store().records };
                records[itemIndex] = dataToAdd;
                if (!index.includes(itemIndex))
                    index = [...index, itemIndex];
                set({ index, records, status: "idle" });
                store().listeners.forEach(callback => callback(itemIndex, { ...dataToAdd }, "inserting"))
                return true;
            } else {
                const errors = validator.validate.errors;
                errors ? set({ errors, status: "invalid" }) : set({ status: "invalid" });
                return false;
            }
        }, update: (id, itemUpdate) => {
            const newItem = produce<DataType>(store().retrieve(id), itemUpdate);
            return store().insert(newItem, id);
        },

        retrieve: (itemIndex) => {
            return store().records[itemIndex];
        },
        setActive: (active) => {
            set({ active });
        },
        setWorkspace: (workspaceUpdate) => {
            const newWorkspace = produce<DataType>(store().workspace(), workspaceUpdate);
            store().setWorkspaceInstance(newWorkspace);
        },
        setWorkspaceInstance: (workspaceInstance) => {
            set({ workspaceInstance });
            store().listeners.forEach(callback => callback("workspace", workspaceInstance, "workspace-update"))
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
            const validator = store().validator();
            const findRecordErrors = (entries: Record<string, DataType>) => {
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
            return errors.length == 0;
        }, clear: () => {
            store().import({});
            store().listeners.forEach(callback => callback("", {}, "clear"))

        },
        export: () => {
            return JSON.stringify(store().records)
        },

        exportWorkspace: () => {
            return JSON.stringify(store().workspace());
        }
    }))
}


export { composeStore };