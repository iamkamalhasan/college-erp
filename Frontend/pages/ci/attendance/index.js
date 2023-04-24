import Dropdown from "../../../utilities/Dropdown"
import Calendar from "../../../utilities/Calendar"
import Button from "../../../utilities/Button"
import { useEffect, useState, useContext } from "react"
import axios from "../../../axios.config"
import MultiSelect from "../../../utilities/MultiSelect"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Attendance = () => {

    const { data: context } = useContext(AppContext)

    const [ data, setData ] = useState([])
    const [ fields, setFields ] = useState([])
    const [ markAttdBtn, setMarkAttdBtn ] = useState(false)
    const [ reloadAttd, setReloadAttd ] = useState(false)
    const [ save,setSave ] = useState(false)
    const [ edit, setEdit ] = useState(0)
    const [ dropPeriod, setDropPeriod ] = useState(false)
    const [ calDate, setCalDate ] = useState("")
    const [ filterCourse, setFilterCourse ] = useState([])
    const [ period, setPeriod ] = useState([''])
    const [ flag, setFlag ] = useState(false)
    const [ freezeFlag, setFreezeFlag ] = useState(false)
    const [ freezeData, setFreezeData ] = useState(false)
    const [ load, setLoad ] = useState(false)

    const [ present, setPresent ] = useState([''])
    const [ backup, setBackup ] = useState([''])

    const [ postId, setPostId ] = useState([])
    const [ bkupPost, setbkupPost ] = useState([])
    const [freezed, setFreezed ] = useState(0)
    const [attdData, setAttdData ] = useState([])

    const [cc, setcc ] = useState('--None--')
    const [cn, setcn ] = useState('--None--')

    const [ branch, setBranch ] = useState('--None--')
    const [ batch, setBatch ] = useState('--None--')
    const [ section, setSection ] = useState('--None--')
    const [ semester, setSemester ] = useState('--None--')
    const [ courseCode, setCourseCode ] = useState('--None--')
    const [ courseName, setCourseName ] = useState('--None--')
    const [ studentList, setStudentList ] = useState([])
    const [ attdBtn, setAttdBtn ] = useState("")
    const [ attdCL, setAttdCL ] = useState([])

    // API GET
    useEffect(() => {
        console.log(context)
        axios.get('/ci/masterAttendance' , { params: {facultyId : context.user._id }})
        .then(response => {
            let data = response.data
            console.log(data)
            setLoad(true)
            setData(data)
        })
        .catch(err => console.log(err.message))

    },[])

    // API GET MARK ATTD
    useEffect(() => {

        if(markAttdBtn) {
        
            console.log(postId[0]._id)
            axios.get('/ci/attendance', { params: { _id: postId[0]._id, courseId: postId[0].courseId } } )
            .then(response => {
                let data = response.data
                console.log(data)
                setAttdData(data)

                let dummy = []
                data.map(student => {
                    if((student.present==true)&&(student.onduty==false))
                        dummy.push(0)
                    else if((student.present==false)&&(student.onduty==false))
                        dummy.push(1)
                    else if((student.present==false)&&(student.onduty==true))
                        dummy.push(2)
                    else
                        dummy.push(3)
                })

                setBackup(dummy)
                // console.log("bsha",dummy)
                setPresent(dummy)

                let stdList = []
                data.map(item => {
                    stdList.push(item.name)
                })
                setStudentList(stdList)

                const omit = ["_id", "masterTimetableId", "marked", "studentId", "present", "onduty", ]
                const omitFields = (field) => !omit.some((item) => item == field)

                setFields(data && data.length > 0
                ? Object.keys(data[0]).filter((key) => omitFields(key))
                : [])


            })
            .catch(err => console.log(err.message))
            setbkupPost(postId)
            setMarkAttdBtn(false)

            

        }
    },[markAttdBtn])

    //Reload on save button
    useEffect(() => {

        if(reloadAttd) {
        
            console.log(postId[0]._id)
            axios.get('/ci/attendance', { params: { _id: bkupPost[0]._id, courseId: bkupPost[0].courseId } } )
            .then(response => {
                let data = response.data
                setAttdData(data)

                let dummy = []
                data.map(student => {
                    if((student.present==true)&&(student.onduty==false))
                        dummy.push(0)
                    else if((student.present==false)&&(student.onduty==false))
                        dummy.push(1)
                    else if((student.present==false)&&(student.onduty==true))
                        dummy.push(2)
                    else
                        dummy.push(3)
                })

                setBackup(dummy)
                console.log("bsha",dummy)
                setPresent(dummy)
            })
            .catch(err => console.log(err.message))
            setReloadAttd(false)
            setSave(false)
        }
    },[reloadAttd])

    //API DROP PERIOD
    useEffect(() => {
        if(dropPeriod){
            console.log(postId[0]._id)
            axios.get('/ci/dropPeriod?_id=' + postId[0]._id)
            .then(response => {
                console.log(response.data)
            })
            setDropPeriod(false)
        }
    }, [dropPeriod])

    // API POST ATTD DATA
    useEffect(() => {
        if(flag) {
            axios.post('/ci/attendance', attdData)
            .then(response => {
                console.log(response.data)
                setReloadAttd(true)
            })
            .catch(err => console.log(err.message))
            setFlag(false)
        }
    }, [flag])

    //API Unfreeze Request
    useEffect(() => {
        if(freezeFlag) {
            axios.post('/ci/request/attendance/unfreeze', freezeData)
            .then(response => {
                console.log(response.data)
                
            })
            .catch(err => console.log(err.message))
            setFreezeFlag(false)
        }
    }, [freezeFlag])

    useEffect(() => {

        let temp = data.filter(item => item.date.slice(0, 10) == calDate)
        console.log(temp)

        setFilterCourse(temp)
        console.log("Into the function")
        setPeriod(['--None--',...temp.map(item=> item.period)])
        setcc("--None--")
        setcn("--None--")

    }, [calDate])

    // Selected Date
    const selectedDate = (date) => {
        let format4 = date.getFullYear() + "-" + (date.getMonth()+1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0")
        
        console.log(format4)
        setCalDate(format4)

    }

    const selectedPeriod = (d) => {

        if(d=="--None--"){
        
            setcc("--None--")
            setcn("--None--")
            setPostId([])
            setFreezed(0)
        
        }else{
        
            let filteredData = filterCourse.filter(item => item.period == d)
            setPostId(filteredData)
            let yesterday = new Date(new Date('2023-01-01').setDate(new Date('2023-01-01').getDate()-1))
            let cond_date = new Date(yesterday.toISOString().slice(0,10))
            console.log("cond ", cond_date)
            console.log("db ", filteredData[0].freeze)
            if(filteredData[0].hodFreeze || filteredData[0].reportFreeze) {
                setFreezed(3)
            } else if((new Date(filteredData[0].freeze)<=cond_date)){
                setFreezed(1)
            } else {
                setFreezed(2)
            }
            setcc(filteredData[0].courseCode)
            setcn(filteredData[0].courseName)

        }

    }

    const saveData = (d) => {
        setSave(true)
        let dummy = attdData.map(d => ({...d}))

        dummy.map((datum, idx) => {
            console.log(datum)
            if(present[idx] == 0){
                datum.present = true
                datum.onduty = false
            } else if (present[idx] == 1) {
                datum.present = false
                datum.onduty = false
            } else if (present[idx] == 2){
                datum.present = false
                datum.onduty = true
            } else {
                datum.present = true
                datum.onduty = true
            }
        })

        console.log(dummy)

        setAttdData(dummy)
        setFlag(true)
        //setReloadAttd(true)
    }

    const cancelData = () => {        
        setPresent(backup)
    }

    // Mark Attendance Handler
    const markAttendanceHandler = (val) => {
        if(postId.length==0){
            alert("No period is Selected")
        }else{
            setMarkAttdBtn(true)
            setBranch(postId[0].branch)
            setBatch(postId[0].batch)
            setSection(postId[0].section)
            setSemester(postId[0].semester)
            setCourseCode(postId[0].courseCode)
            setCourseName(postId[0].courseName)
            setEdit(val)
        }

    }

    const unfreezeHandler = () => {
        const dummy = {
            from: context.user._id,
            fromRef: "Faculty",
            type: "Period Unfreeze Request",
            body: { 
                _id: postId[0]._id,           // _id of period in MasterTimeTable
                branch:context.user.branch         // Branch 
            }     
        }
        setFreezeData(dummy)
        setFreezeFlag(true)
    }

    const dropPeriodHandler = () => {
        if(postId.length==0) {
            alert("No period is selected")
        }else{
            setDropPeriod(true)
        }
    }
    
    const [hoveredHeaderData, setHoveredHeaderData] = useState(null);

    const handleHeaderHover = (data) => {
      setHoveredHeaderData(data);
    };
  
    const handleHeaderLeave = () => {
      setHoveredHeaderData(null);
    };

    const selectedAttd = (e) => {
        setAttdBtn(e)
    }

    const selectedClassList = (e) => {
        console.log(e)
        setAttdCL(e)
    }

    const markAttdMultiHandler = () => {
        console.log(present)
        // console.log(attdData)
        // console.log(attdCL)

        let dummy = []

        const updatedPresent = present.map((value, index) => {
            const studentName = attdData[index].name;
            const isSelected = attdCL.some(selstd => selstd.value === studentName);

            if (isSelected) {
                console.log(attdBtn.toLocaleLowerCase())
                if(attdBtn.toLocaleLowerCase() == "present") return 0;
                else if(attdBtn.toLocaleLowerCase() == "absent") return 1;
                else return 2;
            }

            return value
        })

        console.log(updatedPresent)
        setPresent(updatedPresent)
    }

    return ( period && load ? 
        <>
            <div className="flex">
                <div className="w-9/12">

                    <div className="flex">
                        <div className="w-1/4">
                            <h5 className="p-1">Department</h5>
                            <div className="text-slate-400 p-1">{branch}</div>
                        </div>
                        <div className="w-1/4">
                            <h5 className="p-1">Batch</h5>
                            <div className="text-slate-400 p-1">{batch}</div>
                        </div>
                        <div className="w-1/4">
                            <h5 className="p-1">Section</h5>
                            <div className="text-slate-400 p-1">{section}</div>
                        </div>
                        <div className="w-1/4">
                            <h5 className="p-1" >Semester</h5>
                            <div className="text-slate-400 p-1">{semester}</div>
                        </div>
                        <div className="w-1/4">
                            <h5 className="p-1">Course Code</h5>
                            <div className="text-slate-400 p-1">{courseCode}</div>
                        </div>                
                        <div className="w-1/4">
                            <h5 className="p-1">Course Name</h5>
                            <div className="text-slate-400 p-1">{courseName}</div>
                        </div>                
                    </div>

                    <div className="relative py-10 mr-10 ml-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-b border-gray-300"></div>
                        </div>
                    </div>

                    
                    { (attdData.length > 0 && present.length > 0 && !reloadAttd)?
                        <> {
                                edit?
                                <div className="flex">
                                    <div className="w-1/4">
                                        <Dropdown name ={"Attendance"} data = {['Present', 'Absent', 'OnDuty']} special ={false} update={selectedAttd} />                
                                    </div>
                                    <div className="w-1/2">
                                        <MultiSelect name = {'Class List'} data = {studentList} selectedData={selectedClassList} />
                                    </div>
                                    <div className="w-1/4 mt-2">
                                        <Button color={'blue'} name={"Mark"} outline={true} event={markAttdMultiHandler} />
                                    </div>
                            </div>
                            : null
                            }
                            <div className="flex m-2">
                                <h4> Class List</h4>
                            </div>

                            <div className="flex justify-center mt-2">
                                <div className="max-w-min h-96 overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                                    <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                                        <thead className="bg-gray-100 text-xs uppercase">
                                            <tr>
                                                <th
                                                    className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase"
                                                    onMouseEnter={() => handleHeaderHover('Serial Number')}
                                                    onMouseLeave={handleHeaderLeave}
                                                >
                                                    SNo
                                                    {hoveredHeaderData && (
                                                    <div className="absolute z-10 px-2 py-1 text-gray-500 bg-gray-200 border-b-gray-200 rounded-md">
                                                        {hoveredHeaderData}
                                                    </div>
                                                    )}
                                                </th>
                                                {
                                                    fields.map((heading, index) => (
                                                        <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th>
                                                    ))
                                                }
                                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase">Present</th>
                                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase">Absent</th>
                                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase">On-Duty</th>                                    
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {
                                                attdData.map((row, index) => ( 
                                                <tr className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap" key={index}>
                                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" >{index+1}</td>
                                                    {
                                                        fields.map((key, index) => (
                                                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={index}>{row[key]}</td> ))
                                                    }
                                                    <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
                                                        <input id="default-radio-1" disabled={edit==false?true:(present[index]==3)?true:false} checked={present[index]==0?true:false} value={0} type="radio" onChange={(e) => { 
                                                            let temp = [...present]
                                                            console.log("dfv",e.target.value)
                                                            temp[index] = e.target.value; 
                                                            console.log(temp[index]); 
                                                            setPresent([...temp]) 
                                                            }} name={"present-radio"+index} className="block mx-auto w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
                                                        <input id="default-radio-1" disabled={edit==false?true:(present[index]==3)?true:false} type="radio" value={1} checked={present[index]==1?true:false} onChange={(e) => { 
                                                                let temp = [...present]
                                                                console.log("sf",e.target.value)
                                                                temp[index] = e.target.value; 
                                                                console.log(temp[index]); 
                                                                setPresent([...temp]) 
                                                            }} name={"present-radio"+index} className="block mx-auto w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
                                                        <div className={present[index] == 3 ? "rounded-full bg-green-400 flex justify-center" : "flex justify-center"}>
                                                            <input id="default-radio-1" disabled={!edit} type="radio" value={2} checked={present[index] == 2 || present[index] == 3 ? true: false} onChange={(e) => {
                                                                let temp = [...present]
                                                                console.log("sf",e.target.value)
                                                                if(temp[index]==3)
                                                                    temp[index] = 3
                                                                else
                                                                    temp[index] = e.target.value; 
                                                                console.log(temp[index]); 
                                                                setPresent([...temp]) 
                                                            }} name={"present-radio"+index} className="m-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                        </div>
                                                    </td>
                                                </tr>))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>: 
                        <div className="mx-auto text-center">No Data Available</div>
                    }
                    {edit&&!save?
                        <div className="flex justify-end flex-row m-10">
                            <div className="mx-4 w-1/8">
                                <Button color={'blue'} name={"Cancel"} outline={true} event={cancelData} />
                            </div>
                            <div className="mx-4 w-1/6">
                                <Button color={'blue'} name={"Save"} outline={save} event={saveData} />
                            </div>
                        </div>:""
                    }
                </div>
                <div className="w-3/12 border-l">
                    <div className="ml-6 flex flex-col">
                        <h4 className="pb-4">Calendar</h4>
                        <Calendar className="ml-2 flex-1" selectDate={selectedDate} />
                        <div className="flex-6/12 mt-4" >
                            <Dropdown name ={"Select Period"} data = {period} special ={false} update={selectedPeriod} />                
                        </div>
                        <div className="flex-6/12 mt-4" >
                            <h6 className="p-1 text-sm">Course Code</h6>
                            <div className="text-slate-400 p-1 text-sm">{cc}</div>
                        </div>
                        <div className="flex-6/12 mt-4" >
                            <h6 className="p-1 text-sm">Course Name</h6>
                            <div className="text-slate-400 p-1 text-sm">{cn}</div>
                        </div>
                        
                        { freezed==0 ? <div></div>
                            :<>
                                { freezed==3?
                                    <div className="pt-4">Attendance Submitted</div>
                                    :<div>
                                        {freezed==1?
                                            <>
                                                <div className="flex justify-center mt-2 px-6">
                                                    <Button color={'blue'} name={"Freeze Release request"} icon={'send'} outline={false} event={() => {unfreezeHandler()}} />
                                                </div>
                                                <div className="flex justify-center mt-2 px-6">
                                                    <Button color={'blue'} name={"View Attendance"} icon={'visibility'} outline={true} event={() => {markAttendanceHandler(false)}} />                                            
                                                </div>
                                            </> :
                                            <div className="flex justify-center mt-2 px-6">
                                                <Button color={'blue'} name={"Mark Attendance"} icon={'edit'} outline={false} event={() => {markAttendanceHandler(true)}} />
                                            </div>
                                        }
                                        <div className="flex justify-center mt-2 px-6">
                                            <Button color={'blue'} name={"Drop Period"} icon={'delete'} outline={false} event={dropPeriodHandler} />
                                        </div>
                                    </div>
                                }
                            </>
                        }
                        
                    </div>
                </div>
            </div>
        </> : <Loading /> 
    )
}

export default Attendance