import { useEffect, useState } from "react"
import axios from "../../../axios.config"

import Icon from "../../../utilities/Icon";
import Input from "../../../utilities/Input";
import Dropdown from "../../../utilities/Dropdown";
import Button from "../../../utilities/Button";

const CreateForm = ({ setOpen, batches, minmax, setRefresh }) => {

    const [batch, setBatch] = useState(Object.keys(batches)[0]);
    const [sem, setSem] = useState();
    const [submit, setSubmit] = useState(false);
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);

    useEffect(() => {
        Object.keys(batches).length != 0 &&
            setSem(batches[batch][0])
    }, [batch])

    useEffect(() => {
        if (submit) {
            setSubmit(false)
            axios.post("/admin/feedback/manage", { batch: batch, sem: sem, start: start, end: end, create: true })
                .then((response) => {
                    setOpen(false)
                    setRefresh(true)
                }).catch((err) => console.log(err.message))
        }
    }, [submit]);

    return (
        <><div className="absolute z-20 w-full h-full top-0 left-0 bg-slate-300/25"></div>
            {
                <form onSubmit={(e) => { e.preventDefault(); setSubmit(true) }} className="absolute z-50 w-1/5 bg-white rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute text-slate-400 hover:text-red-500 top-4 right-2 cursor-pointer" onClick={() => setOpen(false)}>
                        <Icon name="close" />
                    </div>
                    <div className="text-xl font-medium w-fit m-auto my-4">Create Feedback</div><hr />
                    {Object.keys(batches).length == 0 ? <div className="p-5 text-slate-500">Feedback created for all current batches</div> :
                        <>
                            <div className="grid grid-rows-3 grid-flow-col pl-10 pb-5 pt-5 gap-5">
                                <div className="flex justify-between"><label className="text-m flex items-center">Batch</label>
                                    <Dropdown name="" data={Object.keys(batches)} update={setBatch} initial={batch} special />
                                    <label className="text-m flex items-center ">Semester</label>
                                    <Dropdown name="" data={batches[batch]} update={setSem} initial={sem} special active />
                                </div>
                                <div className="flex justify-between">
                                    <label className="text-m flex items-center">Start</label>
                                    <Input name="" type="datetime-local" min={minmax.min.slice(0, -1)} max={minmax.max.slice(0, -1)} color="blue" update={setStart} required />
                                </div>
                                <div className="flex justify-between">
                                    <label className="text-m flex items-center">End</label>
                                    <Input name="" type="datetime-local" min={minmax.min.slice(0, -1)} max={minmax.max.slice(0, -1)} color="blue" update={setEnd} required />
                                </div>
                                <hr />
                            </div>
                            <div className="w-full flex justify-center pb-5">
                                {!submit ?
                                    <button type="submit" className={`bg-blue-500 rounded-lg w-5/6 p-2 text-white flex justify-center`} >Create</button>
                                    : <div>Creating...</div>}
                            </div></>}
                </form>
            }
        </>)
}

const BatchHolder = ({ batch, meta, updateSem, refresh, setFeedback, selected, setSelected }) => {
    const [editable, setEditable] = useState(false)
    const [update, setUpdate] = useState(false)
    const [fb, getFB] = useState(false)
    const [sem, setSem] = useState(Object.keys(meta).reverse()[0])
    const [start, setStart] = useState()
    const [end, setEnd] = useState()

    useEffect(() => {
        if (fb) {
            getFB(false)
            axios.get("/admin/feedback", { params: { batch: batch, sem: sem } })
                .then((response) => {
                    setFeedback({ ...response.data })
                })
                .catch((err) => console.log(err.message))

        }
    }, [fb])

    useEffect(() => {
        setStart(meta[sem].start.slice(0, -1))
        setEnd(meta[sem].end.slice(0, -1))
        updateSem(sem)
    }, [sem])

    useEffect(() => {
        if (update) {
            setUpdate(false)
            console.log(start, end);
            axios.post("/admin/feedback/manage", { start: start, end: end, create: false, batch: batch, sem: sem })
                .then((response) => {
                    refresh(true)
                    setEditable(false)
                })
                .catch((err) => console.log(err.message))
        }
    })
    return (
        <div className={`relative w-[260px] h-[100px] border rounded-lg group ${selected[batch] && "border-blue-400"}`} >
            <div className={`absolute ${editable ? "right-7 " : "right-1 invisible"} top-1  group-hover:visible hover:cursor-pointer`}>
                {editable ? <div className="text-red-300" onClick={() => setEditable(false)}><Icon name="close" /></div> :
                    <div className="text-slate-400 hover:text-blue-400" onClick={() => setEditable(true)}><Icon name="edit" /></div>}
            </div>
            {editable && <div className="absolute right-1 top-1 cursor-pointer">
                <div className="text-blue-400" onClick={() => setUpdate(true)}><Icon name="check" /></div>
            </div>}
            <div className="grid grid-rows-3 grid-flow-col pl-3">
                <label className={`text-lg text-slate-400 font-medium items-center ${selected[batch] && "text-blue-500"} hover:cursor-pointer hover:text-blue-500 flex`} onClick={
                    () => {
                        getFB(true);
                        Object.keys(selected).map((btc) => selected[btc] = (batch == btc) ? true : false)
                        setSelected(selected)
                    }
                }>{batch}</label>
                <label className="text-xs text-slate-400 items-center flex">Start</label>
                <label className="text-xs text-slate-400 items-center flex">End </label>
                <div className="flex justify-center pr-8">
                    <div className="flex items-center text-slate-400 text-sm">Sem</div>
                    <Dropdown data={Object.keys(meta).reverse()} name="" update={setSem} />
                </div>
                <input name="" type="datetime-local" value={start} className={`h-5/6 text-xs ${!editable && "text-slate-400"} bg-white`} disabled={!editable} onChange={(e) => { e.preventDefault(); setStart(e.target.value) }} />
                <input name="" type="datetime-local" value={end} className={`h-5/6 text-xs ${!editable && "text-slate-400"} bg-white`} disabled={!editable} onChange={(e) => { e.preventDefault(); setEnd(e.target.value) }} />
            </div>
        </div>)
}

const Table = ({ data, selectedBranch, setSelectedBranch, setBranch, setSection, setView, indexed }) => {

    return (
        <div className=" overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
            <table className=" w-full table-auto divide-y divide-gray-200 text-sm text-center ">
                <thead className="bg-gray-100 text-sm uppercase sticky top-0">
                    <tr>
                        {
                            indexed &&
                            <th className="py-3 text-center text-gray-600 text-sm font-semibold first:rounded-tl-lg uppercase">sno</th>
                        }
                        {
                            <th className=" py-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                Branch
                            </th>
                        }
                        {
                            <th className=" py-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                Section
                            </th>
                        }
                        {
                            <th className=" py-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                Submitted
                            </th>
                        }
                        {
                            <th className=" py-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                Yet To Submit
                            </th>
                        }
                        {
                            <th className=" py-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                Feedback
                            </th>
                        }
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {
                        Object.keys(data).map((branch) => (
                            Object.keys(data[branch]).map((section, ridx) => (
                                <tr className={` py-2 text-lg font-medium text-gray-800 whitespace-nowrap ${selectedBranch[branch][section] && "border border-blue-400"} group hover:bg-slate-50`} key={ridx} onClick={() => {
                                    Object.keys(selectedBranch).map((br) => {
                                        Object.keys(selectedBranch[br]).map((sec) => {
                                            selectedBranch[br][sec] = (br == branch && sec == section) ? true : false
                                            if ((br == branch && sec == section)) {
                                                setBranch(br)
                                                setSection(sec)
                                            }
                                        })
                                    }
                                    )
                                    setSelectedBranch({ ...selectedBranch })
                                }}>
                                    {
                                        indexed && (
                                            <td className=" py-2 text-sm text-gray-800 whitespace-nowrap text-center">
                                                {ridx + 1}
                                            </td>)
                                    }
                                    {
                                        <td className=" py-2 text-sm text-gray-800 whitespace-nowrap" >
                                            {branch}
                                        </td>
                                    }
                                    {
                                        <td className=" py-2 text-sm text-gray-800 whitespace-nowrap" >
                                            {section}
                                        </td>
                                    }
                                    {
                                        <td className=" py-2 text-sm text-gray-800 whitespace-nowrap" >
                                            {data[branch][section]["submitted"].length}
                                        </td>
                                    }
                                    {
                                        <td className=" py-2 text-sm text-gray-800 whitespace-nowrap" >
                                            {data[branch][section]["yetToSubmit"].length}
                                        </td>
                                    }
                                    {
                                        <td className=" py-2 text-m text-gray-800 whitespace-nowrap hover:text-blue-500 hover:cursor-pointer hover:font-semibold hover:text-m" onDoubleClick={() => { setView(true); setBranch(branch); setSection(section) }}>
                                            <Icon name="file_open" />
                                        </td>
                                    }
                                </tr>
                            )
                            )))
                    }
                </tbody>
            </table>
        </div>
    )
}

const FeedbackReport = ({ feedback, branch, section, batch, sem, setView }) => {
    console.log(feedback);
    return <div className="relative h-full">
        <div className="absolute left-0 bottom-0 text-blue-500 hover:cursor-pointer text-lg" onClick={() => { setView(false) }}>
            <Button name="Back" color="blue" />
        </div>
        <div className="flex space-x-20 pb-2">
            <div>
                    <div className="text-lg font-medium">Batch</div>
                    <div className="text-slate-400 text-sm">{batch}</div>
            </div>
            <div>
                    <div className="text-lg font-medium">Branch</div>
                    <div className="text-slate-400 text-sm">{branch +" - "+ section}</div>
                </div>
            <div>
                    <div className="text-lg font-medium">Semester</div>
                    <div className="text-slate-400 text-sm">{sem}</div>
                </div>
        </div>
        <div className="border rounded-md shadow-md Overscroll-none">
            <table className="Overflow-auto w-full table-auto divide-y divide-gray-200 text-sm text-center">
                <thead className="bg-gray-100 text-sm uppercase sticky top-0">
                    <tr>
                        <th className="py-3 text-center text-gray-600 text-sm font-semibold uppercase">Course Code</th>
                        <th className="py-3 text-start text-gray-600 text-sm font-semibold uppercase " >Course Name</th>
                        <th className="py-3 text-start text-gray-600 text-sm font-semibold uppercase " >Staff Handling</th>
                        <th className="py-3 text-start text-gray-600 text-sm font-semibold uppercase" >Title</th>
                        <th className="py-3 text-start text-gray-600 text-sm font-semibold uppercase " >
                            <tr className="flex justify-center">Summary</tr>
                            <tr className="flex justify-around text-xs">
                                <td className="px-2">E</td>
                                <td className="px-2">VG</td>
                                <td className="px-2">G</td>
                                <td className="px-2">P</td>
                                <td className="px-2">VP</td>
                                <td className="px-2">Obt.</td>
                            </tr>
                        </th>

                        <th className="py-3 text-start text-gray-600 text-sm font-semibold uppercase " >{
                            <>
                                <tr className="flex justify-center">Total</tr>
                                <tr className="flex justify-around text-xs">
                                    <td className="px-2">Alt.</td>
                                    <td className="px-2">Obt.</td>
                                </tr>
                            </>
                        }</th>
                        <th className="py-3 text-center text-gray-600 text-sm font-semibold uppercase " >No. of students</th>
                        <th className="py-3 text-center text-gray-600 text-sm font-semibold uppercase " >Percentage (%)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {
                        Object.keys(feedback).map((key) => {
                            return (key != "submitted" && key != "yetToSubmit") && <tr>
                                <td className=" py-2 text-center text-sm text-gray-800 whitespace-nowrap" >
                                    {feedback[key]["courseCode"]}</td>
                                <td className=" py-2 text-start text-sm text-gray-800 whitespace-nowrap" >
                                    {feedback[key]["courseTitle"]}</td>
                                <td className=" py-2 text-start text-sm text-gray-800 whitespace-nowrap" >
                                    {feedback[key]["faculty"]}</td>
                                <td>
                                    {
                                        Object.keys(feedback[key]["summary"]).map((title) => {
                                            return title != "total" &&
                                                <tr className="text-start">
                                                    {title}
                                                </tr>
                                        })

                                    }
                                </td>
                                <td className=" py-2 text-start text-sm text-gray-800 whitespace-nowrap" >

                                    {
                                        Object.keys(feedback[key]["summary"]).map((title) => {
                                            return title.toLowerCase() != "total" && <tr className="flex justify-around">
                                                <td>{feedback[key]["summary"][title]["5"] ?? 0}</td>
                                                <td>{feedback[key]["summary"][title]["4"] ?? 0}</td>
                                                <td>{feedback[key]["summary"][title]["3"] ?? 0}</td>
                                                <td>{feedback[key]["summary"][title]["2"] ?? 0}</td>
                                                <td>{feedback[key]["summary"][title]["1"] ?? 0}</td>
                                                <td>{feedback[key]["summary"][title]["obtained"] ?? 0}</td>
                                            </tr>
                                        })

                                    }

                                </td>
                                <td>
                                    {
                                        <tr className="flex justify-around">
                                            <td>{feedback[key]["summary"]["total"]["allotted"]}</td>
                                            <td>{feedback[key]["summary"]["total"]["obtained"]}</td>
                                        </tr>
                                    }
                                </td>
                                <td className=" py-2 text-cebter text-sm text-gray-800 whitespace-nowrap" >
                                    {feedback[key]["count"]}</td>
                                <td className=" py-2 text-cebter text-sm text-gray-800 whitespace-nowrap" >
                                    {((feedback[key]["summary"]["total"]["obtained"]/feedback[key]["summary"]["total"]["allotted"])*100)}</td>
                            </tr>
                        }

                        )
                    }
                </tbody>
            </table>
        </div>
    </div>
}

const Feedback = () => {

    const [create, setCreate] = useState(false)
    const [meta, setMeta] = useState([])
    const [minmax, setMinMax] = useState({})
    const [batches, setBatches] = useState({})
    const [refresh, setRefresh] = useState(false)
    const [feedback, setFeedback] = useState({})
    const [selected, setSelected] = useState({})
    const [selectedBranch, setSelectedBranch] = useState()
    const [branch, setBranch] = useState()
    const [section, setSection] = useState()
    const [view, setView] = useState(false)
    const [sem, updateSem] = useState()

    const openCreate = () => {
        setCreate(true)
    }

    useEffect(() => {
        setRefresh(false)
        axios.get("/admin/semestermeta/feedback")
            .then((response) => {
                setMinMax(response.data.minmax)
                setMeta(response.data.meta)
                setBatches(response.data.batch)
                let temp = {}
                Object.keys(response.data.meta).forEach((batch) => {
                    temp[batch] = false
                })
                setSelected({ ...temp })
            }).catch((err) => console.log(err.message))
    }, [refresh])

    useEffect(() => {
        let temp = {}, firstRow = true
        if (Object.keys(feedback).length > 0) {
            Object.keys(feedback).map((branch) => {
                if (!temp[branch]) temp[branch] = {}
                Object.keys(feedback[branch]).map((sec) => {
                    if (!temp[branch][sec]) temp[branch][sec] = {}
                    temp[branch][sec] = firstRow ? true : false
                    if (firstRow) {
                        setBranch(branch)
                        setSection(sec)
                    }
                    firstRow = false
                })
            })
        }
        setSelectedBranch({ ...temp })
    }, [feedback])

    return Object.keys(meta).length > 0 || Object.keys(batches).length > 0 ?
        !view ?
            <div className="grid grid-rows-6 h-full ">
                <div className="row-span-1 h-full">
                    <>
                        <div className="flex space-x-4 p-2">
                            <div className={`w-[220px] h-[100px] border border-dashed rounded-lg cursor-pointer hover:bg-slate-50 }`}>
                                <div onClick={() => openCreate()} className="flex h-full justify-center items-center space-x-2 text-slate-400">
                                    <Icon name="add" />
                                    Create
                                </div>
                            </div>
                            <div className="flex space-x-4 overflow-x-auto w-[700px]">
                                {Object.keys(meta).reverse().map((batch, idx) => (<BatchHolder key={idx} batch={batch} meta={meta[batch]} updateSem={updateSem} refresh={setRefresh} setFeedback={setFeedback} selected={selected} setSelected={setSelected} />))}
                            </div>
                        </div>

                        {create && <CreateForm setOpen={setCreate} batches={batches} minmax={minmax} setRefresh={setRefresh} />}
                    </>
                </div>
                <div className="row-span-5 h-full pt-5 pl-2 border border-t-1 border-r-0 border-l-0 border-b-0 border-slate-200 grid grid-cols-8 gap-2">
                    <div className="col-span-6">
                        {
                            Object.keys(feedback).length > 0 && Object.keys(selectedBranch).length > 0 && <Table data={feedback} selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} setBranch={setBranch} setSection={setSection} setView={setView} indexed />
                        }
                    </div>
                    {
                        Object.keys(feedback).length > 0 && Object.keys(selectedBranch).length > 0 && <div className="col-span-2">
                            <div className="max-h-[90%] overflow-auto overflow-y-auto overscroll-hidden mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
                                <table className=" w-full table-auto divide-y divide-gray-200 text-sm text-center ">
                                    <thead className="bg-gray-100 text-sm uppercase sticky top-0">
                                        <tr>
                                            {
                                                <th className=" py-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                                    Submitted
                                                </th>
                                            }
                                            {
                                                <th className=" py-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                                    Yet To Submit
                                                </th>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {
                                            <td className="text-sm text-gray-800 whitespace-nowrap align-top" >
                                                {feedback[branch][section].submitted.map((roll) =>
                                                    <div className="border p-1 m-2 rounded-md">{roll}</div>)}
                                            </td>
                                        }
                                        {
                                            <td className="text-sm text-gray-800 whitespace-nowrap align-top" >
                                                {feedback[branch][section].yetToSubmit.map((roll) =>
                                                    <div className="p-1 border m-2 rounded-md">{roll}</div>)}
                                            </td>
                                        }

                                    </tbody>
                                </table>
                            </div></div>}
                </div>
            </div> :
            <FeedbackReport feedback={feedback[branch][section]} branch={branch} section={section} batch={Object.keys(selected).find((batch) => selected[batch] == true)} sem={sem} setView={setView} /> : <div>Loading...</div>
}

export default Feedback