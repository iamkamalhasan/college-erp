import { useContext, useEffect, useState } from "react"
import axios from "../../../axios.config"

import initial from "../../../utilities/initial.json"
import Download from "../../../utilities/Download"
import Dropdown from "../../../utilities/Dropdown"
import Loading from "../../../utilities/Loading"
import Upload from "../../../utilities/Upload"
import Search from "../../../utilities/Search"
import Table from "../../../utilities/Table"
import { AppContext } from "../../_app"

const Courses = () => {

    const { data: context } = useContext(AppContext)

    const { branches, metadata } = context

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
    const [ editedDoc, setEditedDoc ] = useState({})

    useEffect(() => {

        axios.get('/admin/curriculum', { params: { regulation } })
            .then(response => {
                let data = response.data, fields = []
                if(data.length > 0)
                    fields = Object.keys(data[0]).filter(key => omitFields(key))
                setFilter(fields[0])
                setFields(fields)
                setData(data)
            })
            .catch(err => console.log(err.message))

    }, [ regulation ])

    useEffect(() => {
        if(JSON.stringify(editedDoc) != "{}")
            for(let idx in data)
                if(data[idx]._id == editedDoc._id) {
                    axios.put('/admin/curriculum/update', editedDoc)
                        .then(response => {
                            data[idx] = {...editedDoc}
                            setData([...data])
                        }).catch(err => console.log(err.message))
                }
    }, [ editedDoc ])
    
    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase())

    const filterCheck = (doc) => (doc.regulation == regulation) && (branch == "ALL" ? true : doc.branch == branch) && (type == "ALL" ? true : doc.type.toLowerCase() == type.toLowerCase()) && filterSearch(doc)

    return ( data ? <>
        <div className="mr-2 flex justify-between">
        { regulations.length > 0 && branchList.length > 0 && <div className="flex space-x-6">
                <Dropdown name="Batch" update={setRegulation} data={regulations}/>
                <Dropdown name="Branch" update={setBranch} data={branchList}/>
                <Dropdown name="Type" update={setType} data={[ "ALL", "theory", "practical" ]}/> 
            </div>}
            { data.length > 0 && <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/>}
            <div className="flex mt-2 space-x-2">
                <Upload path="/admin/curriculum/upload" template={initial.courses} context="curriculum"/>
                <Download data={data.filter(doc => filterCheck(doc))} name="curriculum"/>
            </div>
        </div><br/>
        <Table editable data={data.filter(doc => filterCheck(doc))} update={setEditedDoc} omit={omit} indexed/><br/>
        </> : <Loading />
    )
}
 
export default Courses;