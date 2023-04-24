import Button from "../../../utilities/Button";
import Download from "../../../utilities/Download";
import Input from "../../../utilities/Input";
import { useEffect, useState, useContext } from "react"
import axios from "../../../axios.config";
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Report = () => {

    const { data: context } = useContext(AppContext)

    const omit = []
    const omitFields = (field) => !omit.some((item) => item == field);

    const [ fields, setFields ] = useState([])
    const [ tableData, setTableData ] = useState([])
    const [ tableValue, setTableValue ] = useState([])
    const [ downloadData, setDownloadData ] = useState([])
    const [ courses, setCourses ] = useState([])
    const [ branch, setBranch ] = useState("")
    const [ batch, setBatch ] = useState()
    const [ section, setSection ] = useState("")
    const [ semester, setSemester ] = useState()
    const [ startDate, setStartDate ] = useState("--None--")
    const [ endDate, setEndDate ] = useState("--None--")
    const [ overAllState, setOverAllState ] = useState(0)
    const [ hodFreeze, setHodFreeze ] = useState(false)
    const [ requestFlag, setRequestFlag ] = useState(false)
    const [ popupFlag, setPopupFlag ] = useState(false)
    const [ submitFlag, setSubmitFlag ] = useState(false)
    const [ date1, setDate1 ] = useState("")
    const [ date2, setDate2 ] = useState("")
    const [ loadFlag, setLoadFlag ] = useState(true)

    useEffect(() => {
        for(let i of context.metadata) {
            for(let j of i.facultyAdvisor) {
                if(j.faculty==context.user._id) {
                    setBatch(i.batch)
                    setBranch(j.branch)
                    setSemester(i.sem)
                    setSection(j.section)
                }
            }
        }
    }, [])

    //Either this
    useEffect( () => {

        if(loadFlag){
        
            axios.get('/fa/attendanceReport', { params: {branch: branch, batch: batch, semester: semester, section:section } } )
            .then( response => {
                console.log(response.data)
                if(response.data.startDate) {
                    setStartDate(response.data.startDate.slice(0,10))
                } else {
                    setStartDate('--None--')
                }
                if(response.data.endDate) {
                    setEndDate(response.data.endDate.slice(0,10))
                } else {
                    setEndDate('--None--')
                }
                setOverAllState(response.data.overallState)
                setHodFreeze(response.data.hodFreeze)
                setTableData(response.data.data)
                setCourses(response.data.courses)
                setLoadFlag(false)
            })
            .catch(err => console.log(err.message))
            
        }
        
    }, [loadFlag])

    useEffect(()=> {
        let dummy = []
        let studentList = [...new Set(tableData.map(item=>item.register))]
        
        for(let student of studentList){
            let temp = {
                register:student,
                name:"",
            }
            for(let course of courses){
                temp[course.courseCode] = '---'
            }
            dummy.push({...temp})
        }

        console.log("dummy=",dummy)
        let j=0
        for(let i=0;i<tableData.length;i++){
            if(dummy[j]['register']==tableData[i]['register']){
                dummy[j][tableData[i]['courseCode']]=tableData[i]['attendancePercentage']
                dummy[j]['name'] = tableData[i]['name']
            }else{
                for(j=0;j<dummy.length;j++){
                    if(dummy[j]['register']==tableData[i]['register']){
                        dummy[j][tableData[i]['courseCode']]=tableData[i]['attendancePercentage']
                        dummy[j]['name'] = tableData[i]['name']
                        break
                    }
                }
            }
        }
        setTableValue([...dummy])

        setFields(dummy && dummy.length > 0 ? Object.keys(dummy[0]).filter((key) => omitFields(key)) : []);

        
    }, [tableData])

    useEffect(() => {
        let dummy1 = [...tableValue.map(item => {return item})]
        let dummy2 = []
        for(let student of dummy1) {
            let tempstud = {
                register: student.register,
                name: student.name
            }
            let keys = Object.keys(student).filter((key) => (key!="register"&&key!="name"))
            for(let key of keys) {
                let temp = student[key].split(" ")
                tempstud[key+"_fraction"] = temp[0]
                if(temp[0]!="---")
                    tempstud[key+"_percent"] = temp[1]
                else
                    tempstud[key+"_percent"] = temp[0]
            }
            dummy2.push({...tempstud})
        }
        console.log("Final Dummy",dummy2)
        console.log(tableValue)
        setDownloadData([...dummy2])
        
    }, [tableValue])

    useEffect(() => {

        if(requestFlag) {
            axios.get('/fa/requestReport', { params : { branch: branch, batch: batch, semester:semester, section:section, startDate: date1, endDate: date2 } } )
            .then( response => {
                console.log(response.data)
                setLoadFlag(true)
                setPopupFlag(false)
                setRequestFlag(false)
            })
            .catch(err => console.log(err.message))

        }

    }, [requestFlag])

    useEffect(() => {
        
        if(submitFlag) {
            axios.post('/fa/saveAttendancePercent', { branch:branch, batch:batch, semester:semester, section:section, data:tableData } )
            .then( response => {
                console.log(response.data)
                setLoadFlag(true)
                setSubmitFlag(true)
            })
            .catch(err => console.log(err.message))

        }

    }, [submitFlag])

    const requestReport = () => {
        setPopupFlag(true)
    }

    const submitRequestReport = () => {

        if(date1==""||date2==""){
            alert("Start Date and End Date cannot be empty")
        } else {
            setRequestFlag(true)
        }

    }

    const cancelReport = () => {
        setPopupFlag(false)
    }

    const submitReport = () => {
        setSubmitFlag(true)
    }

    return( !loadFlag ?
        <>
            <div className="flex pb-4">
                <div className="w-1/2">
                    <h5>Department</h5>
                    <div className="text-slate-400 pt-2">{branch}</div>
                </div>
                <div className="w-1/2">
                    <h5>Batch</h5>
                    <div className="text-slate-400 pt-2">{batch}</div>
                </div>
                <div className="w-1/2">
                    <h5>Semester</h5>
                    <div className="text-slate-400 pt-2">{semester}</div>
                </div>
                <div className="w-1/2">
                    <h5>Start Date</h5>
                    <div className="text-slate-400 pt-2">{startDate}</div>
                </div>
                <div className="w-1/2">
                    <h5>End Date</h5>
                    <div className="text-slate-400 pt-2">{endDate}</div>
                </div>
                {hodFreeze == false?
                    <>
                        <div className="w-1/2">
                            <Button color={'blue'} name={"Request New Report"} outline={true} event={requestReport}/>
                        </div>
                        {overAllState == 0?
                            <div className="w-1/2">
                                <Button color={'blue'} name={"Submit Report to HoD"} outline={true} event={submitReport}/>
                            </div>
                            :""
                        }
                    </>
                    :""
                }
            </div>
            <div className="flex w-1/4 pb-4">
                <div className="w-1/2 pt-2">
                    {tableValue.length > 0?
                        <Download data={downloadData} name={branch+"_"+batch+"_"+section+"_"+semester}/>
                        :""
                    }
                </div>
            </div>
            {tableValue.length>0?
                <div className="max-w-min max-h-[80%] overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                    <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                        <thead className="bg-gray-100 text-xs uppercase">
                            <tr>
                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">sno</th>
                                {
                                    fields.map((heading, index) => 
                                        <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th>)
                                }
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {
                            tableValue.map((row, ridx) => (
                            <tr className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap group hover:bg-sky-50`} key={ridx}>
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{ridx + 1}</td>
                                {
                                    fields.map((key, kidx) => 
                                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={kidx}>
                                            { row[key] }
                                        </td>)
                                }
                            </tr>))
                        }
                        </tbody>
                    </table>
                </div>:"No Data"
            }
            {popupFlag?
                <>
                    <div className="absolute z-50 w-full h-full top-0 left-0 bg-slate-300/25"></div>
                    <div className="absolute z-50 w-1/5 h-fit top-1/2 left-1/2 p-5 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border">
                        <div className="text-xl font-bold m-auto w-fit my-5 uppercase">{"Make a Report Request"}</div>
                        <hr className={`border border-blue-300`}/>
                        <div className="text-center my-5 text-sm text-slate-400">
                            <Input name="From" type="date" update={setDate1} />
                            <Input name="to" type="date" update={setDate2} />
                            </div><br/>
                        <div className="flex space-x-4 w-fit m-auto">
                            <Button event={() => submitRequestReport()} name={"Make Request"} color={"blue"}/>
                            <Button event={() => cancelReport()} name={"Cancel"} outline/>
                        </div>
                    </div>
                </>
                :""
            }
            
            </>:<Loading />

    )                    
}

export default Report