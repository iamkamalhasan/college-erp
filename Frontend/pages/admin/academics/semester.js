import { useState, useEffect } from "react";
import axios from "../../../axios.config";

import Icon from "../../../utilities/Icon";
import Input from "../../../utilities/Input";
import Switch from "../../../utilities/Switch";
import Button from "../../../utilities/Button";
import { numberToRoman } from "../../../utilities/helpers";
import initial from "../../../utilities/initial.json"

const CreateForm = ({ limits = null, setOpen, setNewBatch }) => {
  
    const [ sem, setSem ] = useState("");
    const [ batch, setBatch ] = useState("");
    const [ endDate, setEndDate ] = useState(limits.max);
    const [ submit, setSubmit ] = useState(false);
    const [ startDate, setStartDate ] = useState(new Date().toISOString().split("T")[0]);
    const [ regulation, setRegulation ] = useState("");

    useEffect(() => {
        if(submit) {
            setNewBatch({ sem, status: 0, batch, regulation, startDate, endDate })
            setSubmit(false)
            setOpen(false)
        }
    }, [ submit ]);

    return ( limits && <>
        <div className="absolute z-50 w-full h-full top-0 left-0 bg-slate-300/25"></div>
        <div className="absolute z-50 w-1/3 bg-white rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="absolute text-slate-400 hover:text-red-500 top-4 right-2" onClick={() => setOpen(false)}>
                <Icon name="close" />
            </div>
            <div className="text-xl font-bold w-fit m-auto my-4">Add Batch</div><hr/>
            <div className="flex space-x-4 justify-center w-full m-4">
                <Input name="Semester" size="w-1/3" type="number" color="blue" value={sem} update={setSem}/>
                <Input name="Batch" size="w-1/3" type="number" color="blue" value={batch} update={setBatch}/>
                <Input name="Regulation" size="w-1/3" type="number" color="blue" value={regulation} update={setRegulation}/>
            </div>
            <div className="flex items-center space-x-4 justify-center w-fit mx-auto m-5">
                <label className="text-sm">Start Date</label>
                <Input name="Begin" type="date" min={limits.min} max={limits.max} color="blue" value={startDate} update={setStartDate}/>
                <label className="text-sm ">End Date</label>
                <Input name="End" type="date" min={limits.min} max={limits.max} color="blue" value={endDate} update={setEndDate}/>
            </div><hr/>
            <div onClick={() => setSubmit(true)} className={`py-2 px-2 rounded-md cursor-pointer font-semibold text-sm m-4 text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500" }`} disabled={submit ? "disabled" : ""}>
                Submit
            </div>
        </div></>)
}

const Batch = ({ batch, selected, setBatch, days = 1, isTemporary }) => {
    
    return (
        <div onClick={() => !selected && !isTemporary && setBatch({...batch})} className={`w-fit p-2 border rounded-lg cursor-pointer ${selected && "border-blue-500"} hover:bg-slate-50 ${(!selected && isTemporary) ? "bg-slate-50" : ""}`}>
            <div className="flex justify-between mb-4">
                <div className="flex text-slate-400 text-sm mr-2">Batch</div>
                <div className="text-sm">{batch.batch + " - " + (parseInt(batch.batch) + 4)}</div>
            </div>
            <div className="flex justify-between space-x-4">
                <div>
                    <span className="text-slate-400 text-xs">Semester&nbsp;</span>
                    <span className="text-xs">{numberToRoman(batch.sem)}</span>
                </div>
                <div className={`text-${batch.status == 0 ? "blue" : batch.status == 1 ? "red" : "slate"}-500 text-xs pt-1`}>
                {batch.status == 0 ? "Ongoing" : batch.status == 1 ? "Add Sem" : batch.status == 2 ? "Starts" : "Ends"}
                {batch.status > 1 && " in " + days + (days > 1 ? " days" : " day")}
                </div>
            </div>
        </div>)
}

const BatchHolder = ({ data, initial, limits, setBatch, setNewBatch, isTemporary }) => {

    const [ create, setCreate ] = useState(false)

    const openCreate = () => {

        if(isTemporary) {
            alert('Semester Creation Under Progress')
            return
        }   else setCreate(true)
    }

    return (<>
        <div className="flex space-x-4 p-2">
            <div className={`w-[160px] h-[80px] border border-dashed rounded-lg ${!isTemporary ? "cursor-pointer hover:bg-slate-50" : ""}`}>
                <div onClick={() => !isTemporary && openCreate()} className="flex h-full justify-center items-center space-x-2 text-slate-400">
                    <Icon name="add" />
                    Create
                </div>
            </div>
            <div className="flex space-x-4 overflow-x-auto w-[700px]">
            { data.length > 0 && data.map((doc, idx) => ( <Batch key={idx} setBatch={setBatch} selected={initial && initial.batch && initial.batch == doc.batch} batch={doc} isTemporary={isTemporary}/> )) }
            </div>
        </div>
        {create && <CreateForm limits={limits} setOpen={setCreate} setNewBatch={setNewBatch}/>}
        </>)
}

const Cutter = ({ title }) => {
  
    return (
        <div className="flex ml-2 space-x-2 justify-center items-center">
            <div className="text-sm text-slate-500 font-bold">{title}</div>
            <div className="h-[1px] mt-1 bg-slate-200 w-full"></div>
        </div>
    )
}

const Semester = () => {

    // Phase I
    const [ batches, setBatches ] = useState([])
    const [ batch, setBatch ] = useState(null)
    const [ newBatch, setNewBatch ] = useState({})

    // Phase II
    const [ semesters, setSemesters ] = useState([])
    const [ semester, setSemester ] = useState(0)

    // Phase III
    const [ document, setDocument ] = useState(initial.metadata)
    const [ docList, setDocList ] = useState(null)
    const [ cancel, setCancel ] = useState(false)
    const [ limits, setLimits ] = useState(null)
    const [ save, setSave ] = useState(false)

    useEffect(() => {

        axios.get("/admin/semestermeta")
            .then(response => {
                let temp = response.data, result = [], sems = []
                temp.sort((a, b) => b.batch == a.batch ? a.sem - b.sem : b.batch - a.batch)
                for(let idx = 0; idx < temp.length - 1; idx++)
                    if(temp[idx].batch != temp[idx + 1].batch)
                        result.push(temp[idx])
                if(temp.length > 0)
                    result.push(temp[temp.length - 1])
                let docs = response.data ? response.data.map(doc => {
                    doc.begin = doc.begin?.split("T")[0] ?? ""
                    doc.end = doc.end?.split("T")[0] ?? ""
                    return doc
                }) : []
                setBatches(result)
                if(result.length > 0) {
                    setBatch({...result[0]})
                    for(let idx = 1; idx < result[0].sem + 1; idx++)
                        sems.push(idx)
                    setSemesters(sems)
                    setSemester(result[0].sem)
                }
                setDocList(docs)
                setDocument(docs[0] ?? initial.metadata)
            }).catch(err => console.log(err.message))
        
        axios.get("/admin/calendar/minmaxdate")
            .then(response => {
                let limits = {}
                limits.min = response.data.min.split('T')[0]
                limits.max = response.data.max.split('T')[0]
                setLimits({...limits})
            }).catch(err => console.log(err.message))

    }, [])

    const selectBatch = (val) => {

        if(document && document.temporary != undefined) {
            alert('Semester Creation Under Progress - Batch')
            return
        }

        setBatch(val)
        let sems = []
        for(let i = 0; i < val.sem; i++)
            sems.push(i + 1)
        setSemesters([...sems])
        setSemester(val.sem)
        let available = docList && docList.length && docList.some(doc => doc.batch == val.batch && doc.sem == val.sem)
        if(available) {
            let currentDoc = docList.filter(doc => doc.batch == val.batch && doc.sem == val.sem)[0]
            setDocument(currentDoc)
        }
    }

    const selectSemester = (val) => {

        if(document && document.temporary != undefined) {
            alert('Semester Creation Under Progress - Semester')
            return
        }

        setSemester(val)
        if(batch) {
            let available = docList && docList.length && docList.some(doc => doc.batch == batch.batch && doc.sem == val)
            if(available) {
                let currentDoc = docList.filter(doc => doc.batch == batch.batch && doc.sem == val)[0]
                setDocument(currentDoc)
        } else setDocument(null)
        }
    }

    useEffect(() => {

        if(cancel) {
            let updatedDocList = docList.filter(doc => !doc.temporary)
            let updatedBatches = batches.filter(doc => doc.batch == document.batch ? docList.some(doc => doc.sem != document.sem) : true)
            updatedBatches = updatedBatches.map(doc => {
                if(doc.batch == document.batch)
                    doc.sem -= 1
                return doc
            })
            setBatches(updatedBatches.length > 0 ? updatedBatches : [])
            setBatch(null)
            setSemester(1)
            setSemesters([])
            setDocList(updatedDocList.length > 0 ? updatedDocList : null)
            setDocument(null)
            setCancel(false)
        }

    }, [ cancel ])

    useEffect(() => {

        if(JSON.stringify(newBatch) != "{}") {
            batches.push(newBatch)
            batches.sort((a, b) => a.batch > b.batch)
            setBatches([...batches])
            
            selectBatch(newBatch)

            let newDoc = {...initial.metadata}
            newDoc.batch = newBatch.batch
            newDoc.regulation = newBatch.regulation
            newDoc.sem = newBatch.sem
            newDoc.begin = newBatch.startDate
            newDoc.end = newBatch.endDate
            newDoc.temporary = true

            setDocument({...newDoc})
            if(docList && docList.length > 0)
                setDocList([...docList, newDoc])
            else 
                setDocList([newDoc])
        }

    }, [ newBatch ])

    const createNewSemester = () => {

        if(document && document.temporary != undefined) {
            alert('Semester Creation Under Progress - New Sem')
            return
        }

        let lastSem = semesters[semesters.length - 1]
        if(lastSem < 8) {

            // Change Batch
            batch.sem = lastSem + 1

            // Change Semester
            semesters.push(lastSem + 1)
            for(let unit of batches)
                if(unit.batch == batch.batch)
                    unit.sem = lastSem + 1
                
            // Change Document
            let newDoc = {...initial.metadata}
            let hasPreviousSem = docList && docList.length && docList.some(doc => doc.batch == batch.batch && doc.sem == batch.sem)
            if(hasPreviousSem) {
                let previousSem = docList.filter(doc => doc.batch == batch.batch && doc.sem == batch.sem)[0]
                newDoc = {...previousSem}
            }
            newDoc.begin = ""
            newDoc.end = ""
            newDoc.sem = lastSem + 1
            newDoc.temporary = true

            setSemesters([...semesters])
            setDocList([...docList, newDoc])
            setDocument({...newDoc})
            setSemester(lastSem + 1)
            setBatches([...batches])
            setBatch({...batch})
        }
    }

    useEffect(() => {

        if(save) {
            if(document.begin == "") {
                alert('Start Date is Required')
                setSave(false)
                return
            }
            if(document.end == "") {
                alert('End Date is Required')
                setSave(false)
                return
            }
            if(document.workingDaysPerWeek == "") {
                alert('Working Days per Week is Required')
                setSave(false)
                return
            }
            let create = document?.temporary != undefined
            document.sem = parseInt(document.sem)
            document.batch = parseInt(document.batch)
            document.regulation = parseInt(document.regulation)
            document.condonation = parseInt(document.condonation)
            for(let idx = 0; idx < document.valueAddedCourse.length; idx++) {
                for(let key of Object.keys(document.valueAddedCourse[idx]))
                    if(key != 'type') 
                        document.valueAddedCourse[idx][key] = parseInt(document.valueAddedCourse[idx][key])
                delete document.valueAddedCourse[idx]._id
            }
            if(create) delete document.temporary
            
            axios({
                method: create ? "post" : "put",
                url: "/admin/semestermeta" + (create ? "/create" : "/update"), 
                data: document
            }).then(response => setSave(false))
            .catch(err => console.log(err.message))
        }

    }, [ save ])

    const emptyMessage = () => batches.length == 0 ? "Create a new batch to proceed" : !batch ? "Select Batch to Edit Semester Options" : !semester ? "Select Semester to Edit Semester Options" : !document ? "Semester Options Unavailable" : "No Data Available"

    return(<>
        { batches && limits && <BatchHolder data={batches} initial={batch} limits={limits} setBatch={selectBatch} setNewBatch={setNewBatch} isTemporary={document && document.temporary != undefined}/> }
        
        { !limits && <div className="text-slate-400 text-sm">Create calendar to proceed with batch (or) semester creation</div> }

        { (semester && semesters.length > 0) ? <>
        <div className="text-dark font-bold mt-2 ml-2">Semester</div>
        <div className="flex space-x-5 p-2 my-3">
            {
                semesters.map((sem, idx) => (
                <div key={idx} onClick={() => !(document && document.temporary != undefined) && selectSemester(sem)} className={`border ${semester == sem && "border-blue-500"} px-3 py-2 w-12 text-center rounded ${(semester != sem) && (document && document.temporary != undefined) ? "bg-slate-50" : "cursor-pointer hover:bg-slate-50"}`}>
                    {numberToRoman(sem)}
                </div>))
            }
            <div onClick={() => !(document && document.temporary != undefined) && createNewSemester()} className={`border px-3 pt-2 w-12 rounded text-white ${(document && document.temporary != undefined) ? "bg-slate-50 text-black" : "bg-blue-500 cursor-pointer hover:bg-blue-600"}`}>
                <Icon name="add"/>
            </div>
            { (document && document.temporary != undefined) &&
            <div className="text-slate-400 text-xs italic h-fit m-auto">
                Semester Creation Under Progress
            </div>}
        </div></> : ""}

        { (batch && semester && limits && document) ? <>
        <Cutter title="Timeline"/>
        <div className="p-8">
            <span className="space-x-4 flex items-center">
                <div className="text-gray-400 text-sm ">Regulation</div>
                <Input color="gray" name="Number" value={document.regulation} disabled/>
                <div className="text-gray-400 text-sm ">Start Date</div>
                <Input color="gray" name="Date" type="date" min={limits.min} max={limits.max} value={document.begin == "" ? document.begin = batch.startDate ?? "" : document.begin} update={(e) => { document.begin = e; setDocument({...document}) }}/>
                <div className="text-gray-400 text-sm">End Date</div>
                <Input color="gray" name="Date" type="date" min={limits.min} max={limits.max} value={document.end == "" ? document.end = batch.endDate : document.end} update={(e) => { document.end = e; setDocument({...document}) }}/>
                <div className="text-gray-400 text-sm ">Working Days / Week</div>
                <Input color="gray" name="Number" value={document.schedule.workingDaysPerWeek} update={(e) => { document.schedule.workingDaysPerWeek = e; setDocument({...document}) }}/>
            </span>
        </div>

        <Cutter title="Academics"/>
        <div className="p-8 grid grid-cols-10">
            <div className="col-span-1 space-y-14 my-auto">
                <div className="text-gray-400 text-sm">Schedule</div>
                <div className="text-gray-400 text-sm">Defaults</div>
            </div>
            <div className="col-span-2 space-y-10">
                <div className="flex pb-1 space-x-2">
                    <Switch initial={document.schedule.opened} toggle={(e) => { document.schedule.opened = e === true; setDocument({...document})}}/>
                    <div className="text-xs text-gray-400 pt-2">Status</div>
                </div>
                <Input type="number" color="gray" size="w-56" name="Internal Freeze" value={document.freeze.internal} update={(e) => { document.freeze.internal = e; setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Period Count" value={document.schedule.periodCount} update={(e) => { document.schedule.periodCount = e; setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Attd. Freeze" value={document.freeze.attendance} update={(e) => { document.freeze.attendance = e; setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Period Duration" value={document.schedule.periodDuration} update={(e) => { document.schedule.periodDuration = e; setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <div className="flex pb-1 space-x-2">
                    <Switch initial={document.schedule.isDayOrder} toggle={(e) => { document.schedule.isDayOrder = e === true; setDocument({...document})}}/>
                    <div className="text-xs text-gray-400 pt-2">Is Day Order</div>
                </div>
            </div>
        </div>

        <Cutter title="Enrollment"/>
        <div className="p-8 grid grid-cols-10">
            <div className="col-span-1 space-y-14 my-auto">
                <div className="text-gray-400 text-sm">Enrollment</div>
                <div className="text-gray-400 text-sm">Registration</div>
            </div>
            <div className="col-span-2 space-y-10">
                <div className="flex pb-1 space-x-2">
                    <Switch initial={document.enrollment.status} toggle={(e) => { document.enrollment.status = e === true; setDocument({...document}) }}/>
                    <div className="text-xs text-gray-400 pt-2">Status</div>
                </div>
                <div className="flex pb-1 space-x-2">
                    <Switch initial={document.courseRegistration.status} toggle={(e) => { document.courseRegistration.status = e === true; setDocument({...document}) }}/>
                    <div className="text-xs text-gray-400 pt-2">Status</div>
                </div>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Start Date" value={document.enrollment.start} update={(e) => { document.enrollment.start = e; setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Start Date" value={document.courseRegistration.start} update={(e) => { document.courseRegistration.start = e; setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="End Date" value={document.enrollment.end} update={(e) => { document.enrollment.end = e; setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="End Date" value={document.courseRegistration.end} update={(e) => { document.courseRegistration.end = e; setDocument({...document}) }}/>
            </div>
        </div>

        <Cutter title="Internals"/>
        <div className="p-8 grid grid-cols-10">
            <div className="col-span-1 space-y-14 my-auto">
                <div className="text-gray-400 text-sm">Unit Test</div>
                <div className="text-gray-400 text-sm">Assignment</div>
                <div className="text-gray-400 text-sm">Tutorial</div>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Count" value={document.ut.count} update={(e) => { document.ut.count = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Count" value={document.assignment.count} update={(e) => { document.assignment.count = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Count" value={document.tutorial.count} update={(e) => { document.tutorial.count = parseInt(e); setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Total" value={document.ut.marks} update={(e) => { document.ut.marks = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Total" value={document.assignment.marks} update={(e) => { document.assignment.marks = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Total" value={document.tutorial.marks} update={(e) => { document.tutorial.marks = parseInt(e); setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Contribution" value={document.ut.contribution} update={(e) => { document.ut.contribution = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Contribution" value={document.assignment.contribution} update={(e) => { document.assignment.contribution = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Contribution" value={document.tutorial.contribution} update={(e) => { document.tutorial.contribution = parseInt(e); setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Duration" value={document.ut.duration} update={(e) => { document.ut.duration = parseInt(e); setDocument({...document}) }}/>
            </div>
        </div>

        <Cutter title="Value Added Courses"/>
        <div className="p-8 grid grid-cols-10">
            <div className="col-span-1 space-y-14 my-auto">
                <div className="text-gray-400 text-sm">Extra Course</div>
                <div className="text-gray-400 text-sm">Activity Points</div>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Regular" value={document.valueAddedCourse[0].regular} update={(e) => { document.valueAddedCourse[0].regular = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Regular" value={document.valueAddedCourse[1].regular} update={(e) => { document.valueAddedCourse[1].regular = parseInt(e); setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Lateral" value={document.valueAddedCourse[0].lateral} update={(e) => { document.valueAddedCourse[0].lateral = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Lateral" value={document.valueAddedCourse[1].lateral} update={(e) => { document.valueAddedCourse[1].lateral = parseInt(e); setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Transfer" value={document.valueAddedCourse[0].transfer} update={(e) => { document.valueAddedCourse[0].transfer = parseInt(e); setDocument({...document}) }}/>
                <Input type="number" color="gray" size="w-56" name="Transfer" value={document.valueAddedCourse[1].transfer} update={(e) => { document.valueAddedCourse[1].transfer = parseInt(e); setDocument({...document}) }}/>
            </div>
        </div>

        <Cutter title="Others"/>
        <div className="p-8 grid grid-cols-10">
            <div className="col-span-1 space-y-14 my-auto">
                <div className="text-gray-400 text-sm">Others</div>
            </div>
            <div className="col-span-2 space-y-10">
                <Input type="number" color="gray" size="w-56" name="Condonation" value={document.condonation} update={(e) => { document.condonation = parseInt(e); setDocument({...document}) }}/>
            </div>
            <div className="col-span-2 space-y-10">
                <div className="flex pb-1 space-x-2">
                    <Switch initial={document.addOnEligible} toggle={(e) => { document.addOnEligible = e === true; setDocument({...document}) }}/>
                    <div className="text-xs text-gray-400 pt-2">Add On Eligible</div>
                </div>
            </div>
            <div className="col-span-2 space-y-10">
                <div className="flex pb-1 space-x-2">
                    <Switch initial={document.downloadHallticket} toggle={(e) => { document.downloadHallticket = e === true; setDocument({...document}) }}/>
                    <div className="text-xs text-gray-400 pt-2">Download Hallticket</div>
                </div>
            </div>
            <div className="col-span-2 space-y-10">
                <div className="flex pb-1 space-x-2">
                    <Switch initial={document.receivePaymentDetails} toggle={(e) => { document.receivePaymentDetails = e === true; setDocument({...document}) }}/>
                    <div className="text-xs text-gray-400 pt-2">Collect Payment Details</div>
                </div>
            </div>
        </div>

        <div className="flex space-x-4 ml-10 right-0">
            <Button name={document?.temporary == undefined ? (save ? "Saving" : "Save") : (save ? "Creating" : "Create") } color="blue" event={() => setSave(true)} disabled={save}/>
            { 
                document?.temporary &&
                <Button name="Cancel" color="blue" event={() => setCancel(true)} outline/>
            }
        </div> </> : emptyMessage()}
    </>)
}

export default Semester;