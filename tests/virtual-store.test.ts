import { importOscal, Party, SystemSecurityPlan } from "oscal"
import { composeVanillaStore } from "../dist/composeVanillaStore"
import { composeVirtualStore } from "../dist/composeVirtualStore"
import oscal_ssp_example from "./data/example_ssp.json"
import oscal_ssp_schema from "./schemas/oscal_ssp_schema.json"
import 'regenerator-runtime/runtime'
import { v4 } from "uuid"

test("can insert a party into workspace via virtual store", async () => {

    const sspStoreApi = composeVanillaStore<SystemSecurityPlan>({
        schema: oscal_ssp_schema,
        definition: "system_security_plan"
    });

    const sspPartyVirtualStore = composeVirtualStore<Party>({
        fetch: () => {
            const parties = sspStoreApi.getState().workspace?.metadata.parties || []
            return parties.reduce((a, b) => ({ ...a, [b.uuid]: b }), {})
        },
        synchronize: (records) => {
            return new Promise((resolve, reject) => {
                return sspStoreApi.getState().updateWorkspace((draft) => {
                    draft.metadata.parties = Object.values(records)
                }).then(() => {
                    resolve("success")
                }).catch((err) => {
                    reject(err);
                })
            })
        }
    });
    const party = { type: "person", uuid: v4(), name: "broseph stalin" }
    sspPartyVirtualStore.getState().insert(party.uuid, party).then(() => {
        expect(((sspStoreApi.getState().workspace?.metadata?.parties?.length) || 0) > 0).toBeTruthy()
    })
})
