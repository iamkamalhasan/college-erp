import Table from "../../../utilities/Table";
import Dropdown from "../../../utilities/Dropdown";
import Download from "../../../utilities/Download";
import Button from "../../../utilities/Button";
import Input from "../../../utilities/Input";
import { useEffect, useState, useContext } from "react"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Report = () => {
    
    const { data: context } = useContext(AppContext)

    const [ courseCode, setCourseCode ] = useState(['--None--'])
    const [ batch, setBatch ] = useState(["--None--"])
    const [ section, setSection ] = useState(["--None--"])
    const [ dept, setDept ] = useState(["--None--"])
    const [ selectCourseCode, setSelectCourseCode ] = useState("--None--")
    const [ selectbatch, setSelectBatch ] = useState("--None--")
    const [ selectSection, setSelectSection ] = useState("--None--")
    const [ selectdept, setSelectdept ] = useState("--None--")
    const [ resData, setResData ] = useState([])
    const [ startDate, setStartDate ] = useState("")
    const [ endDate, setEndDate ] = useState("")
    const [ courseId, setCourseId ] = useState("")
    const [ courseName, setCourseName ] = useState("--None--")
    const [ getSemester, setSemester ] = useState("--None--")
    const [ generateFlag, setGenerateFlag ] = useState(false)
    const [ submittedFlag, setSubmittedFlag ] = useState(false) 
    const [ submitFlag, setSubmitFlag ] = useState(false)
    const [ saveFlag, setSaveFlag ] = useState(false)   
    const [ Date1, setDate1 ]=useState()
    const [ Date2, setDate2 ]=useState()
    const [ freeze, setFreeze ] = useState(false)
    const [ tableData, setTableData ] = useState([])
    const [ downloadData, setDownloadData ] = useState([])
    const [ reportCourseCode, setReportCourseCode ] = useState("")
    const [ load, setLoad ] = useState(false)
    
    //EITHER THIS
    // useEffect( () => {
    //     setResData(course.courses.map(doc=>({...doc})))
    //     setStartDate(course.start_date)
    //     setEndDate(course.end_date)
    //     setCourseCode(["--None--", ...new Set(course.courses.map(item=>item.courseCode))])
    // },[])

    //OR THIS
    useEffect( () => {
        axios.get('/ci/courses', { params: { facultyId: context.user._id } } )
        .then( response => {
            console.log(response.data)
            setResData(response.data.courses.map(doc=>({...doc})))
            setStartDate(response.data.start_date.slice(0,10))
            setEndDate(response.data.end_date.slice(0,10))
            setCourseCode(["--None--", ...new Set(response.data.courses.map(item=>item.courseCode))])
            setLoad(true)

        })
        .catch(err => console.log(err.message))
    },[])

    useEffect(() => {
        if(generateFlag) {
            axios.get('/ci/attendancePercent', { params : { start_date: Date1, end_date: Date2, courseId: courseId } } )
            .then((response) => {
                console.log(response.data)
                setTableData(response.data)
                setGenerateFlag(false)
                setSubmitFlag(true)
                setDownloadData(response.data)
            })
            .catch(err => console.log(err.message))
        }
    }, [generateFlag])

    useEffect(() => {
        if(submittedFlag) {
            axios.get('/ci/submittedAttendance', { params: { courseId: courseId } } )
            .then((response) => {
                console.log(response.data)
                setTableData(response.data)
                setSubmittedFlag(false)
                setSubmitFlag(false)
            })
            .catch(err => console.log(err.message))
        }
    }, [submittedFlag])

    useEffect(() => {
        if(saveFlag) {
            axios.post('/ci/saveAttendance', { courseId:courseId, data:tableData } )
            .then((response) => {
                console.log(response.data)
                setSubmittedFlag(true)
            })
            .catch(err => console.log(err.message))
        }
    },[saveFlag])

    const selectedCourseCode = (data) => {
        setSelectCourseCode(data);
        if(data === '--None--'){
            setCourseName('--None--')
            setDept(["--None--"])
            setSelectdept("--None--")
            setBatch(["--None--"])
            setSelectBatch("--None--")
            setSemester("--None--")
        }else{
            setCourseName(resData.filter(item => item.courseCode == data ).map(item => item.courseName)[0])
            setBatch(["--None--",...new Set(resData.filter(item => item.courseCode == data ).map(item => item.batch))])
            setSelectBatch("--None--")
            setSemester("--None--")
            setDept(["--None--"])
            setSelectdept("--None--")
        }
    }

    const selectedBatch = (val) => {
        setSelectBatch(val)
        if(val==='--None--'){
            setSection(["--None--"])
            setSelectSection("--None--")
        }else{
            setSemester(resData.filter(item=>item.batch == val).map(item=>item.semester)[0])
            setSection(["--None--",...new Set(resData.filter(item => item.courseCode == selectCourseCode && item.batch == val).map(item => item.section))])
            setSelectSection("--None--")
        }
    }

    const selectedSection = (val) => {
        setSelectSection(val)
        if(val==='--None--') {
            setDept(['--None--'])
            setSelectdept('--None--')
        } else {
            setDept(["--None--",...new Set(resData.filter(item => item.courseCode == selectCourseCode && item.batch == selectbatch && item.section == val).map(item => item.branch))])
            setSelectdept("--None--")
        }
    }

    const selectedDepartment = (val) => {
        setSelectdept(val)
        let dummy = resData.filter(item=>item.courseCode === selectCourseCode && item.batch === selectbatch && item.branch === val)
        console.log("Course selected =",dummy)
        setFreeze(dummy[0].freezeAttendance)
        setDate1(dummy[0].startDate.slice(0,10))
        setDate2(dummy[0].endDate.slice(0,10))
    }

    const generateReport = () => {
        let dummy = resData.filter(item=>item.courseCode === selectCourseCode && item.batch === selectbatch && item.section==selectSection && item.branch === selectdept)
        console.log("Selected course = ", dummy)
        if(dummy.length==0){
            alert("Please Select a valid Course code, Batch and Branch")
        }else{  
            setCourseId(dummy[0]._id)
            setReportCourseCode(dummy[0].courseCode)
            setGenerateFlag(true)
        }
    }

    const selectedRange = (e) => {
        if(e == 'All') {
            setDownloadData(tableData)
        }else if(e == '>75%') {
            setDownloadData(tableData.filter(student => (parseFloat(student.percent.slice(0,-1)) >= 75.00)))
        } else if(e == '50%-75%'){
            setDownloadData(tableData.filter(student => (parseFloat(student.percent.slice(0,-1)) < 75.00)&&(parseFloat(student.percent.slice(0,-1)) >= 50.00)))
        } else {
            setDownloadData(tableData.filter(student => (parseFloat(student.percent.slice(0,-1)) < 50.00)))
        }
    }

    const viewSubmittedReport = () => {
        let dummy = resData.filter(item=>item.courseCode === selectCourseCode && item.batch === selectbatch && item.section == selectSection && item.branch === selectdept)
        console.log("Selected course = ", dummy)
        if(dummy.length==0){
            alert("Please Select a valid Course code, Batch and Branch")
        }else{  
            setCourseId(dummy[0]._id)
            setSubmittedFlag(true)
        }
    }

    const submitReport = () => {
        setSaveFlag(true)
    }

    let omit = [ "_id", "Sem", "Course_Code" ]
 
    return( resData && load ?
        <>
            <div className="flex">
                <div className="flex w-10/12">
                    <div className="w-1/4 pt-2">
                        <Dropdown name="Course Code" update={selectedCourseCode}  data={courseCode}/>
                    </div>
                    <div className="w-1/4 pt-2">
                        <h5 className="text-sm">Course Name</h5>
                        <div className="text-slate-400 pt-2 text-sm">{courseName}</div>
                    </div>
                    <div className="w-1/4 pt-2">
                        <Dropdown name="Batch" update={selectedBatch}  data={batch}/>
                    </div>
                    <div className="w-1/4 pt-2">
                        <Dropdown name="Section" update={selectedSection}  data={section}/>
                    </div>
                    <div className="w-1/4 pt-2">
                        <h5 className="text-sm">Semester</h5>
                        <div className="text-slate-400 pt-2 text-sm">{getSemester}</div>
                    </div>                
                    <div className="w-1/4 pt-2 pr-2">
                        <Dropdown name="Department" update={selectedDepartment}  data={dept}/>
                    </div>
                    <div className="w-1/3 pt-6">
                        <Button color="blue" name="View Submitted Report" event={viewSubmittedReport}/>
                    </div>
                </div>
                {submitFlag ? 
                    <div className="w-1/6 pt-6">
                        <Button color="blue" name="Submit Report" event={submitReport}/>
                    </div>
                : ""}
                           
            </div>

            <div className="flex pb-10" >

                <div className="flex w-2/5">
                    
                    <div className="w-1/3 pt-8 pr-6">
                        <Input name="from" type="date" value={Date1} min={startDate} max={endDate} update={setDate1} disabled={freeze}/>
                    </div>
                    <div className="w-1/3 pt-8 pl-6">
                        <Input name="to" type="date" value={Date2} min={startDate} max={endDate} update={setDate2} disabled={freeze}/>
                    </div>
                    <div className="w-1/3 pt-5 pl-6">
                        <Button color="blue" name="Generate Report" event={generateReport} disabled={freeze}/>
                    </div>

                </div>

                <div className="flex w-1/3 pl-8">
                    <div className="w-1/2 pt-8">
                        {tableData.length > 0?
                            <Dropdown name="Download Range" update={(e) => {selectedRange(e)}}  data={["All", ">75%", '50%-75%', '<50%']}/>
                            :""
                        }
                    </div>
                    <div className="w-1/2 pt-10">
                        {tableData.length > 0?
                            <Download data={downloadData} name={reportCourseCode}/>
                            :""
                        }
                    </div>
                </div>
            </div>

            {tableData.length > 0 ?
                <Table data={tableData} omit={omit} indexed />                   
                : <div className="pt-8">No Data Here...</div>
            }
        </>
        :<Loading />
    )                    
}

export default Report