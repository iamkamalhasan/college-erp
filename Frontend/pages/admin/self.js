import { useEffect, useState } from "react"
import axios from "../../axios.config"

import Dropdown from "../../utilities/Dropdown"
import Search from "../../utilities/Search"
import Table from "../../utilities/Table"
import Icon from "../../utilities/Icon"
import Input from "../../utilities/Input"

const SelfForm = ({ setOpen }) => {
    
    const [email, setEmail] = useState(null);
    const [SelfId, setSelfId] = useState(null);
    const [fName, setFName] = useState(null);
    const [lName, setLName] = useState(null);
    const [mobile, setMobile] = useState(null);
    const [title,setTitle] = useState("Dr.");
    const [submit, setSubmit] = useState(false);
  
    useEffect(() => {
    
        if (submit  && email && SelfId && fName && lName && mobile ) {
        
            let data = { email, adminId: SelfId, firstName: fName, isCredentialCreated: false, lastName: lName, mobile: mobile, title: title };
            axios.post("/admin/manage", data)
                .then((response) => {
                    setSubmit(false);
                    setOpen(false);
                }).catch((err) => console.log(err.message));
        }

    }, [submit]);

    return (
        <div className="absolute w-fit bg-white rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="absolute cursor-pointer text-red-500 top-4 right-2" onClick={() => setOpen(false)}>
                <Icon name="close" />
            </div>
      
            <div className="text-xl font-bold w-fit m-auto my-4">
                Add New Admin
            </div><hr />

            <div className="flex space-x-4 justify-center w-fit m-4">
                <Dropdown data={["Dr.","Mr.","Mrs."]} update={setTitle} />
                <Input name="First Name" type="text" color="blue" value={fName} update={setFName} />
                <Input name="Last Name" type="text" color="blue" value={lName} update={setLName} />
            </div>
      
            <div className="flex space-x-4 justify-center w-fit m-4">
                <Input name="Admin ID" type="number" color="blue" value={SelfId} update={setSelfId} />
            </div>
      
            <div className="flex space-x-4 justify-center w-fit m-4">
                <Input name="Email" type="email" color="blue" value={email} update={setEmail} />
                <Input name="Mobile" type="text" color="blue" value={mobile} update={setMobile} />
            </div><hr />
      
            <div onClick={() => setSubmit(true)} className={`py-2 px-2 flex space-x-2 rounded-md cursor-pointer font-semibold text-sm m-4 text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500" }`} disabled={submit ? "disabled" : ""} >
                <Icon name="add"/>
                Add
            </div>

        </div>)
}


const Self = () => {

    let omit = [ "_id", "isActive" ]
    const omitFields = (field) => !omit.some(item => item == field)
    
    const [ open, setOpen ] = useState(false);
    const [ filter, setFilter ] = useState(null)
    const [ fields, setFields ] = useState(null)
    const [ search, setSearch ] = useState("")
    const [ data, setData ] = useState(null)
    const [ editedDoc, setEditedDoc ] = useState({})

    useEffect(() => {   
        axios.get("/admin")
            .then((response) => {
                let data = response.data, fields = [];
                console.log(data);
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
                    axios.post('/admin/manage', editedDoc)
                        .then(response => {
                            data[idx] = {...editedDoc}
                            setData([...data])
                        }).catch(err => console.log(err.message))
                }
    
    }, [ editedDoc ])
    
    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase())

    const filterCheck = (doc) => filterSearch(doc)

    return (  <><div>
        <div className="mr-2 flex justify-between">            
            <div className="flex mt-2 space-x-2">
                <div className="p-2 border cursor-pointer flex rounded-lg text-sm w-fit group" onClick={() => setOpen(true)}>
                <Icon name="add"/>
                <div className="mt-0.5 ease-in duration-150 h-0 w-0 opacity-0 pointer-events-none group-hover:h-fit group-hover:w-fit group-hover:opacity-100 group-hover:ml-2">Add Admin</div>
            </div>
            { data && data.length> 0 && <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/> }
            </div>
        
        </div><br/>
        {
            data?.length>0 && <div>
            <Table editable data={data.filter(doc => filterCheck(doc))} update={setEditedDoc} omit={omit} indexed/><br/>
            </div>
        }
        </div>
        <div>{ open && <SelfForm setOpen={setOpen}/> }</div></>
        )
}
 
export default Self;
