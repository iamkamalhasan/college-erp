import { useContext, useEffect, useState } from "react"
import axios from "../../axios.config"

import Download from "../../utilities/Download"
import Dropdown from "../../utilities/Dropdown"
import Upload from "../../utilities/Upload"
import Search from "../../utilities/Search"
import Table from "../../utilities/Table"
import initial from "../../utilities/initial.json"
import { AppContext } from "../_app"

const Students = () => {

    const { data: context } = useContext(AppContext)

    const { branches, metadata } = context

    let batchList = [...new Set(metadata.map(doc => doc.batch))].sort((a, b) => b - a), branchList = [ "ALL", ...new Set(branches.map(doc => doc.branch)) ]

    let omit = [ "_id", "father", "mother", "guardian", "sslc", "hsc", "diploma", "personalEmail", "undergraduate", "permanentAddress", "temporaryAddress", "firstName", "lastName", "masterAttendance", "requestId", "hallTicketRelease" ]

    const omitFields = (field) => !omit.some(item => item == field)

    const [ batch, setBatch ] = useState(batchList.sort((a,b)=>b-a)[0])
    const [ branch, setBranch ] = useState("ALL")
    const [ type, setType ] = useState("ALL")
    
    const [ filter, setFilter ] = useState(null)
    const [ fields, setFields ] = useState(null)
    const [ search, setSearch ] = useState("")

    const [ data, setData ] = useState(null)
    const [ editedDoc, setEditedDoc ] = useState({})

    useEffect(() => {

        axios.get('/admin/students', { params: { batch } })
            .then(response => {
                let data = response.data, fields = []
                if(data.length > 0)
                    fields = Object.keys(data[0]).filter(key => omitFields(key))
                setFilter(fields[0])
                setFields(fields)
                setData(data)
            })
            .catch(err => console.log(err.message))

    }, [ batch ])

    useEffect(() => {
        if(JSON.stringify(editedDoc) != "{}")
            for(let idx in data)
                if(data[idx]._id == editedDoc._id) {
                    axios.put('/admin/student/update', editedDoc)
                        .then(response => {
                            data[idx] = {...editedDoc}
                            setData([...data])
                        }).catch(err => console.log(err.message))
                }
    }, [ editedDoc ])
    
    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase())

    const filterCheck = (doc) => (doc.batch == batch) && (branch == "ALL" ? true : doc.branch == branch) && (type == "ALL" ? true : doc.type.toLowerCase() == type.toLowerCase()) && filterSearch(doc)

    return ( data ? <>
        <div className="mr-2 flex justify-between">
           {batchList.length>0 && branchList.length>0 &&  <><div className="flex space-x-6">
                <Dropdown name="Batch" update={setBatch} data={batchList}/>
                <Dropdown name="Branch" update={setBranch} data={branchList} />
                <Dropdown name="Type" update={setType} data={[ "ALL", "regular", "lateral", "transfer" ]}/> 
            </div>
            { data.length > 0 && <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/> }</>}
            <div className="flex mt-2 space-x-2">
                <Upload path="/admin/students/upload" template={initial.student} context="student" rules={[ "No field should be left blank", <>Double check the <code classname="text-xs">register</code> field</> ]}/>
                <Download data={data.filter(doc => filterCheck(doc))} name="students"/>
            </div>
        </div><br/>
        <Table editable data={data.filter(doc => filterCheck(doc))} update={setEditedDoc} omit={omit} indexed/><br/>
        </> : <div>Loading</div>
    )
}
 
export default Students;