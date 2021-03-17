import { composeStoreOptions } from "./composeStoreOptions";
declare const composeStore: <DataType>(options: composeStoreOptions<DataType>) => import("zustand").UseStore<import("./store").Store<DataType>>;
export { composeStore };
