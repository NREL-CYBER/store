import Validator, { RootSchemaObject } from "validator";
import { Store } from "./store";
/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 * @param initial The initial value of the store
 */
interface composeStoreProps<DataType> {
    schema: RootSchemaObject;
    initial?: {};
    definition?: string;
    validator?: Validator<DataType>;
}
declare const composeVanillaStore: <DataType>(options: composeStoreProps<DataType>) => import("zustand").UseStore<Store<DataType>>;
export { composeVanillaStore };
