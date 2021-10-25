import { StateCreator, UseStore } from "zustand";
import { composeStoreOptions } from ".";
import { Store } from "./store";
/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 * @param initial The initial value of the store
 */
declare const composeGenericStore: <StoreType, DataType_1>(create: (storeCreator: StateCreator<Store<DataType_1>, import("zustand").SetState<Store<DataType_1>>>) => UseStore<Store<DataType_1>>, options: composeStoreOptions<DataType_1>) => UseStore<Store<DataType_1>>;
export { composeGenericStore };
