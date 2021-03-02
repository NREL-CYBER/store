import { importOscal } from "oscal"
import { composeVanillaStore } from "../dist/composeVanillaStore"
import oscal_ssp_example from "./data/example_ssp.json"
import oscal_ssp_schema from "./schemas/oscal_ssp_schema.json"

test("can load an oscal json schema", () => {

    const sspStoreApi = composeVanillaStore<any>({
        schema: oscal_ssp_schema,
        definition: "system_security_plan"
    });
    const importedOscal = importOscal(oscal_ssp_example["system-security-plan"]);

    sspStoreApi.getState().insert(importedOscal);

    expect(sspStoreApi.getState().all().length > 0).toBeTruthy()
})
test("when given a definition it is not considered a root schema", () => {

    const sspStoreApi = composeVanillaStore<any>(
        {
            schema: oscal_ssp_schema,
            definition: "system_security_plan"
        });
    const importedOscal = importOscal(oscal_ssp_example["system-security-plan"]);
    expect(sspStoreApi.getState().validator().isRootSchema).toBeFalsy()
})



