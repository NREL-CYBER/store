import { composeStoreOptions } from "./composeStoreOptions";
declare const composeVanillaStore: <DataType>(options: composeStoreOptions<DataType>) => import("zustand/vanilla").StoreApi<import("./store").Store<DataType>>;
export { composeVanillaStore };
