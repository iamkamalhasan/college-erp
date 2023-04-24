import Dropdown from "../../../utilities/Dropdown";
import Button from "../../../utilities/Button";
import { useEffect, useState, useContext } from "react"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"


const Condonation = () => {
    
    const { data: context } = useContext(AppContext)
    
    const [ department, setDepartment] = useState("")
    const [ batch, setBatch ] = useState()
    const [ section, setSection ] = useState("")
    const [ semester, setSemester ] = useState()
    const [ courseList, setCourseList ] = useState([])
    const [ courseCode, setCourseCode ] = useState("--None--")
    const [ courseCodeList, setCourseCodeList ] = useState(["--None--"])
    const [ courseName, setCourseName ] = useState("--None--")
    const [ curriculumId, setCurriculumId ] = useState("")
    const [ reportState, setReportState ] = useState(false)
    const [ reportFlag, setReportFlag ] = useState(false)
    const [ reportCurriculumId, setReportCurriculumId ] = useState()
    const [ display, setDisplay ] = useState(false)
    const [ submitted, setSubmitted ] = useState(true)
    const [ approved, setApproved ] = useState(true)
    const [ submitFlag, setSubmitFlag ] = useState(false)
    const [ tableData, setTableData ] = useState([])
    const [ faculties, setFaculties ] = useState([])
    const [ load, setLoad ] = useState(false)
    
    const fields = [ "register", "name", "Attendance" ]
    
    useEffect(() => {
        for(let i of context.metadata) {
            for(let j of i.facultyAdvisor) {
                if(j.faculty==context.user._id) {
                    setBatch(i.batch)
                    setDepartment(j.branch)
                    setSemester(i.sem)
                    setSection(j.section)
                }
            }
        }
    }, [])


    useEffect(()=>{

        axios.get('/fa/classCourses', { params: { branch:department, batch:batch, section:section, semester:semester }} )
        .then(response => {
            setCourseList(response.data)
            console.log(response.data)
            setCourseCodeList(["--None--", ...new Set(response.data.map(course => course.courseCode))])
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    
    }, [])

    useEffect(() => {
    
        if(reportFlag){

            axios.get('/fa/finalAttendanceReport', {params: {branch:department, curriculumId:reportCurriculumId, batch:batch, section:section, semester: semester } } )
            .then(response => {
                let submit = true, approve = true
                for(let faculty of response.data.Faculties) {
                    submit = submit && faculty.submitted
                    approve = approve && faculty.approved       
                }
                console.log(response.data)
                setApproved(approve)
                setSubmitted(submit)
                setTableData(response.data.data)
                setFaculties(response.data.Faculties)
                setDisplay(true)
            })
            .catch(err => console.log(err.message))
            setReportFlag(false)
        
        }
    
    }, [reportFlag])

    useEffect(() => {
    
        if(submitFlag){
            axios.get('/fa/submitReport', { params: { branch:department, curriculumId:reportCurriculumId, batch:batch, section:section, semester:semester } } )
            .then(response => {
                console.log(response.data)
                if(response.data=="Update Success"){
                    setApproved(true)
                }
                
            })
            .catch(err => console.log(err.message))
            setReportFlag(false)
        
        }
    
    }, [submitFlag])

    const changeCourseCode = (val) => {
        setCourseCode(val)
        if(val=="--None--"){
            setCourseName("--None--")
            setCurriculumId("")
            setReportState(false)
        } else {
            const temp = courseList.filter(item => item.courseCode==val)
            setCourseName(temp[0].courseName)
            setCurriculumId(temp[0].curriculumId)
            setReportState(temp[0].faApproved)
        }
    }

    const getReport = () => {
        setReportFlag(true)
        setReportCurriculumId(curriculumId)
    }

    const submitReport = () => {
        setSubmitFlag(true)
    }

    return( courseList && load?
        <>
            <div className="flex">
                <div className="w-4/5">
                    <div className="flex">
                        <div className="w-1/4 pt-2">
                            <h5 className="text-sm">Department</h5>
                            <div className="text-slate-400 pt-2 text-sm">{department}</div>
                        </div>
                        <div className="w-1/6 pt-2">
                                <h5 className="text-sm">Batch</h5>
                                <div className="text-slate-400 pt-2">{batch}</div>
                        </div>
                        <div className="w-1/6 pt-2">
                                <h5 className="text-sm">Section</h5>
                                <div className="text-slate-400 pt-2">{section}</div>
                        </div>
                        <div className="w-1/6 pt-2">
                                <h5 className="text-sm">Semester</h5>
                                <div className="text-slate-400 pt-2">{semester}</div>
                        </div>
                        <div className="w-1/3 pt-2">
                            <Dropdown name={"Course Code"} update={changeCourseCode}  data={courseCodeList}/>
                        </div>
                        <div className="w-1/3 pt-2">
                                <h5 className="text-sm">Course Name</h5>
                                <div className="text-slate-400 pt-2 text-sm">{courseName}</div>
                        </div>
                        <div className="w-1/3 pt-2">
                            <Button  color="blue" outline name="View Report" event={getReport} />
                        </div>
                        {approved? <div className="w-1/3 pt-2"><Button  color="blue" event={submitReport} name="Submit to HoD" disabled={!submitted} /> </div> :""}                        
                    </div>
                    <br></br>
                    {display?
                        <>
                        <div className="flex flex-wrap">
                        <div className="flex justify-center mt-2"></div>
                            <div className="max-w-min h-96 overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                                <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                                    <thead className="bg-gray-100 text-xs uppercase">
                                        <tr>
                                        { <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">sno</th> }
                                        {
                                            fields.map((heading, index) => 
                                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th>)
                                        }
                                        { <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">Condonation</th> }
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
                                            { <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{row["submitted"]?row["Condonation"]:"-----"}</td> }
                                            { <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{row["ExamEligibility"]==1?"Eligible":"Not Eligible"}</td> }
                                            { <td className={ !row["submitted"]?"px-6 py-4 text-sm text-gray-800 whitespace-nowrap": row["ExamEligibility"] == 1 && (row["Condonation"]=="Not Required" || row["Condonation"]=="approved")? "px-6 py-4 text-sm text-green-500 whitespace-nowrap" : "px-6 py-4 text-sm text-red-500 whitespace-nowrap" } > {!row["submitted"]?"------":row["ExamEligibility"] == 1 && (row["Condonation"]=="Not Required" || row["Condonation"]=="approved")? "Eligible":"Not Eligible"}</td> }
                                        </tr>))
                                    }
                                    </tbody>
                                </table>
                            </div> 
                            </div>
                        </>: <div>No Data Here...</div>
                    }
                </div>
                <div className="w-1/5 border-l align-middle">
                <h5 className="text-sm pt-4 pl-4 text-green-600">List of Faculties Submitted</h5>
                    {faculties.map(faculty => 
                        <div className="">
                            {
                                
                                faculty["submitted"] ? 
                                    <div className="px-6 py-4 text-sm text-grey-800 whitespace-nowrap">{faculty["name"]}</div>
                                    : ""
                            }
                        </div>
                    )}

                <h5 className="text-sm pt-4 pl-4 text-red-500">List of Faculties Not Submitted</h5>
                    {faculties.map(faculty => 
                        <div className="">
                            {
                                !faculty["submitted"] ? 
                                <div className=" pl-10 py-2 text-sm text-grey-800 whitespace-nowrap">{faculty["name"]}</div>   
                                : ""                         
                            }
                        </div>

                    )}
                </div>
            </div>
            
        </>
        :<Loading />
    )  
}

export default Condonation