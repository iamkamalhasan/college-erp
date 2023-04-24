import Dropdown from "../../utilities/Dropdown"
import Table from "../../utilities/Table"
import Button from '../../utilities/Button'
import MultiSelect from '../../utilities/MultiSelect'
import initial from '../../utilities/initial.json'
import { useEffect, useState, useContext } from "react"
import axios from "../../axios.config"
import Icon from "../../utilities/Icon"
import Input from "../../utilities/Input"
import { AppContext } from "../_app"
import Loading from "../../utilities/Loading"

const Timetable = () => {

    // Get data from the api
    const { data: context } = useContext(AppContext)
    

    // Dummy Meta data
    const MetaData = [
        {
            sem: '7',
            batch: '2019'
        },
        {
            sem: '5',
            batch: '2020'
        },
        {
            sem: '3',
            batch: '2021'
        },
        {
            sem: '1',
            batch: '2022'
        },
    ]

    
    let test1 = initial.timeTable.map(doc => ({...doc}))

    // use States
    const [ sems, setSems ] = useState([])
    const [ batches, setBatches ] = useState(["--None--"])
    const [ batch, setBatch ] = useState("--None--")
    const [ sections, setSections ] = useState(["--None--"])
    const [ section, setSection ] = useState("--None--")
    const [ getSemester, setSemester ] = useState('--None--')
    const [ enable, setEnable ] = useState(false)
    const [ load, setLoad ] = useState(false)
    const [ tableData, setTableData ] = useState([])
    const [ inorVar, setInorVar ] = useState([])
    const [ open, setOpen ] = useState(false)
    const [ submit, setSubmit ] = useState(false)
    const [ effectiveDate, setEffectiveDate ] = useState("")
    const [ ttcBranch, setTTCBranch ] = useState("--None--")
    const [ tableFlag, setTableFlag ] = useState(false)


    const [ tableValue, setTableValue ] = useState([...initial.timeTable])
    const [ savedData, setSavedData ] = useState(initial.timeTable)
    const [ flag, setFlag ] = useState(false)

    // const [tableData, setTableData] = useState(test)
    const [ editBtn, setEditBtn ] = useState(false)
    const [ update, setUpdate ] = useState(false)
    const [ period, setPeriod ] = useState([])
    const [ courseCode, setCourseCode ] = useState("");
    const [ getCourseCodeData, setCourseCodeData ] = useState([''])
    const [ selectedPeriodList, setSelectedPeriodList ] = useState([])
    const [ previousTableData, setPreviousTableData ] = useState(tableValue);
    const [ branch, setBranch ] = useState(['2023'])
    const [ semester, setSelectedSemester ] = useState(7)

    useEffect(() => {

        let TTCBranch = context.user.branch
        let isFirstYear = false
        const branchExist = context.branches.filter(item => item.branch == TTCBranch)
        if(branchExist.length == 0) {
            for(let batch of context.metadata) {
                for(let branch of batch.facultyAdvisor) {
                    if (context.user._id==branch.faculty) {
                        TTCBranch = branch.branch
                        isFirstYear = true
                    }
                }
            }
        }

        const TTCSection = context.branches.filter(item => item.branch == TTCBranch).map(item => item.section)
        
        setTTCBranch(TTCBranch)

        axios.get('/ttc/timetable', { params: { branch: TTCBranch, isFirstYear:isFirstYear, section:TTCSection } })
        .then(response => {
            let data = response.data
            console.log(data)
            setSems(data.sems)
            setInorVar(data.courses)
            setBatches(["--None--", ...data.sems.map(item => item.batch)])
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    },[])

    useEffect(() => {
        if(flag){            
            axios.post('/ttc/timetable', { ed: effectiveDate, branch:ttcBranch, data: savedData })
            .then(response => {
                console.log(response.data)
            })
            .catch(err => console.log(err.message))
            setFlag(false)
        }
    }, [flag])

    //Get Semester      
    // useEffect(() => {

    //     // const cc = [...new Set(tableData.map(course => course.courseCode))];
    //     // setCourseCodeData(cc)

    //     const semesterCodes = [...new Set(MetaData.map(semester => semester.sem))];
    //     setSemester(semesterCodes)

    //     const periods = [];
                
    //     // for (const obj of tableData) {
    //     //     for (const key of Object.keys(obj)) {
    //     //         if (obj[key] === courseCode) {
    //     //             const val = obj["DayOrder"] + " " + key;
    //     //             periods.push(val);
    //     //         }
    //     //     }
    //     // }
        
    //     setPeriod(periods);
    
    // }, [courseCode]);

    const selectedBatch = (val) => {
        setBatch(val)
        setEnable(false)
        if(val=="--None--") {
            setSemester("--None--")
            setSections(["--None--"])
        } else {
            setSemester(sems.filter(item=>item.batch==val).map(item=>item.sem))
            setSections(["--None--", ...new Set(inorVar.filter(item=>item.batch==val).map(item=>item.section))])
        }
    }

    const selectedSection = (val) => {
        setSection(val)
        setEnable(false)
    }

    const selectedTimetable = () => {
        if(batch=="--None--"||section=="--None--") {
            setEnable(false)
            alert("No Batch or No Section is selected")
        } else {
            console.log(inorVar.filter(doc => (doc.batch==batch)&&(doc.section==section)))
            setTableData(inorVar.filter(doc => (doc.batch==batch)&&(doc.section==section)))
            const cc = ["Clear Period", ...new Set(inorVar.filter(doc => (doc.batch==batch)&&(doc.section==section)).map(course => course.courseCode))];
            setCourseCodeData(cc)
            setEnable(true)
            setTableFlag(true)
        }
    }


    const selectedSemester = (data) => {
        setSelectedSemester(data)
        const b = MetaData.map(semester => {
            if(semester.sem === data) return semester.batch
        })
        test1 = [...initial.timeTable]
        setBranch(b)

        setTableData(inorVar.filter(sem => sem.semester === data))

    }

    useEffect(()=>{

        let dummy = []
        console.log(tableData)

        // console.log(test)
        test1 = initial.timeTable.map(doc => ({...doc}))

        for(let course of tableData) {
            for(let cell of course.schedule) {
                let r = Math.floor(cell / 10), c = cell % 10
                if(test1[r - 1]["Period " + c] == "")
                    test1[r - 1]["Period " + c] = course.courseCode
                else
                test1[r - 1]["Period " + c] += " / " + course.courseCode
            }
        }
        dummy = [...test1]
        setTableValue([...dummy])

        const cc = ["Clear Period", ...new Set(tableData.map(course => course.courseCode))];
        setCourseCodeData(cc)

    }, [tableData])

    const selectedCourseCode = (data) => {
        setCourseCode(data);
    }

    const selectedBranch = (data) => {
        setBranch(data);
    }
      
    const periodOptions = period.map((p) => ({
    value: p.replace(/\s+/g, ''),
    label: p,
    }));
      

    // Multi Select functionality
    const selectedPeriod = (data) => {
        setSelectedPeriodList(data)
    }

    // Update Button Functionality
    const updateTable = () => {
        console.log(tableValue)
        setPreviousTableData(tableValue)

        let dummy = []
        for(let cell of tableValue) {
            let obj = {...cell}
            for(let period of selectedPeriodList) {
                let keys = period.value.split(" ")
                if(obj["DayOrder"] == keys[0])
                    if(courseCode == "Clear Period")
                        obj["Period " + keys[1]] = ""
                    else
                        if(obj["Period " + keys[1]]=="")
                            obj["Period " + keys[1]] = courseCode
                        else{
                            let cr = obj["Period " + keys[1]].split(" / ")
                            let f = false
                            for(let i of cr){
                                if(i==courseCode){
                                    f=true;
                                    break;
                                }
                            }
                            if(f==false){
                                obj["Period " + keys[1]] += " / " + courseCode
                            }
                        }
            }
            dummy.push(obj)
        }
        setTableValue(dummy)
        setCourseCode("");
        setSelectedPeriodList("");
        setUpdate(true);
    };
      

    // Save Button Functionality
    const saveData = (d) => {

        setOpen(true)

    }

    const sendData = () => {

        setOpen(false)

        let dummy = tableData.map(d => ({...d}))

        dummy.map(course => {
            course.schedule = []
        })

        tableValue.map((row, idx) => {
            console.log(row)

            for(let key of Object.keys(row)) {
                if(key != "DayOrder"){
                    let sp = row[key].split(" / ");
                    for(let cr of sp){
                        for(let course of dummy) {
                            if(course.courseCode == cr) {
                                course.schedule.push((idx+1)*10 + parseInt(key.charAt(key.length - 1)))
                            }
                        }
                    }
                }                    
            }
            // row.map((cell, cidx) => {
            //     if(cidx != 0)
            //         for(let course of dummy) {
            //             if(course.courseCode == cell) {
            //                 course.schedule.push = (idx+1)*10 + cidx
            //             }
            //         }    
            // })
        })

        console.log("Me",dummy)
        setSavedData(dummy)
        setFlag(true)



        // console.log("Added Data ", tableData)
        setEditBtn(false)
        setUpdate(false)

    }

    const effDate = (data) => {
        // console.log(data)
        setEffectiveDate(data)
    }

    // Cancel Button Functionality
    const cancelData = () => { 
        setTableData(inorVar.filter(doc => doc.semester == semester))
        setEditBtn(false)    
        setUpdate(false)
    }
    
    return ( load && tableValue ?
        <>
        <div className="px-2 m-2">
            <div className="flex">
                <div className="w-1/4">
                    <h5 className="p-1">Department</h5>
                    <div className="text-slate-400 p-1">{ttcBranch}</div>
                </div>
                <div className="w-1/5">
                    <Dropdown name ={"Batch"} data = {batches} update={selectedBatch} />
                </div>
                <div className="w-1/5">
                    <Dropdown name ={"Section"} data = {sections} update={selectedSection} />
                </div>
                <div className="w-1/4">
                    <h5 className="p-1">Semester</h5>
                    <div className="text-slate-400">{getSemester}</div>
                </div>
                {
                    !enable && !editBtn ?
                    <div className="w-1/4">
                        <Button color={'blue'} name={"Get Timetable"} event={selectedTimetable} />
                    </div>
                    : null
                }
                {
                    enable && !editBtn ? 
                    <div className="w-1/4">
                        <Button color={'blue'} name={"Edit Timetable"} icon={'edit'} outline={false} event={() => {setEditBtn(true)}} />
                    </div> : null
                }
            </div>

            {
                editBtn ? 
                <div className="flex pt-10">
                    <div className="w-1/3 pt-5 pl-3">
                        <Dropdown name ={"Course Code"} data = {getCourseCodeData} special ={true} update={selectedCourseCode} />
                    </div>
                    <div className="w-1/2">
                        <MultiSelect name = {'Period'} data = {initial.dayOrder} values={periodOptions} selectedData={selectedPeriod} def/>
                    </div>
                    <div className="w-1/3 pt-2">
                        <Button color={'blue'} name={"Update"} icon={'add'} outline={false} event={updateTable} />
                    </div>
                </div> : null
            }

            { tableFlag ? 
                <div className="flex pt-10 flex-wrap">
                    <Table data={tableValue} />
                </div>
                : "No Class Selected"
            }
            
            {
                editBtn ?  
                <div className="flex justify-end flex-row m-10">
                    <div className="mx-4 w-1/8">
                        <Button color={'blue'} name={"Cancel"} outline={true} event={cancelData} />
                    </div>
                    <div className="mx-4 w-1/6">
                        <Button color={'blue'} name={"Save"} outline={false} event={saveData} disabled={!update}/>
                    </div>
                </div> : null
            }

            { open ?         
            <div className="absolute w-3/12 z-40 border-x-2 bg-white rounded-lg  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="absolute cursor-pointer text-red-500 top-4 right-2" onClick={() => setOpen(false)}>
                <Icon name="close" icon="close"/>
                </div>
                <div className="text-md font-bold w-fit m-auto my-3">Attendance effective from: </div>
                <div className="flex pl-14 space-x-4 justify-center w-fit m-4">
                    <Input name="Date" type="date" color="blue"  update={effDate}/>
                </div>
                <hr/>
                <div onClick={sendData} className={`py-4 px-3 rounded-md cursor-pointer font-semibold text-sm m-4 text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500"}`} disabled={submit ? "disabled" : ""}>Ok</div>
            </div> : <></>}


        </div>

        </> : <Loading />
    ) 
}

export default Timetable