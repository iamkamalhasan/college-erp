import Dropdown from "../../../utilities/Dropdown";
import Button from "../../../utilities/Button";
import { useEffect, useState, useContext } from "react"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Condonation = () => {
    
    const { data: context } = useContext(AppContext)
    
    const [ courseCode, setCourseCode ] = useState(['--None--'])
    const [ batch, setBatch ] = useState(["--None--"])
    const [ section, setSection ] = useState(["--None--"])
    const [ dept, setDept ] = useState(["--None--"])
    const [ selectCourseCode, setSelectCourseCode ] = useState("--None--")
    const [ selectbatch, setSelectBatch ] = useState("--None--")
    const [ selectsection, setSelectSection ] = useState("--None--")
    const [ selectdept, setSelectdept ] = useState("--None--")
    const [ resData, setResData ] = useState([])
    const [ courseId, setCourseId ] = useState("")
    const [ courseName, setCourseName ] = useState("--None--")
    const [ getSemester, setSemester ] = useState("--None--")
    const [ reportFlag, setReportFlag ] = useState(false)    
    const [ tableData, setTableData ] = useState([])
    const [ freeze, setFreeze ] = useState(true)
    const [ dropDownData, setDropDownData ] = useState(["applied", "approved", "denied"])
    const [ saveFlag, setSaveFlag ] = useState(false)
    const [ submitFlag, setSubmitFlag ] = useState(false)
    const [ load, setLoad ] = useState(false)
    
    const omit = ['_id', 'ExamEligibility', 'condonationStatus', 'temp']
    const omitFields = (field) => !omit.some((item) => item == field);
    const [ fields, setFields ] = useState([])

    useEffect( () => {
        axios.get('/ci/coursesHandled', {params: { facultyId: context.user._id} })
        .then( response => {
            console.log(response.data)
            setResData(response.data.map(doc=>({...doc})))
            setCourseCode(["--None--", ...new Set(response.data.map(item=>item.courseCode))])
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    },[])

    //Either this
    useEffect(() => {
        if(reportFlag) {
            axios.get('/ci/condonationApplication?', {params:{courseId:courseId}} )
            .then((response) => {
                console.log(response.data)
                for(let item of response.data) {
                    item.temp = item.condonationStatus
                }
                setTableData(response.data)
                setReportFlag(false)
                setFields(response.data && response.data.length > 0 ? Object.keys(response.data[0]).filter((key) => omitFields(key)) : []);
            })
            .catch(err => console.log(err.message))
        }
    }, [reportFlag])

    //or this
    // useEffect(() => {
    //     if(reportFlag) {
    //         let dummy = [...data]
    //         dummy.map(item => (item.temp=item.condonationStatus))
    //         setTableData(dummy)
    //         setReportFlag(false)
    //         setFields(data && data.length > 0 ? Object.keys(data[0]).filter((key) => omitFields(key)) : []);
    //     }
    // }, [reportFlag])

    useEffect(() => {
        if(saveFlag) {
            axios.post('/ci/saveCondonationApplication', {data:tableData} )
            .then((response) => {
                console.log(response.data)
                setSaveFlag(false)
            })
            .catch(err => console.log(err.message))
        }
    },[saveFlag])

    useEffect(() => {
        if(submitFlag) {
            axios.post('/ci/submitCondonationApplication', {courseId:courseId, data:tableData} )
            .then((response) => {
                console.log(response.data)
                setSubmitFlag(false)
                setFreeze(true)
            })
            .catch(err => console.log(err.message))
        }
    }, [submitFlag])

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
            setSection(["--None--",...new Set(resData.filter(item => item.courseCode == selectCourseCode && item.batch == val ).map(item => item.section))])
            setSelectSection("--None--")
        }
    }

    const selectedSection = (val) => {
        setSelectSection(val)
        if(val==='--None--'){
            setDept(["--None--"])
            setSelectdept("--None--")
        }else{
            setDept(["--None--",...new Set(resData.filter(item => item.courseCode == selectCourseCode && item.batch == selectbatch && item.section == val ).map(item => item.branch))])
            setSelectdept("--None--")
        }
    }

    const selectedDepartment = (val) => {
        setSelectdept(val)
    }

    const generateReport = () => {
        let dummy = resData.filter(item=>item.courseCode === selectCourseCode && item.batch === selectbatch && item.section == selectsection && item.branch === selectdept)
        console.log("Selected course = ", dummy)
        if(dummy.length==0){
            alert("Please Select a valid Course code, Batch and Branch")
        }else{
            if(dummy[0].hodFreeze==false){
                alert('Attendance for this course is not freezed for this course')
            } else {
                setCourseId(dummy[0]._id)
                setReportFlag(true)
                setFreeze(dummy[0].attendanceApproval.ci)
            }
            
        }
    }

    const updateCondonationStatus = (idx, val) => {
        let dummy = [...tableData]
        dummy[idx]['temp'] = val
        setTableData([...dummy])
    }

    const saveData = () => {
        let dummy = [...tableData]
        dummy = dummy.map(item => {
            item.condonationStatus = item.temp
            return item
        })
        console.log(dummy)
        setTableData([...dummy])
        setSaveFlag(true)
    }

    const cancelData = () => {
        let dummy = [...tableData]
        dummy = dummy.map(item => {
            item.temp = item.condonationStatus
            return item 
        })
        console.log(dummy)
        setTableData([...dummy])
    }

    const submitReport = () => {
        let dummy = [...tableData]
        let flag = false
        dummy = dummy.map(item => {
            item.condonationStatus = item.temp
            if(item.temp=="Applied")
                flag=true
            return item
        })
        if(flag==true)
            alert("Some of the Condonation Status are in applied State, either Approve or Deny them before submitting...")
        else{
            console.log(dummy)
            setTableData([...dummy])
            setSubmitFlag(true)
        }
    }
    
    return( load ?
        <>
            <div className="flex pb-4">
                <div className="w-1/2">
                    <Dropdown name={"Course Code"} data={courseCode} update={selectedCourseCode} />
                </div>
                <div className="w-1/2">
                    <h5>Course Name</h5>
                    <div className="text-slate-400 pt-2">{courseName}</div>
                </div>
                <div className="w-1/3">
                    <Dropdown name={"Batch"} data={batch} update={selectedBatch} />
                </div>
                <div className="w-1/3">
                    <Dropdown name={"Section"} data={section} update={selectedSection} />
                </div>
                <div className="w-1/3">
                    <h5>Semester</h5>
                    <div className="text-slate-400 pt-2">{getSemester}</div>
                </div>
                <div className="w-1/2">
                    <Dropdown name={"Branch"} data={dept} update={selectedDepartment} />
                </div>
                <div className="w-1/2">
                    <Button color={'blue'} name={"Get Report"} outline={true} event={generateReport}/>
                </div>
                <div className="w-1/2">
                    <Button color={'blue'} name={"Submit Report to FA"} outline={true} event={submitReport} disabled={freeze}/>
                </div>
            </div>

            {tableData.length > 0 ?
                <>
                    <div className="max-w-min max-h-[75%] overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                        <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                            <thead className="bg-gray-100 text-xs uppercase">
                                <tr>
                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">sno</th>
                                {
                                    fields.map((heading, index) => 
                                        <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading=='ExamEligibility'? 'Master Attendance Eligibility':heading}</th>)
                                }
                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">Master Attendance Eligibility</th>
                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">Condonation Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {
                                tableData.map((row, ridx) => (
                                <tr className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap group hover:bg-sky-50`} key={ridx}>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{ridx + 1}</td> 
                                    {
                                        fields.map((key, index) => 
                                        <td className={`px-6 py-4 text-sm whitespace-nowrap text-gray-800`} key={index}>{row[key]}</td> )
                                    }
                                    <td className={"px-6 py-4 text-sm "+(row['ExamEligibility']==1?"text-green-600":"text-red-500")+" whitespace-nowrap"}>{row['ExamEligibility']==1?"ELIGIBLE":"NOT ELIGIBLE"}</td> 
                                    <td className={"px-6 py-4 text-sm "+(row['condonationStatus']=="Not Required"?"text-green-600":(row['condonationStatus']=="Not Applicable"?"text-red-600":"text-grey-800"))+" whitespace-nowrap"}>{row['condonationStatus']=="Not Required"||row['condonationStatus']=="Not Applicable"||row['condonationStatus']=="Applicable"?row['condonationStatus']:(<Dropdown data={[row['temp'], ...dropDownData.filter(item => item != row['temp'])]} update={(val) => updateCondonationStatus(ridx,val)} active disabled={freeze}/>)}</td> 
                                </tr>))
                            }
                            </tbody>
                        </table>
                    </div>
                    {freeze?"":
                        <div className="flex justify-end flex-row">
                            <div className="mx-4 w-1/8">
                                <Button color={'blue'} name={"Cancel"} outline={true} event={cancelData} disabled={freeze} />
                            </div>
                            <div className="mx-4 w-1/6">
                                <Button color={'blue'} name={"Save"} outline={true} event={saveData} disabled={freeze} />
                            </div>
                        </div>
                    }
                    
                </>
                :"No Class is Selected"
            }
        </> :<Loading />
    )  
}

export default Condonation