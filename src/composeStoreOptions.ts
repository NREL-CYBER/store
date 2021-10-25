
/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 * @param initial The initial value of the store
 */

import { Draft } from "immer";
import Validator, { RootSchemaObject } from "validator";

export interface StoreIndex {
    name: string
    keypath: string | string[],
}
export interface PageOptions {
    page: number,
    identifier: string,
    pageSize: number,
}
export interface PaginatedQueryParameters extends Record<string, any> { }
export interface composeStoreOptions<DataType> {
    schema: RootSchemaObject,
    initial?: {},
    definition?: string
    validator?: Validator<DataType>
    vanilla?: boolean
    indexes?: StoreIndex[]
    workspace?: any
    fetch?: (id: string) => Promise<DataType | undefined>
    paginate?: <OptionType extends PaginatedQueryParameters = {}>(page: PageOptions, options: OptionType) => Promise<DataType[]>
}


export interface composeVirtualStoreOptions<DataType> {
    synchronize: ((realObject: any) => Promise<void>),
    index: string,
    fetch: () => DataType[]
}
