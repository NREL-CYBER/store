import { RootSchemaObject } from "validator";
import { Store } from "./store";
/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 */
declare const composeStore: <DataType>(schema: RootSchemaObject, definition?: string | undefined) => import("zustand").UseStore<Store<DataType>>;
export { composeStore };
