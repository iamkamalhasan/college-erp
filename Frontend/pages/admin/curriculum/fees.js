import React, { useContext, useEffect, useState } from 'react';
import Button from '../../../utilities/Button';
import Input from "../../../utilities/Input";
import Toast from '../../../utilities/Toast';
import axios from '../../../axios.config';
import Dropdown from '../../../utilities/Dropdown';
import { AppContext } from "../../_app"

const ExamFees = () => {

    const { data: context } = useContext(AppContext)

    const { metadata } = context

    let regulations = [...new Set(metadata.map(doc => doc.regulation))]

    const [showToast, setShowToast] = useState(false);
    const [toastDetails, setToastDetails] = useState({message:"",type:""});
    const [regulation, setRegulation] = useState(regulations[0])
    const [data, setData] = useState(null)

    useEffect(() => {
        axios.get("/admin/curriculum/examfee",{params:{regulation:regulation}})
            .then(res => {
                console.log(res.data);
                if(res.data.success){
                    setToastDetails({message:res.data.message, type:"success"})
                    setShowToast(true)
                  }else{
                    setToastDetails({message:res.data.message, type:"error"})
                    setShowToast(true)
                  }
                  setData(res.data.data)
                
            }).catch(err => console.log(err))
     
    }, [regulation])

  const handleSubmit = () => {
    axios.post("/admin/curriculum/examfee/update",{data:data})
            .then(response => {
                console.log(response.data);
                setToastDetails({message:response.data.message, type:response.data.success ? "success" : "error"})
                setShowToast(true)
                
            }).catch(err => console.log(err.message))
  };
 

  return (
    <>
    { regulations.length > 0 && <div className="w-fit"><Dropdown name="Regulation" update={setRegulation} data={regulations}/></div> }
         {data && <>
            <div className="mt-5">

                <div className='bg-white border rounded-lg px-8 py-6 pb-8 mb-4'>
                    <h2 className="text-lg font-medium text-blue-500 mb-4">
                    Payment Details
                    </h2>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <Input color={"blue"} name="Application Form" value={data.applicationForm} update={(e) => setData({...data, applicationForm:e})}/>
                        <Input color={"blue"} name="Statement of Marks" value={data.statementOfMarks} update={(e) => setData({...data, statementOfMarks:e})}/>
                        <Input color={"blue"} name="Consolidate Marksheet" value={data.consolidateMarkSheet} update={(e) => setData({...data, consolidateMarkSheet:e})}/>
                        <Input color={"blue"} name="Course Completion Certificate" value={data.courseCompletionCertificate} update={(e) => setData({...data, courseCompletionCertificate:e})}/>
                        <Input color={"blue"} name="Provisonal Certificate" value={data.provisionalCertificate} update={(e) => setData({...data, provisionalCertificate:e})}/>
                        <Input color={"blue"} name="Degree Certificate" value={data.degreeCertificate} update={(e) => setData({...data, degreeCertificate:e})}/>
                        <Input color={"blue"} name="Other University Fee" value={data.otherUniversityFee} update={(e) => setData({...data, otherUniversityFee:e})}/>
                    </div>
                    <br />
                    <hr/>
                    <br />
                    <h4 className="text-lg font-medium text-blue-500 mb-4">
                        Course Registration Fee Details
                    </h4>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <Input color={"blue"} name="Theory Courses" value={data.courseRegistrationFee.theory} update={(e) => setData({...data, courseRegistrationFee:{theory:e}})}/>
                        <Input color={"blue"} name="Practical Courses" value={data.courseRegistrationFee.practical} update={(e) => setData({...data, courseRegistrationFee:{practical:e}})}/>
                        <Input color={"blue"} name="Acitivity Points" value={data.courseRegistrationFee.activity} update={(e) => setData({...data, courseRegistrationFee:{activity:e}})}/>
                        <Input color={"blue"} name="Internship" value={data.courseRegistrationFee.internship} update={(e) => setData({...data, courseRegistrationFee:{internship:e}})}/>
                    </div>
                    <br />
                    <hr />
                    <br />
                    <Button color={"blue"} icon={"Done"} name={"save"} event={()=>handleSubmit()}/>
                </div>
            </div>
         </>
         }
    {showToast && <Toast message={toastDetails.message} type={toastDetails.type} />}
            </>
  );

}

export default ExamFees