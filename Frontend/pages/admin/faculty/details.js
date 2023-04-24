import { useContext, useEffect, useState } from "react"
import axios from "../../../axios.config"

import initial from "../../../utilities/initial.json"
import Download from "../../../utilities/Download"
import Dropdown from "../../../utilities/Dropdown"
import Button from "../../../utilities/Button"
import Upload from "../../../utilities/Upload"
import Search from "../../../utilities/Search"
import Table from "../../../utilities/Table"
import Input from "../../../utilities/Input"
import Icon from "../../../utilities/Icon"
import { AppContext } from "../../_app"

const FacultyForm = ({ branchList, setOpen }) => {
    
    const [branch, setBranch] = useState(branchList[0]);
    const [email, setEmail] = useState(null);
    const [FacultyId, setFacultyId] = useState(null);
    const [fName, setFName] = useState(null);
    const [lName, setLName] = useState(null);
    const [mobile, setMobile] = useState(null);
    const [title,setTitle] = useState("Dr.");
    const [primaryRole,setPrimaryRole] = useState("CI");
    const [type,setType]= useState("");
    const [roles, setRoles]=useState({"cfa":false, "hod": false, "pc": false, "ttc": false, "fa": false, "ci": false});
    const [submit, setSubmit] = useState(false);
  
    useEffect(() => {
    
        if (submit  && email && FacultyId && fName && lName && mobile ) {
        
            let data = { branch: branch, email: email, facultyId: FacultyId, firstName: fName, lastName: lName, mobile: mobile, primaryRole: primaryRole.toLowerCase(), title: title, type: type, ...roles };
            axios.post("/admin/faculty/add", data)
                .then((response) => {
                    setSubmit(false);
                    setOpen(false);
                }).catch((err) => console.log(err.message));
        }

    }, [submit]);


    return ( <>
        <div className="absolute z-50 w-full h-full top-0 left-0 bg-slate-300/25"></div>
        <div className="absolute z-50 w-fit bg-white rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="absolute cursor-pointer text-red-500 top-4 right-2" onClick={() => setOpen(false)}>
                <Icon name="close" />
            </div>
      
            <div className="text-xl font-bold w-fit m-auto my-4">
                Add New Faculty
            </div><hr />

            <div className="flex space-x-4 justify-center w-fit m-4">
                <Dropdown data={["Dr.","Mr.","Mrs."]} update={setTitle} />
                <Input name="First Name" type="text" color="blue" value={fName} update={setFName} />
                <Input name="Last Name" type="text" color="blue" value={lName} update={setLName} />
            </div>

            <div className='flex justify-around py-5 border rounded-lg'>
                <label className=' justify-center flex items-center'>Roles</label>
                    <div className="grid grid-cols-6">
                    {
                        Object.keys(roles).map((role, idx) =>
                            <div key={idx} className=" col-span-2 justify-center">
                                    <input
                                        onChange={(e) => { roles[role] = e.target.checked; setRoles({...roles}) }}
                                        name={role} type="checkbox">
                                    </input>
                                <label className="p-5">{role.toUpperCase()}</label>
                            </div>
                        )}
                </div>
            </div>
            <div className="flex space-x-4 justify-center w-fit m-4">
                <Dropdown update={setBranch} initial={branch} name="Branch" data={branchList} />
                <Dropdown update={setPrimaryRole} initial={primaryRole} name="Primary Role" data={["CFA", "HOD", "PC", "TTC", "FA", "CI"]} />
            </div>
      
            <div className="flex space-x-4 justify-center w-fit m-4">
                <Input name="Faculty ID" type="number" color="blue" value={FacultyId} update={setFacultyId} />
                <Input name="Type" type="text" color="blue" value={type} update={setType} />
            </div>
      
            <div className="flex space-x-4 justify-center w-fit m-4">
                <Input name="Email" type="email" color="blue" value={email} update={setEmail} />
                <Input name="Mobile" type="text" color="blue" value={mobile} update={setMobile} />
            </div><hr />
      
            <div className="p-3">
                <Button name="Add" color="blue" event={() => setSubmit(true)} disabled={submit} size="full"/>
            </div>
        </div></>)
}


const Details = () => {

    const { data: context } = useContext(AppContext)

    let branchList = [ "ALL", ...new Set(context.branches.map(doc => doc.branch)), "Mathematics", "Tamil", "English", "Physics", "Chemistry", "Humanities", "Biology" ]

    let omit = [ "_id", "cfa", "hod", "pc", "ttc", "fa", "ci", "firstName", "lastName", "requestId", "isActive" ]
    const omitFields = (field) => !omit.some(item => item == field)
    
    const [ open, setOpen ] = useState(false);
    const [ branch, setBranch ] = useState("ALL")
    const [ filter, setFilter ] = useState(null)
    const [ fields, setFields ] = useState(null)
    const [ search, setSearch ] = useState("")
    const [ data, setData ] = useState(null)
    const [ editedDoc, setEditedDoc ] = useState({})

    useEffect(() => {   
        axios.get("/admin/faculty")
            .then((response) => {
                let data = response.data, fields = [];
                if(data.length > 0)
                fields = Object.keys(data[0]).filter((key) => omitFields(key));
                setFilter(fields[0]);
                setFields(fields);
                setData(data);
            }).catch((err) => console.log(err.message));

    }, [ open ])

    useEffect(() => {

        if(JSON.stringify(editedDoc) != "{}")
            for(let idx in data)
                if(data[idx]._id == editedDoc._id) {
                    axios.put('/admin/faculty/update', editedDoc)
                        .then(response => {
                            data[idx] = {...editedDoc}
                            setData([...data])
                        }).catch(err => console.log(err.message))
                }
    
    }, [ editedDoc ])
    
    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase())

    const filterCheck = (doc) => (branch == "ALL" ? true : doc.branch == branch) && filterSearch(doc)

    return ( data ? <>
        <div className="mr-2 flex justify-between">

            <div className="flex space-x-6">
                <Dropdown name="Branch" update={setBranch} data={branchList}/>
            </div>
            
            { data.length > 0 && <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/> }
            
            <div className="flex mt-2 space-x-2">
                <div className="p-2 border cursor-pointer flex rounded-lg text-sm w-fit group" onClick={() => setOpen(true)}>
                <Icon name="add"/>
                <div className="mt-0.5 ease-in duration-150 h-0 w-0 opacity-0 pointer-events-none group-hover:h-fit group-hover:w-fit group-hover:opacity-100 group-hover:ml-2">Add Faculty</div>
            </div>
            <Upload path="/admin/faculty/upload" template={initial.faculty} context="faculty"/>
            <Download data={data.filter(doc => filterCheck(doc))} name="faculty"/>
            </div>
        
        </div><br/>
        <Table editable data={data.filter(doc => filterCheck(doc))} update={setEditedDoc} omit={omit} indexed/><br/>
        { open && <FacultyForm branchList={branchList.filter(doc => doc != "ALL")} setOpen={setOpen}/> }
        </> : <div>Loading</div>)
}
 
export default Details;
