import Icon from "../../utilities/Icon"
import Button from "../../utilities/Button"
import { useState } from "react"

const SwapClassCard = ({ active }) => {

    return (
        <div className={`flex items-center bg-white border rounded-lg shadow w-3/4 p-2 pl-3 border-l-4 border-l-blue-500 ${active ? "" : "grayscale"}`}>
            <div className="flex justify-between items-center pl-2 w-full">
                <div>
                    <div className="font-semibold text-slate-500">Prof. Aswini C</div>
                    <div className="text-sm text-slate-400">23 Mar - IV Hour</div>
                </div>
                <div className="text-xs items-center text-slate-400 text-center pr-4">
                    <div className="pb-2">{ freeze } Freeze</div>
                    <hr/>
                    <div className="pt-2">12:45 PM - 24 Mar 2023</div>
                </div>
                <div className="flex space-x-2 items-center">
                    <Button name="Deny" color="blue" outline disabled={!active}/>
                    <Button name="Approve" color="blue" disabled={!active}/>
                    <div className="text-white cursor-default pt-2">
                        <Icon name="expand_more" size="5xl"/>
                    </div>
                </div>
            </div>
        </div> 
    )
}

const FreezeReleaseCard = ({ freeze, active }) => {

    return (
        <div className={`flex items-center bg-white border rounded-lg shadow w-3/4 p-2 pl-3 border-l-4 border-l-blue-500 ${active ? "" : "grayscale"}`}>
            <div className="flex justify-between items-center pl-2 w-full">
                <div>
                    <div className="font-semibold text-slate-500">Prof. Aswini C</div>
                    <div className="text-sm text-slate-400">23 Mar - IV Hour</div>
                </div>
                <div className="text-xs items-center text-slate-400 text-center pr-4">
                    <div className="pb-2">{ freeze } Freeze</div>
                    <hr/>
                    <div className="pt-2">12:45 PM - 24 Mar 2023</div>
                </div>
                <div className="flex space-x-2 items-center">
                    <Button name="Deny" color="blue" outline disabled={!active}/>
                    <Button name="Approve" color="blue" disabled={!active}/>
                    <div className="text-white cursor-default pt-2">
                        <Icon name="expand_more" size="5xl"/>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProfileCard = ({ data, active }) => {

    const [ viewMore, setViewMore ] = useState(false)

    let keys = Object.keys(data[0]), values = []

    for(let key of keys) {
        let arr = [key]
        for(let datum of data)
            arr.push(datum[key])
        values.push(arr)
    }

    return ( <>
        <div className={`flex items-center bg-white border rounded-${viewMore ? "t-" : ""}lg shadow w-3/4 p-2 pl-3 border-l-4 border-l-blue-500 ${active ? "" : "grayscale"}`}>
            <div className="flex justify-between items-center pl-2 w-full">
                <div>
                    <div className="font-semibold text-slate-500">Vishal Pranav</div>
                    <div className="text-sm text-slate-400">1918147 - IT - III Yr</div>
                </div>
                <div className="text-xs items-center text-slate-400 text-center pr-4">
                    <div className="pb-2">Profile Update</div>
                    <hr/>
                    <div className="pt-2">08:24 AM - 15 Mar 2023</div>
                </div>
                <div className="flex space-x-2 items-center">
                    <Button name="Deny" color="blue" outline disabled={!active}/>
                    <Button name="Approve" color="blue" disabled={!active}/>
                    <div className="text-slate-300 hover:text-slate-400 cursor-pointer pt-2" onClick={() => setViewMore(!viewMore)}>
                        <Icon name={`expand_${viewMore ? "less" : "more"}`} size="5xl"/>
                    </div>
                </div>
            </div>
        </div> { viewMore && 
        <div className={`w-3/4 flex rounded-b-lg h-1/3 bg-gray-50 shadow border overflow-auto ${active ? "" : "grayscale"}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b [&>*]:p-2 bg-gray-100 text-slate-400 shadow">
                        <th>FIELD</th>
                        <th>OLD</th>
                        <th>NEW</th>
                    </tr>
                </thead>
                <tbody className="[&>tr]:text-slate-400 bg-white [&>tr:hover]:bg-gray-50 [&>tr:not(:last-child)]:border-b text-sm text-center">
                    { values.map((value, idx) => <tr key={idx}>{ value.map((field, idx) => <td key={idx}>{ field }</td>) }</tr>) }
                </tbody>
            </table>
        </div> } </>
    )
}

const Requests = () => {

    return <div>You are inside requests</div>
}

export default Requests