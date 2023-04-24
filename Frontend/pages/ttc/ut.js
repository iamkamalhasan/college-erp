import { useEffect, useState, useContext } from "react"
import axios from "../../axios.config"

import Dropdown from "../../utilities/Dropdown"
import Button from "../../utilities/Button"
import Input from "../../utilities/Input"
import { AppContext } from "../_app"
import Loading from "../../utilities/Loading"

const UT = () => {

    // Get data from the api
    const { data: context } = useContext(AppContext)
    
    const omit = ["courseId", "session", "date"]

    const [ data, setData ] = useState(null);
    const [ fields, setFields ] = useState(null)
    const [ semester, setSemester ] = useState(null)
    const [ batch, setBatch ] = useState("ALL")
    const [ section, setSection ] = useState("ALL")
    const [ ut, setUt ] = useState("ALL")
    const [ save, setSave ] = useState(false)
    const [ courses, setCourses ] = useState(null)

    useEffect(() => {
        if(save) {
            console.log(data)
            axios.post('/ttc/ut',  data )
                .then(res => {
                    console.log(res.data)
                    setSave(false)
                })
                .catch(err => console.log(err.message))
        }
    }, [ save ])

    useEffect(() => {
        console.log(data)
        if (data!=null){
            console.log(batch)
            setCourses(data.filter(doc => (batch=='ALL' ? true : doc.batch == batch) && (ut == 'ALL' ? true: doc.number == ut)))
        }
            
    }, [ batch ])

    useEffect(() => {
        if (data!=null){
            console.log(ut)
            setCourses(data.filter(doc => (batch=='ALL' ? true : doc.batch == batch) && (ut == 'ALL' ? true: doc.number == ut)))
        }
            
    }, [ ut ])


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
        

        axios.get('/ttc/ut', { params: { branch: TTCBranch, isFirstYear:isFirstYear, section:TTCSection } })
            .then(res => {
                let courses = res.data.courses
                console.log(courses)
                
                const omitFields = (field) => !omit.some(item => item == field)

                setFields(courses && courses.length > 0 ? Object.keys(courses[0]).filter(key => omitFields(key)) : [])

                courses.map((course, idx) =>{
                    if(course.date)
                        course.date = course.date.slice(0, 10)
                    return course;
                })
                setData(courses)
                setCourses(courses.filter(doc => (batch=='ALL' ? true : doc.batch == batch) && (ut == 'ALL' ? true : doc.number == ut )))
                setSemester(res.data.sems)
                
            })
            .catch(err => console.log(err.message))

    }, [])
    
    
    return (
        (courses && semester) ? 
        <>
            <div className="mr-2 flex space-x-4">
                {batch=="ALL"?
                    <Dropdown name="Batch" update={setBatch} data={ [ batch, ...semester.filter(doc=>doc.batch!=batch).map(doc => doc.batch) ]}/>:
                    <Dropdown name="Batch" update={setBatch} data={ [ batch, "ALL", ...semester.filter(doc=>doc.batch!=batch).map(doc => doc.batch) ]}/>
                }
                {section=="ALL"?
                    <Dropdown name="Section" update={setSection} data={ [ section, ...new Set([...data.filter(doc=>doc.section!=section).map(doc => doc.section)]) ]}/>:
                    <Dropdown name="Section" update={setSection} data={ [ section, "ALL", ...new Set([...data.filter(doc=>doc.section!=section).map(doc => doc.section)]) ]}/>
                }
                {ut=="ALL"?
                    <Dropdown name="UT Number" update={setUt} data={ [ ut, ...new Set([...data.filter(doc=> doc.number!=ut).map(doc => doc.number)])] }/>:
                    <Dropdown name="UT Number" update={setUt} data={ [ ut, "ALL", ...new Set([...data.filter(doc=>doc.number!=ut).map(doc => doc.number)])] }/>
                }
            </div><br/><div></div>
            <div className="max-w-min max-h-[75%] overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                    <thead className="bg-gray-100 text-xs uppercase">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">SNO</th> 
                            {
                                fields.map((heading, index) => (
                                    <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th> ))
                            }
                            <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">Date</th> 
                            <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">Session</th> 
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {
                           courses.map((row, ridx) => (
                            <tr className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap group hover:bg-sky-50`} key={ridx}>
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{ ridx + 1 }</td>
                              {
                                  fields.map((key, kidx) => ( 
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={kidx}>{ typeof(row[key]) == typeof("") ? row[key].charAt(0).toUpperCase() + row[key].slice(1) : row[key] }</td>
                                  ))
                              }
                               <td>
                                    <Input name="" type={"date"} 
                                        update = {(val) => {
                                            courses[ridx].date = val;
                                            setCourses([...courses])
                                        }} 
                                        value={courses[ridx].date!=null?courses[ridx].date.slice(0,10):""} 
                                    />
                                </td>
                                <td>
                                    <Dropdown 
                                        update = {(val) => 
                                            {
                                                let temp = data.map(item => ({...item}))
                                                for(let value of temp) {
                                                    if(value.number==row.number&&value.courseCode == row.courseCode){
                                                        console.log("updating..")
                                                        value.session = val
                                                    }
                                                    setData(temp)
                                                }    
                                                setCourses(temp.filter(doc => (batch=='ALL' ? true : doc.batch == batch) && (ut == 'ALL' ? true : doc.number == ut ) && (section == 'ALL' ? true : doc.section == section )))
                                            }
                                        }
                                        data = { courses[ridx].session =="AN" ?["AN", "FN"]:["FN", "AN"] }
                                    />
                                </td>
                             </tr>))
                        }
                    </tbody>
                </table>
        </div>
        <br></br>
        <Button name="Save" color="blue" icon="check" event={() => setSave(true)}/>
        </> : <Loading />
    )

}

export default UT