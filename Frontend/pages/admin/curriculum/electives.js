import { useContext, useEffect, useState } from "react"
import axios from "../../../axios.config"

import initial from "../../../utilities/initial.json"
import Dropdown from "../../../utilities/Dropdown"
import Loading from "../../../utilities/Loading"
import Upload from "../../../utilities/Upload"
import Table from "../../../utilities/Table"
import Input from "../../../utilities/Input"
import Icon from "../../../utilities/Icon"
import { AppContext } from "../../_app"

const ElectiveForm = ({regulation, branch, setOpen }) => {

    const [semester,setSemester] = useState()
    const [pe,setPE] = useState()
    const [oe,setOE] = useState()
    const [ submit, setSubmit ] = useState(false)
    
    useEffect(() => {

        if(submit) {
            let data = { branch:branch, regulation: regulation, semester: semester, pe: pe,oe: oe}
            
            axios.post('/admin/electives/add', [data])
                .then(response => { setSubmit(false); setOpen(false) })
                .catch(err => console.log(err.message))
        }

    }, [ submit ])
    

    return (
        <>
        <div className="absolute w-full h-full top-0 left-0 bg-slate-300/25"></div>
        <form onSubmit={(e) => {e.preventDefault(); setSubmit(true)}} className="absolute w-fit bg-white border rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
            <div className="absolute cursor-pointer text-red-500 top-4 right-2" onClick={() => setOpen(false)}>
                <Icon name="close"/>
            </div>
            <div className="text-xl w-fit m-auto my-4">Add Elective</div><hr/>
            <div className="flex space-x-4 justify-center w-fit m-4">
                <Input  name="Branch" disabled value={branch}/>
                <Input  name="Semester" update={(e) => { setSemester(e)}} required/>
            </div>
            <div className="flex space-x-4 justify-center w-fit m-4">
                <Input  name="Open Electives" update={(e) => { setOE(e)}} required/>
                <Input  name="Professional Electives" update={(e) => { setPE(e)}} required/>
            </div>
            <hr/>
            <div className="flex justify-center p-2">
            <button type="submit" className={`py-2 w-full rounded-md cursor-pointer font-semibold text-sm  text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500"}`} disabled={submit ? "disabled" : ""}>Add</button>

            </div>
        </form></>
    )
}

const Electives = () => {

    const { data: context } = useContext(AppContext)

    const { branches, metadata } = context

    let regulations = [...new Set(metadata.map(doc => doc.regulation))], branchList = [ "ALL", ...new Set(branches.map(doc => doc.branch)) ]

    const [ open, setOpen ] = useState(false)
    const [ data, setData ] = useState(null)
    const [ editedDoc, setEditedDoc ] = useState({})
    const [regulation,setRegulation] = useState(regulations[0])
    const [branch,setBranch] = useState("ALL")

    useEffect(() => {

        axios.get('/admin/electives')
            .then(response => {
                let data = response.data
                setData(data)
            })
            .catch(err => console.log(err.message))
    
    }, [])

    useEffect(() => {
        if(JSON.stringify(editedDoc) != "{}")
            for(let idx in data)
                if(data[idx]._id == editedDoc._id) {
                    console.log(editedDoc);
                    axios.put('/admin/electives/update', editedDoc)
                        .then(response => {
                            data[idx] = {...editedDoc}
                            setData([...data])
                        }).catch(err => console.log(err.message))
                }
    }, [ editedDoc ])

    const filterCheck = (doc) => (doc.regulation == regulation) && (branch == "ALL" ? true : doc.branch == branch)

    return (data ? <>
        <div className="mr-2 flex justify-between mb-12">
            <div className="flex space-x-6">
                <Dropdown name="Regulation" initial={regulations[0]} update={setRegulation} data={regulations}/>
                <Dropdown name="Branch" initial={branchList[0]} update={setBranch} data={branchList} />
            </div>
           <div className="flex mt-2 space-x-2 mr-20">
           <div className="p-2 border cursor-pointer flex rounded-lg text-sm w-fit group" onClick={() => setOpen(true)}>
                <Icon name="add"/>
                <div className="mt-0.5 ease-in duration-150 h-0 w-0 opacity-0 pointer-events-none group-hover:h-fit group-hover:w-fit group-hover:opacity-100 group-hover:ml-2">Add Elective</div>
            </div>
                { open && <ElectiveForm regulation={regulation} branch={branch} setOpen={setOpen}/> }
                <Upload path="/admin/electives/upload" template={initial.electives} context="electives"/>
           </div>
        </div>
        <Table editable data={data.filter(doc => filterCheck(doc)).sort((a, b) => a.semester - b.semester)} update={setEditedDoc} indexed/><br/>
        </> : <Loading />
    )
}

export default Electives