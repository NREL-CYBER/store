import { ErrorObject } from "ajv";
import produce from "immer";
import { v4 } from "uuid";
import Validator, { RootSchemaObject } from "validator";
import create from "zustand/vanilla";
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


const composeVanillaStore = <DataType>(options: composeStoreProps<DataType>) => {
    const { schema, definition, initial } = options;
    const injectedValidator = options.validator;
    const collection = definition ? definition : schema.$id ? schema.$id : "errorCollection"
    if (collection === "errorCollection") {
        throw new Error("invalid JSON schema");
    }
    const validator = typeof injectedValidator !== "undefined" ? injectedValidator :
        typeof definition === "string" ?
            new Validator<DataType>(schema, definition) :
            new Validator<DataType>(schema);

    /*
     * validate the initial state and show errors and filter invalid and process data.
     */
    const records: Record<string, DataType> = initial ? initial : {};
    const index: string[] = initial ? Object.keys(initial) : [];


    const workspace = validator.makeWorkspace() as DataType;
    const validateRecords = (entries: Record<string, DataType>) => {
        const data = Object.values(entries);
        if (data.length === 0)
            return true;
        return data
            .map(item => validator.validate(item))
            .reduce((x, y) => x && y)
    }

    const findRecordErrors = (entries: Record<string, DataType>) => {
        Object.values(entries).forEach(x => {
            if (!validator.validate(x)) {
                return validator.validate.errors;
            }
        })
        return [];
    }
    const errors: ErrorObject<string, Record<string, any>>[] = !validateRecords(records) ? findRecordErrors(records) : [];



    // Create the implementation of the store type now that we have the initial values prepared.
    return create<Store<DataType>>((set, store) => ({
        workspace,
        /* data type identifier index */
        /* Name of the collection */
        collection,
        /* index of all record ids */
        index,
        /* storage map of all records */
        records,
        /* validation errors */
        errors,
        /* status of store activity */
        status: "idle",
        /* validation object responsible for data integrity  */
        validator: validator,
        /**
        * Post Crud Listened Events
        */
        listeners: [],
        /**
        * filter entries via a predicate
        */
        filter: (predicate: ((e: DataType) => boolean)) => store()
            .filterIndex(predicate).map(
                matchingItemIndex => store().retrieve(matchingItemIndex)
            ),
        /**
        * filter index via a predicate
        */
        filterIndex: (predicate: ((e: DataType) => boolean)) => store()
            .index
            .filter(
                itemIndex =>
                    predicate(store().retrieve(itemIndex))
            ),

        /**
         * Remove an Item from the store by Id
         *  
         * const {remove} = useStore()
         * onDelete => remove(item)
         */
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
            const valid = store().validator.validate(dataToAdd);
            if (valid) {
                let records = { ...store().records };
                records[itemIndex] = dataToAdd;
                if (!index.includes(itemIndex))
                    index = [...index, itemIndex];
                set({ index, records, status: "idle" });
                store().listeners.forEach(callback => callback(itemIndex, { ...dataToAdd }, "inserting"))
                return true;
            } else {
                const errors = store().validator.validate.errors;
                errors ? set({ errors, status: "invalid" }) : set({ status: "invalid" });
                return false;
            }
        },
        /**
         * retrieve an Item to the store
         * ie for atomic updates use:
         * const item = useStore(x=>x.retreive(id))
         */
        retrieve: (itemIndex) => {
            return store().records[itemIndex];
        },
        /**
        * highlight or select this instance for detail view
        */
        setActive: (active) => {
            set({ active });
        },
        /**
        * Perform safe partial updates here using immer produce<Datatype>()
        */
        setWorkspace: (workspaceUpdate) => {
            const newWorkspace = produce<DataType>(store().workspace, workspaceUpdate);
            set({ workspace: newWorkspace });
            store().listeners.forEach(callback => callback("workspace", newWorkspace, "workspace-update"))
        },
        /**
        * Listen for updates on the store
        */
        addListener: (callback: StoreListener<DataType>) => {
            set({ listeners: [...store().listeners, callback] })
        },
        /**
        * Find a single data instance in the store
        */
        find: (predicate) => {
            return store().filter(predicate).pop();
        },
        /**
        * Find and remove any matching instances
        */
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
        /**
        * Find the index the data item matching a predicate
        */
        findIndex: (predicate: ((e: DataType) => boolean)) => store()
            .index
            .find(
                itemIndex =>
                    predicate(store().retrieve(itemIndex))
            ),
        /**
        * All records in an array
        */
        all: () => {
            return store().filter(x => true);
        },
        /**
         * Retrieve the active instance if there is one
         */
        activeInstance: () => {
            const { active } = store();
            return active ? store().retrieve(active) : undefined;
        },
        import: (entries) => {
            const errors: ErrorObject<string, Record<string, any>>[] = findRecordErrors(records);
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
        /**
         * Export all items including the partial.
         * Exported loses information about the "active item"
         */
        export: () => {
            return JSON.stringify(store().records)
        },

        exportWorkspace: () => {
            return JSON.stringify(store().workspace);
        }
    }))
}

export { composeVanillaStore };