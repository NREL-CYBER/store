// import { openDB, IDBPDatabase } from 'idb';

// export type DBUpgradeProcess = <T>(database: IDBPDatabase<T>, oldVersion: number, newVersion: number | null) => void

// class IndexDBService {
//     private static _instance: IndexDBService;

//     namespaces: Record<string, Promise<IDBPDatabase<any>>>;

//     private constructor() {
//         this.namespaces = {}
//     }

//     public static please() {
//         return this._instance || (this._instance = new this());
//     }
//     private registerNamespace<T>(namespace: string, version = 0, upgrade: DBUpgradeProcess) {
//         this.namespaces[namespace] = openDB<T>(namespace, version, {
//             blocked: () => {
//                 console.log(namespace + " DB Blocked")
//             }, blocking: () => {
//                 console.log(namespace + " DB Blocking")
//             }, terminated: () => {
//                 console.log(namespace + " DB Terminated")
//             }, upgrade
//         });
//     }
//     public open<T>(namespace: string, version: number = 0, upgrade: DBUpgradeProcess) {
//         if (!Object.keys(this.namespaces).includes(namespace)) {
//             this.registerNamespace<T>(namespace, version, upgrade);
//         }
//         return this.namespaces[namespace];
//     }
// }
// export default IndexDBService;