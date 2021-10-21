import { ErrorObject } from "ajv";
import Validator, { RootSchemaObject } from "validator";
import { Draft } from "immer";
export declare type StoreStatus = "warming-workspace" | "warming-validator" | "booting" | "idle" | "fetching" | "importing" | "exporting" | "inserting" | "removing" | "erroring" | "updating" | "workspacing" | "clearing" | "activating" | "missing";
export declare type StoreListener<DataType> = (itemIndex: string, item: Partial<DataType>, status: StoreStatus) => Promise<string>;
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
     * Indexes of query results & cache misses //TODO
     */
    indexes: Record<string, string[]>;
    /**
     * Active data instance identifier
     */
    active?: string;
    /**
     * Map of all instances
     */
    records: Record<string, dataType>;
    /**
    * workspace data is not validated.
    * Idea is this is where you build data
    * that will eventually be valid after some time
    * then it will graduate and be inserted
    */
    workspace?: dataType;
    /**
    *  Lazy instantiate workspace on request for performance
    *  This is expensive for large schemas, make sure to show a loading screen.
    */
    lazyLoadWorkspace: () => Promise<dataType>;
    /**
    * Validator can be triggered on insert and import
    */
    validator?: Validator<dataType>;
    /**
    *  Lazily instantiate the Validator
    *  This is expensive for large schemas, make sure to show a loading screen.
    */
    lazyLoadValidator: () => Promise<Validator<dataType>>;
    /**
      * Validation errors are cached here
      */
    errors: ErrorObject[];
    /**
     * shares the status of a store ie inserting idle, removing etc...
     */
    status: StoreStatus;
    /**
     * Sets the status and updates the history...
     */
    setStatus: (status: StoreStatus) => void;
    /**
     * Stores the status history
     */
    statusHistory: StoreStatus[];
    /**
     * A list of all listeners on the collection
     */
    listeners: StoreListener<dataType>[];
    /**
     * Get the active instance that was set by the setActive function
     */
    activeInstance: () => dataType | undefined;
    /**
     * Get an item by id that's already been cached
     */
    retrieve: (id: string) => undefined | dataType;
    /**
     * Insert a data-item, optionally specify the identifier. uuid4 will be used by default
     */
    insert: (id: string, dataItem: dataType, validate?: boolean) => Promise<string>;
    /**
     * Insert a data-item, optionally specify the identifier. uuid4 will be used by default
     */
    update: (id: string, change: (item: Draft<dataType>) => void) => Promise<string>;
    /**
     * Remove a single item in the store
     */
    remove: (id: string) => Promise<string>;
    /**
     * get all Items in the store
     */
    all: () => dataType[];
    /**
     * delete the collection (this may wipe a db table)
     */
    clear: () => void;
    /**
     * mark a particular item as "active"
     */
    setActive: (id: string) => void;
    /**
     * update the workspace with an immer function
     */
    updateWorkspace: (workspaceUpdate: (workspace: Draft<dataType>) => void) => Promise<void>;
    /**
     * set the workspace directly (from serialized workspace)
     */
    setWorkspaceInstance: (instance: dataType, notify?: boolean) => void;
    /**
     * filter all string properties by query (perhaps a full fuzzy index in the future)
     */
    search: (query: string) => [string, dataType][];
    /**
     * save the schema from initialization so we don't have to wait for the validator to boot
     * when we make a form
     */
    schema: RootSchemaObject;
    /**
     * filter items by predicate
     */
    filter: (predicate: ((e: dataType) => boolean)) => dataType[];
    /**
     * filter indexes by predicate
     */
    filterIndex: (predicate: ((e: dataType) => boolean)) => string[];
    find: (predicate: ((e: dataType) => boolean)) => dataType | undefined;
    /**
     * Find index of matching item
     */
    findIndex: (predicate: ((e: dataType) => boolean)) => string | undefined;
    /**
     * Remove single matching item
     */
    findAndRemove: (predicate: ((e: dataType) => boolean)) => void;
    /**
     * Listen for updates
     */
    addListener: (callback: StoreListener<dataType>) => void;
    /**
     * Import Records
     */
    import: (records: Record<string, dataType>, validate?: boolean, notify?: boolean) => Promise<void>;
    /**
     * Export to serializable string
     */
    export: () => string;
    exportWorkspace: () => string;
};
