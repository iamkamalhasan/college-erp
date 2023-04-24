import { useContext, useEffect, useState } from "react"
import axios from "../../../axios.config"

import Download from "../../../utilities/Download"
import Dropdown from "../../../utilities/Dropdown"
import Search from "../../../utilities/Search"
import Table from "../../../utilities/Table"
import Loading from "../../../utilities/Loading"
import { AppContext } from "../../_app"

const Courses = () => {

    const { data: context } = useContext(AppContext)

    const { branches, metadata } = context

    console.log(context);

    let regulations = [...new Set(metadata.map(doc => doc.regulation))], branchList = [ "ALL", ...new Set(branches.map(doc => doc.branch)) ]

    let omit = [ "_id", "marks", "hours" ]
    const omitFields = (field) => !omit.some(item => item == field)

    const [ regulation, setRegulation ] = useState(regulations[0])
    const [ branch, setBranch ] = useState("ALL")
    const [ type, setType ] = useState("ALL")
    
    const [ filter, setFilter ] = useState(null)
    const [ fields, setFields ] = useState(null)
    const [ search, setSearch ] = useState("")

    const [ data, setData ] = useState(null)

    useEffect(() => {

        axios.get('/admin/curriculum', { params: { regulation } })
            .then(response => {
                let data = response.data, fields = []
                fields = Object.keys(data[0]).filter(key => omitFields(key))
                setFilter(fields[0])
                setFields(fields)
                setData(data)
            })
            .catch(err => console.log(err.message))

    }, [ regulation ])
    
    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase())

    const filterCheck = (doc) => (doc.regulation == regulation) && (branch == "ALL" ? true : doc.branch == branch) && (type == "ALL" ? true : doc.type.toLowerCase() == type.toLowerCase()) && filterSearch(doc)

    return ( data ? <>
        <div className="mr-2 flex justify-between">
            { regulations.length > 0 && branchList.length > 0 && <div className="flex space-x-6">
                <Dropdown name="Regulation" update={setRegulation} data={regulations}/>
                <Dropdown name="Branch" update={setBranch} data={branchList}/>
                <Dropdown name="Type" update={setType} data={[ "ALL", "theory", "practical" ]}/> 
            </div>}
            { data.length > 0 && <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/> }
            <div className="flex mt-2 space-x-2">
                <Download ids={data.filter(doc => filterCheck(doc)).map(doc => doc._id)} name="curriculum"/>
            </div>
        </div><br/>
        <Table data={data.filter(doc => filterCheck(doc))} omit={omit}/><br/>
        </> : <Loading />
    )
}
 
export default Courses;