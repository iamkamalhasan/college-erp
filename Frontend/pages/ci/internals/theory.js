import Table from "../../../utilities/Table"
import Button from "../../../utilities/Button";
import Dropdown from "../../../utilities/Dropdown";
import Upload from "../../../utilities/Upload";
import axios from '../../../axios.config';
import { jsonToExcel } from "../../../utilities/helpers";
import { createElement, useEffect, useState, useRef } from "react";
import Icon from "../../../utilities/Icon";

const Theory = () => {
    const [courses, setCourses] = useState([])
    const [display, setDisplay] = useState(true)
    const [students, setStudents] = useState([])
    const [type,setType] = useState("Unit Test");
    const [typeNum,setTypeNum] = useState("All");
    const [showModal,setShowModal] = useState(false);
    const [currentCourse,setCurrentCourse] = useState("");

    const getHandlingCourses = async () => {
        // 63f42892a8a5c50a79ed2664
        // 63f42892a8a5c50a79ed2660
        let { data } = await axios.get('/ci/internals/theory',
        { params : { facultyId : '63f42892a8a5c50a79ed2660'}});
    
        data = data.map((d) => {
            const button = createElement('button',{className: 'bg-blue-500 text-white text-sm px-2 py-1 rounded-md hover:cursor-pointer', onClick:getEnrolledStudents, id : d._id},"Fetch")
            d.action = button ;
            return d;
        })
        setCourses(data);
    }
    const getInternalsData = async(e) => {
        let {data} = await axios.get('/ci/internals/theory/course/get',
        { params : {courseId:e.target.id}});
        setCurrentCourse(e.target.id);
        studentData = data.map( (student) =>{
            let s;
        } )
        console.log(data);
    }
    const getEnrolledStudents = async (e) => {
        let { data } = await axios.get('/ci/internals/theory/course',
        { params : {courseId:e.target.id}});
        setCurrentCourse(e.target.id);
        
        data = data.map( d => {
            const student = {...d};
            student.UT1 = Math.floor(Math.random() * (50-40) + 40);
            student.UT2 = Math.floor(Math.random() * (50-40) + 40);
            student.UT3 = Math.floor(Math.random() * (50-40) + 40);
            student.UTAVG_30 = Number.parseInt((student.UT1+student.UT2+student.UT3)/5);
            student.A1 = Math.floor(Math.random() * (15-10) + 10);
            student.A2 = Math.floor(Math.random() * (15-10) + 10);
            student.A3 = Math.floor(Math.random() * (15-10) + 10);
            student.ASAVG_15 = Number.parseInt((student.A1 + student.A1 + student.A1)/3);  
            student.T1 = Math.floor(Math.random() * (5-1) + 1);
            student.T2 = Math.floor(Math.random() * (5-1) + 1);
            student.T3 = Math.floor(Math.random() * (5-1) + 1);
            student.TUTAVG_5 = Number.parseInt((student.T1 + student.T2 + student.T3) /3);
            student.TOTAL_50 = Number.parseInt(student.UTAVG_30 + student.ASAVG_15 + student.TUTAVG_5);
            return student;
        })
        setStudents(data);
        setDisplay(!display);
    }
    
    const changeDisplay = () => {
        setType("Unit Test");
        setDisplay(!display);
        setShowModal(false);
    }

    const openModal = () => {
        setShowModal(true);
    }
    useEffect( () => {
        getHandlingCourses();
    },[display]);

    let omitable = ["studentId","enrollmentId","UT1","UT2","UT3","A1","A2","A3","T1","T2","T3","UTAVG_30","ASAVG_15","TUTAVG_5","TOTAL_50"]
    return(
    <div>
        {display && courses && <Table data={courses} editable={false} indexed={true} omit={["_id","facultyId","requirement","semType","type"]}/>}
        {!display && 
        <div className="flex justify-between">
            <div className="flex justify-end gap-4">
                <button className="bg-blue-500 text-white text-md py-1 px-2 mb-2 h-8 rounded-md hover:cursor-pointer mr-4" onClick={changeDisplay}>Back</button>
                <CourseCard courses={courses} currentCourseId={currentCourse}/>
            </div>
            <div className="flex justify-evenly gap-6 mr-4">
                {type==="Overall" && <button className="flex gap-3 bg-slate-500 text-white justify-center items-center border border-slate-400 rounded-lg ml-3 py-1 px-2 mb-2" onClick={()=>{
                    let studentsData = students.map((s)=>{
                        let st;
                        delete s.enrollmentId;
                        delete s.studentId;
                        st = s;
                        return st;
                    })
                    jsonToExcel(studentsData)
                    }}><Icon size={"md"} name={"Download"}/> <p className="text-sm">Download</p></button>}  
                <Dropdown data={["Unit Test", "Assignment", "Tutorial","Overall"]} update={(e) => { setType(e); }}/>
                <Dropdown data={["All",1,2,3]} update={(e) => { setTypeNum(e)}} />

                <button className="bg-blue-500 text-white text-md px-4 py-1 mb-2 h-9 rounded-md hover:cursor-pointer" onClick={openModal}><p className="text-sm font">Set Questions</p></button>
                {/* <Upload path={"/ci/internals/uploadmarks"}/> */}
                <ExcelUpload path={"/ci/internals/uploadmarks"} currentCourse={currentCourse}/>
            </div>
        </div>}
        {showModal ? <Modal setShowModal={setShowModal} course={currentCourse} type={type} typeNum={typeNum}/> : null}
                {!display && students && type==="Overall" && <Table data={students} indexed={false} omit={["studentId","enrollmentId"]} />}
                {!display && students && type==="Unit Test" && typeNum==="All" && <Table data={students} indexed={false}omit={omitable.filter((e) => { 
                    return !(["UT1","UT2","UT3"].includes(e)) 
                    })}/> }
                {!display && students && type==="Unit Test" && typeNum===1 && <Table data={students}  indexed={false} omit={omitable.filter((e) => e!=="UT1")} /> }
                {!display && students && type==="Unit Test" && typeNum===2 && <Table data={students}  indexed={false} omit={omitable.filter((e) => e!=="UT2")} /> }
                {!display && students && type==="Unit Test" && typeNum===3 && <Table data={students}  indexed={false} omit={omitable.filter((e) => e!=="UT3")} /> }
                {!display && students && type==="Assignment" && typeNum==="All" && <Table data={students} editable={true} indexed={false}omit={omitable.filter((e) => { 
                    return !(["A1","A2","A3"].includes(e)) 
                    })}/> }
                {!display && students && type==="Assignment" && typeNum===1 && <Table data={students} editable={true} indexed={false} omit={omitable.filter((e) => e!=="A1")} /> }
                {!display && students && type==="Assignment" && typeNum===2 && <Table data={students} editable={true} indexed={false} omit={omitable.filter((e) => e!=="A2")} /> }
                {!display && students && type==="Assignment" && typeNum===3 && <Table data={students} editable={true} indexed={false} omit={omitable.filter((e) => e!=="A3")} /> }
                {!display && students && type==="Tutorial" && typeNum==="All" && <Table data={students} editable={true} indexed={false}omit={omitable.filter((e) => { 
                    return !(["T1","T2","T3"].includes(e)) 
                    })}/> }
                {!display && students && type==="Tutorial" && typeNum===1 && <Table data={students} editable={true} indexed={false} omit={omitable.filter((e) => e!=="T1")} /> }
                {!display && students && type==="Tutorial" && typeNum===2 && <Table data={students} editable={true} indexed={false} omit={omitable.filter((e) => e!=="T2")} /> }
                {!display && students && type==="Tutorial" && typeNum===3 && <Table data={students} editable={true} indexed={false} omit={omitable.filter((e) => e!=="T3")} /> }
    </div>
    );
}

const Modal = ({setShowModal, course, type, typeNum}) => {

  //render the modal JSX in the portal div.
  const [questions,setQuestions] = useState([]);
  let questionNO = useRef("");
  let coNo = useRef("");
  let mark = useRef("");
  let result = useRef([]);


  const closeModel = () =>{
    setShowModal(false);
  }
  const questionNumbers = ["1","2","3","4","5","6","7","8","9","10"];
  const coTypes = ["CO0","CO1","CO2","CO3"];
  const markNumbers = ["2","4","5","6","8","10"];

  const setQno = (e) =>{
    questionNO.current = e;
  }
  const setMark = (e) =>{
    mark.current = e;
  }
  const setCOno = (e) =>{
    coNo.current = e;
  }
//   const UpdateResultQuestions = () => {
//     let questionData = {
//         qNo : questionNO.current,
//         COType : coNo.current,
//         Mark : mark.current
//     }
//     result.current.push(questionData);
//   }
  const addQuestions = () => {
    if( questionNO.current !== "" && coNo.current !== "" && mark.current !== "" )
    {
        let questionData = {
            number : questionNO.current,
            co : coNo.current,
            allotted : mark.current
        }
        result.current.push(questionData);
    }
    // const button = createElement('button',{className: 'bg-blue-500 text-white text-sm px-2 py-1 rounded-md hover:cursor-pointer', onClick:addQuestions},"Set")

    console.log(result)
    setQuestions([...questions,{
        "Question No" : <Dropdown data={questionNumbers} update={setQno}/>, 
        "CO Type":<Dropdown  data={coTypes} update={setCOno}/>, 
        "Marks": <Dropdown  data={markNumbers} update={setMark}/>,
    }]);
    
    
  }

  const sendQuestionData = async () => {
    closeModel();
    let questionData = {
        number : questionNO.current,
        co : coNo.current,
        allotted : mark.current
    }
    result.current.push(questionData);
    const data = {courseId : course,
        category: type,
        number : typeNum,
        questions : result.current};
    console.log(data);
    // await axios.post('/ci/internals/xltemplate', data);
    // /ci/internals/theory/create
    // /ci/internals/xltemplate
  
    try {
        const response = await axios.post('/ci/internals/theory/create', data, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.xlsx');
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error(error);
      }
    };
  return (
    <div className="fixed inset-0 z-50 shadow-xl">
        <div className="flex h-screen justify-center items-center overflow-y-auto">
            <div className="flex-col justify-center bg-white py-4 px-4 shadow-2xl border-2 border-gray-200 rounded-xl overflow-scroll">
                <div className="flex mb-4 justify-between">
                    <button className="bg-blue-500 text-white text-md px-4 py-1 mb-2 rounded-md hover:cursor-pointer mr-4" onClick={addQuestions}>Add Questions</button>
                    <button className="bg-red-500 text-white text-md px-4 py-1 mb-2 rounded-md hover:cursor-pointer" onClick={closeModel}>Close</button>
                </div>
                <div className="max-h-96 overflow-auto">
                    <Table data={questions}/>
                </div>
                
                <button className="bg-blue-500 text-white text-md px-4 py-1 rounded-md hover:cursor-pointer mt-5" onClick={sendQuestionData}>Submit</button>
                <div>
                        
                </div>
            </div>

        </div>

    </div>
   )
}

const CourseCard = ({courses,currentCourseId})=>{
    const currentCourse = courses.find(c => c._id===currentCourseId)
    return (
            <div className="flex ml-5 justify-between gap-8 h-9 mt-1">
                <div className="flex gap-3">
                    <p className="text-slate-400 text-center">Course  </p>
                    <p className="text-md font-medium text-center">{currentCourse.title}</p>
                </div>
                <div className="flex gap-3">
                    <p className="text-slate-400 text-center">Semester  </p>
                    <p className="text-md font-medium text-center">{currentCourse.semester}</p>
                </div>
                <div className="flex gap-3">
                    <p className="text-slate-400 text-center">Branch  </p>
                    <p className="text-md font-medium text-center">{currentCourse.branch}</p>
                </div>

            </div>
    )
}

import Image from "next/image"
import spreadsheet from "../../../assets/spreadsheet.png"
import upload from "../../../assets/upload.png"

/**
 * Default file upload component
 * @param url @type URL - Server endpoint for upload
 */
const ExcelUpload = ({ url,currentCourse }) => {
    const [type,setType] = useState("");
    const [typeNum,setTypeNum] = useState(0);
    const [file,setFile] = useState(null)
    const [ closed, isClosed ] = useState(true)

    const changeModal = () => {
        isClosed(!closed);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        isClosed(!closed);
        let formData = new FormData();
        formData.append("courseId",currentCourse)
        formData.append("type",type);
        formData.append("number",typeNum);
        formData.append("data",file,file.name);
        console.log(formData)
        // /ci/internals/uploadmarks
        try{
            await axios({
                method: 'POST',
                url: "/ci/internals/theory/upload",
                data: formData,
                headers: {'Content-Type': 'multipart/form-data' }
            })

        } catch(error){
            console.log(error);
        }
    }
    return (
    <>
        <div>
            
            <button className="flex gap-3 justify-center items-center border border-slate-400 rounded-lg py-1 px-3 " onClick={changeModal}><Icon name="upload"/><p className="text-sm">Upload</p></button>
        </div>
       {!closed &&
        <div className="fixed inset-0 z-50 shadow-xl">
        <div className="flex h-screen justify-center items-center overflow-y-auto">
            <div className="flex-col justify-center bg-white py-4 px-4 shadow-2xl border-2 border-gray-200 rounded-xl overflow-scroll">
                <form id="excel-upload">
                    <div className="flex justify-end">
                        <button onClick={changeModal}><Icon name="close" className="cursor-pointer "/></button>
                    </div>
                    <div className="flex mb-4 justify-between gap-10">
                        <Dropdown data={["Unit Test", "Assignment", "Tutorial"]} update={(e) => { setType(e); }}/>
                        <Dropdown data={[1,2,3]} update={(e) => { setTypeNum(e)}} />               
                    </div>
                    <div>
                        <input id="upload" type="file" accept=".xls,.xlsx" onChange={(e) => setFile(e.target.files[0])}/>
                    </div>
                    <button className="bg-blue-500 text-white text-sm px-2 py-1 rounded-md hover:cursor-pointer mt-5" onClick={handleSubmit}>Submit</button>

                </form>
            
            </div>
        </div> 
       </div>
       }
    </>
);
}

// closed ? 
// <div className="p-2 border cursor-pointer flex rounded-lg text-sm w-fit group" onClick={() => isClosed(false)}>
//     <Icon name="upload"/>
//     {/* <div className="mt-0.5 ease-in duration-150 h-0 w-0 opacity-0 pointer-events-none">Upload</div> */}
// </div> :
// <div className="absolute w-1/3 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white">
//     <div className="relative m-2 border shadow rounded-lg">
//         <div className="absolute text-slate-400 hover:text-red-500 top-2 right-2" onClick={() => { setFile(null); isClosed(true) }}>
//             <Icon name="close"/>
//         </div>
//         <label htmlFor="upload" className={`block text-center cursor-pointer hover:text-blue-500 text-sm ${file ? "mt-5" : "m-5"}`}>
            // <div className="m-auto w-fit mb-3">
            //     <Image src={file ? spreadsheet : upload} width="50" height="50" alt="File Image"/>
            // </div>
//             { file ? file.name : "Select File (.xls, .xlsx)" }
//         </label>
//         {   file && 
//             <div className="w-fit m-auto my-3 flex space-x-5">
//                 {   !sent ? <>
//                     <Button color="blue" name="Send" event={() => setTrigger(true)}/>
//                     <Button color="blue" name="Cancel" event={() => isClosed(true)} outline/></> :
//                     <div className="bg-slate-400 rounded p-2 border pointer-events-none text-white">Sent</div>
//                 }
//             </div> 
//         }
//         <input id="upload" type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm border flex h-0 w-0 invisible"/>
//     </div>
// </div>

export default Theory;