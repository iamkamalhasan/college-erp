import Button from "../../../utilities/Button"
import { useEffect, useState, useContext } from "react"
import axios from "../../../axios.config"
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Master = () => {
    
    const { data: context } = useContext(AppContext)
    
    const [ tableData,setTableData ] = useState([])
    const [ tableView, setTableView ] = useState(false)
    const [ load, setLoad ] = useState(false)

    useEffect(() => {
        axios.get('/student/masterTimetable', { params: { studentId:context.user._id, semester:context.user.currentSemester} } )
        .then(response => {
            let data = response.data
            console.log(data)
            setTableData(data)
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    },[])

    let fields
    
    let data=[]
    let min_data =[]
    
    if (tableData!=null){
        let dummy = [...new Set(tableData.map(item => item.date))]
        dummy.sort()
        let tempdata = []
        for(let i of dummy) { 
            let tempDummy = {}
            tempDummy["Date"] = i.slice(0,10)
            tempDummy["Period_1"]= [" ", " ", " "]
            tempDummy["Period_2"]= [" ", " ", " "]
            tempDummy["Period_3"]= [" ", " ", " "]
            tempDummy["Period_4"]= [" ", " ", " "]
            tempDummy["Period_5"]= [" ", " ", " "]
            tempDummy["Period_6"]= [" ", " ", " "]
            tempDummy["Period_7"]= [" ", " ", " "]
            tempDummy["Period_8"]= [" ", " ", " "]
            tempdata.push({...tempDummy})
        }

        for(let i of tableData){
            for(let j of tempdata){
                if(j["Date"]==i["date"].slice(0,10)){
                    j["Period_"+i["period"]][0] = i["courseCode"]
                    j["Period_"+i["period"]][1] = i["present"]
                    j["Period_"+i["period"]][2] = i["marked"]                                        
                }
            }
        }
        data = tempdata

        for(let i=0;i<5&&i<tempdata.length;i++){
            min_data.push({...data[i]})
        }
    
        fields = data && data[0] ? Object.keys(data[0]) : [];

        console.log(data)

    }
    
   const changeState = (status) => {
    setTableView(status)
   }


    return(
        load?
        <>
            <div className="max-w-min max-h-[80%] overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                    <thead className="bg-gray-100 text-xs uppercase">
                        <tr>
                            { <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">sno</th> }
                            {
                                fields.map((heading, index) => (
                                    <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th> ))
                            }
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200"> 
                    { tableView ?
                        data.map((row, index) => ( 
                        <tr className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap hover:bg-sky-50" key={index}>
                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" >{index+1}</td>
                            {
                                fields.map((key, index) => ( key == "Date" ?
                                <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap" key={index}>{row[key]}</td>
                                :row[key][1] != true ? row[key][1] == false && row[key][2] == 1?                                     
                                <td className="px-6 py-4 text-sm text-red-400 whitespace-nowrap" key={index}>{row[key][0]}</td> : 
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={index}>{row[key][0]}</td> : 
                                <td className="px-6 py-4 text-sm text-green-600 whitespace-nowrap" key={index}>{row[key][0]}</td> ))
                            }
                        </tr>)) : 
                        min_data.map((row, index) => ( 
                            <tr className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap hover:bg-sky-50" key={index}>
                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" >{index+1}</td>
                                {
                                    fields.map((key, index) => ( key == "Date" ?
                                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap" key={index}>{row[key]}</td>
                                    :row[key][1] != true ? row[key][1] == false && row[key][2] == 1?                                     
                                    <td className="px-6 py-4 text-sm text-red-400 whitespace-nowrap" key={index}>{row[key][0]}</td> : 
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={index}>{row[key][0]}</td> : 
                                    <td className="px-6 py-4 text-sm text-green-600 whitespace-nowrap" key={index}>{row[key][0]}</td> ))
                                }
                            </tr>))
                    } 
                    </tbody>
                </table>
            </div>
        <div className="w-4/5 flex justify gap-x- p-2">
            <Button color="blue" icon={tableView?"expand_less":"expand_more"} outline={true} event={ () => tableView?changeState(false):changeState(true)} name= {tableView?"Minimize Timetable":"View Full Timetable"} />
        </div>
        </> : 
        <Loading />
    )
}

export default Master