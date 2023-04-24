import axios from "../axios.config"

import { useEffect, useState } from "react"
import Input from '../utilities/Input'
import Button from '../utilities/Button'
import Dropdown from '../utilities/Dropdown'
import Icon from '../utilities/Icon'

const Profile = () => {
    const [document,setDocument] = useState({}) 
    const [cancel,setCancel]=useState(false)
    const [edit,setEdit] = useState(0)
    const [originalData,setOriginalData] = useState({})
    useEffect(()=>{
        if(cancel){
            axios.put('/ci/profile/request/cancel', { requestId: originalData.requestId })
            .then((response) => {
            setCancel(false)
            setEdit(originalData.requestId==undefined?0:3)
            }).catch((err) => console.log(err.message));   
        }
        axios.get('/ci/profile', { params: { facultyId: "643ee0ec5ba81c8116e6b369" } })
        .then((response) => {
            setDocument(response.data)
            setEdit(response.data.requestId==undefined||response.data.requestId==""?0:3)
            setOriginalData({...response.data})
        }).catch((err) => console.log(err.message));
    }, [cancel])

    useEffect(()=>{
        if(document && originalData && edit==2){
        let newData={}
        let oldData={}
            
            for (let key of Object.keys(originalData)){
                if(document[key]!=originalData[key]){
                    newData[key]=document[key]
                    oldData[key]=originalData[key]
                }

            }
            let body = {
                new: newData,
                old: oldData
                }
            let data = {
                from : originalData._id,
                 to: originalData.toId, 
                 fromRef: "Faculty",
                 body : JSON.stringify(body),
                 type: "Faculty Profile Request"
                }
            axios.post("/ci/profile/request",data )
            .then((response) => {
                setEdit(originalData.requestId==undefined?0:3)
            }).catch((err) => console.log(err.message));
        }else if(edit==3){
            axios.get('/ci/profile', { params: { facultyId: "643ee0ec5ba81c8116e6b369" } })
        .then((response) => {
            setDocument(response.data)
            setEdit(response.data.requestId==undefined||response.data.requestId==""?0:3)
            setOriginalData({...response.data})
            console.log(originalData)

        }).catch((err) => console.log(err.message));
        }
    },[edit])


    return  ( document &&  <div>
    <h1 className=" font-bold mb-5">Academic Details</h1>    
        <div className="grid grid-cols-3 px-5">
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1 ">Faculty ID</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.facultyId} disabled="True" ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1 ">Branch</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.branch} disabled="True" ></Input></div>
                </div>
                
                
            </div>

            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">                
                    <div className="col-span-1">Primary Role</div> 
                    <span className="ml-4"><Dropdown name="" data={["CFA", "HOD", "PC", "TTC", "FA", "CI" ]} disabled={edit!=1 }  update={(e) => { document.primaryRole = e; setDocument({...document})}}  /></span>
                </div>
       
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Title</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.title} disabled="True" ></Input></div>
                </div>
            </div>

            <div className="space-y-4 text-sm col-span-1 ">
            <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Type</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.type} disabled="True" ></Input></div>
            </div>
            <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Roles</div> 
            <div className=" col-span-4 grid grid-cols-4 ">
                <div className="cols-span-3">
                {document.fa && <div className=" ml-7 flex space-x-2 items-center">
                      <Icon name={"done"}></Icon><div>CFA</div>
                    </div>}
                    {document.ca && <div className=" ml-7 flex space-x-2 items-center">
                      <Icon name={"done"}></Icon><div>HOD</div>
                    </div>}
                    {document.fa && <div className=" ml-7 flex space-x-2 items-center">
                      <Icon name={"done"}></Icon><div>PC</div>
                    </div>}
                
                 </div >
                <div className="col-span-1">
                {document.fa && <div className=" ml-7 flex space-x-2 items-center">
                      <Icon name={"done"}></Icon><div>TTC</div>
                    </div>}
                    {document.ca && <div className=" ml-7 flex space-x-2 items-center">
                      <Icon name={"done"}></Icon><div>FA</div>
                    </div>}
                    {document.fa && <div className=" ml-7 flex space-x-2 items-center">
                      <Icon name={"done"}></Icon><div>CI</div>
                    </div>}
                </div>
            </div>
        </div>
    </div>       
</div>
        <hr className="m-5"></hr>

        <h1 className=" font-bold mb-5">Personal Details</h1>    
        <div className="grid grid-cols-3 px-5">
        
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">First Name</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.firstName} disabled={edit!=1} update={(e) => { document.firstName = e; setDocument({...document}) }} ></Input></div>
                </div>
                
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Email</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.email} disabled={edit!=1} update={(e) => { document.email = e; setDocument({...document}) }} ></Input></div>
                </div>
                
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Last Name</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.lastName} disabled={edit!=1} update={(e) => { document.lastName = e; setDocument({...document}) }}></Input></div>
                </div>
               
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
            <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Mobile Number</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.mobile} disabled={edit!=1} update={(e) => { document.mobile = e; setDocument({...document}) }} ></Input></div>
                </div>
            </div>

            
            
        </div>    
        <div className="grid grid-cols-2 px-5 space-x-5 py-5">
        <div className="col-span-1">
        <div className="grid grid-cols-6 items-center">
                    <div className="text-sm col-span-1">Address</div> 
                    <textarea className="col-span-5 text-sm border py-2 px-4 block w-full rounded-md disabled" value={document.Address} onChange={(e)=>{document.Address = e.target.value; setDocument({...document})}} disabled={edit!=1} ></textarea>
            </div>
        </div>
        </div>

        <div className="m-5 flex items-center space-x-3 justify-between">
            {edit<=1 && <Button  name={edit==0? "Edit" : "save"} color="blue" disabled={edit>1}  event={() => edit < 2 && setEdit(edit+1)} />}
            {edit==1 && <Button name="Cancel" color="blue" event={()=>setEdit(0)} outlined/>}
            {edit!=0 && edit!=1 &&<><code className="text-blue-500 text-lg flex items-center">Requested</code><Button  name="Cancel Request" color="blue"  event={() => {setCancel(true)}} /></>}
        
        </div>
            <hr className="mt-10"></hr>
        </div> 
    )
}
export default Profile