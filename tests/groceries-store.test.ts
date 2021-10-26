import 'regenerator-runtime/runtime'
import { composeStore } from "../dist/composeStore";
import groceriesSchema from "./schemas/groceries-schema.json";
export type Fruit = string;
export interface Veggie {
    veggieName: string
    veggieLike: boolean
}
export const barocolli: Veggie = {
    veggieLike: true,
    veggieName: "baracoli obama"
};
export const tomato: Fruit = "Heirloom Tomato";

export interface Groceries {
    fruits: Fruit[]
    veggies: Veggie[]
}
export const groceryList: Groceries = {
    veggies: [barocolli],
    fruits: [tomato]
}

export const invalidGroceryList = {
    veggies: [barocolli, 9],
    fruits: [tomato, { veggieLike: "yeee", veggieName: "Chocolate" }]
}


test("Paginating store works with default algo", async () => {
    const veggieStoreAPI = composeStore<Veggie>(
        {
            schema: groceriesSchema,
            definition: "veggie",
            initial: { ["obama"]: barocolli }
        });
    const import_export_Record = JSON.parse(veggieStoreAPI.getState().export()) as Record<string, Veggie>;
    const veggiesPaginated = await veggieStoreAPI.getState().query({ page: 0, identifier: "veggieName", pageSize: 1 }, { veggieName: "baracoli obama" })
    expect(import_export_Record["obama"].veggieName === "baracoli obama");
})


test("After insterting a valid brocoli, it is found in the veggie store", async () => {
    const veggieStoreAPI = composeStore<Veggie>({
        schema: groceriesSchema,
        definition: "veggie",
    });

    await veggieStoreAPI.getState().insert("obama", barocolli);
    expect(veggieStoreAPI.getState().find(x => x.veggieName == barocolli.veggieName)).toBeTruthy()
})

test("Grocery Workspace comes with empty veggie array", async () => {
    const veggieStoreAPI = composeStore<Groceries>({
        schema: groceriesSchema
    });
    const workspace = await veggieStoreAPI.getState().lazyLoadWorkspace();
    expect(workspace.fruits.length).toEqual(0);
})


test("Brocolli set as initial value is able to be retrieved after init", () => {
    const veggieStoreAPI = composeStore<Veggie>(
        {
            schema: groceriesSchema,
            definition: "veggie",
            initial: { ["obama"]: barocolli }
        });

    expect(veggieStoreAPI.getState().retrieve("obama")?.veggieName === "baracoli obama");
})
test("Brocolli set as exported  as a key value pair on export", () => {
    const veggieStoreAPI = composeStore<Veggie>(
        {
            schema: groceriesSchema,
            definition: "veggie",
            initial: { ["obama"]: barocolli }
        });
    const import_export_Record = JSON.parse(veggieStoreAPI.getState().export()) as Record<string, Veggie>;

    expect(import_export_Record["obama"].veggieName === "baracoli obama");
})

test("Exporting and importing a store validates", () => {
    const veggieStoreAPI = composeStore<Veggie>(
        {
            schema: groceriesSchema,
            definition: "veggie",
            initial: { ["obama"]: barocolli }
        });
    const import_export_Record = JSON.parse(veggieStoreAPI.getState().export()) as Record<string, Veggie>;
    veggieStoreAPI.getState().import({})
    expect(import_export_Record["obama"].veggieName === "baracoli obama");
})




