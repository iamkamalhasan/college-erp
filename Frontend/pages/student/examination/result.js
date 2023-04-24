import { useEffect, useState } from "react"
import axios from "../../../axios.config"

import Download from "../../../utilities/Download"
import Dropdown from "../../../utilities/Dropdown"
import Search from "../../../utilities/Search"
import Table from "../../../utilities/Table"
import Loading from "../../../utilities/Loading"

  
const Result = () => {
   
    let omit = [ "_id" , "studentId", "courseId", "regulation", "batch", "branch", "Name", "RegisterNumber", "studentType"]
    const omitFields = (field) => !omit.some(item => item == field)

    const [ filter, setFilter ] = useState(null)
    const [ fields, setFields ] = useState(null)
    const [ search, setSearch ] = useState("")
    const [ data, setData ] = useState(null)
    const [ semester, setSemester ] = useState("ALL")

    useEffect(() => {
        axios
          .get('/student/result')
          .then((response) => {
            let data = response.data.results,
              fields = [];
            fields = Object.keys(data[0]).filter((key) => omitFields(key));
            setFilter(fields[0]);
            setFields(fields);
            setData(data);
            console.log(data)
          })
          .catch((err) => console.log(err.message));

    }, [])
    
    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase())

    const filterCheck = (doc) => (semester == "ALL" ? true : doc.semester == semester) && filterSearch(doc)

    return ( data ? <>
        <div className="mr-2 flex justify-between">
            <div className="flex space-x-6">
                <Dropdown name="semester" update={setSemester} data={[ "ALL", 1,2,3,4,5,6,7,8]} />
            </div>
            <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/>
            <div title="download as excel">
              <Download data={data.filter(doc => filterCheck(doc))} name={"result_semester_"+semester}/>
            </div>
        </div><br/>
        <Table data={data.filter(doc => filterCheck(doc))} omit={omit} indexed/><br/>
        
        </> : <Loading />
    )
}

export default Result
