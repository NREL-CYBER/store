import { RootSchemaObject } from "validator";
import { Store } from "./Store";
/**
 * Create an indexed storage & validation for vanillar TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 */
export default function composeStore<DataType>(schema: RootSchemaObject, definition?: string): import("zustand/vanilla").StoreApi<Store<DataType>>;
