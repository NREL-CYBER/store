
import { Draft } from "immer";
import { StoreStatus } from "./store";

/**
 * add remove retrieve contract for identifiable data type
 */
export type VirtualStore<dataType> = {
    index: () => (string)[]
    /**
     * shares the status of a store ie inserting idle, removing etc...
     */
    status: StoreStatus
    /**
     * Sets the status and updates the history...
     */
    setStatus: (status: StoreStatus) => void
    /**
     * Stores the status history
     */
    statusHistory: StoreStatus[]
    /**
     * Get an item by id that's already been cached 
     */
    retrieve: (id: string | number) => undefined | dataType
    /**
     * Insert a data-item, optionally specify the identifier. uuid4 will be used by default
     */
    insert: (id: string, dataItem: dataType, validate?: boolean) => Promise<string>,
    /**
     * Insert a data-item, optionally specify the identifier. uuid4 will be used by default
     */
    update: (id: string, change: (item: Draft<dataType>) => void) => Promise<string>,
    /**
     * Remove a single item in the store
     */
    remove: (id: string | number) => Promise<string>,
    /**
     * get all Items in the store
     */
    all: () => dataType[],
    /**
     * delete the collection (this may wipe a db table)
     */
    clear: () => void
    ,

    /**
     * filter items by predicate
     */
    filter: (predicate: ((e: dataType) => boolean)) => dataType[],
    /**
     * filter indexes by predicate
     */
    filterIndex: (predicate: ((e: dataType) => boolean)) => (string | number)[],
    find: (predicate: ((e: dataType) => boolean)) => dataType | undefined,
    /**
     * Find index of matching item
     */
    findIndex: (predicate: ((e: dataType) => boolean)) => string | number | undefined,
    /**
     * Remove single matching item
     */
    findAndRemove: (predicate: ((e: dataType) => boolean)) => void,
    /**
     * Import Records
     */
    import: (records: Record<string, dataType>, validate?: boolean, notify?: boolean) => Promise<void>

}



