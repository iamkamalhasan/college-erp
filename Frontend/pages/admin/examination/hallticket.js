import Dropdown from "../../../utilities/Dropdown";
import Download from "../../../utilities/Download";
import Button from "../../../utilities/Button";
import { useEffect, useState, useContext } from "react";
import axios from "../../../axios.config";
import { AppContext } from "../../_app"

const Hallticket = () => {
    
    const { data: context } = useContext(AppContext)

    const MetaData = context.metadata.map(item => ({batch:item.batch, sem:item.sem}))

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


    const [ tableData, setTableData ] = useState([]);
    const [ feeData, setFeeData ] = useState([])
    const [ fields, setFields ] = useState([])
    const [ tableValue, setTableValue ] = useState([])

    const [ branch, setBranch ] = useState("--None--")
    const [ batch, setBatch ] = useState("--None--")
    const [ section, setSection ] = useState("--None--")
    const [ reportBranch, setReportBranch ] = useState("--None--")
    const [ reportBatch, setReportBatch ] = useState("--None--")
    const [ reportSemester, setReportSemester ] = useState("--None--")
    const [ reportSection, setReportSection ] = useState("--None--")
    const [ sections, setSections ] = useState(["--None--"])
    const [ semester, setSemester ] = useState("--None--")
    const [ condonation, setCondonation ] = useState("--None--")
    const [ reportFlag, setReportFlag ] = useState(false)
    const [ generateFlag, setGenerateFlag ] = useState(false)
    const [ freezeFlag, setFreezeFlag ] = useState(false)
    const [ selectAll, setSelectAll ] = useState(false);
    const [ checkedRows, setCheckedRows ] = useState([]);
    const [ studentIds, setStudentIds ] = useState([])

    //Either this
    useEffect(() => {
        if(reportFlag){
            axios.get('/admin/hallTicketData' , { params: { branch:branch, section:section, batch: batch, semester: semester } } )
            .then(response => {
                console.log(response.data)
                setTableData(response.data.data)
                setFeeData(response.data.fees)
                setReportFlag(false)
            })
            .catch(err => console.log(err.message))
        }
    }, [reportFlag])

    //Or this
    // useEffect(() => {
    //     if(reportFlag){
    //         setTableData(adminHallticketData)
    //         setReportFlag(false)
    //     }
    // }, [reportFlag])

    useEffect(() => {
        if(generateFlag) {
            axios.post('/admin/releaseHallTicket',  { studentIds:studentIds } )
            .then(response => {
                console.log(response.data)
                setGenerateFlag(false)
            })
            .catch(err => console.log(err.message))
        }
    }, [generateFlag])

    
    useEffect(() => {
        if(freezeFlag) {
            axios.post('/admin/freezeHallTicket',  { studentIds:studentIds } )
            .then(response => {
                console.log(response.data)
                setFreezeFlag(false)
            })
            .catch(err => console.log(err.message))
        }
    }, [freezeFlag])

    useEffect(() => {

        let dummy = []
        let studentList = [...new Set(tableData.map(item=>item.register))]
        
        for(let student of studentList){
            let temp = {
                register:student,
                studentId:'',
                name:'',
                eligiblecourse:'',
                condonationCourse:'',
                condonationPaymentId: '--None--',
                waitingforapproval:'',
                ineligiblecourse:'',
                racourse:'',
                "checked": false
            }
            dummy.push({...temp})
        }

        let j=0
        for(let i=0;i<tableData.length;i++){
        
            if(dummy[j]['register']==tableData[i]['register']){
        
                if(tableData[i]['type']!='regular') {
                    dummy[j]['racourse'] += tableData[i]['courseCode'] + ', '
                } else if(tableData[i]['approved']==false) {
                    dummy[j]['waitingforapproval'] += tableData[i]['courseCode'] + ', '
                } else if(tableData[i]['eligible']==true&&!tableData[i]['condonationStatus']) {
                    dummy[j]['eligiblecourse'] += tableData[i]['courseCode'] + ', '
                } else if(tableData[i]['eligible']==true&&tableData[i]['condonationStatus']) {
                    dummy[j]['condonationCourse'] += tableData[i]['courseCode'] + ', '
                    dummy[j]['condonationPaymentId'] = tableData[i]['condonationFee']
                } else {
                    dummy[j]['ineligiblecourse'] += tableData[i]['courseCode'] + ', '
                }
        
                dummy[j]['name'] = tableData[i]['name']
                dummy[j]['studentId'] = tableData[i]['studentId']
        
            }else{
        
                for(j=0;j<dummy.length;j++){
        
                    if(dummy[j]['register']==tableData[i]['register']){
        
                        if(tableData[i]['type']!='regular') {
                            dummy[j]['racourse'] += tableData[i]['courseCode'] + ', '
                        } else if(tableData[i]['approved']==false) {
                            dummy[j]['waitingforapproval'] += tableData[i]['courseCode'] + ', '
                        } else if(tableData[i]['eligible']==true) {
                            dummy[j]['eligiblecourse'] += tableData[i]['courseCode'] + ', '
                        } else {
                            dummy[j]['ineligiblecourse'] += tableData[i]['courseCode'] + ', '
                        }
        
                        dummy[j]['name'] = tableData[i]['name']
                        dummy[j]['studentId'] = tableData[j]['studentId']
                        break
        
                    }
        
                }
        
            }
        
        }

        for(let student of dummy) {
            let temp = feeData.filter(item => item.register==student.register)
            student.fee = temp[0].fee
            student.paymentId = temp[0].paymentId
        }
        
        setTableValue(dummy)
        
    }, [tableData])

    useEffect(() => {
        
        const omit = ["studentId", "checked"];
        const omitFields = (field) => !omit.some((item) => item == field);

        setFields(
            tableValue.length > 0
            ? Object.keys(tableValue[0]).filter((key) => omitFields(key))
            : []
        );

    }, [tableValue])

    const toggleSelectAll = () => {
    
        const newCheckedRows = selectAll ? [] : tableValue.map((_, index) => index);
        setCheckedRows(newCheckedRows);
        setSelectAll(!selectAll);
        const newTableValue = tableValue.map((row, index) => ({ ...row, checked: !selectAll || newCheckedRows.includes(index) }));
        setTableValue(newTableValue);
    
    };
    
    function toggleRow(index) {
    
        const isChecked = checkedRows.includes(index);
        const newCheckedRows = isChecked
        ? checkedRows.filter(i => i !== index)
        : [...checkedRows, index];
        setCheckedRows(newCheckedRows);
        setSelectAll(newCheckedRows.length === tableValue.length);

        const newTableValue = tableValue.map((row, i) => {
            if (i === index) {
                return { ...row, checked: isChecked ? false : true };
            }
            return row;
    
        });
        
        setTableValue(newTableValue);
    
    }
    

    const selectedBranch = (e) => {
        setBranch(e)
        MetaData1.map(item => {
            if(item.branch == e) {
                setSections(item.section)
            }
        })
    }
    
    const selectedBatch = (e) => {
        setBatch(e);
        MetaData.map(items => {
            if(items.batch === e)
                setSemester(items.sem)
        })
    };

    const selectedSection = (e) => {
        setSection(e);
    }

    const selectedCondonation = (e) => {
        setCondonation(e);
    }

    const getReportHandler = () => {
    
        if(batch=="--None--"){
            alert('No batch selected')
        } else if (branch =="--None--") {
            alert('No branch selected')
        } else if (section =="--None--") {
            alert('No Section selected')
        } else {
            setReportBranch(branch)
            setReportBatch(batch)
            setReportSection(section)
            setReportSemester(semester)
            setReportFlag(true)
        }
    
    }

    const generateHandler = () => {
        if(condonation=="--None--") {
            alert('No Condonation Status Selected')
        } else {
            setStudentIds([...tableValue.filter(item => item.checked==true).map(item => item.studentId)])
            setGenerateFlag(true)
        }
    }

    const freezeHandler = () => {
        if(condonation=="--None") {
            alert("No Condonation Status Selected")
        } else {
            setStudentIds([...tableValue.filter(item => item.checked==true).map(item => item.studentId)])
            setFreezeFlag(true)
        }
    }

    return (
        <>
            <div className="flex pb-3 gap-4">
                <div className="w-1/4">
                    <Dropdown name={"Branch"} data={["--None--", ...MetaData1.map(item => item.branch)]} update={selectedBranch} />
                </div>
                <div className="w-1/4">
                    <Dropdown name={"Batch"} data={["--None--", ...MetaData.map(item => item.batch)]} update={selectedBatch} />
                </div>
                <div className="w-1/4">
                    <Dropdown name={"Section"} data={sections} update={selectedSection} />
                </div>
                <div className="w-1/4">
                    <h5>Semester</h5>
                    <div className="text-slate-400 pt-1">{semester}</div>
                </div>
                <div className="w-1/4">
                    <Button color={'blue'} name={"Get Report"} outline={true} event={getReportHandler} />
                </div>
                <div className="w-1/2">
                    <Dropdown name={"Condonation"} data={["--None--", "Eligible Courses", "Condonation Courses"]} update={selectedCondonation} />
                </div>
                <div className="w-1/3">
                    <Button color={"blue"} name={"Generate Hallticket"} event={generateHandler}/>
                </div>
                <div className="w-1/3">
                    <Button color={"blue"} name={"Freeze Hallticket"} event={freezeHandler}/>
                </div>
                <div className="w-1/3 pt-4">
                    <Download color={"blue"} name={reportBranch+"_"+reportSection+"_"+reportBatch+"_"+reportSemester+"_"+"Hallticket_Data"} data={tableValue}/>
                </div>
            </div>

            { tableValue.length>0?
                <>
                    <div className="max-w-min max-h-[75%] overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                        <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                            <thead className="bg-gray-100 text-xs uppercase">
                                <tr>
                                    <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase"> sno </th>
                                    {
                                        fields.map((heading, index) => (
                                            <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>{heading}</th>
                                        ))
                                    }
                                    <th className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
                                        <input className="m-2" type="checkbox" checked={selectAll} onChange={toggleSelectAll}/>
                                    </th>                                            
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {
                                    tableValue.map((row, index) => ( 
                                    <tr className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap" key={index}>
                                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" >{index+1}</td>
                                        {
                                            fields.map((key, index) => (
                                            <td className={`px-6 py-4 text-sm whitespace-nowrap`} key={index}>{key != "waitingforapproval" ? row[key] : row[key].split(' ').map((word, i) => (i > 0 && i % 4 === 0) ? [<br />, " " + word] : " " + word)}<br/></td> ))
                                        }
                                        <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
                                            <input className="m-2" type="checkbox" checked={checkedRows.includes(index)} key={index}
                                            onChange={() => toggleRow(index)}/>
                                        </td>
                                    </tr>))
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="flex">
                        
                    </div>
                </> 
                :"No Batch has been selected"
            }
            
        </>
    );
};

export default Hallticket;