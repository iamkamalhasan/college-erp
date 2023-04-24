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

	const [ batch, setBatch ] = useState(context.metadata.filter(item => (item.sem==1||item.sem==2)).map(item => item.batch)[0])
  	const [ semester, setSemester ] = useState(context.metadata.filter(item => (item.sem==1||item.sem==2)).map(item => item.sem)[0])
  	const [ branch, setBranch ] = useState("--None--")
    const [ section, setSection ] = useState('--None--')
    const [ sections, setSections ] = useState(["--None--"])
	const [ tableData, setTableData ] = useState([])
    const [ tableFlag, setTableFlag ] = useState(false)
    const [ fields, setFields ] = useState([])

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

    // //Either this
	// useEffect(() => {
	// 	if(hallTicketFlag) {
            
	// 	}
	// }, [hallTicketFlag])

    // //or this
    // useEffect(() => {
	// 	if(hallTicketFlag) {
	// 		setTableData(details)
    //         setHallTicketFlag(false)
	// 	}
	// }, [hallTicketFlag])

    useEffect(() => {
        if(tableFlag) {
            axios.get('/hod/studentList',  { params: { branch:branch, batch:batch, section:section, semester:semester } } )
            .then(response => {
                console.log(response.data)
                setTableData(response.data)
                setFields(response.data.length > 0 ? Object.keys(response.data[0]).filter((key) => omitFields(key)) : []);
                setTableFlag(false)
            })
            .catch(err => console.log(err.message))
    
        }
    }, [tableFlag])

    const selectedBranch = (e) => {
        setBranch(e)
        setSection("--None--")
        if(e=="--None--") {
            setSections(["--None--"])
        } else {
            MetaData1.map(item => {
                if(item.branch == e)
                    setSections(item.section)
            })
        }
    }

    const selectedSection = (e) => {
        setSection(e)
    }

    const getHallTicket = () => {
        if(branch=="--None--") {
            alert('Select a Branch')
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

                <div className="w-1/4">
					<Dropdown name={"Branch"} data={["--None--", ...MetaData1.map(item => item.branch)]} update={selectedBranch} />
				</div>
				<div className="w-1/4">
			    	<h5>Batch</h5>
					<div className="text-slate-400 pt-1">{batch}</div>
				</div>
				<div className="w-1/4">
					<Dropdown name={"Section"} data={sections} update={selectedSection} />
				</div>
				<div className="w-1/4">
					<h5>Semester</h5>
					<div className="text-slate-400 pt-1">{semester}</div>
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
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap"><ViewPDF studentId={row['_id']} semester={semester} /></td>
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap"><GeneratePDF studentId={row['_id']} semester={semester} /></td>
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