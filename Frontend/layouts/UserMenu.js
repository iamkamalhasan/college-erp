import Link from "next/link"
import { useRouter } from "next/router"
import { useState, useContext } from "react"
import Cookies from "universal-cookie"

import Icon from "../utilities/Icon"
import { AuthContext } from "../pages/_app"

const roles = {
    admin: "Admin",
    hod: "Head of the Department",
    cfa: "Chief Faculty Advisor",
    pc: "Program Coordinator",
    ttc: "Timetable Coordinator",
    fa: "Faculty Advisor",
    ci: "Course Incharge"
}

const UserMenu = ({ setToggle, setReport }) => {

    const cookies = new Cookies()
    const router = useRouter()

    const { auth, setAuth } = useContext(AuthContext)

    const signOut = () => {

        cookies.remove("gcterp", { path: '/' })

        setAuth({ status: false })
    }

    const [ currentRole, setCurrentRole ] = useState(auth.roles.indexOf(router.pathname.split('/')[1]));

    return (
        <div className="absolute bg-white mt-12 mr-1 w-fit ml-96 border shadow rounded-md" onClick={() => setToggle(false)}>
            <div className="group hover:bg-slate-50 rounded-md">
                <div className="absolute w-5 h-5 border-t border-l rotate-45 bg-white group-hover:bg-slate-50 right-4 -top-[10.5px] "></div>
                <Link className="cursor-pointer flex peer p-2" href={"/" + auth.primaryRole + "/profile"}>
                    <Icon name="offline_bolt"/>
                    <div className="pl-2 text-sm">My Profile</div>
                </Link>
            </div>
            <hr className="border-gray-200"></hr>
            
            {   auth.primaryRole != "student" && auth.primaryRole != "admin" &&
                <><div className="text-xs text-slate-400 px-1 pt-1">ROLES</div>
                {
                    auth.roles.map((role, idx) => (
                        <Link href={router.pathname.split('/')[1] == role ? {} : ("/" + role)} key={idx}>
                            <li onClick={() => setCurrentRole(idx) } className={`px-2 cursor-pointer ${ currentRole === idx ? `marker:text-blue-500 marker:text-xl ` : " marker:text-white marker:text-xl" } list-outside`}>
                                <span className={`text-xs hover:text-blue-500 ${currentRole == idx && "text-blue-500"} -left-2`}>
                                    { roles[role] }
                                </span>
                            </li>
                        </Link>
                    ))
                }
                <hr className="border-gray-200 mt-2"></hr></>
            }

            <div className="flex cursor-pointer p-2 hover:bg-slate-50" onClick={() => setReport(true)}>
                <Icon name="report"/>
                <div className="pl-2 text-sm">Report</div>
            </div>
            <hr className="border-gray-200"></hr>

            <div className="flex cursor-pointer p-2 hover:bg-slate-50" onClick={() => signOut()}>
                <Icon name="logout"/>
                <div className="pl-2 text-sm">Sign Out</div>
            </div>

        </div>
    );
};

export default UserMenu;