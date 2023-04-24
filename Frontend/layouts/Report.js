import { useEffect, useState } from "react"
import Icon from "../utilities/Icon"
import Button from "../utilities/Button"
import routes from "../utilities/routes"
import axios from "../axios.config"

const Report = ({ active, setReport }) => {

    let role = active[1] == "admin" ? "Admin" : active[1].toUpperCase()
    let page = active[2] != "profile" ? routes[active[1]].filter(doc => doc.route == active[2])[0] : { name: "Profile" }
    let tab = (page.name != "Profile" && page.menu) ? page.menu.filter(doc => doc.route == active[3])[0] : null

    const [ issue, setIssue ] = useState("")
    const [ submit, setSubmit ] = useState(false)
    
    const [ repeater, setRepeater ] = useState(false)
    const [ deadend, setDeadend ] = useState(false)
    const [ stopper, setStopper ] = useState(false)

    useEffect(() => {

        if(submit)
            axios.post('/auth/report', { issue, repeater, deadend, stopper, endpoint: active.join("/") })
                .then(res => {

                    if(res.data.sent) {
                        setSubmit(false)
                        setReport(false)
                    }   else alert('Unable to send report. Try again')

                }).catch(err => console.log(err.message))

    }, [ submit ])

    return (<>
        <div className="absolute z-50 w-full h-full top-0 left-0 bg-slate-300/25"></div>
        <div className="absolute z-50 w-1/3 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group p-5 bg-white rounded-lg shadow border">
            <div onClick={() => setReport(false)} className="absolute w-[30px] h-[30px] top-2 right-0 text-red-500 cursor-pointer hidden group-hover:block">
                <Icon name="close"/>
            </div>
            <div className="text-center uppercase">
                Report an Issue
            </div>
            <hr className="my-3"/>
            <div className="flex mt-2 space-x-3 items-center">
                <div className="flex space-x-2 items-center">
                    <code className="bg-slate-100 text-xs rounded-lg p-2">ROLE</code>
                    <div className="text-sm">{ role }</div>
                </div>
                { page &&
                <div className="flex space-x-2 items-center">
                    <Icon name="chevron_right"/>
                    <code className="bg-slate-100 text-xs rounded-lg p-2">PAGE</code>
                    <div className="text-sm">{ page.name }</div>
                </div>}
                { tab &&
                <div className="flex space-x-2 items-center">
                    <Icon name="chevron_right"/>
                    <code className="bg-slate-100 text-xs rounded-lg p-2">TAB</code>
                    <div className="text-sm">{ tab.name }</div>
                </div>}
            </div><br />
            <textarea name="issue" className="text-sm w-full border min-h-[75px] max-h-[150px] rounded p-2 outline-none" placeholder="Describe your issue here..." value={issue} onChange={(e) => setIssue(e.target.value)}></textarea>
            <div className="mt-4">
                <div className="text-sm">
                    Select those that better suits the problem
                </div>
                <div className="flex space-x-3 items-center pl-5 mt-2" onClick={() => setRepeater(!repeater)}>
                    <input type="checkbox" name="action" defaultChecked={repeater}/>
                    <label className={`text-sm ${repeater ? "" : "text-gray-500"}`}>
                        Able to reproduce the same problem again
                        { repeater && <code className="text-xs bg-slate-100 rounded-full px-2 py-1 ml-3 uppercase">repeater</code> }
                    </label>
                </div>
                <div className="flex space-x-3 items-center pl-5 mt-2" onClick={() => setDeadend(!deadend)}>
                    <input type="checkbox" name="action" defaultChecked={deadend}/>
                    <label className={`text-sm ${deadend ? "" : "text-gray-500"}`}>
                        Restricts me from going to the next stage
                        { deadend && <code className="text-xs bg-slate-100 rounded-full px-2 py-1 ml-3 uppercase">deadend</code> }
                    </label>
                </div>
                <div className="flex space-x-3 items-center pl-5 mt-2" onClick={() => setStopper(!stopper)}>
                    <input type="checkbox" name="action" defaultChecked={stopper}/>
                    <label className={`text-sm ${stopper ? "" : "text-gray-500"}`}>
                        Reloading seems to be the only remedy
                        { stopper && <code className="text-xs bg-slate-100 rounded-full px-2 py-1 ml-3 uppercase">show-stopper</code> }
                    </label>
                </div>
            </div>
            <div className="text-sm text-gray-500 mt-3 text-center bg-slate-100 rounded-lg p-3">
                Reporting an issue will inform the portal team about the problem in order to take actions to solve the issue
            </div>
            <div className="flex space-x-3 mt-2">
                <Button name="Cancel" color="slate" size="full" outline event={() => setReport(false)}/>
                <Button name="Report" color="blue" size="full" event={() => setSubmit(true)} disabled={submit}/>
            </div>
        </div>
    </>)
}

export default Report