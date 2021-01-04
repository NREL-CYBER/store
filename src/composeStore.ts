import { ErrorObject } from "ajv";
import Validator, { RootSchemaObject } from "validator";
import { v4 } from "uuid";
import { Store, StoreListener } from "./store";
import produce from "immer";
import create from "zustand";

/**
 * Create an indexed storage & validation for vanillar TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 */
export default function composeStore<DataType>(schema: RootSchemaObject, definition?: string) {
    let collection = definition ? definition : schema.$id ? schema.$id : "errorCollection"
    if (collection === "errorCollection") {
        throw ("invalid JSON schema");
    }

    const validator = definition ? new Validator<DataType>(schema) : new Validator<DataType>(schema, definition);

    let errors: ErrorObject<string, Record<string, any>>[] = [];
    /*
     * validate the initial state and show errors and filter invalid and process data.
     */
    let records: Record<string, DataType> = {};
    const index: string[] = [];

    const partial = validator.makePartial() as DataType;
    // Create the implementation of the store type now that we have the initial values prepared.
    return create<Store<DataType>>((set, store) => ({
        partial,
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
            .index
            .filter(
                itemIndex =>
                    predicate(store().retrieve(itemIndex))
            ).map(
                matchingItemIndex => store().retrieve(matchingItemIndex)
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
            const records = { ...store().records };
            const oldRecord = { ...records[idToRemove] }
            delete records[idToRemove];
            let active = store().active;
            if (active && active === idToRemove) {
                active = undefined;
            }
            store().listeners.forEach(callback => callback(idToRemove, oldRecord, "removing"))
            set({ index, records, active, status: "idle" });
        },
        /**
         *  add an Item to the store using decomposition.
         *  const {add,errors} = useStore()
         *  onSubmit => insert(item);
         * 
         *  validation errors apear in errors array
         *  errors && errors.map(error=>error.message)
         */
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
            } else {
                const errors = store().validator.validate.errors;
                errors ? set({ errors, status: "invalid" }) : set({ status: "invalid" });
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
        getPartial: () => {
            return {
                ...store().partial
            };
        },
        /**
        * Perform safe partial updates here using immer produce<Datatype>()
        */
        setPartial: (partialUpdate) => {
            const newPartial = produce<DataType>(store().partial, partialUpdate, (events) => {
                events.map((e) => console.log(e.op + " " + e.path + " " + JSON.stringify(e.value)));
            });
            set({ partial: newPartial });
            store().listeners.forEach(callback => callback("partial", newPartial, "partial-update"))
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
        /**
         * Export all items including the partial.
         * Exported loses information about the "active item"
         */
        export: () => {
            return JSON.stringify([...store().all()])
        },

        exportPartial: () => {
            return JSON.stringify(store().partial);
        }
    }))
}

