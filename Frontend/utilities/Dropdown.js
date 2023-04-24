import { useEffect, useState, useRef, useCallback } from "react"

import Icon from "../utilities/Icon.js"

/**
 * Dropdown UI Component
 * @param name @type String - Dropdown label 
 * @param data @type [String] - Any collection of strings
 * @param update @type Function - React `setState` method signature
 * @param initial @type String - Default label value
 * @param disabled @type Boolean - Disabled dropdown
 * @param special @type Boolean - UI Rich Component
 * @param active @type Boolean - Allow Dynamic Changes
 * @param searchable @type Boolean - Enable Search Ability
 */
const Dropdown = ({ name, data, update, initial, disabled, special, active = false, searchable = false}) => {

    const [ option, setOption ] = useState(initial ?? data[0])
    const [ expand, setExpand ] = useState(false)
    const [ search, setSearch ] = useState("")

    const dropdownRef = useRef()

    const getMaxSize = () => Math.max(...data.map(doc => doc.length)).toString()

    const collapseDropdown = useCallback(event => !dropdownRef.current.contains(event.target) && setExpand(false), [])

    useEffect(() => {

        if(active) setOption(data[0])

    }, [ data ])

    useEffect(() => {

        window.addEventListener("click", collapseDropdown)

        return () => window.removeEventListener("click", collapseDropdown)

    }, [ collapseDropdown ])

    const updateFields = (value) => {
        setExpand(false)
        setOption(value)
        update(value)
        setSearch("")
    }

    return (!disabled ? 
        (special ? <>
        <div className="relative border w-fit rounded pl-2 hover:border-blue-500" ref={dropdownRef}>
            <div className="absolute text-sm w-fit bg-white ml-[0.5px] px-1 -mt-3 text-blue-500">{ name }</div>
            <div className="flex w-fit justify-between text-sm px-1 pt-1 cursor-pointer items-center" onClick={() => setExpand(!expand)}>
                { typeof(option) == typeof(1) ? option : option.charAt(0).toUpperCase() + option.slice(1) }&nbsp;&nbsp;&nbsp;
                <Icon name={`expand_${expand ? "less" : "more"}`}/>
            </div>
            {expand &&
            <ul className={`absolute max-h-52 overflow-auto overscroll-none z-50 bg-white mt-1 px-3 -ml-2 py-1 w-fit rounded-md shadow-md`}>
            { searchable && <input name="search" type="text" value={search} onChange={(e) => setSearch(e.target.value)} size={getMaxSize() - 1} className="outline-none border rounded-md mt-1 mr-1 p-1 text-slate-400 text-sm"/> }
            { data.map((ele, idx) => (!searchable || ele.toString().toLowerCase().includes(search.toString().toLowerCase())) && <li key={idx} onClick={() => updateFields(data[idx])} className={`text-sm cursor-pointer text-slate-400 hover:text-opacity-80 rounded p-1 my-1 hover:bg-blue-50 hover:text-blue-500 ${option == data[idx] && "text-blue-500 bg-blue-50"}`}>{ typeof(ele) == typeof(1) ? ele : ele.charAt(0).toUpperCase() + ele.slice(1) }</li>) }
            </ul>}
        </div></> :
        
        <div className="relative group" ref={dropdownRef}>
            <div className="text-sm font-semibold pl-3 mb-2">{ name }</div>
            <div className="flex w-fit justify-between text-slate-400 group-hover:text-blue-500 text-sm pl-3 cursor-pointer" onClick={() => setExpand(!expand)}>
                { typeof(option) == typeof(1) ? option : option.charAt(0).toUpperCase() + option.slice(1) }&nbsp;&nbsp;
                <Icon name={`expand_${expand ? "less" : "more"}`}/>
            </div>
            {expand &&
            <ul className={`absolute max-h-52 overflow-auto overscroll-none z-50 bg-white px-2 py-1 w-fit rounded-md shadow-md`}>
            { searchable && <input name="search" type="text" value={search} onChange={(e) => setSearch(e.target.value)} size={getMaxSize() - 1} className="outline-none border rounded-md mt-1 mr-1 p-1 text-slate-400 text-sm"/> }
            { data.map((ele, idx) => (!searchable || ele.toString().toLowerCase().includes(search.toString().toLowerCase())) && <li key={idx} onClick={() => updateFields(data[idx])} className={`text-sm cursor-pointer text-slate-400 hover:text-opacity-80 rounded p-1 my-1 hover:bg-blue-50 hover:text-blue-500 ${option == data[idx] && "text-blue-500 bg-blue-50"}`}>{ typeof(ele) == typeof(1) ? ele : ele.charAt(0).toUpperCase() + ele.slice(1)  }</li>) }
            </ul>}
        </div>) : 
        
        <div className="group" ref={dropdownRef}>
            <div className="text-sm font-semibold pl-3 mb-2">{ name }</div>
            <div className="flex w-fit justify-between text-slate-400 group-hover:text-blue-500 text-sm pl-3">
                { typeof(option) == typeof(1) ? option : option.charAt(0).toUpperCase() + option.slice(1) }
            </div>
        </div>
    )     
}

export default Dropdown