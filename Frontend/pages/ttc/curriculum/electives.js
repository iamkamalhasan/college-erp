import axios from "../../../axios.config"
import { useContext, useEffect, useState } from "react"

import Table from "../../../utilities/Table"
import Dropdown from "../../../utilities/Dropdown"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Electives = () => {

    const { data: context } = useContext(AppContext)

    const { branches, metadata } = context

    let regulations = [...new Set(metadata.map(doc => doc.regulation))], branchList = [ "ALL", ...new Set(branches.map(doc => doc.branch)) ]

    const [ data, setData ] = useState(null)
    const [ regulation, setRegulation ] = useState(regulations[0])
    const [ branch, setBranch ] = useState("ALL")

    useEffect(() => {

        axios.get('/admin/electives')
            .then(response => {
                let data = response.data
                setData(data)
            })
            .catch(err => console.log(err.message))
    
    }, [])

    const filterCheck = (doc) => (doc.regulation == regulation) && (branch == "ALL" ? true : doc.branch == branch)

    return (data ? <>
        <div className="mr-2 flex justify-between mb-12">
            { regulations.length > 0 && branchList.length > 0 && <div className="flex space-x-6">
                <Dropdown name="Regulation" update={setRegulation} data={regulations}/>
                <Dropdown name="Branch" update={setBranch} data={branchList} />
            </div>}
        </div>
        <Table data={data.filter(doc => filterCheck(doc))}/><br/>
        </> : <Loading />
    )
}

export default Electives