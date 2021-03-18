# store
Frontend Store powered by json schemas and zustand

    yarn add git://github.nrel.gov/CyberSecurity/store.git

# tests
    RUNS  tests/groceries-store.test.ts
    RUNS  tests/oscal-store.test.ts

    Test Suites: 2 passed, 2 total
    Tests:       7 passed, 7 total
    Snapshots:   0 total
    Time:        7.713 s
    Ran all test suites.

# example

The store is a souped up object dictionary that uses zustand under the hood to notifiy react-components to re-render.


create a hook :
    const useAddress=composeStore(addressSchema)

insert & display some data:

     ()=>{
         const {insert,all} = useAddress();
         return <>
         {all.map({street_address}=>
             <p>{street_address}</p>)}
            <button onClick={()=>{
                insert({street_address:'123 singularity way'})
            }}>
            </button>
         </>
     }
Use Immer for updates
     ()=>{
        const updateAddress = useAddress(x=>x.update)
        updateAddress(index,(addressDraft)=>{
            addressDraft.street_address += "( unverified )"
        })
     }



add a listener
     ()=>{
         const onAddressStoreChange = useAddress(x=>x.addListener)
        onAddressStoreChange((i, address, status)=>{
            if(status==="updating"){
                alert("updated address!")
            }
        })
     }

