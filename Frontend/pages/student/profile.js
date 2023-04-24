import axios from "../../axios.config"

import { useEffect, useState } from "react"
import Input from '../../utilities/Input'
import Button from '../../utilities/Button'
import Dropdown from '../../utilities/Dropdown'

const Cutter = ({ title }) => {
    return (
        <div className="flex ml-2 my-5 space-x-2 justify-center items-center">
            <div className="text-sm text-slate-500 font-bold">{title}</div>
            <div className="h-[1px] mt-1 bg-slate-200 w-full"></div>
        </div>
    )
}



const Profile = () => {
    const [document,setDocument] = useState({})
    const [cancel,setCancel]=useState(false)
    const [edit,setEdit] = useState(0)
    const [originalData,setOriginalData] = useState({})
    useEffect(()=>{
        if(cancel){
            axios.put('/student/profile/request/cancel', {   studentId: originalData._id, requestId: originalData.requestId })
            .then((response) => {
            setCancel(false)
            setEdit(originalData.requestId==undefined?0:3)
            }).catch((err) => console.log(err.message));   
        }
        axios.get('/student/profile', { params: { studentId: "643685a65f47c70e6d939220" } })
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
                if(typeof(document[key])=="object"){
                    for (let nestedKey of Object.keys(document[key])){
                        if(typeof(document[key])=="object"){
                                if(document[key][nestedKey]!=originalData[key][nestedKey]){
                                 newData[key][nestedKey]=document[key][nestedKey]
                                 oldData[key][nestedKey]=originalData[key][nestedKey]
                              }
                        
                         }
                    } 
                 }
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
                 fromRef: "Students",
                 body : JSON.stringify(body),
                 type: "Student Profile Request"
                }
            axios.post("/student/profile/request",data )
            .then((response) => {
                setEdit(originalData.requestId==undefined?0:3)
            }).catch((err) => console.log(err.message));
        }else if(edit==3){
            axios.get('/student/profile', { params: { studentId: "643685a65f47c70e6d939220" } })
        .then((response) => {
            setDocument(response.data)
            setEdit(response.data.requestId==undefined||response.data.requestId==""?0:3)
            setOriginalData({...response.data})
        }).catch((err) => console.log(err.message));
        }
    },[edit])


    return  ( document &&  <div>
    <h1 className=" font-bold mb-5">Academic Details</h1>    
        <div className="grid grid-cols-3 px-5">
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1 ">Register Number</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.register} disabled="True" ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Batch</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.batch} disabled="True" ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Current Semester</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.currentSemester} disabled="True" ></Input></div>
                </div>
            </div>

            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Degree</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.degree} disabled="True" ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Regulation</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.regulation} disabled="True" ></Input></div>
                </div>
                
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Date of Join</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.doj} disabled="True" ></Input></div>
                </div>
            </div>

            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Branch</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.branch} disabled="True" ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Section</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.section} disabled="True" ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Type</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.type} disabled="True" ></Input></div>
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
                    <div className=" col-span-1">Mobile Number</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.mobile} disabled={edit!=1} update={(e) => { document.mobile = e; setDocument({...document}) }} ></Input></div>
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
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Aadhar Number</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.aadhar} disabled={edit!=1} update={(e) => { document.firstName = e; setDocument({...document}) }} ></Input></div>
                </div>
                
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    {!edit ? 
                    <>
                    <div className="col-span-1">Gender</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.gender} disabled={edit!=1} update={(e) => { document.gender = e; setDocument({...document}) }}/></div>
                    </>:
                    <>
                    <div className="col-span-1">Gender</div> 
                    <Dropdown name="" data={["Male", "Female","Transgender"]}  />
                    </>                    
                    }
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Date of Birth</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document.dob} disabled={edit!=1} update={(e) => { document.doj = e; setDocument({...document}) }}></Input></div>
                </div>
                
            </div>

            
            
        </div>    
        <div className="grid grid-cols-2 px-5 space-x-5 py-5">
        <div className="col-span-1">
        <div className="grid grid-cols-6 items-center">
                    <div className="text-sm col-span-1">Permanent Address</div> 
                    <textarea className="col-span-5 text-sm border py-2 px-4 block w-full rounded-md disabled" value={document.permanentAddress} onChange={(e)=>{document.permanentAddress = e.target.value; setDocument({...document})}} disabled={edit!=1} ></textarea>
            </div>
        </div>
        <div className="col-span-1">
        <div className="grid grid-cols-6 items-center">
                    <div className="text-sm col-span-1">Temporary Address</div> 
                    <textarea className="col-span-5 text-sm border py-2 px-4 block w-full rounded-md disabled" value={document.temporaryAddress} onChange={(e)=>{document.temporaryAddress = e.target.value; setDocument({...document})}} disabled={edit!=1} ></textarea>
                </div>
        </div>
        </div>

        <div className="my-5">
        <Cutter title={"Father"}></Cutter>
        <div className="grid grid-cols-3 px-7 ">
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Name</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["father.name"] } disabled={edit!=1} update={(e) => { document["father.name"] = e; setDocument({...document}) }} ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Occupation</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["father.occupation"]} update={(e) => { document["father.occupation"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Mobile</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["father.mobile"] } update={(e) => { document["father.mobile"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Income</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["father.income"] } update={(e) => { document["father.income"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>

        </div>        
       
        </div>

        <div className="my-5">
        <Cutter title={"Mother"}></Cutter>
        <div className="grid grid-cols-3 px-7 ">
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Name</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["mother.name"] } disabled={edit!=1} update={(e) => { document["mother.name"] = e; setDocument({...document}) }} ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Occupation</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={ document["mother.occupation"] } update={(e) => { document["mother.occupation"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Mobile</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={ document["mother.mobile"] } update={(e) => { document["mother.mobile"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Income</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={( document["mother.income"])?document["mother.income"]:"" } update={(e) => { document["mother.income"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>

        </div>        
       
        </div>

    {
        <div className="my-5">
        <Cutter title={"Gaurdian"}></Cutter>
        <div className="grid grid-cols-3 px-7 ">
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Name</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={( document["gaurdian.name"])?document["gaurdian.name"]:"" } disabled={edit!=1} update={(e) => { document["gaurdian.name"] = e; setDocument({...document}) }} ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Occupation</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={( document["gaurdian.occupation"])?document["gaurdian.occupation"]:"" } update={(e) => { document["gaurdian.occupation"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Mobile</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={( document["gaurdian.mobile"])?document["gaurdian.mobile"]:"" } update={(e) => { document["gaurdian.mobile"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Income</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={( document["gaurdian.income"])?document["gaurdian.income"]:"" } update={(e) => { document["gaurdian.income"] = e; setDocument({...document}) }} disabled={edit!=1} ></Input></div>
                </div>
            </div>

        </div>        
       
        </div>

}
    <div className="m-5">
    </div>
        <hr className="m-5"></hr>
        <h1 className=" font-bold mb-5">Education Details</h1>    
        <div className="m-5">
        <Cutter title={"SSLC"}></Cutter>
        </div>
        <div className="grid grid-cols-3 px-7 ">
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">School</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["sslc.school"]} disabled={edit!=1} update={(e) => { document["sslc.school"] = e; setDocument({...document}) }} ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Passing Year</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["sslc.passingYear"]} disabled={edit!=1} update={(e) => { document["sslc.passingYear"] = e; setDocument({...document}) }} ></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Board of Education</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["sslc.board"]} disabled={edit!=1} update={(e) => { document["sslc.board"] = e; setDocument({...document}) }} ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Period</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["sslc.period"]} disabled={edit!=1}  update={(e) => { document["sslc.period"] = e; setDocument({...document}) }}></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Percentage</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["sslc.percentage"]} disabled={edit!=1} update={(e) => { document["sslc.percentage"] = e; setDocument({...document}) }} ></Input></div>
                </div>
                
            </div>

        </div>        
        <div className="m-5">
        <Cutter title={"HSC"}></Cutter>
        </div>
        <div className="grid grid-cols-3 px-7 ">
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">School</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["hsc.school"]} disabled={edit!=1} update={(e) => { document["hsc.school"] = e; setDocument({...document}) }} ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Passing Year</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["hsc.passingYear"]} disabled={edit!=1} update={(e) => { document["hsc.passingYear"] = e; setDocument({...document}) }} ></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Board of Education</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={(document["hsc.board"])} disabled={edit!=1} update={(e) => { document["hsc.board "]= e; setDocument({...document}) }}></Input></div>
                </div>
                
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Period</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["hsc.period"]} disabled={edit!=1} update={(e) => { document["hsc.period"] = e; setDocument({...document}) }}></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1" >
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Percentage</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["hsc.percentage"]} disabled={edit!=1} update={(e) => { document["hsc.percentage"] = e; setDocument({...document}) }} ></Input></div>
                </div>
            </div>
        </div>   
        <div className="m-5">
        <Cutter title={"Diploma"}></Cutter>
        </div>
        <div className="grid grid-cols-3 px-7 ">
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Institution</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["diploma.institution"]} disabled={edit!=1} update={(e) => { document["diploma.institution"] = e; setDocument({...document}) }} ></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Passing Year</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["diploma.passingYear"]} disabled={edit!=1} update={(e) => { document["diploma.passingYear"] = e; setDocument({...document}) }}></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1 ">
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Branch</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["diploma.branch"]} disabled={edit!=1} update={(e) => { document["diploma.branch"] = e; setDocument({...document}) }}></Input></div>
                </div>
                
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Period</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["diploma.studyPeriod"]} disabled={edit!=1} update={(e) => { document["diploma.studyPeriod"] = e; setDocument({...document}) }}></Input></div>
                </div>
            </div>
            <div className="space-y-4 text-sm col-span-1" >
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Percentage</div> 
                        <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["diploma.percentage"]} disabled={edit!=1} update={(e) => { document["diploma.percentage"] = e; setDocument({...document}) }}></Input></div>
                </div>
                <div className="grid grid-cols-5 items-center">
                    <div className=" col-span-1">Affiliation</div> 
                    <div className="col-span-4"><Input name="" size="ml-7 w-5/12" value={document["diploma.affiliation"]} disabled={edit!=1} update={(e) => { document["diploma.affiliation"] = e; setDocument({...document}) }}></Input></div>
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
