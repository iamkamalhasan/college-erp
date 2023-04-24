import { useState, useEffect, useContext } from "react"
import axios from "../../../axios.config"
import Dropdown from "../../../utilities/Dropdown"
import Download from "../../../utilities/Download"
import Upload from "../../../utilities/Upload"
import Search from "../../../utilities/Search"
import Table from "../../../utilities/Table"
import Toast from "../../../utilities/Toast" 
import Loading from "../../../utilities/Loading"
import { AppContext } from "../../_app"

const ReportGeneration = () => {

    const { data: context } = useContext(AppContext)

    const { metadata, branches } = context

    let batchList = [...new Set(metadata.map(doc => doc.batch))].sort((a, b) => b - a), branchList = [ "ALL", ...new Set(branches.map(doc => doc.branch)) ]

    let omit = [ "_id","regulation", "batch"]
    const omitFields = (field) => !omit.some(item => item == field)
  
    const [ branch, setBranch ] = useState(branchList[0] ?? "ALL")
    const [ batch, setBatch ] = useState(batchList[0] ?? null)
    const [ filter, setFilter ] = useState(null)
    const [ fields, setFields ] = useState(null)
    const [ search, setSearch ] = useState("")
    const [ isloading, setIsloading] = useState(false)
    const [ data, setData ] = useState(null)
    const [ editedDoc, setEditedDoc ] = useState({})
    const [ showToast, setShowToast] = useState(false);
    const [ toastDetails, setToastDetails] = useState({ message: "", type: "", duration: "" });

    useEffect(() => {
        setData(null)
        let data = {
            batch:batch
        }
        setIsloading(true)
        if (!batch) {
            setToastDetails({ duration: 3000, message: "Please Choose Batch", type: "info" });
            setShowToast(true);
        } else {
            axios
            .get('/admin/enrolment/query', { params: data })
            .then((response) => {
                if(response){
                    if(response.data.results.length == 0){
                        console.log("Empty array")
                        if (batch) {
                            setToastDetails({ duration: 30000, message: `Data not exist for batch - ${batch}`, type: "warning" });
                            setShowToast(true);
                        }
                        setIsloading(false);
                }
                let data = response.data.results, fields = [];
                console.log(data);
                fields = Object.keys(data[0]).filter((key) => omitFields(key));

                setFilter(fields[0]);
                setFields(fields);
                setData(data);
                setIsloading(false)
                setToastDetails({ duration: 5000, message: `Details fetched for batch - ${batch}`, type: "success" });
                setShowToast(true);
            }
            })
            .catch((err) => {
                console.log(err);
                setToastDetails({ duration: 10000, message: `Something wrong happened - Please try again`, type: "error" });
                setShowToast(true);
                setIsloading(false);
                setBatch(null);
            });
        }
    }, [batch, editedDoc])
  
    useEffect(() => {
    // updates only 
    // 1. enrolled flag - true or false, 
    // 2. approval(-4,-3,-2,-1,0,1,2,3,4 && -14,-13,-12,-11,10,11,12,13,14), 
    // 3. courseCategory - FOR OE courses - specify as OE-2,OE-1, etc.. same for PE also
    // 4. semester - semester to be printed in courseCertificate
    // 5. type - specifies enrollment type as - normal, dropped, RA, SA, internship, acitivityPoints

        if(JSON.stringify(editedDoc) != "{}")
            for(let idx in data)
                if(data[idx]._id == editedDoc._id) {
                    axios.put('/admin/enrolment/query/update', editedDoc)
                        .then(response => {
                        if(response && response.data.success){
                            setToastDetails({ duration: 3000, message: `Details updated`, type: "success" });
                            setShowToast(true);
                            data[idx] = {...editedDoc}
                            setData([...data])
                        }else{
                            setToastDetails({ duration: 10000, message: `Something wrong happened - Please try again`, type: "error" });
                            setShowToast(true);
                        }
                        })
                        .catch((err) => {
                        console.log(err);
                        setToastDetails({ duration: 10000, message: `Something wrong happened - Please try again`, type: "error" });
                        setShowToast(true);
                    });
                }
    }, [ editedDoc ])
    
    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase())
    
    const filterCheck = (doc) => (branch == "ALL" ? true : doc.branch == branch) && filterSearch(doc)
  
    return (
    branchList && batchList && <>
        <div className="mr-2 flex justify-between">
            <div className="flex space-x-6">
                <Dropdown name="Batch" update={setBatch} data={batchList} />
                {data?
                    <Dropdown name="Branch" update={setBranch} data={branchList} />
                    :<></>
                }
            </div>
            {
                data?
                <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/>
                :<>
                </>
            }
            <div className="flex mt-2 space-x-2">
                <div onClick={()=>{setToastDetails({ duration: 10000, message: `Upload Might take time (upto 10mins)`, type: "info" })
                    setShowToast(true)}}>
                <Upload path='/admin/enrolment/query/upload' template={{register:"Register Number of the student", courseCode:"CourseCode for course", semester:"Semester at which the course is last modified"}}/>
                </div>
                {data ? 
                
                <Download data={data.filter(doc => filterCheck(doc))} name={"enrolmentData_downlad_"+"batch-"+batch} />
            
                : <></>}
                
            </div>
        </div><br/>
        
        {
            data ?
                <>
                    <Table editable data={data.filter(doc => filterCheck(doc))} update={setEditedDoc} omit={omit} indexed/><br/> 
                </>
            : batch 
                ? isloading ? <Loading /> : <>No Data Exists</>:
                <>
                    Please choose batch
                </>
        }
        {showToast && <Toast duration={toastDetails.duration} message={toastDetails.message} type={toastDetails.type} />}
    
    </>  
        
        
    )
}
export default ReportGeneration