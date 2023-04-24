import Button from "../../utilities/Button"
import Input from "../../utilities/Input"
import { useEffect, useState, useContext } from "react"
import axios from "../../axios.config"
import { AppContext } from "../_app"
import Loading from "../../utilities/Loading"

const Attendance = () => {

    const { data: context } = useContext(AppContext)
    
    const [ register, setRegister ] = useState(context.user.register)
    const [ name, setName ] = useState(context.user.firstName + " " + context.user.lastName)
    const [ branch, setBranch ] = useState(context.user.branch)
    const [ batch, setBatch ] = useState(context.user.batch)
    const [ section, setSection ] = useState(context.user.section)
    const [ semester, setSemester ] = useState(context.user.currentSemester)
    const [ tableData, setTableData ]  = useState([])
    const [ submitFlag, setSubmitFlag ] = useState(false)
    const [ enrollmentId, setEnrollmentId ] = useState("")
    const [ fields, setFields ] = useState([])
    const [ masterFlag, setMasterFlag ] = useState(false)
    const [ load, setLoad ] = useState(false)
    const [ feesflag, setFeesFlag ] = useState(false)
    const [ paymentId, setPaymentId ] = useState("")
    const [ payFlag, setPayFlag ] = useState(false)
    const [ enrollmentIds, setEnrollmentIds ] = useState([])

    console.log(context)
    useEffect(() => {
        axios.get('/student/examEligibilityStatus', { params: { studentId:context.user._id, semester:semester } } )
        .then(response => {
            console.log("response =", response.data)
            setTableData(response.data.data)
            setMasterFlag(response.data.masterFlag)
            setFeesFlag(response.data.feeFlag)
            setLoad(true)
        })
        .catch(err => console.log(err.message))
    }, [])
    
    useEffect(() => {

        const omit = ["_id"]
        const omitFields = (field) => !omit.some((item) => item == field)

        setFields(tableData.length > 0
            ? Object.keys(tableData[0]).filter((key) => omitFields(key))
            : [])
    
    }, [tableData])
    
    useEffect(() => {
        if(submitFlag) {
            axios.get('/student/applyForCondonation', { params: { enrollmentId: enrollmentId } } )
            .then(response => {
                console.log("response =", response.data)
                setSubmitFlag(false)
            })
            .catch(err => console.log(err.message))
        }
    },[submitFlag])

    useEffect(() => {
        if(payFlag) {
            axios.get('/student/savePaymentId', { params: { enrollmentIds: enrollmentIds, paymentId: paymentId } } )
            .then(response => {
                console.log("response =", response.data)
                setPayFlag(false)
            })
            .catch(err => console.log(err.message))
        }
    }, [payFlag])

    const applyCondonation = (id) => {
        setEnrollmentId(id)
        setSubmitFlag(true)
    }

    const updatePaymentId = () => {
        let dummy = tableData.filter(item => item.condonationStatus=="approved").map(item => item._id)
        console.log(dummy)
        setEnrollmentIds(dummy)
        setPayFlag(true)
    }

    return ( load ?
        <>
        <div className="px-2 m-2">
            <div className="flex justify-end m-2 mr-10">
                <div className="w-1/5">
                    <h5>Register</h5>
                    <div className="text-slate-400">{register}</div>
                </div>
                <div className="w-1/3">
                    <h5>Name</h5>
                    <div className="text-slate-400">{name}</div>
                </div>
                <div className="w-1/3">
                    <h5>Branch</h5>
                    <div className="text-slate-400">{branch}</div>
                </div>
                <div className="w-1/5">
                    <h5>Batch</h5>
                    <div className="text-slate-400">{batch}</div>
                </div>
                <div className="w-1/5">
                    <h5>Section</h5>
                    <div className="text-slate-400">{section}</div>
                </div>
                <div className="w-1/5">
                    <h5>Semester</h5>
                    <div className="text-slate-400">{semester}</div>
                </div>
            </div>
            <div className="flex mx-2 mr-10 mt-10">
                    <h5 className="pr-2">Master Attendance Eligibilty: </h5>
                    <p className={masterFlag?"text-green-600":"text-red-500"}>{masterFlag?"ELIGIBLE":"NOT ELIGIBLE"}</p>
            </div>

            <div className="flex flex-wrap">
            <div className="flex justify-center mt-2">
                <div className="max-w-min h-96 overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                    <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                        <thead className="bg-gray-100 text-xs uppercase">
                            <tr>
                                <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase"> SNo </th>
                                {
                                    fields.map((heading, index) => (
                                        <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {
                                tableData.map((row, index) => ( 
                                <tr className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap" key={index}>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" >{index+1}</td>
                                    {
                                        fields.map((key, index) => (
                                        <td className={`px-6 py-4 text-sm whitespace-nowrap ${key === "condonationStatus" ? ( row[key] == "Not Required" ? 'text-green-600' : ( row[key] == 'Not Applicable' ? 'text-red-500' : 'text-gray-800') ) : 'text-gray-800'}`} key={index}>{key === "condonationStatus" ? row[key] === "Not Required"  ? "NOT REQUIRED" : (row[key] == "Applicable" && masterFlag == true)? <Button color={'blue'} name={"Apply for Condonation"} event={() => applyCondonation(row["_id"])} outline={false}></Button> : row[key] : row[key]}</td> ))
                                    }
                                </tr>))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
            { feesflag ? 
                <div className='pt-4'>
                    <h5>Your Condonation Approved! Enter your Condonation Fee Payment Id</h5>
                    <div className="flex pt-4 gap-6">
                        <div className="pt-3">
                            <Input name={'Payment Id'} color={'blue'} type={'text'} update={(val) => {setPaymentId(val)}}  />
                        </div>
                        <div>
                            <Button name={'Submit Payment ID'} color={'blue'} event={updatePaymentId} />
                        </div>
                    </div>
                </div>
                :""
            }
        </div>
        </>
        :<Loading />
    ) 
}

export default Attendance