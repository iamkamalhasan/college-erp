import axios from "../axios.config"
import { useEffect, useState } from "react"

import Button from "./Button"
import Icon from "./Icon"
import { jsonToExcel } from "./helpers"

/**
 * Default file upload component
 * @param path @type String - Server endpoint for upload
 * @param template @type Object - Sample JSON Object
 * @param context @type String - Context of Upload
 * @param rules @type [String] - Rules for Upload
 */
const Upload = ({ path, template, context = "upload", rules = [] }) => {

    const [ file, setFile ] = useState(null)
    const [ trash, setTrash ] = useState([])
    const [ closed, isClosed ] = useState(true)
    const [ sending, setSending ] = useState(0)

    useEffect(() => {

        if(sending == 1) {
            axios.post(path, { data: file }, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(response => {
                if(response.data.documents.trash > 0) {
                    setTrash(response.data.trash)
                    setSending(2)
                }   else {
                    setSending(0)
                    isClosed(true)
                }
            }).catch(err => console.log(err.message))
        }

    }, [ sending ])

    return (<>
        <div className="p-2 border cursor-pointer flex rounded-lg text-sm w-fit group" onClick={() => isClosed(false)}>
            <Icon name="upload"/>
            <div className="mt-0.5 ease-in duration-150 h-0 w-0 opacity-0 pointer-events-none group-hover:h-fit group-hover:w-fit group-hover:opacity-100 group-hover:ml-2">Upload</div>
        </div>
        { !closed && <>
        <div className="absolute z-50 w-full h-full top-0 left-0 bg-slate-300/25"></div>
        <div className="absolute z-50 w-3/12 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group">
            <div className="relative p-5 bg-white rounded-lg shadow border">
                { rules.length > 0 && 
                <div className="w-full bg-slate-100/75 p-3 rounded-lg">
                    <div className="text-lg">Upload Instructions</div><hr className="my-2"/>
                    <ul className="list-disc ml-10 [&>li]:text-sm [&>li]:mb-1">
                        { rules.map((rule, idx) => <li key={idx}>{ rule }</li>) }
                    </ul>
                </div>}
                <div className="w-full text-center mt-3">
                    <code className="text-sm">{ file ? file.name : "No File Selected" }</code><hr className="my-2"/>
                    <div className="text-xs">Only <code>.xls</code> and <code>.xlsx</code> files allowed</div>
                    { file ?
                    <Button name={sending == 1 ? "Uploading..." : sending == 0 ? "Upload" : "Uploaded"} color="blue" size="full" event={() => setSending(1)} disabled={sending > 0}/> :
                    <label htmlFor="upload" className="flex w-full mt-3 p-2 rounded-md justify-center cursor-pointer font-medium text-sm items-center text-white border border-blue-500 bg-blue-500 hover:bg-blue-600">
                        <div className="px-1">Select File</div>
                    </label>}
                    <Button name={trash.length > 0 ? "Download Trash" : "Download Template"} color={trash.length > 0 ? "red" : "blue"} size="full" event={() => jsonToExcel(trash.length > 0 ? trash : [template], context + (trash.length > 0 ? "_trash" : ""))} outline/>
                    <input id="upload" type="file" accept=".xls,.xlsx" onChange={(e) => setFile(e.target.files[0])} className="text-sm border flex h-0 w-0 invisible"/>
                </div>
                { sending == 2 && <div onClick={() => { setSending(0); setTrash([]); setFile(null) }} className="w-full text-center text-slate-400 cursor-pointer mt-2">
                    Reset
                </div>}
                { sending != 1 && <div onClick={() => { setFile(null); isClosed(true) }} className="absolute w-[30px] h-[30px] bg-white rounded-bl-lg rounded-tr-lg top-0 right-0 text-red-400 text-center pt-[2px] cursor-pointer hidden group-hover:block">
                    <Icon name="close"/>
                </div>}
            </div>
        </div></>}
    </>)
}

export default Upload