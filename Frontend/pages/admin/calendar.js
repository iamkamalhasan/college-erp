import { useEffect, useState } from 'react'
import { isEqual, isFuture } from 'date-fns'
import axios from '../../axios.config'

import Icon from '../../utilities/Icon'
import Input from '../../utilities/Input'
import Switch from '../../utilities/Switch'
import Dropdown from '../../utilities/Dropdown'
import Button from '../../utilities/Button'

const CreateCalendar = ({ setOpen }) => {

    const [endDate, setEndDate] = useState(null)
    const [submit, setSubmit] = useState(false)
    const [startDate, setStartDate] = useState(null)
    const [isSaturdayHoliday, setSaturdayHoliday] = useState(true)
    const [min, setMin] = useState()

    useEffect(() => {
        axios.get("/admin/calendar/minmaxdate")
            .then(response => {
                let tomorrow = new Date(response.data.max)
                let result = new Date(tomorrow.setDate(tomorrow.getDate() + 1))
                setMin(result.toISOString().split('T')[0])
                setStartDate(result.toISOString().split('T')[0])
            }).catch(err => console.log(err.message))

    }, [])

    useEffect(() => {
        if (submit) {
            let data = { from: startDate, to: endDate, isSaturdayHoliday: isSaturdayHoliday }
            setSubmit(false)
            axios.post("/admin/calendar/create", data)
                .then(response => {
                    setOpen(false)
                }).catch(err => console.log(err.message))
        }
    }, [submit]);

    return (
        <>
            <div className="absolute z-50 w-full h-full top-0 left-0 bg-slate-300/25"></div>
            <form onSubmit={(e) => { e.preventDefault(); setSubmit(true) }} className="absolute border z-50 w-1/3 bg-white rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="absolute text-slate-400 cursor-pointer hover:text-red-500 top-4 right-2" onClick={() => setOpen(false)}>
                    <Icon name="close" />
                </div>
                <div className="text-xl font-bold w-fit m-auto my-4">Add Calendar</div><hr />
                <div className="flex items-center space-x-4 justify-center w-fit mx-auto m-5">
                    <label className="text-sm">Start Date</label>
                    <Input name="" type="date" min={min} color="blue" value={startDate ?? ""} update={setStartDate} />
                    <label className="text-sm ">End Date</label>
                    <Input name="" type="date" min={min} color="blue" value={endDate ?? ""} update={setEndDate} required />
                </div>
                <div className="flex space-x-2 mb-2 justify-center">
                    <div className="text-sm pt-1">Is Saturday Holiday ?</div>
                    <Switch initial={isSaturdayHoliday} toggle={setSaturdayHoliday} />
                </div>
                <hr />
                <div className="flex justify-center">
                    <button type="submit" className={`py-2 px-2 w-full rounded-md cursor-pointer font-semibold text-sm m-4 text-center items-center text-white ${submit ? "bg-slate-400" : "bg-blue-500"}`} disabled={submit ? "disabled" : ""}>
                        Create
                    </button>
                </div>
            </form></>)

}

const About = ({ selectedDay, months, batches: defaultBatches }) => {
    const [isWorkingDay, setWorkingDay] = useState(selectedDay.isWorkingDay)
    const [isEdit, setEdit] = useState(true)
    const [save, setSave] = useState(false)
    const [isfuture, setfuture] = useState(false)
    const [batches, setBatches] = useState(defaultBatches.map(doc => ({ check: selectedDay.batches ? selectedDay.batches.includes(doc) : false, batch: doc })))
    const [order, setOrder] = useState(selectedDay.order)

    useEffect(() => {
        let currentDate = new Date(selectedDay.date).toDateString()
        let today = new Date().toDateString()
        let future = new Date(currentDate) > new Date(today)
        setEdit(true)
        setOrder(selectedDay.order ?? 1)
        setBatches(defaultBatches.map(doc => ({ check: selectedDay.batches ? selectedDay.batches.includes(doc) : false, batch: doc })))
        setWorkingDay(selectedDay.isWorkingDay)
        setfuture(future)
    }, [selectedDay])

    useEffect(() => {
        if (save) {
            selectedDay.isWorkingDay = isWorkingDay
            let data = { date: selectedDay.date, order: isWorkingDay ? order : null, batches: isWorkingDay ? batches.map(doc => doc.check ? doc.batch : false).filter(doc => doc) : [], isWorkingDay: isWorkingDay }
            axios.put("/admin/calendar/workingday", data)
                .then(response => setSave(false))
                .catch(err => console.log(err.message))
        }
    }, [save])

    let date = selectedDay.date.split("T")[0].split("-")
    date = months[selectedDay.month] + " " + date[2] + ",  " + date[0]
    return (
        selectedDay.day != 0 ? <>
            <div className='h-2/3'>
                <div className={`text-lg font-semibold text-${!isfuture ? "slate-500" : "blue-500"} flex justify-around ml-2 p-1 mt-10 `}>
                    {date}
                    {isfuture && <div onClick={() => { setEdit(!isEdit) }} className={` w-fit cursor-pointer rounded-lg text-m ${isEdit ? "text-blue-500" : "text-red-500"}`}>
                        <Icon name={isEdit ? "edit" : "close"} />
                    </div>}
                </div>
                <div className=' border rounded-lg my-5 '>
                    <div className='flex justify-around items-center py-5'>
                        <label className='text-m'>Working Day</label>
                        <Switch initial={isWorkingDay} toggle={setWorkingDay} editable={!isEdit} />
                    </div>
                    <div className='flex justify-around py-5 text-m items-center'>
                        <label>Order</label>
                        {isEdit ? <label>{selectedDay.order ?? "--null--"}</label> : <Dropdown name="" data={[1, 2, 3, 4, 5]} update={setOrder} special initial={selectedDay.order ?? 1} />}
                    </div>
                </div>
                <div className='flex justify-around py-5 border rounded-lg'>
                    <label className=' justify-center flex items-center'>Batches</label>
                    <div className="grid grid-cols-4 gap-4">
                        {
                            batches.map((batch, idx) =>

                                <div key={idx} className="flex col-span-2 gap-2 justify-center">
                                    {isEdit ? <Icon name={batch.check && "check"} ></Icon> :
                                        <input
                                            checked={batch.check}
                                            onChange={(e) => { batches[idx].check = e.target.checked; setBatches([...batches]) }}
                                            name={batch.batch} type="checkbox">
                                        </input>
                                    }
                                    <label>{batch.batch}</label>
                                </div>
                            )}
                    </div>
                </div>
                {!isEdit && <div className="w-full justify-center flex py-5">
                    <button onClick={() => { setSave(true); setEdit(true) }} className={`border w-2/5 p-2 rounded-lg font-medium text-m ${isEdit ? "border-blue-500 text-blue-500" : "bg-blue-500 text-white"}`}>{isEdit ? "Edit" : "Save"}</button>
                </div>}

            </div></> : <>
            <div className='h-full items-center justify-center flex text-2xl'>Sunday</div></>
    )
}

const DeclareHolidays = ({ editCheckBox, setEditCheckBox, setDeclareHolidays, holidays }) => {

    return (
        <>
            <div className="flex justify-around mt-10 text-lg text-blue-500 font-semibold">
                <div className='w-full justify-center flex pb-5'>Holidays</div>
                <div onClick={() => { setEditCheckBox(!editCheckBox) }} className={` w-fit cursor-pointer rounded-lg text-m ${!editCheckBox ? "text-blue-500" : "text-red-500"}`}>
                    <Icon name={!editCheckBox ? "edit" : "close"} />
                </div>
            </div>
            <div className='h-3/5 text-center overflow-auto'>
                {holidays.map(holiday => <div key={holiday._id} className='text-lg pt-1 pb-1 mt-1 border rounded-sm'>{new Date(holiday.date).toDateString().slice(4)}</div>
                )}
            </div>
            {editCheckBox && <div className='flex justify-center pt-5'><Button name="Save" color="blue" event={() => setDeclareHolidays(true)} /></div>}
        </>
    )
}


//Manages both batch and saturday
const ManageBatSat = ({ batches: defaultBatches, isManageSaturday }) => {

    let today = new Date()
    today = today.getFullYear() + "-" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "-" + today.getDate()

    const [batches, setBatches] = useState(defaultBatches.map(doc => ({ check: false, batch: doc })))
    const [fromDate, setFromDate] = useState(today)
    const [toDate, setToDate] = useState(null)
    const [workingDay, setWorkingDay] = useState(true)
    const [maxDate, setMaxDate] = useState(new Date())
    const [save, setSave] = useState(false)
    const [isEdit, setEdit] = useState(true)
    const [workingDayPerWeek, setWorkingDaysPerWeek] = useState(5)
    const [isDayOrder, setIsDayOrder] = useState(false)

    useEffect(() => {
        axios.get("/admin/calendar/minmaxdate")
            .then(response => {
                setMaxDate(response.data.max.split('T')[0])
            }).catch(err => console.log(err.message))

    }, [])

    useEffect(() => {
        if (save) {
            setSave(false)
            setEdit(true)
            let url = "/admin/calendar/manage/" + (isManageSaturday ? "saturday" : "batch")
            let additionalFields = isManageSaturday ? { order: 1 } : { isDayOrder: isDayOrder, workingDayPerWeek: workingDayPerWeek, addBatch: workingDay }
            let data = { from: fromDate, to: toDate, batches: batches.map(doc => doc.check ? doc.batch : false).filter(doc => doc), isWorkingDay: workingDay, ...additionalFields }
            axios.put(url, data)
                .then(response => { })
                .catch(err => console.log(err.message))
        }
    }, [save])

    return (
        <form className="mt-12 " onSubmit={(e) => { e.preventDefault(); setSave(true) }}>
            <Input name="From" type="date" min={today} value={fromDate} update={e => setFromDate(e)} disabled={isEdit ? "disabled" : ""} required /><br />
            <Input name="To" type="date" max={maxDate} value={toDate} update={e => setToDate(e)} disabled={isEdit ? "disabled" : ""} required />
            <div className="border my-5 rounded-lg">
                <div className='flex justify-around items-center py-5'>
                    <label className="text-sm">{isManageSaturday ? "Working Day" : "Add Batch"}</label>
                    <Switch initial={workingDay} toggle={setWorkingDay} editable={!isEdit} />
                </div>
                {!isManageSaturday && <>
                    <div className='flex justify-around items-center py-5'>
                        <label className="text-sm">Is Day Order ? </label>
                        <Switch initial={isDayOrder} toggle={setIsDayOrder} editable={!isEdit} />
                    </div>
                    <div className='flex justify-around py-5 text-sm items-center'>
                        <label>Workingdays / Week</label>
                        {isEdit ? <label>{5}</label> : <Dropdown name="" data={[5, 6]} update={setWorkingDaysPerWeek} special initial={workingDayPerWeek} />}
                    </div>
                </>
                }  </div>
            <div className='flex justify-around py-5 border rounded-lg'>
                <label className='justify-center flex items-center'>Batches</label>
                <div className="grid grid-cols-4 gap-4">
                    {
                        batches.map((batch, idx) =>

                            <div key={idx} className="flex col-span-2 gap-2 justify-center">
                                {isEdit ? <Icon name={batch.check && "check"} ></Icon> :
                                    <input
                                        checked={batch.check}
                                        onChange={(e) => { batches[idx].check = e.target.checked; setBatches([...batches]) }}
                                        name={batch.batch} type="checkbox">
                                    </input>
                                }
                                <label>{batch.batch}</label>
                            </div>
                        )}
                </div>
            </div>
            <div className="m-auto flex justify-around mt-5 ">
                {!isEdit ?
                    <>
                        <button type="submit" className={`bg-blue-500 font-semibold rounded-lg w-1/3  text-white`}>Save</button>
                        <Button name="Cancel" color="blue" size={"1/3"} outline event={() => setEdit(true)} />
                    </> :
                    <Button name="Edit" color="blue" outline event={() => setEdit(false)} />}
            </div>
        </form>

    )
}


const Calendar = () => {

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let actions = ["About", "Manage Saturday", "Declare Holidays", "Manage Batch"]

    const [expand, setExpand] = useState(false)
    const [action, setAction] = useState(actions[0])
    const [selectedDay, setSelectedDay] = useState(null)

    const [data, setData] = useState([])
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [today, setToday] = useState(new Date())
    const [showCal, setShowCal] = useState(false)
    const [batches, setBatches] = useState([])
    const [holidays, setHolidays] = useState([])
    const [editCheckBox, setEditCheckBox] = useState(false)
    const [declareHolidays, setDeclareHolidays] = useState(false)

    useEffect(() => {
        axios.get("/admin/batch")
            .then(response => {
                let data = response.data.batches
                setBatches(data.slice(0, 4))
                console.log(data)
            }).catch(err => console.log(err.message))
    }, [])

    useEffect(() => {
        setEditCheckBox(false)
        if (declareHolidays) {
            console.log(holidays);
            axios.put("/admin/calendar/holiday", holidays)
                .then(response => setDeclareHolidays(false))
                .catch(err => console.log(err.message))
        }
    }, [declareHolidays])

    useEffect(() => {
        axios.get("/admin/calendar", { params: { year: currentYear } })
            .then(response => {
                setData(response.data)
                let selected = response.data.filter(doc => (new Date(doc.date).getDate() == today.getDate() && doc.month == today.getMonth() && doc.year == today.getFullYear()))
                setSelectedDay(selected.length > 0 ? selected[0]._id : response.data[0]._id)
            })
            .catch(err => console.log(err.message))
    }, [currentYear])

    useEffect(() => {
        setHolidays([])
    }, [currentMonth])


    let calendar = []
    if (data.length != 0)
        for (let month = 0; month < 12; month++) {
            calendar.push(data.filter(doc => doc.month == month))
        }

    const previousMonth = () => {
        if (currentMonth == 0) {
            setCurrentYear(currentYear - 1)
            setCurrentMonth(11)
        } else setCurrentMonth(currentMonth - 1)
    }

    const nextMonth = () => {
        if (currentMonth == 11) {
            setCurrentYear(currentYear + 1)
            setCurrentMonth(0)
        } else setCurrentMonth(currentMonth + 1)
    }

    return (
        <div className="grid grid-cols-9 h-full pl-3">
            <div className="col-span-7 pr-10">
                <div className='flex justify-between'>
                    <div className="flex items-center">
                        <button type="button" onClick={() => previousMonth()} className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-blue-500">
                            <Icon name="chevron_left" />
                        </button>
                        <h2 className="font-semibold text-gray-900 text-xl w-48 flex justify-center">{months[currentMonth] + " - " + currentYear}</h2>
                        <button type="button" onClick={() => nextMonth()} className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-blue-500">
                            <Icon name="chevron_right" />
                        </button>
                    </div>
                    <div
                        onClick={() => setShowCal(true)}
                        className={`py-2 px-2 rounded-md cursor-pointer  text-lg m-4 text-center items-center hover:text-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white"`}
                    >
                        Create Calendar
                    </div>
                </div>
                <div className="grid grid-cols-7  mt-4 text-lg leading-6 text-center text-gray-500 font-bold">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => <div key={idx}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 mt-2 text-xl h-flex">
                    {
                        calendar.length > 0 && calendar[currentMonth].length > 0 ?
                            calendar[currentMonth].map((day, dayIdx) => {
                                let date = new Date(day.date)
                                let isToday = isEqual(today.getDate(), date.getDate()) && isEqual(today.getFullYear(), date.getFullYear()) && isEqual(today.getMonth(), date.getMonth())
                                return (
                                    <Cell key={dayIdx} setAction={setAction} showCheckbox={actions[2] == action && editCheckBox && day.isWorkingDay && (new Date(new Date(day.date).toDateString()) > new Date(today))} holidays={holidays} setHolidays={setHolidays} day={day} today={isToday} update={setSelectedDay} selectedDay={selectedDay} />
                                )
                            })
                            : <div>Create calendar for this month </div>
                    }
                </div>
                {showCal && <CreateCalendar setOpen={setShowCal} />}
            </div>
            <div className='col-span-2 border border-r-0 border-t-0 border-b-0 p-10 group '>
                <div className="h-full">
                    <div className="border relative px-2 py-1 rounded h-12 group-hover:border-blue-400">
                        <div className="absolute z-10 text-m w-fit bg-white ml-[0.5px] px-1 -mt-4">Actions</div>
                        <div className="flex w-full justify-between text-m px-1 pt-2 cursor-pointer" onClick={() => setExpand(!expand)}>
                            {action}&nbsp;&nbsp;&nbsp;
                            <Icon name={`expand_${expand ? "less" : "more"}`} />
                        </div>
                        <ul className={`absolute max-h-64 overflow-auto overscroll-none z-10 bg-white rounded shadow px-2 py-1 -ml-1 mt-1 ${expand ? "" : "hidden"}`}>
                            {
                                actions.map((ele, idx) => <li key={idx} onClick={() => { setExpand(false); setAction(actions[idx]) }} className={`text-m cursor-pointer text-slate-400 hover:text-opacity-80 rounded p-1 my-1 hover:bg-blue-50 hover:text-blue-500 ${action == actions[idx] && "text-blue-500 bg-blue-50"}`}>{ele}</li>)
                            }
                        </ul>
                    </div>
                    {
                        data.length > 0 &&
                        <div className='h-5/6 w-full'>
                            {actions[0] == action && <About selectedDay={data.filter(doc => doc._id == selectedDay)[0]} months={months} batches={batches} />}
                            {actions[1] == action && <ManageBatSat batches={batches} isManageSaturday={true} />}
                            {actions[2] == action && <DeclareHolidays holidays={holidays} editCheckBox={editCheckBox} setEditCheckBox={setEditCheckBox} setDeclareHolidays={setDeclareHolidays} />}
                            {actions[3] == action && <ManageBatSat batches={batches} isManageSaturday={false} />}
                        </div>
                    }
                </div>
            </div>

        </div>
    )
}

const Cell = ({ day, today, setAction, update, selectedDay, showCheckbox, holidays, setHolidays }) => {

    const changeHolidays = (checked) => {
        let result = checked ? [...holidays, { _id: day._id, order: day.order, isDayOrder: day.isDayOrder, date: day.date }] : holidays.filter(doc => doc._id != day._id)
        result.sort((a, b) => new Date(a.date) - new Date(b.date))
        setHolidays([...result])
    }

    return (
        <div onClick={() => showCheckbox && changeHolidays(!holidays.some(doc => doc._id == day._id))} className={`h-24 group rounded-lg border relative col-start-${day.day + 1} ${today ? "border-blue-400" : ""} ${selectedDay == day._id && "bg-blue-50"} hover:bg-gray-50`} onDoubleClick={() => { update(day._id); setAction("About") }}>
            <div className={`w-full h-full flex justify-center items-center text-${!day.isWorkingDay ? "gray" : "blue"}-500`}>
                {(new Date(day.date)).getDate()}
            </div>
            {
                showCheckbox &&
                <div className='absolute top-0 right-2'><input checked={holidays.some(doc => doc._id == day._id)} type="checkbox" /></div>
            }
            <div className='absolute bottom-0 right-2 text-xs text-slate-400'>{day.order ?? ""}</div>
        </div>
    )
}

export default Calendar