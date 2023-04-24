import { useEffect, useState, useContext } from "react";
import axios from "../../../axios.config";
import Table from "../../../utilities/Table";
import ViewPDF from "../../../utilities/ViewPDF";
import GeneratePDF from "../../../utilities/GeneratePDF";
import Loading from "../../../utilities/Loading";
import { AppContext } from "../../_app"

const Hallticket = () => {

    
    const { data: context } = useContext(AppContext)
    
    const initial = {
        register: "--None--",
        name: "--None--",
        branch: "--None--",
        batch: "--None--",
        semester: "--None--",
        section: "--None--"
    }
    
    const [ tableData, setTableData ] = useState([]);
    const [ headData, setHeadData ] = useState(initial);
    const [ studentId, setStudentId ] = useState(context.user._id)
    const [ semester, setSemester ] = useState(context.user.currentSemester)
    const [ load, setLoad ] = useState(false)

    useEffect(() => {
        axios.get('/student/enrolledCourseData', { params: { studentId, semester } })
        .then(response => {
            console.log(response.data)
            setTableData(response.data.courses)
            delete response.data.courses
            setHeadData(response.data)
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    }, [])
  
    return ( load ?
    <>
        <div className="flex pb-4">
            <div className="w-2/4">
                <h5 className="p-1">Register No</h5>
                <div className="text-slate-400 p-1">{headData.register}</div>
            </div>
            <div className="w-2/4">
                <h5 className="p-1">Name</h5>
                <div className="text-slate-400 p-1">{headData.name}</div>
            </div>
            <div className="w-2/4">
                <h5 className="p-1">Branch</h5>
                <div className="text-slate-400 p-1">{headData.branch}</div>
            </div>
            <div className="w-2/4">
                <h5 className="p-1">Batch</h5>
                <div className="text-slate-400 p-1">{headData.batch}</div>
            </div>
            <div className="w-2/4">
                <h5 className="p-1">Section</h5>
                <div className="text-slate-400 p-1">{headData.section}</div>
            </div>
            <div className="w-2/4">
                <h5 className="p-1">Semester</h5>
                <div className="text-slate-400 p-1">{headData.semester}</div>
            </div>
            <div className="w-2/4">
                <ViewPDF studentId={studentId} semester={semester}/>
            </div>
            <div className="w-2/4">
                <GeneratePDF studentId={studentId} semester={semester}/>
            </div>
        </div>
        {tableData.length > 0 ?
            <Table data={tableData} indexed />
            :"No Data"
        }

    </>
    :<Loading />
  );
};

export default Hallticket;
