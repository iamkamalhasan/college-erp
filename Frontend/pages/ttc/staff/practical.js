import { useEffect, useState, useContext } from "react"
import Button from "../../../utilities/Button"
import Dropdown from "../../../utilities/Dropdown"
import MultiSelect from "../../../utilities/MultiSelect"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"

const Practical = () => {

    // Get data from the api
    const { data: context } = useContext(AppContext)
    
    const [ sems, setSems ] = useState([])
    const [ sections, setSections ] = useState(['--None--'])
    const [ yearBatch, setYearBatch ] = useState("--None--")
    const [ section, setSection ] = useState("--None--")
    const [ fetchData, setFetchData ] = useState({})
    const [ getSemester, setSemester ] = useState('--None--')
    const [ getCourseCode, setCourseCode ] = useState(['--None--'])
    const [ getCourseName, setCourseName ] = useState('--None--')
    const [ getBatch, setBatch ] = useState(['--None--'])
    const [ addData, setAddData ] = useState([])
    const [ revert, setRevert ] = useState([])
    const [ courseCode, setSelectedCourseCode ] = useState("--None--")
    const [ studentList, setStudentList ] = useState([])
    const [ courseIncharge, setCourseIncharge ] = useState([])
    const [ group, setGroup ] = useState(['Select Batch'])
    const [ selectedStudentList, setSelectedStudentList ] = useState([])
    const [ selectedBatchNumber, setSelectedBatchNumber ] = useState("")
    const [ selectedCI, setSelectedCI ] = useState("")
    const [ flag, setFlag ] = useState(false)
    const [ listFlag, setListFlag ] = useState(false)
    const [ facultyData, setFacultyData ] = useState([])
    const [ multiStud, setMultiStud ] = useState([])
    const [ load, setLoad ] = useState(false)
    const [ elRem, setElRem ] = useState("")
    const [ ttcBranch, setTTCBranch ] = useState("--None--")


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

        axios.get('/ttc/groups', { params: { branch: TTCBranch, isFirstYear:isFirstYear, section:TTCSection } })
        .then(response => {
            let data = response.data
            console.log(data)
            setSems(data.sems)
            setFetchData(data.courses)
            setRevert(data.courses) // need to be tested
            setCourseIncharge(data.faculty.map(fac => fac.Name))
            setFacultyData(data.faculty)
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    },[])

    // EITHER OR

    // useEffect(() => {
    //     const cc = [...new Set(fetchData.map(course => course.courseCode))];
    //     setCourseCode(cc)

    //     setCourseIncharge(groupsData.faculty.map(fac => fac.Name))
    // }, [])

    // POST 
    useEffect(() => {
        if(flag) {
            // axios.post
            let dummy  = addData.map(item =>({...item}))
            let outdummy = fetchData.map(item => ({...item}))
            // console.log("in", outdummy)
            outdummy.map(course=> {
                dummy.map(newgrp => {
                    if(newgrp["Group Number"]==course.groupNo && course.courseCode == courseCode) {
                        course.student = newgrp["Student List"].split(", ")
                        course.facultyName = newgrp["Course Incharge"]
                        course.facultyId = facultyData.filter(item => item.Name == course.facultyName).map(item => item._id)[0]
                    }
                })
            })

            console.log("outdummy =", outdummy)

            axios.post('/ttc/groups', { branch: ttcBranch, courses: outdummy })
            .then(response => {
                console.log(response.data)
            })
            .catch(err => console.log(err.message))
            // console.log("out", outdummy)
            setFlag(false)
        }
    }, [flag])

    const selectedBatch = (val) => {
        setYearBatch(val)
        if(val=="--None--") {
            setSemester("--None--")
            setSections(["--None--"])
        } else {
            setSemester(sems.filter(item=>item.batch==val).map(item=>item.sem))
            setSections(["--None--", ...new Set(fetchData.map(item => item.section))])
        }
    }

    const selectedSection = (val) => {
        setSection(val)

        if(val=="--None--") {
            setCourseCode(["--None--"])
            setCourseName("--None--")
        } else {
            const cc = ["--None--", ...new Set(fetchData.filter(item=> (item.batch==yearBatch)&&(item.section==val)).map(course => course.courseCode))];
            setCourseCode(cc)
            setCourseName("--None--")
        }

    }


    // On Select Course Code
    const selectedCourseCode = (data) => {
        setSelectedCourseCode(data)

        if(data=="--None--") {
            setCourseName("--None--")
        } else {
            const cn = [...new Set(fetchData.map(course => {
                if(course.courseCode === data) return course.courseName
            }))]
    
            setCourseName(cn)    
        }
    }


    useEffect(() => {
        if(fetchData && courseCode&&courseCode!="--None--"){
            const groupNum = []
            const studentList = []
            const batch = []

            for (let i = 0; i < fetchData.length; i++) {
                const course = fetchData[i];
                let tempflag=false
                if(course.courseCode === courseCode) {
                    if(tempflag=false){
                        setBatch(course.batch)
                        setSemester(course.semester)
                        tempflag=true
                    }
                    const obj = {
                        "Group Number": course.groupNo,
                        "Student List": course.student.join(", "),
                        "Course Incharge": course.facultyName
                    };
                    course.student.map(stud => studentList.push(stud))
                    groupNum.push("Batch "+course.groupNo)
                    batch.push(obj);    
                }
            }
            
            setStudentList(studentList)
            setGroup([...groupNum])
            setAddData(batch)
            setRevert(batch)
        }
        
    }, [courseCode])

    useEffect(() => {
        let dummy = addData
        let dummyList = []
        let bno = selectedBatchNumber.split(" ")
        if(listFlag) { 
            dummy.map(item => {
                if(item["Group Number"] == bno[1]) {
                    dummyList = item["Student List"].split(", ")
                }
            })
            setMultiStud(dummyList)
            setListFlag(false)     
        }
    }, [listFlag, selectedBatchNumber])    

    const fields = addData && addData[0] ? Object.keys(addData[0]) : [];

    // To update a row
    const updateBatch = () => {
        let dummy = addData.map(item => ({...item}))
        let bno = selectedBatchNumber.split(" ")

        // let dummyList = []
        // dummy.map(item => {
        //     if(item["Group Number"] == bno[1]) {
        //         dummyList = item["Student List"].split(", ")
        //     }
        // })
        // console.log(selectedStudentList, dummyList)

        let dummyList = []
        let studRem = []
        dummy.map(item=> {
            dummyList = item["Student List"].split(", ")
            console.log("dl", dummyList)

            selectedStudentList.map(student => {
                for(let stud in dummyList) {
                    if(student == dummyList[stud]) {
                        dummyList.splice(stud, 1)
                        item["Student List"] = [...dummyList].join(', ')

                    }

                }
            })

        })

        console.log(selectedStudentList, dummyList)
        dummy.map(batch => {
            if (batch["Group Number"] == bno[1]) {
                batch["Student List"] = [...selectedStudentList].join(', '),
                batch["Course Incharge"] = selectedCI
            }
        })

        setAddData([...dummy])
    }

    
    const handleStudentLists = (data) => {
        // studentListsSelected = [...data];
        let transformedArray;
        transformedArray = data.map(function(innerArray) {
              return innerArray.value;
        });
        setSelectedStudentList([...transformedArray])
    }

    const batchNumber = (data) => {
        setSelectedBatchNumber(data)
        setListFlag(true)
    }

    const handleCourseIncharge = (data) => {
        setSelectedCI(data)
    }

    const addBatch = () => {
        // if(batchNumberSelected && transformedArray && courseInchargeSelected)
        //     setAddData([...addData, {"Group Number" : batchNumberSelected, "Student List" : transformedArray.join(", "), "Course Incharge" : courseInchargeSelected }])
        // else alert("Please add the required data")
        let grp = [...group]
        let dummy = addData.map(doc => ({...doc}))

        const obj = {
            "Group Number": group.length + 1,
            "Student List": "",
            "Course Incharge": ""
        };    
        dummy.push(obj)
        grp.push("Batch "+(group.length+1))
        setAddData([...dummy])
        setGroup([...grp])

    }

    const saveData = (d) => {
        console.log("Added Data ", addData)
        setRevert(addData)

        setFlag(true)
    }

    const cancelData = () => {        
        setAddData(revert)
        // setAddData([])
    }

    
    return (( load && getCourseCode.length > 0 && courseIncharge.length > 0 ) ?
        <>
        <div className="px-2 m-2">
            <div className="flex">
                <div className="w-1/4">
                    <h5 className="p-1">Department</h5>
                    <div className="text-slate-400 p-1">{ttcBranch}</div>
                </div>
                <div className="w-1/5">
                    <Dropdown name ={"Batch"} data = {["--None--", ...sems.map(item=>item.batch)]} update={(val) => selectedBatch(val)} />
                </div>
                <div className="w-1/5">
                    <Dropdown name ={"Section"} data = {sections} update={(val) => selectedSection(val)}/>
                </div>
                <div className="w-1/5">
                    <h5 className="p-1">Semester</h5>
                    <div className="text-slate-400 p-1">{getSemester}</div>
                </div>
                <div className="w-1/5 p-1">
                    <Dropdown name ={"Course Code"} data = {getCourseCode} update={selectedCourseCode} />
                </div>
                <div className="w-1/5 p-1">
                    <h5 className="p-1">Course Name</h5>
                    <div className="text-slate-400 p-1">{getCourseName}</div>
                </div>

            </div>

            <div className="flex pt-10 justify-around">
                <div className="w-1/4 pt-5 pl-3">
                    <Dropdown name ={"Batch No"} data = {group} special ={true} update={batchNumber} />
                </div>
                <div className="w-1/2">
                    <MultiSelect name = {'Student List'} data = {studentList} selectedData={handleStudentLists} values={multiStud} />
                </div>
                <div className="w-1/3 pt-5">
                    <Dropdown name ={"CI"} data = {courseIncharge} special ={true} update={handleCourseIncharge} />
                </div>
                <div className="w-1/4 pt-2">
                    <Button color={'blue'} name={"Update"} icon={'update'} outline={false} event={updateBatch}/>
                </div>
            </div>

            <div className="flex pt-10 items-center justify-center">
                {
                    !addData.length ? "No Data Available" :         
                    <div className="relative p-1.5 w-fit inline-block align-middle">
                        <div className=" overflow-hidden overflow-x-auto shadow-md sm:rounded-lg border">
                            <table className="min-w-full divide-y divide-gray-200 text-sm text-left sm:rounded-lg">
                                <thead className="rounded-t-lg bg-gray-100 text-xs uppercase">
                                    <tr>
                                        {
                                            fields.map((heading, index) => (
                                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase tracking-wider" key={index}>{heading}</th>
                                            ))
                                        }
                                        {/* <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase tracking-wider">Delete</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {
                                        addData.map((row, index) => ( 
                                        <tr className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap hover:bg-sky-50" key={index}>
                                            {
                                                fields.map((key, index) => ( key == "Group Number" ? 
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={index}>{row[key]}</td> : 
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={index}>{row[key]}</td> ))
                                            }
                                            {/* <td className="block mx-auto px-6 py-4 text-sm text-gray-800 whitespace-nowrap cursor-pointer"><Icon name={'delete'}  /></td> */}
                                        </tr>))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
            </div>

            <div className="flex pt-10 items-center justify-center">
                <Button color={'blue'} name={"Add Batch"} icon={'add'} outline={false} event={addBatch} />
            </div>

            <div className="flex justify-end flex-row m-10">
                <div className="mx-4 w-1/8">
                    <Button color={'blue'} name={"Cancel"} outline={true} event={cancelData} />
                </div>
                <div className="mx-4 w-1/6">
                    <Button color={'blue'} name={"Save"} outline={false} event={saveData} />
                </div>
            </div>
        </div>
        </> : <div>Loading...</div>
    ) 
}

export default Practical