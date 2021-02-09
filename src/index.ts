import { composeStore } from "./composeStore"
import { Store } from "./store"
import { enablePatches } from 'immer';
import { composeVanillaStore } from "./composeVanillaStore";
enablePatches()
export { Store, composeStore, composeVanillaStore }
