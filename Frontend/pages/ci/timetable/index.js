import { useEffect, useState, useContext } from 'react'
import Table from "../../../utilities/Table";
import Button from "../../../utilities/Button";
import axios from "../../../axios.config";
import { AppContext } from "../../_app"
import Loading from "../../../utilities/Loading"

const Timetable = () => {

    const { data: context } = useContext(AppContext)

    const [ tableData, setTableData ]=useState(null)
    const [ tableView, setTableView ] = useState(false)
    const [ load, setLoad ] = useState(false)
    let data=[]
    let temp={}
    let min_data =[]
    
    useEffect(()=>{
        axios.get('/ci/staffTimetable' , { params: { facultyId: context.user._id } } )
        .then(res=>{
            let a = res.data
            setTableData(a)
            setLoad(true)
        })
    }, [])
    console.log("Table : ",tableData)

    if (tableData!=null){

       let j
        for(let i=0;i<tableData.length;i++){
            j = tableData[i].date
            temp["Date"] = j.slice(0,10)
            temp["Period_1"]= " "
            temp["Period_2"]= " "
            temp["Period_3"]= " "
            temp["Period_4"]= " "
            temp["Period_5"]= " "
            temp["Period_6"]= " "
            temp["Period_7"]= " "
            temp["Period_8"]= " "
            while(tableData[i].date === j){
                temp["Period_" + tableData[i].period]= tableData[i].courseCode
                i++
                if(i==tableData.length)
                    break
            }
            data.push({...temp})
            i--
        }

        for(let i=0;i<5&&i<data.length;i++){
            min_data.push({...data[i]})
        }

    }
    
   const changeState = (status) => {
    setTableView(status)
   }


    return(load?
        <>
            <Table data={tableView ? data : min_data}/>
            <div class="w-4/5 flex justify gap-x- p-2">
                <Button color="blue" icon={tableView?"expand_less":"expand_more"} outline event={ () => tableView?changeState(false):changeState(true)} name= {tableView?"Minimize Timetable":"View Full Timetable"} />
            </div>
        </>:<Loading />

    )
}

export default Timetable