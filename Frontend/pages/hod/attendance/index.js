import Dropdown from "../../../utilities/Dropdown"
import Table from "../../../utilities/Table"
import { useEffect, useState, useContext } from "react"
import Button from "../../../utilities/Button"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"

const Attendance = () => {

    const { data: context } = useContext(AppContext)
    
    const MetaData = context.metadata.filter(item => (item.sem!=1&&item.sem!=2)).map(item => ({batch:item.batch, sem:item.sem}))

    const [ branch, setBranch ] = useState(context.user.branch)
    const [ semester, setSemester ] = useState('--None--')  
    const [ batch, setBatch ] = useState("--None--")
    const [ section, setSection ] = useState("--None--")
    const [ reportBatch, setReportBatch ] = useState("")
    const [ reportSemester, setReportSemester ] = useState("")
    const [ reportSection, setReportSection ] = useState("")
    const [ reportFlag, setReportFlag] = useState(false)
    const [ tableData, setTableData ] = useState([])
    const [ tableValue, setTableValue ] = useState([])
    const [ courses, setCourses ] = useState([])
    const [ reportData, setReportData ] = useState(false)
    const [ freeze, setFreeze ] = useState(false)
    const [ saveFlag, setSaveFlag ] = useState(false) 
    const [ condonationFreeze, setCondonationFreeze ] = useState(false)
    
    useEffect(() => {
        if(reportFlag){
            setReportFlag(false)
            axios.get('/hod/attendanceReport', { params: { branch:branch, batch:batch, semester:semester, section:section } } )
            .then(response => {
                console.log("response =", response.data)
                setFreeze(response.data.freeze)
                if(response.data.freeze){
                    setTableData(response.data.data)
                    setCourses(response.data.Courses)
                    setCondonationFreeze(response.data.condonationFreeze)
                }
                setReportFlag(false)
                setReportData(true)
            })
            .catch(err => console.log(err.message))

        }
    }, [reportFlag])

    useEffect(()=> {
        let dummy = []
        let studentList = [...new Set(tableData.map(item=>item.register))]
        
        for(let student of studentList){
            let temp = {
                register:student,
                name:'',
            }
            for(let course of courses){
                
                temp[course.courseCode] = '--'
            }
            dummy.push({...temp})
        }
        console.log("dummy=",dummy)
        let j=0
        for(let i=0;i<tableData.length;i++){
            if(dummy[j]['register']==tableData[i]['register']){
                dummy[j][tableData[i]['courseCode']]=tableData[i]['attendancePercentage']
                dummy[j]['name'] = tableData[i]['studentName']
            }else{
                for(j=0;j<dummy.length;j++){
                    if(dummy[j]['register']==tableData[i]['register']){
                        dummy[j][tableData[i]['courseCode']]=tableData[i]['attendancePercentage']
                        dummy[j]['name'] = tableData[i]['studentName']
                        break
                    }
                }
            }
        }
        setTableValue(dummy)
        
    }, [tableData])

    useEffect(() => {
        if(saveFlag) {
            axios.post('/hod/openCondonation', { branch: branch, batch:reportBatch, semester:reportSemester, section:reportSection, data:tableData } )
            .then(response => {
                if(response.data) {
                    alert(response.data)
                }
            })
            .catch(err => console.log(err.message))
            setSaveFlag(false)
        }
    }, [saveFlag])

    const selectedBatch = (e) => {
        setBatch(e)
        if(e=="--None--") {
            setSemester("--None--")
        } else {
            MetaData.map(items => {
                if(items.batch === e)
                    setSemester(items.sem)
            })
        }
        
    }

    const selectedSection = (e) => {
        setSection(e)
    }

    const getReportHandler = () => {
        if(batch=="--None--"||section=="--None--") { 
            alert("No Batch has been selected...")
        } else {
            setReportBatch(batch)
            setReportSection(section)
            setReportSemester(semester)
            setReportFlag(true)
        }
    }

    const saveReport = () => {
        if(!freeze) {
            alert('No Report is Generated to Freeze...')
        } else {
            if(condonationFreeze) {
                alert("This Report is already Freezed...")
            } else {
                setSaveFlag(true)
            }
        }
    }

    return (
        <>
            <div className="flex w-4/5 pb-2">
                <div className="w-1/3">
                    <h5>Department</h5>
                    <div className="text-slate-400">{branch}</div>
                </div>
                <div className="w-1/4">
                    <Dropdown name ={"Batch"} data = { ["--None--", ...MetaData.map(item => item.batch)] } special ={false} update={selectedBatch} /> 
                </div>
                <div className="w-1/4">
                    <Dropdown name ={"Section"} data = { ["--None--", ...context.branches.filter(item => item.branch == branch).map(item => item.section)] } update={selectedSection} /> 
                </div>
                <div className="w-1/5">
                    <h5>Semester</h5>
                    <div className="text-slate-400">{semester}</div>
                </div>
                <div className="w-1/4 pt-2">
                    <Button color={'blue'} name={"Get Report"} outline={true} event={getReportHandler} />
                </div>
                <div className="w-1/3 pt-2">
                    <Button color={'blue'} name={"Open Condonation"} outline={true} event={saveReport} disabled={!freeze} />
                </div>
            </div>

            { reportData?(freeze?<Table indexed data={tableValue} />:"No Data Submitted by Faculty Advisor"): "No Batch Selected" }

        </>
    ) 
}

export default Attendance