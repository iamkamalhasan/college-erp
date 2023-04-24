import GeneratePDF from '../../../utilities/GeneratePDF'
import ViewPDF from '../../../utilities/ViewPDF'
import Button from "../../../utilities/Button";
import Dropdown from "../../../utilities/Dropdown";
import { useEffect, useState, useContext } from "react"
import axios from '../../../axios.config';
import { AppContext } from "../../_app"

const Hallticket = () => {
    
    const { data: context } = useContext(AppContext)

    const omit= ["_id"]

	const [ batch, setBatch ] = useState("--None--")
    const [ section, setSection ] = useState("--NOne--")
  	const [ semester, setSemester ] = useState("--None--")
  	const [ branch, setBranch ] = useState("IT")
	const [ tableData, setTableData ] = useState([])
    const [ tableFlag, setTableFlag ] = useState(false)
    const [ fields, setFields ] = useState([])

	const MetaData = context.metadata.map(item => ({batch:item.batch, sem:item.sem}))

    // //or this
    // useEffect(() => {
	// 	if(hallTicketFlag) {
	// 		setTableData(details)
    //         setHallTicketFlag(false)
	// 	}
	// }, [hallTicketFlag])

    useEffect(() => {
        if(tableFlag) {
            axios.get('/hod/studentList',  { params: { branch:branch, section:section, batch:batch, semester:semester } } )
            .then(response => {
                console.log(response.data)
                setTableData(response.data)
                setFields(response.data.length > 0 ? Object.keys(response.data[0]).filter((key) => omitFields(key)) : []);
                setTableFlag(false)
            })
            .catch(err => console.log(err.message))
    
        }
    }, [tableFlag])

	const selectedBatch = (e) => {
        setBatch(e);
        if(e=="--None--"){
            setSemester("--None--")
        } else {
            MetaData.map(items => {
                if(items.batch === e)
                    setSemester(items.sem)
            })
        }
    };

    const selectedSection = (e) => {
        setSection(e)
    }

    const getHallTicket = () => {
        if(batch=="--None--") {
            alert('Select a Batch')
        } else if(section=="--None--") {
            alert('Select a Section')
        } else {
            setTableFlag(true)
        }
    }

    const omitFields = (field) => !omit.some((item) => item == field);

    return (
		<>
			<div className="flex w-4/5 pb-4">

				<div className="w-1/3">
					<h5>Branch</h5>
					<div className="text-slate-400 pt-1">{branch}</div>
				</div>
				<div className="w-1/4">
					<Dropdown name={"Batch"} data={["--None--", ...MetaData.map(item => item.batch)]} update={selectedBatch} />
				</div>
				<div className="w-1/4">
					<Dropdown name={"Section"} data={["--None--", "A"]} update={selectedSection} />
				</div>
				<div className="w-1/3">
					<h5>Semester</h5>
					<div className="text-slate-400 pt-2">{semester}</div>
				</div>
				<div className="w-1/4">
					<Button color={'blue'} name={"Get HallTicket"} outline={true} event={getHallTicket} />
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
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap"><GeneratePDF studentId={row['_id']} semester={semester} disabled={!row['HallTicket Release']} /></td>
                            </tr>))
                        }
                        </tbody>
                    </table>
                </div>
                : "No Data"
            }
		</>
      )
}


export default Hallticket