import create from "zustand/vanilla";
import { composeStoreOptions } from "./composeStoreOptions";
import { composeGenericStore } from "./compseGenericStore";

const composeVanillaStore = <DataType>(options: composeStoreOptions<DataType>) => {
    return composeGenericStore(create, options);
}
export { composeVanillaStore };

