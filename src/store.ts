
import { ErrorObject } from "ajv";
import Validator from "validator";
import { Draft } from "immer";

export type StoreStatus = "idle" | "inserting" | "removing" | "validating" | "invalid" | "workspace-update" | "clear";
export type StoreListener<DataType> = (itemIndex: string, item: Partial<DataType>, status: StoreStatus) => void;

/**
 * add remove retrieve contract for identifiable data type
 */
export type Store<dataType> = {
    /**
     * Collection name (object name singular) ie "catalog"
     * Used in serialization & validation MUST match property on schema
     */
    collection: string
    /**
     * Index of all data identifiers
     */
    index: string[]
    /**
     * Active data instance identifier
     */
    active?: string
    /**
     * Map of all instances
     */
    records: Record<string, dataType>
    /**
    * workspace data is not validated.
    * Idea is this is where you build data
    * that will eventually be valid after some time
    * then it will graduate and be inserted 
    *  
    */
    workspace: dataType
    /**
     * Validation errors
     * validation occurs on load and add
     */
    errors: ErrorObject[]
    status: StoreStatus
    validator: Validator<dataType>,
    listeners: StoreListener<dataType>[],
    activeInstance: () => dataType | undefined
    retrieve: (id: string) => (dataType)
    insert: (dataItem: any, id?: string) => boolean,
    remove: (id: string) => boolean,
    all: () => dataType[],
    setActive: (id: string) => void,
    setWorkspace: (partialUpdate: (partial: Draft<dataType>) => void) => void,
    filter: (predicate: ((e: dataType) => boolean)) => dataType[],
    filterIndex: (predicate: ((e: dataType) => boolean)) => string[],
    find: (predicate: ((e: dataType) => boolean)) => dataType | undefined,
    findIndex: (predicate: ((e: dataType) => boolean)) => string | undefined,
    findAndRemove: (predicate: ((e: dataType) => boolean)) => void,
    addListener: (callback: StoreListener<dataType>) => void,
    import: (records: Record<string, dataType>) => boolean
    export: () => string
    clear: () => void
    exportWorkspace: () => string

}



