import { useEffect, useState, useContext } from "react"
import axios from "../../../axios.config"

import Dropdown from "../../../utilities/Dropdown"
import Table from "../../../utilities/Table"
import Button from "../../../utilities/Button"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Theory = () => {
    
    const omit = [ "_id", "semester", "courseId", "facultyId", "courseCategory", "facultyName" ]

    const { data: context } = useContext(AppContext)
    const [ sems, setSems ] = useState([])
    const [ semester, setSemester ] = useState("-----")
    const [ batch, setBatch ] = useState("ALL")
    const [ section, setSection ] = useState("ALL")
    const [ courses, setCourses ] = useState([])
    const [ save, setSave ] = useState(false)
    const [ load, setLoad ] = useState(false)
    const [ ttcBranch, setTTCBranch ] = useState("--None--")

    useEffect(() => {

        if(save) {
            console.log(courses)
            axios.post('/ttc/staff', { courses })
                .then(res => {
                    console.log(res.data)
                    setSave(false)
                })
                .catch(err => console.log(err.message))
        }

    }, [ save ])

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

        axios.get('/ttc/staff', { params: { branch: TTCBranch, isFirstYear: isFirstYear, section: TTCSection } })
        .then(res => {
            let courses = res.data.courses
            console.log(res, courses)
            courses.map((course, idx) => {
                course["faculty"] = <Dropdown 
                    update={(val) => { 
                        let newFacultyId = res.data.faculty.filter(doc => doc.Name == val)[0]._id
                        courses[idx].facultyName = val; 
                        courses[idx].facultyId = newFacultyId;
                        setCourses([...courses])
                    }}
                    data={[ 
                        course.facultyName, 
                        ...res.data.faculty.map(doc => doc.Name).filter(doc => doc != course.facultyName) 
                    ]} searchable/>
                return course
            })
            setCourses(courses)
            setSems(res.data.sems)
            setLoad(true)
        })
        .catch(err => console.log(err.message))

    }, [])

    const selectedBatch = (val) => {
        setBatch(val)
        setSemester(sems.filter(item => item.batch == val).map(item => item.sem))
    }

    return (
        load ? <>
            <div className="mr-2 flex justify-between">
                <div className="w-1/2">
                    <h5 className="p-1">Department</h5>
                    <div className="text-slate-400 p-1">{ttcBranch}</div>
                </div>
                <div className="w-1/2">
                    <Dropdown name="Batch" update={(val) => selectedBatch(val)} data={[ "ALL", ...sems.map(doc => doc.batch) ]}/>
                </div>
                <div className="w-1/2">
                    <Dropdown name="Section" update={setSection} data={[ "ALL", ...new Set(courses.map(doc => doc.section)) ]}/>
                </div>
                <div className="w-1/2">
                    <h5>Semester</h5>
                    <div className="text-slate-400 pt-2">{semester}</div>
                </div>
                    
            </div>
            <br/>
            <Table data={courses.filter(doc => (batch == "ALL" ? true : doc.batch == batch)&&(section == "ALL" ? true : doc.section == section))} omit={omit} indexed/><br/>
            <Button name="Save" color="blue" icon="check" event={() => setSave(true)}/>
        </> : <Loading />
    )
}

export default Theory