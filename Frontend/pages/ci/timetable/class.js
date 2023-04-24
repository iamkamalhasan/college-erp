import Button from "../../../utilities/Button"
import Input from "../../../utilities/Input"
import { useEffect, useState, useContext } from "react"
import Icon from "../../../utilities/Icon"
import Dropdown from "../../../utilities/Dropdown"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Class = () => {

    const { data: context } = useContext(AppContext)

    const MetaData = context.metadata.map(item => ({batch:item.batch, sem:item.sem}))

    let MetaData1 = []

    for(let branch of context.branches) {
        let flag = false
        for(let i of MetaData1) {
            if(i.branch == branch.branch) {
                i.section.push(branch.section)
                flag=true
                break
            }
        }
        if(!flag) {
            MetaData1.push({branch:branch.branch, section:["--None--", branch.section]})
        }
    }

    // TEMP Faculty ID
    const facultyId = context.user._id
    const [ open, setOpen ] = useState(false)
    const [ openState, setOpenState ] = useState(false)
    const [replaceOpenState, setReplaceOpenState] = useState(false)

    const [tableData,setTableData]=useState([])
    const [tableView, setTableView] = useState(false)
    const [hoverData, setHoverData] = useState("")
    const [hoveredRow, setHoveredRow] = useState(null);
    const [hoveredKey, setHoveredKey] = useState(null);
    const [selectedCell2, setSelectedCell2] = useState(null);
    const [ submit, setSubmit ] = useState(false)
    const [date, setDate] = useState("")
    const [period, setPeriod] = useState("")
    const [reason, setReason] = useState("")
    const [getCourseCode, setCourseCode] = useState([])
    const [getSelectedCourseCode, setSelectedCourseCode] = useState("")
    const [selectedCell, setSelectedCell] = useState(null);
    const [getSemester, setSemester] = useState("")
    const [baForClassTT, setBaForClassTT] = useState("")
    const [brForClassTT,setBrForClassTT] = useState("")
    const [ section, setSection ] = useState("")
    const [ sections, setSections ] = useState(["--None--"])
    const [reportBatch, setReportBatch] = useState("")
    const [reportBranch, setReportBranch] = useState("")
    const [reportSection, setReportSection] = useState("")
    const [swapReqFlag, setSwapReqFlag] = useState(false)
    const [replaceClassFlag, setReplaceClassFlag] = useState(false)


    const [data, setData] = useState([])
    const [minData, setMinData] = useState([])
    const [getTT, setTT] = useState(false)
    const [hoveredCell, setHoveredCell] = useState(null);
    const [clickedCourseCodes, setClickedCourseCodes] = useState(false);
    const [firstValue, setFirstValue] = useState("")
    const [swapFlag, setSwapFlag] = useState(false)
    const [TTFlag, setTTFlag] = useState(false)
    const [ECFlag, setECFlag] = useState(false)

    const [sd1, setSd1] = useState("")
    const [sd2, setSd2] = useState("")
    const [sp1, setSp1] = useState("")
    const [sp2, setSp2] = useState("")
    const [scc1, setScc1] = useState("")
    const [scc2, setScc2] = useState("")
    const [pointer2, setPointer2] = useState(false)

    const [replaceDate, setReplaceDate] = useState("")
    const [replacePeriod, setReplacePeriod] = useState("")
    const [replaceCC1, setReplaceCC1] = useState("")

    let temp={}
    let min_data =[]
    let i=0

    const getTimeTableHandler = () => {
        setReportBatch(baForClassTT)
        setReportBranch(brForClassTT)
        setReportSection(section)
        setTTFlag(true)
    }

    const handleCellHover = (event, row, key) => {
        setHoveredRow(row);
        setHoveredKey(key);
        if (row[key] === "") {
            setHoverData("Extra Class");
        } else if(getCourseCode.includes(row[key]) && key != "Date" && row[key] != "18IEE801" && row[key] != "18IEE708"){
            setHoverData("Swap Class")
        } else if(!getCourseCode.includes(row[key]) && key != "Date" && scc1 == ""){
            setHoverData("Replace Class");
        } else if(scc1 != ""){
            setHoverData("Swap Class")
        } else {
            setHoverData("")
        }
      setHoveredCell({ row, key });
    };
  
    const handleCellLeave = () => {
      setHoveredCell(null);
    };

    useEffect(() => {
        if(TTFlag){
            axios.get('/ci/studentTimetable' , { params: { branch:brForClassTT, section:section, batch: baForClassTT, sem: getSemester } } )
            .then(response => {
                console.log(response.data)
                setTableData(response.data)
                setTTFlag(false)
                setTT(true)
            })
            .catch(err => console.log(err.message))
        }    
    }, [TTFlag])

    useEffect(() => {
        if(ECFlag) {
            const tempDummy = {
                date:date,
                period:period,
                courseId: tableData.filter(item => item.facultyId == facultyId&&item.courseCode==getSelectedCourseCode).map(item => item.courseId)[0],
                facultyId: facultyId,
                batch: reportBatch,
                branch: reportBranch,
                section: reportSection
            }
            axios.post('/ci/extraPeriod' , tempDummy )
            .then(response => {
                console.log(response.data)
                setECFlag(false)
            })
            .catch(err => console.log(err.message))

        }
    }, [ECFlag])

    useEffect(() => {
        if(replaceClassFlag) {
            console.log("hello")
            // console.log(sd1, sd2, sp1, sp2, scc1, scc2)
            console.log(replaceCC1)
            let courseCodes = replaceCC1.split(" / ")
            for(let course of courseCodes) {
                let period1 = tableData.filter(item => item.date.slice(0,10)==replaceDate&&item.period==replacePeriod.split(" ")[1]&&item.courseCode==course)
                let period2 = tableData.filter(item => item.courseCode==getSelectedCourseCode)
                console.log("period", period1,period2)
                
                let temp = {  
                    _id: period1[0]._id,   // _id of the period in MasterTimeTable
                    request: {              // This obj will the actual request for swapping
                        from: facultyId,              // Faculty _id who made request
                        fromRef: "Faculty",         // 'Faculty'
                        to: period1[0].facultyId,                // Faculty _id who accept/decline the request
                        type: "Period Unfreeze Request",              // Period Unfreeze Request 
                        body: [             // Contains the one of two JSON object
                            {
                                _id: period1[0]._id,        // _id of swapping period in MasterTimeTable 
                                courseId: period2[0].courseId,  
                                facultyId: facultyId
                            }    
                        ],
                        deadline: 3          // deadline only in hours
                    }
                        
                }
                temp.request.body = JSON.stringify(temp.request.body)
                console.log("temp = ", temp)
                
                axios.post('/ci/request/period/swap' , temp )
                .then(response => {
                    console.log(response.data)
                    setReplaceClassFlag(false)
                })
                .catch(err => console.log(err.message))
            }
        }
            
    }, [replaceClassFlag])

    useEffect(() => {
        if(swapReqFlag) {
            let period1 = tableData.filter(item => item.date.slice(0,10)==sd1&&item.period==sp1.split(" ")[1]&&item.courseCode==scc1)
            let period2 = tableData.filter(item => item.date.slice(0,10)==sd2&&item.period==sp2.split(" ")[1])
            console.log("period", period1,period2)
            for(let period of period2) {
                let temp = {  
                    _id: period1[0]._id,   // _id of the period in MasterTimeTable
                    request: {              // This obj will the actual request for swapping
                        from: facultyId,              // Faculty _id who made request
                        fromRef: "Faculty",         // 'Faculty'
                        to: period.facultyId,                // Faculty _id who accept/decline the request
                        type: "Period Unfreeze Request",              // Period Unfreeze Request 
                        body: [             // Contains the one of two JSON object
                            {
                                _id: period1[0]._id,        // _id of swapping period in MasterTimeTable 
                                courseId: period.courseId,  
                                facultyId: period.facultyId
                            },
                            {
                                _id: period._id,        // _id of swapping period in MasterTimeTable 
                                courseId: period1[0].courseId,  
                                facultyId: period1[0].facultyId
                            }
    
                        ],
                        deadline: 3          // deadline only in hours
                    }
                           
                }
                temp.request.body = JSON.stringify(temp.request.body)
                console.log("temp = ", temp)

                axios.post('/ci/request/period/swap' , temp )
                .then(response => {
                    console.log(response.data)
                    setSwapReqFlag(false)
                })
                .catch(err => console.log(err.message))
            }    
        }
    }, [swapReqFlag])

    useEffect(() => {
        if (tableData!=null){

            let dummy = []
    
            let j
             for(let i=0;i<tableData.length;i++){
                j = tableData[i].date
            //  console.log(typeof(j))
            //  console.log(typeof(tableData[i].date))
                temp["Date"] = j.slice(0,10)
                temp["Period 1"]= ""
                temp["Period 2"]= ""
                temp["Period 3"]= ""
                temp["Period 4"]= ""
                temp["Period 5"]= ""
                temp["Period 6"]= ""
                temp["Period 7"]= ""
                temp["Period 8"]= ""
                while(tableData[i].date === j){
                    if(tableData[i].courseName === "Project Work" || tableData[i].courseName === "Mini Project") {
                        temp["Period " + tableData[i].period] = tableData[i].courseCode + " / "                        
                    } else {
                        temp["Period " + tableData[i].period] += tableData[i].courseCode + " / "
                    }

                    i++
                    if(i==tableData.length)
                        break
                }

                 temp["Period 1"] = temp["Period 1"].slice(0,-3)
                 temp["Period 2"] = temp["Period 2"].slice(0,-3)
                 temp["Period 3"] = temp["Period 3"].slice(0,-3)
                 temp["Period 4"] = temp["Period 4"].slice(0,-3)
                 temp["Period 5"] = temp["Period 5"].slice(0,-3)
                 temp["Period 6"] = temp["Period 6"].slice(0,-3)
                 temp["Period 7"] = temp["Period 7"].slice(0,-3)
                 temp["Period 8"] = temp["Period 8"].slice(0,-3)

                 dummy.push({...temp})
                // console.log(temp)
                // let dummy = tableData.map(d => ({...d}))
                 i--
             }
             setData(dummy)
     
             for(let i=0;i<5&&i<dummy.length;i++){
                 min_data.push({...dummy[i]})
             }
            //  console.log(min_data)
            setMinData(min_data)

        }
        
        setCourseCode([...new Set(tableData.filter(item => item.facultyId == facultyId).map(item => item.courseCode))])
    }, [tableData])

    const changeState = (status) => {
        setTableView(status)
    }

    const batchHandler = (data) => {
        setBaForClassTT(data)
        MetaData.map(item => {
            if(item.batch == data)
                setSemester(item.sem)
        })
    }

    const branchHandler = (data) => {
        setBrForClassTT(data)
        MetaData1.map(item => {
            if(item.branch == data)
                setSections(item.section)
        })
    }

    const sectionHandler = (data) => {
        setSection(data)
    }

    const selectedCourseCode = (data) => {
        console.log(data)
        setSelectedCourseCode(data)
    }

    // Update the Table for Extra Class
    const addECHandler = () => {
        const dummy = data
        //setCourseCode([...new Set(tableData.filter(item => item.facultyId == facultyId).map(item => item.courseCode))])
        
        
        setECFlag(true)
        dummy.map(item => {
            if(item["Date"] == date) {
                item["Period " + period] = getSelectedCourseCode
                console.log(item)
            }
        })
        console.log(dummy)
        // data = dummy
        setData(dummy)

        let min_data = []

        for(let i=0;i<5&&i<dummy.length;i++){
            min_data.push({...dummy[i]})
        }
       //  console.log(min_data)
       setMinData(min_data)

        setSubmit(true)
        setOpenState(false)
    }

    const replaceClassHandler = () => {
        setReplaceClassFlag(true)
    }

    const swapRequestHandler = () => {
        setSwapReqFlag(true)
    }

    const SwapClassHandler = () => {
        setOpen(true)
    }

    // function getTableCellClassNames(row, key) {
    //     let classNames = 'px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap';

    //     if (hoveredCell?.row === row && hoveredCell?.key === key) {
    //         classNames += ' bg-sky-100';
    //     }
    //     if (getCourseCode.includes(row[key]) && row[key]) {
    //         // if (clickedCourseCodes.includes(row[key])) {
    //         //     classNames += ' cursor-pointer bg-sky-200 text-white';
    //         // } else {
    //         //     classNames += ' cursor-pointer';
    //         // }
    //         classNames += 'cursor-pointer bg-sky-200 text-white'
    //     } else if (!row[key]) {
    //         classNames += ' cursor-pointer';
    //     } 

    //     return classNames;
    // }

    const handleTable = (e, row, key, kidx, ridx) => {

        if(getCourseCode.includes(row[key])) {
            setClickedCourseCodes(true)
        }
        console.log(getCourseCode)

        if (row[key] !== "" && !getCourseCode.includes(row[key]) && scc1 == "") {
            setReplaceDate(row["Date"])
            setReplacePeriod(key)
            setReplaceCC1(row[key])
            setReplaceOpenState(true)
        }   else if(row[key] !==""){         
            console.log("Cell is not empty");
            // if(e.target.textContent != row["Date"]) setOpen(true)

            if (selectedCell === null) {
                setSelectedCell({ row: ridx, column: kidx });
                setSd1(row["Date"])
                setSp1(key)
                setScc1(row[key])

                setPointer2(true)
            } else {
                let newSelectedCell = {};
                if(row[key] != "18IEE801" && row[key] != "18IEE708") {

                    newSelectedCell = { row: ridx, column: kidx };
                    setSd2(row["Date"])
                    setSp2(key)
                    setScc2(row[key])
                    setSelectedCell2({ row: ridx, column: kidx })
                } else {
                    setSelectedCell(null)
                    setSwapFlag(false)
                    // setOpen(false)
                    return
                }
                if (selectedCell.row === newSelectedCell.row && selectedCell.column === newSelectedCell.column) {
                    // If the two selected cells are the same, deselect
                    setSelectedCell(null);
                    setClickedCourseCodes(false)
                    setScc1("")
                    
                } else if (selectedCell2 && selectedCell2.row === newSelectedCell.row && selectedCell2.column === newSelectedCell.column) {
                    // If the two selected cells are the same, deselect
                    setSelectedCell2(null);
                    setSwapFlag(false)
                    setScc2("")
                    
                } else {
                    console.log(row[key], row, key, kidx, ridx)
                    // Swap the two cells
                //     const newData = [...data];
                //     const temp = newData[selectedCell.row][fields[selectedCell.column]];
                //     newData[selectedCell.row][fields[selectedCell.column]] = newData[newSelectedCell.row][fields[newSelectedCell.column]];
                //     newData[newSelectedCell.row][fields[newSelectedCell.column]] = temp;
                //     setData(newData);

                //     let min_data = []

                //     for(let i=0;i<5&&i<dummy.length;i++){
                //         min_data.push({...dummy[i]})
                //     }
                //    //  console.log(min_data)
                //    setMinData(min_data)
            
                //     console.log("SWAPPED")
                    if(clickedCourseCodes) {
                        setSwapFlag(true)
                        // setOpen(true)
                    } else {
                        setSelectedCell(null);
                        setClickedCourseCodes(false)
                    
                    }
            
                    // Deselect
                    setPointer2(false)
                        // setScc1("")

                }
            }   
        
        } else {
            // console.log("Cell is empty");
            // console.log(row)
            setDate(row["Date"])
            setPeriod(kidx)

            setOpenState(true)

        }

    }


    let omit = []
    const omitFields = (field) => !omit.some(item => item == field)
    const fields = data && data.length > 0 ? Object.keys(data[0]).filter(key => omitFields(key)) : []

    return (

        data && min_data?
     
         <>
            <div className="flex">
                <div className="w-3/12">
                    <div className="flex-6/12" >
                        <Dropdown name ={"Branch"} data = {MetaData1.map(item => item.branch)} update={branchHandler} />                
                    </div>
                </div>
                <div className="w-2/12">
                    <div className="flex-6/12" >
                        <Dropdown name ={"Batch"} data = {MetaData.map(item => item.batch)} update={batchHandler} />                
                    </div>
                </div>
                <div className="w-3/12">
                    <div className="flex-6/12" >
                        <Dropdown name ={"Section"} data = {sections} update={sectionHandler} />                
                    </div>
                </div>
                <div className="w-2/12">
                    <h5 className="p-1">Semester</h5>
                    <div className="text-slate-400 p-1">{getSemester}</div>
                </div>
                <div className="w-3/12">
                    <Button color={'blue'} name={"Get Class TimeTable"} icon={'table'} outline={false} event={getTimeTableHandler} />
                </div>
                <div className="w-3/12">
                    <Button color={'blue'} name={"Swap Class"} outline={true} event={SwapClassHandler} disabled={!swapFlag}/>
                </div>
            </div>
         {
            openState ? 
            <div className="absolute w-3/12 z-40 border-x-2 bg-white rounded-lg  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="absolute cursor-pointer text-red-500 top-4 right-2" onClick={() => setOpenState(false)}>
                    <Icon name="close" icon="close"/>
                </div>
                <div className="text-l font-semibold w-fit m-auto my-4">EXTRA CLASS</div><hr/>

                <div className="flex pl-14 space-x-4 justify-center w-fit m-4">
                    <h5 className="p-1">Date</h5>
                    <div className="text-slate-400 p-1">{date}</div>
                </div>

                <div className="flex pl-14 space-x-4 justify-center w-fit m-4">
                    <h5 className="p-1">Period</h5>
                    <div className="text-slate-400 p-1">{period}</div>
                </div>

                {/* <div className="flex pl-12 space-x-4 justify-center w-fit m-4">
                    <Input name="Period" type="text" color="blue" value={period} />
                </div> */}
                <div className="flex pl-12 space-x-4 justify-center w-fit m-4">
                    <Dropdown name ={"Course Code"} data = {getCourseCode} special ={false} update={selectedCourseCode}  />
                </div>                
                <div className="flex pl-12 space-x-4 justify-center w-fit m-4">
                    <Input name="Reason" type="text" color="blue" update={setReason} />
                </div><hr/>
                {/* <div onClick={() => setSubmit(true)} className={`py-2 px-2 rounded-md cursor-pointer font-semibold text-sm m-4 text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500"}`} disabled={submit ? "disabled" : ""}>Add</div> */}
                <div onClick={addECHandler} className={`py-2 px-2 rounded-md cursor-pointer font-semibold text-sm m-4 text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500"}`} disabled={submit ? "disabled" : ""}>Add</div>                
            </div> : ""
         }

        {
            open ? 
            <div className="absolute w-5/12 z-40 border-x-2 bg-white rounded-lg  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="absolute cursor-pointer text-red-500 top-4 right-2" onClick={() => {
                    setOpen(false)
                    setSwapFlag(false)
                    setScc1("")
                    setSelectedCell(null);
                    setSelectedCell2(null)
                    setClickedCourseCodes(false)}}>
                <Icon name="close" icon="close"/>
                </div>
                <div className="text-xl font-bold w-fit m-auto my-4">SWAP CLASS</div><hr/>

                <div className="flex pl-14 space-x-4 justify-center w-fit m-4">
                    <h5 className="p-1">Date</h5>
                    <div className="text-slate-400 p-1">{sd1}</div>

                    <h5 className="p-1">Date</h5>
                    <div className="text-slate-400 p-1">{sd2}</div>
                </div>

                <div className="flex pl-14 space-x-4 justify-center w-fit m-4">
                    <h5 className="p-1">Period</h5>
                    <div className="text-slate-400 p-1">{sp1}</div>

                    <h5 className="p-1">Period</h5>
                    <div className="text-slate-400 p-1">{sp2}</div>
                </div>

                <div className="flex pl-14 space-x-4 justify-center w-fit m-4">
                    <h5 className="p-1">Course Code</h5>
                    <div className="text-slate-400 p-1">{scc1}</div>

                    <span class="material-symbols-outlined">swap_horiz</span>

                    <h5 className="p-1">Course Code</h5>
                    <div className="text-slate-400 p-1">{scc2}</div>
                </div>


                <div className="flex pl-14 space-x-4 justify-center w-fit m-4">
                    <Input name="Reason" type="text" color="blue"  update={setReason}/>
                </div><hr/>
                <div onClick={swapRequestHandler} className={`py-2 px-2 rounded-md cursor-pointer font-semibold text-sm m-4 text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500"}`} disabled={submit ? "disabled" : ""}>Request</div>
            </div>
            : ""
        }

{
            replaceOpenState ? 
            <div className="absolute w-4/12 z-40 border-x-2 bg-white rounded-lg  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="absolute cursor-pointer text-red-500 top-4 right-2" onClick={() => setReplaceOpenState(false)}>
                    <Icon name="close" icon="close"/>
                </div>
                <div className="text-l font-semibold w-fit m-auto my-4">REPLACING CLASS</div><hr/>

                <div className="flex pl-24 space-x-4 justify-center w-fit m-4">
                    <h5 className="p-1">Date</h5>
                    <div className="text-slate-400 p-1">{replaceDate}</div>
                </div>

                <div className="flex pl-24 space-x-4 justify-center w-fit m-4">
                    <h5 className="p-1">Period</h5>
                    <div className="text-slate-400 p-1">{replacePeriod}</div>
                </div>

                <div className="flex pl-24 space-x-4 justify-center w-fit m-4">
                <div className="flex flex-col space-x-4 justify-center">
                    <h5 className="text-sm">Course Code</h5>
                    <div className="text-slate-400 text-sm pt-2">{replaceCC1}</div>
                </div>


                    <span class="material-symbols-outlined pt-10 pl-4">arrow_forward</span>

                    <div className="flex pl-4 space-x-4 justify-center w-fit m-4">
                        <Dropdown name ={"Course Code"} data = {getCourseCode} special ={false} update={selectedCourseCode}  />
                    </div>                
                </div>


                <div className="flex pl-24 space-x-4 justify-center w-fit m-4">
                    <Input name="Reason" type="text" color="blue" update={setReason} />
                </div><hr/>
                <div onClick={replaceClassHandler} className={`py-2 px-2 rounded-md cursor-pointer font-semibold text-sm m-4 text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500"}`} disabled={submit ? "disabled" : ""}>Request Class</div>                
            </div> : ""
         }

        {
            getTT ? <>

        {tableView ? data && (data.length > 0 ?

            <div className="max-w-min max-h-[80%] overflow-auto overscroll-none mr-2 mt-4 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                    <thead className="bg-gray-100 text-xs uppercase">
                        <tr>
                            {
                                fields.map((heading, index) => (
                                    <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th> ))
                            }
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {
                           data.map((row, ridx) => (
                            <tr className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap`} key={ridx}>
                              {
                                  fields.map((key, kidx) => ( 

                                    <td
                                        key={kidx}
                                        className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap 
                                        ${ (hoveredCell?.row === row && hoveredCell?.key === key) ? 'bg-sky-100' : ''} 
                                        ${ (selectedCell && clickedCourseCodes && selectedCell.row === ridx && selectedCell.column === kidx) || (selectedCell2 && clickedCourseCodes && selectedCell2.row === ridx && selectedCell2.column === kidx) ? 'bg-orange-200 cursor-pointer' : (pointer2 && clickedCourseCodes && row[key] != "18IEE801" && row[key] != "18IEE708") ? 'cursor-pointer' : '' }                                        
                                        ${(row[key] != "18IEE801" && row[key] != "18IEE708" && !row[key].includes("/")) ? 'cursor-pointer' : ''}
                                        ${(getCourseCode.includes(row[key]) && row[key] != "18IEE801" && row[key] != "18IEE708" && !row[key].includes("/"))? 'bg-sky-100 cursor-pointer' : ''}
                                        `}
                                        // className={getTableCellClassNames(row, key)}
                                        onMouseEnter={(event) => handleCellHover(event, row, key)}
                                        onMouseLeave={handleCellLeave}
                                        onClick={(event) => handleTable(event, row, key, kidx, ridx)}
                                      >

                                        {typeof row[key] === 'string' ? row[key].charAt(0).toUpperCase() + row[key].slice(1) : row[key]}
                                        {
                                            hoveredRow === row && hoveredKey === key && hoverData !== "" && 
                                            <div className="absolute z-10 px-2 py-1 text-gray-500 bg-slate-200 border-b-gray-200 rounded-md text-center">
                                                {hoverData} <br/>
                                            </div>
                                        }
                                    </td>
                                    ))
                              }
                             </tr>))
                        }
                    </tbody>
                </table>
        </div> : <div>No Data Here...</div> ) 
        : 
        minData && (minData.length > 0 ?
            <div className="max-w-min max-h-[80%] overflow-auto overscroll-none mr-2 mt-4 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                    <thead className="bg-gray-100 text-xs uppercase">
                        <tr>
                            {
                                fields.map((heading, index) => (
                                    <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th> ))
                            }
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {
                           minData.map((row, ridx) => (
                            <tr className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap`} key={ridx}>
                              {
                                  fields.map((key, kidx) => ( 

                                    <td
                                        key={kidx}
                                        className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap 
                                        ${ (hoveredCell?.row === row && hoveredCell?.key === key) ? 'bg-sky-100' : ''} 
                                        ${ (selectedCell && clickedCourseCodes && selectedCell.row === ridx && selectedCell.column === kidx) || (selectedCell2 && clickedCourseCodes && selectedCell2.row === ridx && selectedCell2.column === kidx) ? 'bg-orange-200 cursor-pointer' : (pointer2 && clickedCourseCodes && row[key] != "18IEE801" && row[key] != "18IEE708") ? 'cursor-pointer' : '' }                                        
                                        ${(row[key] != "18IEE801" && row[key] != "18IEE708" && !row[key].includes("/")) ? 'cursor-pointer' : ''}
                                        ${(getCourseCode.includes(row[key]) && row[key] != "18IEE801" && row[key] != "18IEE708" && !row[key].includes("/"))? 'bg-sky-100 cursor-pointer' : ''}
                                        `}
                                        // className={getTableCellClassNames(row, key)}
                                        onMouseEnter={(event) => handleCellHover(event, row, key)}
                                        onMouseLeave={handleCellLeave}
                                        onClick={(event) => handleTable(event, row, key, kidx, ridx)}
                                      >

                                        {typeof row[key] === 'string' ? row[key].charAt(0).toUpperCase() + row[key].slice(1) : row[key]}
                                        {
                                            hoveredRow === row && hoveredKey === key && hoverData !== "" && 
                                            <div className="absolute z-10 px-2 py-1 text-gray-500 bg-slate-200 border-b-gray-200 rounded-md text-center">
                                                {hoverData} <br/>
                                            </div>
                                        }
                                    </td>
                                    ))
                              }
                             </tr>))
                        }
                    </tbody>
                </table>
        </div> : <div>No Data Here...</div> ) }
         <div className="w-4/5 flex justify gap-x- p-2">
             <Button color="blue" icon={tableView?"expand_less":"expand_more"} outline={true} event={ () => tableView?changeState(false):changeState(true)} name= {tableView?"Minimize Timetable":"View Full Timetable"} />
         </div> </>
         : <div className="text-slate-500 justify-center flex">Get Class Time Table by selecting the appropriate Batch and Branch </div>}

         </>:<Loading />
    )
}

export default Class