import { StateCreator, UseBoundStore } from "zustand";
import { composeStoreOptions } from ".";
import { Store } from "./store";
/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 * @param initial The initial value of the store
 */
declare const composeGenericStore: <StoreType, DataType>(create: (storeCreator: StateCreator<Store<DataType>, import("zustand").SetState<Store<DataType>>, import("zustand").GetState<Store<DataType>>, import("zustand").StoreApi<Store<DataType>>>) => UseBoundStore<Store<DataType>, import("zustand").StoreApi<Store<DataType>>>, options: composeStoreOptions<DataType>) => UseBoundStore<Store<DataType>, import("zustand").StoreApi<Store<DataType>>>;
export { composeGenericStore };
