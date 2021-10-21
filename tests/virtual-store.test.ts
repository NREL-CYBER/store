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
            return parties
        },
        index: "uuid",
        synchronize: (records) => {
            return sspStoreApi.getState().updateWorkspace((draft) => {
                draft.metadata.parties = records
            })
        }
    });
    const party = { type: "person", uuid: v4(), name: "broseph stalin" }
    sspPartyVirtualStore.getState().insert(party.uuid, party).then(() => {
        expect(((sspStoreApi.getState().workspace?.metadata?.parties?.length) || 0) > 0).toBeTruthy()
    })
})


test("can get parties from the virtual store", async () => {

    const sspStoreApi = composeVanillaStore<SystemSecurityPlan>({
        schema: oscal_ssp_schema,
        definition: "system_security_plan"
    });

    const sspPartyVirtualStore = composeVirtualStore<Party>({
        fetch: () => {
            const parties: Party[] = (sspStoreApi.getState().workspace?.metadata.parties ? sspStoreApi.getState().workspace?.metadata.parties : []) as any
            return parties
        },
        index: "uuid",
        synchronize: (newParties) => {
            return sspStoreApi.getState().updateWorkspace((draft) => {
                draft.metadata.parties = newParties
            })
        }
    });
    const party = { type: "person", uuid: v4(), name: "broseph stalin" }
    await sspPartyVirtualStore.getState().insert(party.uuid, party)
    expect(((sspPartyVirtualStore.getState().all().length)) > 0).toBeTruthy()

})


test("can import a dictionary of parties into the real store through the virtual store", async () => {
    const sspStoreApi = composeVanillaStore<SystemSecurityPlan>({
        schema: oscal_ssp_schema,
        definition: "system_security_plan"
    });

    const sspPartyVirtualStore = composeVirtualStore<Party>({
        fetch: () => {
            const parties: Party[] = (sspStoreApi.getState().workspace?.metadata.parties ? sspStoreApi.getState().workspace?.metadata.parties : []) as any
            return parties
        },
        index: "uuid",
        synchronize: (newParties) => {
            return sspStoreApi.getState().updateWorkspace((draft) => {
                draft.metadata.parties = newParties
            })
        }
    });
    
    const uuid = v4();
    const parties = {
        [uuid]: {
            type: "person", uuid, name: "bromosapien"
        }
    }
    await sspPartyVirtualStore.getState().import(parties)
    expect(((sspPartyVirtualStore.getState().all().length)) > 0).toBeTruthy()
})

