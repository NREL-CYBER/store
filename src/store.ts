
import { ErrorObject } from "ajv";
import Validator from "validator";
import { Draft } from "immer";

export type StoreStatus = "lazy" | "idle" | "inserting" | "removing" | "validating" | "invalid" | "workspace-update" | "clear";
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
  *  Lazy instantiate workspace on request for performance
  */
  workspaceInstance?: dataType
  /**
  * workspace data is not validated.
  * Idea is this is where you build data
  * that will eventually be valid after some time
  * then it will graduate and be inserted 
  *  
  */
  workspace: () => Promise<dataType>
  /**
  *  Lazy instantiate Validator on request app boot performance
   */
  validatorInstance?: Validator<dataType>,
  /**
  * Validator is triggered on insert and import
  */
  validator: () => Promise<Validator<dataType>>,
  /**
    * Validation errors
    * validation occurs on load and add
    */
  errors: ErrorObject[]
  /**
   * shares the status of a store ie inserting idle, removing etc...
   */
  status: StoreStatus
  /**
   * A list of all listeners on the collection
   */
  listeners: StoreListener<dataType>[],
  /**
   * Get the active instance that was set by the setActive function
   */
  activeInstance: () => dataType | undefined
  /**
   * Get an item by id
   * this is for use with items that are known to exist 
   * because it is included in the index
   */
  retrieve: (id: string) => (dataType)
  /**
   * Insert a data-item, optionally specify the identifier. uuid4 will be used by default
   */
  insert: (dataItem: any, id?: string) => Promise<boolean>,
  /**
   * Insert a data-item, optionally specify the identifier. uuid4 will be used by default
   */
  update: (id: string, change: (item: Draft<dataType>) => void) => Promise<boolean>,
  /**
   * Remove a single item in the store
   */
  remove: (id: string) => boolean,
  /**
   * get all Items in the store
   */
  all: () => dataType[],
  /**
   * delete the collection (this may wipe a db table)
   */
  clear: () => void
  /**
   * mark a particular item as "active" 
   */
  setActive: (id: string) => void,
  /**
   * update the workspace with an immer function
   */
  setWorkspace: (workspaceUpdate: (workspace: Draft<dataType>) => void) => Promise<void>,
  /**
   * set the workspace directly (from serialized workspace)
   */
  setWorkspaceInstance: (instance: dataType) => void,
  /**
   * filter items by predicate
   */
  filter: (predicate: ((e: dataType) => boolean)) => dataType[],
  /**
   * filter indexes by predicate
   */
  filterIndex: (predicate: ((e: dataType) => boolean)) => string[],
  find: (predicate: ((e: dataType) => boolean)) => dataType | undefined,
  /**
   * Find index of matching item
   */
  findIndex: (predicate: ((e: dataType) => boolean)) => string | undefined,
  /**
   * Remove single matching item
   */
  findAndRemove: (predicate: ((e: dataType) => boolean)) => void,
  /**
   * Listen for updates
   */
  addListener: (callback: StoreListener<dataType>) => void,
  /**
   * Import Records
   */
  import: (records: Record<string, dataType>, validate?: boolean) => boolean
  /**
   * Export to serializable string
   */
  export: () => string
  exportWorkspace: () => string

}



