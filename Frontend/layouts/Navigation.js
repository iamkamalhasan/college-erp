import { useContext } from "react"
import Image from "next/image"
import Link from "next/link"

import routes from "../utilities/routes"
import Icon from "../utilities/Icon"
import logo from "../public/logo.svg"
import { AppContext } from "../pages/_app"

const Title = () => {
    return ( 
        <div className="flex place-content-center border-r">
            <div className="grid place-content-center w-1/3">
                <Image src={logo} width={25} alt="GCT"/>
            </div>
            <div className="grid items-center w-2/3 text-xl font-black">
                <span>GCTERP</span>
            </div>
        </div>
    )
}

const Credits = () => {
    return ( 
        <div className="flex place-content-center border-r cursor-pointer">
            <div className="grid place-content-center w-1/3 text-slate-400">
                <Icon name="groups"/>
            </div>
            <div className="grid items-center w-2/3 text-slate-400">
                <span>By Students</span>
            </div>
        </div>
    )
}

const User = ({name, role }) => {

    const roles = { admin: "Admin", cfa: "Chief Faculty Advisor", hod: "Head of the Department", pc: "Programme Coordinator", ttc: "Timetable Coordinator", fa: "Faculty Advisor", ci: "Course Incharge", student: "Student" }

    return ( 
        <div className="flex place-content-center group border-b border-r cursor-pointer pb-1">
            <div className="w-1/3 grid place-content-center">
                <Icon name="account_circle" outline/>
            </div>
            <Link href={"/" + role + "/profile"} className="grid pt-2 h-fit w-2/3">
                <div className="text-xs font-bold group-hover:text-blue-500">
                    { name }
                </div>
                <div className="text-[11px]">
                    { roles[role] }
                </div>
            </Link>
        </div>
    )
}

const NavItem = ({ name, icon, route, active }) => {
	return (
		<Link href={"/" + active[1] + "/" + route} className={`flex place-content-center group ${active[2] == route && "bg-blue-50 border-r-2 border-blue-500"} py-2 cursor-pointer`}>
			<div className={`grid place-content-center w-1/3 group-hover:text-blue-500 ${active[2] == route && "text-blue-500"}`}>
				<Icon name={icon} fill={active[2] == route}/>
			</div>
			<div className={`grid items-center w-2/3 group-hover:text-blue-500 ${active[2] == route && "text-blue-500"}`}>
				<span>{name}</span>
			</div>
		</Link>
	)
}

const Navigation = ({ active }) => {

    const { data } = useContext(AppContext)

    let name = data.user.firstName + " " + data.user.lastName

    if(data.user.userType != "Student")
        name = data.user.title + " " + name

    return (<>        
        <Title/>
        <div className="border-r"></div>
        <User name={name} role={active[1]}/>
        <div className="row-span-12 pt-5 border-b border-r">
        {   
            active[2] && routes[active[1]].map(action => (
                <NavItem key={action.key} name={action.name} icon={action.icon} route={action.route} active={active}/>
            ))
        }   
        </div>
        <Credits/>
    </>)
}

export default Navigation;