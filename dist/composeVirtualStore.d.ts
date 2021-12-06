import { composeVirtualStoreOptions } from ".";
declare const composeVirtualStore: <DataType>(options: composeVirtualStoreOptions<DataType>) => import("zustand").UseStore<import("./virtual-store").VirtualStore<DataType>, import("zustand").StoreApi<import("./virtual-store").VirtualStore<DataType>>>;
export { composeVirtualStore };
