import oscal_ssp_schema from "./schemas/oscal_ssp_schema.json"
import oscal_ssp_example from "./data/example_ssp.json"
import { composeVanillaStore } from "../dist/composeVanillaStore"
import { importOscal } from "oscal"
import "babel-polyfill"

test("can load an oscal json schema", async () => {

    const sspStoreApi = composeVanillaStore<any>({
        schema: oscal_ssp_schema,
        definition: "system_security_plan"
    });
    const importedOscal = importOscal(oscal_ssp_example["system-security-plan"]);

    await sspStoreApi.getState().insert(importedOscal);

    expect(sspStoreApi.getState().all().length > 0).toBeTruthy()
})
test("when given a definition it is not considered a root schema", async () => {

    const sspStoreApi = composeVanillaStore<any>(
        {
            schema: oscal_ssp_schema,
            definition: "system_security_plan"
        });
    const importedOscal = importOscal(oscal_ssp_example["system-security-plan"]);
    const validator = await sspStoreApi.getState().validator();
    expect(validator.isRootSchema).toBeFalsy()
})



