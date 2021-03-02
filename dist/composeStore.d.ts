import { composeStoreOptions } from "./composeStoreOptions";
declare const composeStore: <DataType>(options: composeStoreOptions<DataType>) => import("zustand").StoreApi<import("./store").Store<DataType>>;
export { composeStore };
