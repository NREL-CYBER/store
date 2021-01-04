import Validator from "validator";
import groceriesSchema from "./schemas/groceries-schema.json"
import composeStore from "../composeVanillaStore";

type Fruit = string;
interface Veggie {
    veggieName: string
    veggieLike: boolean
}
const brocolli: Veggie = { veggieLike: true, veggieName: "baracoli obama" };
const tomato: Fruit = "Heirloom Tomato";

interface Groceries {
    fruits: Fruit[]
    veggies: Veggie[]
}
const groceryList: Groceries = {
    veggies: [brocolli],
    fruits: [tomato]
}

const invalidGroceryList = {
    veggies: [brocolli, 9],
    fruits: [tomato, { veggieLike: "yeee", veggieName: "Chocolate" }]
}

test("After insterting a valid brocoli, it is found in the veggie store", () => {
    const veggieStoreAPI = composeStore<Veggie>(groceriesSchema, "veggie");
    veggieStoreAPI.getState().insert(brocolli);
    expect(veggieStoreAPI.getState().find(x => x.veggieName == brocolli.veggieName)).toBeTruthy()
})

test("Partial Grocery list comes with empty veggie array", () => {
    const veggieStoreAPI = composeStore<Groceries>(groceriesSchema);
    expect(veggieStoreAPI.getState().partial.fruits.length).toEqual(0);
})


