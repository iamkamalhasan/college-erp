import Dropdown from "../../../utilities/Dropdown"
import Table from "../../../utilities/Table"
import { useEffect, useState, useContext } from "react"
import Button from "../../../utilities/Button"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"

const Attendance = () => {
    
    const { data: context } = useContext(AppContext)
    
    let MetaData = []

    for(let branch of context.branches) {
        let flag = false
        for(let i of MetaData) {
            if(i.branch == branch.branch) {
                i.section.push(branch.section)
                flag=true
                break
            }
        }
        if(!flag) {
            MetaData.push({branch:branch.branch, section:["--None--", branch.section]})
        }
    }

    
    const [ branch, setBranch ] = useState("--None--")
    const [ sections, setSections ] = useState(["--None--"])
    const [ semester, setSemester ] = useState(context.metadata.filter(item => (item.sem==1||item.sem==2)).map(item=> item.sem)[0])  
    const [ batch, setBatch ] = useState(context.metadata.filter(item => (item.sem==1||item.sem==2)).map(item => item.batch)[0])
    const [ section, setSection ] = useState("--None--")
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
            axios.post('/hod/openCondonation', { branch: branch, batch:batch, semester:semester, section:section, data:tableData } )
            .then(response => {
                if(response.data) {
                    alert(response.data)
                }
            })
            .catch(err => console.log(err.message))
            setSaveFlag(false)
        }
    }, [saveFlag])

    const selectedBranch = (e) => {
        setBranch(e)
        MetaData.map(items => {
            if(items.branch === e)
                setSections(items.section)
        })
        
    }

    const selectedSection = (e) => {
        setSection(e)
    }

    const getReportHandler = () => {
        if(branch=="--None--"||section=="--None--") { 
            alert("No Branch or Section has been selected...")
        } else {
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
            <div className="flex w-3/4 pb-2">
                <div className="w-1/4">
                    <Dropdown name ={"Department"} data = { ["--None--", ...MetaData.map(item => item.branch)] } update={selectedBranch} /> 
                </div>
                <div className="w-1/4">
                    <h5>Batch</h5>
                    <div className="text-slate-400">{batch}</div>
                </div>
                <div className="w-1/4">
                    <Dropdown name ={"Section"} data = {sections} update={selectedSection} /> 
                </div>
                <div className="w-1/5">
                    <h5>Semester</h5>
                    <div className="text-slate-400">{semester}</div>
                </div>
                <div className="w-1/4 pt-2">
                    <Button color={'blue'} name={"Get Report"} outline={true} event={getReportHandler} />
                </div>
                <div className="w-1/4 pt-2">
                    <Button color={'blue'} name={"Open Condonation"} outline={true} event={saveReport} />
                </div>
            </div>

            { reportData?(freeze?<Table indexed data={tableValue} />:"No Data Submitted by Faculty Advisor"): "No Batch Selected" }

        </>
    ) 
}

export default Attendance