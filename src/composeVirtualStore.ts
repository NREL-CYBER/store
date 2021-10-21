import { composeVirtualStoreOptions } from ".";
import create from "zustand";
import { composeGenericVirtualStore } from "./composeGenericVirtualStore";

const composeVirtualStore = <DataType>(options: composeVirtualStoreOptions<DataType>) => {
    return composeGenericVirtualStore(create, options);
}
export { composeVirtualStore };
