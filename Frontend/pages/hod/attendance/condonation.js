import Dropdown from "../../../utilities/Dropdown";
import Button from "../../../utilities/Button";
import { useEffect, useState, useContext } from "react"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Condonation = () => {
    
    const { data: context } = useContext(AppContext)

    const [ department, setDepartment ] = useState(context.user.branch)
    const [ batch, setBatch ] = useState("--None--")
    const [ section, setSection ] = useState("--None--")
    const [ Batches, setBatches ] = useState(["--None--"])
    const [ sections, setSections ] = useState(["--None--"])
    const [ courseList, setCourseList ] = useState([])
    const [ courseCode, setCourseCode ] = useState("--None--")
    const [ courseCodeList, setCourseCodeList ] = useState(["--None--"])
    const [ semester, setSemester ] = useState("--None--")
    const [ courseName, setCourseName ] = useState("--None--")
    const [ curriculumId, setCurriculumId ] = useState("")
    const [ reportState, setReportState ] = useState(false)
    const [ reportFlag, setReportFlag ] = useState(false)
    const [ reportCurriculumId, setReportCurriculumId ] = useState()
    const [ reportBatch, setReportBatch ] = useState()
    const [ reportSection, setReportSection ] = useState()
    const [ reportSemester, setReportSemester ] = useState()
    const [ display, setDisplay ] = useState(false)
    const [ submitted, setSubmitted ] = useState(true)
    const [ submitFlag, setSubmitFlag ] = useState(false)
    const [ tableData, setTableData ] = useState([])
    const [ facultyName, setFacultyName ] = useState("")
    const [ load, setLoad ] = useState(false)

    const fields = [ "register", "name", "attendance", "Condonation" ]
    
    useEffect(()=>{

        axios.get('/hod/currentCourses?', { params: { branch:department } } )
        .then(response => {
            setBatches(["--None--", ...new Set(response.data.map(item => item.batch))])
            setCourseList(response.data)
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    
    }, [])

    useEffect(() => {
    
        if(reportFlag){

            axios.get('/hod/finalAttendanceReport', { params: { branch:department, curriculumId:reportCurriculumId, batch:reportBatch, section: reportSection, semester:reportSemester } } )
            .then(response => {
                setSubmitted(response.data.approved)
                setTableData(response.data.data)
                console.log(response.data.data)
                setFacultyName(response.data.facultyName)
                setDisplay(true)
            })
            .catch(err => console.log(err.message))
            setReportFlag(false)
        
        }
    
    }, [reportFlag])

    useEffect(() => {
    
        if(submitFlag){

            axios.get('/hod/submitReport', { params: { branch: department, curriculumId: reportCurriculumId, batch: reportBatch, section: reportSection, semester: reportSemester } } )
            .then(response => {
                if(response.data=="Update Success"){
                    setSubmitted(true)
                }
                
            })
            .catch(err => console.log(err.message))
            setReportFlag(false)
        
        }
    
    }, [submitFlag])

    
    const changeBatch = (val) => {
        setBatch(val)
        if(val=="--None--"){
            setSemester("--None--")
            setSection(["--None--"])
        } else {
            setSections(["--None--", ...new Set(courseList.filter(item => item.batch==val).map(item => item.section))])
            setSemester(...new Set(courseList.filter(item => item.batch==val).map(item => item.semester)))
        }
    }

    const changeSection = (val) => {
        setSection(val)
        if(val=="--None--") {
            setCourseCodeList(["--None--"])
        } else {
            setCourseCodeList(["--None--", ...(courseList.filter(item => (item.batch==batch)&&(item.section==val)).map(item => item.courseCode))])
        }
    }

    const changeCourseCode = (val) => {
        setCourseCode(val)
        if(val=="--None--"){
            setCourseName("--None--")
            setCurriculumId("")
            setReportState(false)
        } else {
            const temp = courseList.filter(item => (item.batch==batch)&&(item.section==section)&&(item.courseCode==val))
            setCourseName(temp[0].courseName)
            setCurriculumId(temp[0].curriculumId)
            setReportState(temp[0].faApproved)
        }
    }

    const getReport = () => {
        setReportFlag(true)
        setReportCurriculumId(curriculumId)
        setReportBatch(batch)
        setReportSemester(semester)
        setReportSection(section)
    }

    const submitReport = () => {
        setSubmitFlag(true)
    }

    return( courseList && load ?
        <>
            <div className="flex">
                <div className="w-1/4 pt-2">
                    <h5 className="text-sm">Department</h5>
                    <div className="text-slate-400 pt-2 text-sm">{department}</div>
                </div>
                <div className="w-1/4 pt-2">
                    <Dropdown name="Batch" update={changeBatch} data={Batches}/>
                </div>
                <div className="w-1/4 pt-2">
                    <Dropdown name="Section" update={changeSection} data={sections}/>
                </div>
                <div className="w-1/4 pt-2">
                    <h5 className="text-sm">Semester</h5>
                    <div className="text-slate-400 pt-2">{semester}</div>
                </div>
                <div className="w-1/4 pt-2">
                    <Dropdown name="Course Code" update={changeCourseCode}  data={courseCodeList}/>
                </div>
                <div className="w-1/3 pt-2">
                    <h5 className="text-sm">Course Name</h5>
                    <div className="text-slate-400 pt-2">{courseName}</div>
                </div>
                <div className="w-1/4 pt-2">
                    <Button  color="blue" outline name="View Report" event={getReport} disabled={!reportState}/>
                </div>
                <div className="w-1/4 pt-2">
                    {submitted?<Button  color="blue" event={submitReport} name="Submit to COE" />:""}
                </div>
            </div>
            {display?<div>Faculty Name: {facultyName}</div>:"" }
                
            <br></br>
                {display?
                    <>
                        <div className="max-w-min max-h-[80%] overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                            <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                                <thead className="bg-gray-100 text-xs uppercase">
                                    <tr>
                                    { <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">sno</th> }
                                    {
                                        fields.map((heading, index) => 
                                            <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th>)
                                    }
                                    { <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">Master Attendance Eligibility</th> }
                                    { <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">Final Exam Eligibility</th> }
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {
                                    tableData.map((row, ridx) => (
                                    <tr className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap group hover:bg-sky-50`} key={ridx}>
                                        { <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{ridx + 1}</td> }
                                        {
                                            fields.map((key, kidx) =>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={kidx}>
                                                    { typeof row[key] == typeof('') ? row[key].charAt(0).toUpperCase() + row[key].slice(1) : row[key] }
                                                </td> 
                                            )
                                        }
                                        { <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{row["ExamEligibility"]==1?"Eligible":"Not Eligible"}</td> }
                                        { <td className={ row["ExamEligibility"] == 1 && (row["Condonation"]=="Not Required" || row["Condonation"]=="Approved")? "px-6 py-4 text-sm text-green-500" : "px-6 py-4 text-sm text-red-500" } > {row["ExamEligibility"]==1?"Eligible":"Not Eligible"}</td> }
                                    </tr>))
                                }
                                </tbody>
                            </table>
                        </div> 
                    </>: <div>No Data Here...</div>
                }
        </>
        :<Loading />
    )  
}

export default Condonation