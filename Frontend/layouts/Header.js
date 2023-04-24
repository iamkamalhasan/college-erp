import { useCallback, useEffect, useRef, useState } from "react"

import Report from "./Report.js"
import UserMenu from "./UserMenu.js"
import Icon from "../utilities/Icon"
import Notification from "./Notification.js"

const Header = ({ active }) => {

    const [ notify, setNotify ] = useState(false)
    const [ toggle, setToggle ] = useState(false)
    const [ report, setReport ] = useState(false)

    const headerRef = useRef()

    const collapseHeader = useCallback(event => {

        if(!headerRef.current.contains(event.target)) {
            setNotify(false)
            setToggle(false)
        }

    }, [])

    useEffect(() => {

        window.addEventListener("click", collapseHeader)

        return () => window.removeEventListener("click", collapseHeader)

    }, [ collapseHeader ])

    return (  
        <div className="col-span-6 border-b flex justify-end" ref={headerRef}>
            <div className={`p-2 relative hover:text-blue-500 cursor-pointer ${notify && "text-blue-500"}`} onClick={() => setNotify(!notify)}>
                <Icon name={`notifications${notify ? "_active" : ""}`} fill={notify}/>
                <div className="absolute animate-ping w-2 h-2 bg-red-400 top-1/4 right-1/4 rounded-full"></div>
                <div className="absolute w-2 h-2 bg-red-400 top-1/4 right-1/4 rounded-full"></div>
            </div>
            <div className={`p-2 hover:text-blue-500 cursor-pointer ${toggle && "text-blue-500"}`} onClick={() => setToggle(!toggle)}>
                <Icon name="person" fill={toggle}/>
                <Icon name={`expand_${toggle ? "less" : "more"}`}/>
            </div>
            { notify && <Notification setNotify={setNotify}/> }
            { toggle && <UserMenu setToggle={setToggle} setReport={setReport}/> }
            { report && <Report active={active} setReport={setReport}/> }
        </div>
    )
}
 
export default Header;