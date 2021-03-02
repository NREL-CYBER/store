import "babel-polyfill";
import { composeVanillaStore } from "../dist/composeVanillaStore";
import groceriesSchema from "./schemas/groceries-schema.json";
type Fruit = string;
interface Veggie {
    veggieName: string
    veggieLike: boolean
}
const barocolli: Veggie = { veggieLike: true, veggieName: "baracoli obama" };
const tomato: Fruit = "Heirloom Tomato";

interface Groceries {
    fruits: Fruit[]
    veggies: Veggie[]
}
const groceryList: Groceries = {
    veggies: [barocolli],
    fruits: [tomato]
}

const invalidGroceryList = {
    veggies: [barocolli, 9],
    fruits: [tomato, { veggieLike: "yeee", veggieName: "Chocolate" }]
}

test("After insterting a valid brocoli, it is found in the veggie store", async () => {
    const veggieStoreAPI = composeVanillaStore<Veggie>({
        schema: groceriesSchema,
        definition: "veggie",
        vanilla: true
    });

    await veggieStoreAPI.getState().insert(barocolli);
    expect(veggieStoreAPI.getState().find(x => x.veggieName == barocolli.veggieName)).toBeTruthy()
})

test("Grocery Workspace comes with empty veggie array", async () => {
    const veggieStoreAPI = composeVanillaStore<Groceries>({
        schema: groceriesSchema
    });
    const workspace = await veggieStoreAPI.getState().workspace();
    expect(workspace.fruits.length).toEqual(0);
})


test("Brocolli set as initial value is able to be retrieved after init", () => {
    const veggieStoreAPI = composeVanillaStore<Veggie>(
        {
            vanilla: true,
            schema: groceriesSchema,
            definition: "veggie",
            initial: { ["obama"]: barocolli }
        });

    expect(veggieStoreAPI.getState().retrieve("obama").veggieName === "baracoli obama");
})
test("Brocolli set as exported  as a key value pair on export", () => {
    const veggieStoreAPI = composeVanillaStore<Veggie>(
        {
            vanilla: true,
            schema: groceriesSchema,
            definition: "veggie",
            initial: { ["obama"]: barocolli }
        });
    const import_export_Record = JSON.parse(veggieStoreAPI.getState().export()) as Record<string, Veggie>;

    expect(import_export_Record["obama"].veggieName === "baracoli obama");
})

test("Exporting and importing a store validates", () => {
    const veggieStoreAPI = composeVanillaStore<Veggie>(
        {
            vanilla: true,
            schema: groceriesSchema,
            definition: "veggie",
            initial: { ["obama"]: barocolli }
        });
    const import_export_Record = JSON.parse(veggieStoreAPI.getState().export()) as Record<string, Veggie>;
    veggieStoreAPI.getState().import({})
    expect(import_export_Record["obama"].veggieName === "baracoli obama");
})




