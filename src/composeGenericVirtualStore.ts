import produce from "immer";
import { StateCreator, UseStore } from "zustand";
import { composeVirtualStoreOptions } from "./composeStoreOptions";
import { StoreStatus } from "./store";
import { VirtualStore } from "./virtual-store";

/**
 * @param synchronize function to synchronize into real object
 * @param fetch get the value of the real object
 */


const composeGenericVirtualStore = <StoreType, DataType>(create: (storeCreator: StateCreator<VirtualStore<DataType>>) => UseStore<VirtualStore<DataType>>, options: composeVirtualStoreOptions<DataType>) => {
    const { synchronize, fetch, index } = options;
    const status: StoreStatus = "booting"

    return create((set, store) => ({

        errors: [],
        index: () => Object.keys(store().all().map((x: any) => x[index])),
        statusHistory: [],
        setStatus: (status) => {
            set({ status, statusHistory: [...store().statusHistory.slice(0, 9), status] });
        },
        status,
        filter: (predicate: ((e: DataType) => boolean)) => store().all().filter(predicate),
        remove: async (idToRemove) => {
            store().setStatus("removing");
            return new Promise<string>(async (resolve, reject) => {

                const remaining = store().all().filter(x => (x as any)[index] !== idToRemove);
                if (store().index().length === remaining.length) {
                    store().setStatus("idle");
                    return false;
                }
                await synchronize(remaining);
                store().setStatus("idle");
                resolve("succuss");
            })
        },
        insert: (itemIndex, dataToAdd) => {
            return new Promise<string>(async (resolve, reject) => {
                store().setStatus("inserting");
                const newCollection = [...store().filter(x => (x as any)[index] !== itemIndex), dataToAdd];
                await synchronize(newCollection);
                store().setStatus("idle")
                resolve(itemIndex);
            })
        }
        , update: (id, itemUpdate) => {
            store().setStatus("updating");
            const newItem = produce<DataType>(store().retrieve(id)!, itemUpdate);
            return store().insert(id, newItem);
        },
        import: (records) => {
            return synchronize(Object.values(records))
        },

        retrieve: (itemIndex) => {
            const item = store().find((x: any) => x[index] === itemIndex)
            if (!item) {
                console.log("Cache Miss", itemIndex, "virtual-store")
            }
            return item;
        },
        find: (predicate) => {
            return store().all().find(predicate);
        },
        findAndRemove: (predicate) => {
            store().all()
                .filter(predicate).forEach((item: any) => {
                    const itemIndex = item[index];
                    store().remove(itemIndex);
                });
        },
        filterIndex: (predicate) =>
            store()
                .all()
                .filter(predicate)
                .map((x: any) =>
                    x[index]
                )
        , findIndex: (predicate: ((e: DataType) => boolean)) => {
            const item: any = store()
                .all()
                .find(predicate)
            return (item && item[index]) ? item[index] : undefined
        },
        all: () => {
            const items = fetch()
            return typeof items === "undefined" ? [] : items
        },
        clear: async () => {
            store().setStatus("clearing");
            store().index().forEach((i) => {
                store().remove(i);
            })
            store().setStatus("idle");
        },
    }))
}


export { composeGenericVirtualStore };

