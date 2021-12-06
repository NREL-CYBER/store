import { StateCreator, UseStore } from "zustand";
import { composeVirtualStoreOptions } from "./composeStoreOptions";
import { VirtualStore } from "./virtual-store";
/**
 * @param synchronize function to synchronize into real object
 * @param fetch get the value of the real object
 */
declare const composeGenericVirtualStore: <StoreType, DataType>(create: (storeCreator: StateCreator<VirtualStore<DataType>, import("zustand").SetState<VirtualStore<DataType>>, import("zustand").GetState<VirtualStore<DataType>>, import("zustand").StoreApi<VirtualStore<DataType>>>) => UseStore<VirtualStore<DataType>, import("zustand").StoreApi<VirtualStore<DataType>>>, options: composeVirtualStoreOptions<DataType>) => UseStore<VirtualStore<DataType>, import("zustand").StoreApi<VirtualStore<DataType>>>;
export { composeGenericVirtualStore };
