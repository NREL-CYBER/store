import groceriesSchema from "./schemas/groceries-schema.json"
import { composeVanillaStore } from "../src/composeVanillaStore"
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

test("After insterting a valid brocoli, it is found in the veggie store", () => {
    const veggieStoreAPI = composeVanillaStore<Veggie>({
        schema: groceriesSchema,
        definition: "veggie"
    });

    veggieStoreAPI.getState().insert(barocolli);
    expect(veggieStoreAPI.getState().find(x => x.veggieName == barocolli.veggieName)).toBeTruthy()
})

test("Grocery Workspace comes with empty veggie array", () => {
    const veggieStoreAPI = composeVanillaStore<Groceries>({
        schema: groceriesSchema
    });
    expect(veggieStoreAPI.getState().workspace.fruits.length).toEqual(0);
})


test("Brocolli set as initial value is able to be retrieved after init", () => {
    const veggieStoreAPI = composeVanillaStore<Veggie>(
        {
            schema: groceriesSchema,
            definition: "veggie",
            initial: { ["obama"]: barocolli }
        });

    expect(veggieStoreAPI.getState().retrieve("obama").veggieName === "baracoli obama");
})


