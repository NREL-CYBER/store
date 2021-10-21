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
    const { synchronize, fetch } = options;
    const status: StoreStatus = "booting"

    return create((set, store) => ({

        records: fetch,
        errors: [],
        index: () => Object.keys(fetch()),
        statusHistory: [],
        setStatus: (status) => {
            set({ status, statusHistory: [...store().statusHistory.slice(0, 9), status] });
        },
        status,
        indexes: {},
        filter: (predicate: ((e: DataType) => boolean)) => store()
            .filterIndex(predicate).map(
                matchingItemIndex => store().retrieve(matchingItemIndex)!
            ),
        remove: async (idToRemove) => {
            store().setStatus("removing");
            return new Promise<string>(async (resolve, reject) => {

                const index = store().index().filter(x => x !== idToRemove);
                if (store().index().length === index.length) {
                    return false;
                }
                const records = { ...store().records() };
                delete records[idToRemove];
                await synchronize((realObject: any) => {
                    realObject = records;
                });
                store().setStatus("idle");
                resolve("succuss");
            })
        },
        insert: (itemIndex, dataToAdd) => {
            return new Promise<string>(async (resolve, reject) => {
                store().setStatus("inserting");
                let index = [...store().index()];
                let records = { ...store().records() };
                records[itemIndex] = dataToAdd;
                if (!index.includes(itemIndex))
                    index = [...index, itemIndex];
                await synchronize((realObject: any) => {
                    realObject = records;
                });
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
            return synchronize((realObject: any) => {
                realObject = records;
            })
        },

        retrieve: (itemIndex) => {
            const item = store().records()[itemIndex]
            if (!item) {
                console.log("Cache Miss", itemIndex, "virtual-store")
            }
            return item;
        },
        find: (predicate) => {
            return store().filter(predicate).pop();
        },
        findAndRemove: (predicate) => {
            store()
                .index()
                .filter(
                    itemIndex =>
                        predicate(store().retrieve(itemIndex)!)
                ).forEach(index => {
                    store().remove(index);
                });
        },
        filterIndex: (predicate) =>
            store()
                .index()
                .filter(
                    itemIndex =>
                        predicate(store().retrieve(itemIndex)!)
                )
        ,

        findIndex: (predicate: ((e: DataType) => boolean)) => store()
            .index()
            .find(
                itemIndex =>
                    predicate(store().retrieve(itemIndex)!)
            ),
        all: () => {
            return store().filter(x => true);
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

