/**
 * Switch or Toggle Component
 * @param initial @type Boolean - Is it ON or OFF
 * @param toggle @type Function - React `setState` method signature
 * @param editable @type Boolean - Can accept changes
 */
const Switch = ({ initial, toggle, editable = true }) => {

    return (
        <div className="relative h-5 w-14 rounded-full text-gray-500 flex border">
            <div onClick={() => { editable && toggle(!initial === true) }} className={`absolute ${initial && "right-0"} h-full shadow bg-white z-10 w-7/12 border-${initial ? "l" : "r"} cursor-pointer rounded-full`}></div>
            <div className="h-full w-1/2 rounded-l-full border-r bg-blue-400 pl-2 pt-[3px]"></div>
            <div className="h-full w-1/2 rounded-r-full bg-slate-50 pr-2 pt-[3px]"></div>
        </div>
    )
}

export default Switch