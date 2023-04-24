import GeneratePDF from '../../../utilities/GeneratePDF'
import ViewPDF from '../../../utilities/ViewPDF'
import { useEffect, useState, useContext } from "react"
import axios from '../../../axios.config';
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading";

const Hallticket = () => {
    
    const { data: context } = useContext(AppContext)

    const omit= ["_id"]

	const [ batch, setBatch ] = useState()
    const [ section, setSection ] = useState("")
  	const [ semester, setSemester ] = useState()
  	const [ branch, setBranch ] = useState("")
	const [ tableData, setTableData ] = useState([])
    const [ fields, setFields ] = useState([])
    const [ load, setLoad ] = useState(false)

    useEffect(() => {
        for(let i of context.metadata) {
            for(let j of i.facultyAdvisor) {
                if(j.faculty==context.user._id) {
                    setBatch(i.batch)
                    setBranch(j.branch)
                    setSemester(i.sem)
                    setSection(j.section)
                }
            }
        }
    }, [])

    useEffect(() => {
        axios.get('/hod/studentList',  { params: { branch:branch, batch:batch, section:section, semester:semester } } )
        .then(response => {
            setTableData(response.data)
            setFields(response.data.length > 0 ? Object.keys(response.data[0]).filter((key) => omitFields(key)) : []);
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    }, [])

    const omitFields = (field) => !omit.some((item) => item == field);

    return ( load ?
		<>
			<div className="flex w-3/4 pb-4">

				<div className="w-1/3">
					<h5>Branch</h5>
					<div className="text-slate-400 pt-1">{branch}</div>
				</div>
				<div className="w-1/3">
                    <h5>Batch</h5>
					<div className="text-slate-400 pt-1">{batch}</div>
				</div>
				<div className="w-1/3">
                    <h5>Section</h5>
					<div className="text-slate-400 pt-1">{section}</div>
				</div>
				<div className="w-1/3">
                    <h5>Semester</h5>
                    <div className="text-slate-400 pt-1">{semester}</div>
				</div>
                
			</div>

            {tableData.length > 0 ?
                <div className="max-w-min max-h-[80%] overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                    <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                        <thead className="bg-gray-100 text-xs uppercase">
                            <tr>
                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">sno</th>
                                {
                                    fields.map((heading, index) => 
                                        <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th>)
                                }
                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">View HallTicket</th>
                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">Download HallTicket</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {
                            tableData.map((row, ridx) => (
                            <tr className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap group hover:bg-sky-50`} key={ridx}>
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{ridx + 1}</td>
                                {
                                    fields.map((key, kidx) =>
                                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={kidx}>
                                            { row[key] }
                                        </td>)
                                }
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap"><ViewPDF studentId={row['_id']} semester={semester} disabled={!row['HallTicket Release']} /></td>
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap"><GeneratePDF studentId={row['_id']} semester={semester} disabled={!row['HallTicket Release']}/></td>
                            </tr>))
                        }
                        </tbody>
                    </table>
                </div>
                : "No Data"
            }
		</>
        :<Loading />

    )
}


export default Hallticket