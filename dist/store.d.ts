import { ErrorObject } from "ajv";
import Validator from "validator";
import { Draft } from "immer";
export declare type StoreStatus = "idle" | "inserting" | "removing" | "validating" | "invalid" | "partial-update";
export declare type StoreListener<DataType> = (itemIndex: string, item: Partial<DataType>, status: StoreStatus) => void;
/**
 * add remove retrieve contract for identifiable data type
 */
export declare type Store<dataType> = {
    /**
     * Collection name (object name singular) ie "catalog"
     * Used in serialization & validation MUST match property on schema
     */
    collection: string;
    /**
     * Index of all data identifiers
     */
    index: string[];
    /**
     * Active data instance identifier
     */
    active?: string;
    /**
     * Map of all instances
     */
    records: Record<string, dataType>;
    /**
    * partially complete data
    * This has not been validated yet,
    */
    partial: dataType;
    /**
     * Validation errors
     * validation occurs on load and add
     */
    errors: ErrorObject[];
    status: StoreStatus;
    validator: Validator<dataType>;
    listeners: StoreListener<dataType>[];
    activeInstance: () => dataType | undefined;
    retrieve: (id: string) => (dataType);
    insert: (dataItem: any, id?: string) => void;
    remove: (id: string) => void;
    all: () => dataType[];
    setActive: (id: string) => void;
    setWorkspace: (partialUpdate: (partial: Draft<dataType>) => void) => void;
    filter: (predicate: ((e: dataType) => boolean)) => dataType[];
    find: (predicate: ((e: dataType) => boolean)) => dataType | undefined;
    findAndRemove: (predicate: ((e: dataType) => boolean)) => void;
    findIndex: (predicate: ((e: dataType) => boolean)) => string | undefined;
    addListener: (callback: StoreListener<dataType>) => void;
    export: () => string;
    exportPartial: () => string;
};
