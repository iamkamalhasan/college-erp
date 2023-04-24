import axios from "../../axios.config"
import { useEffect } from "react"
import { useState } from "react"

import Dropdown from "../../utilities/Dropdown"
import Button from "../../utilities/Button"

const Table = ({ data }) => {

    return (
        <div className="mr-2 overflow-auto overscroll-none rounded-b-lg shadow-md align-middle border rounded-t-lg w-fit h-full">
            <table className="table-auto divide-y divide-gray-200 text-sm text-center ">
                <thead className="bg-gray-100 text-sm uppercase sticky top-0">
                    <tr>
                        {
                            <th className="p-3 text-center text-gray-600 text-sm font-semibold first:rounded-tl-lg uppercase">sno</th>
                        }
                        {
                            <th className=" p-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                Register
                            </th>
                        }
                        {
                            <th className=" p-3 text-gray-600 text-center text-sm font-semibold uppercase " >
                                Name
                            </th>
                        }
                        {
                            Object.keys(data[Object.keys(data)[0]]).map((type)=>{
                                if(typeof data[Object.keys(data)[0]][type]== typeof {}){
                                    return <th className="p-3 text-gray-600 text-center text-sm font-semibold uppercase "> 
                                    <tr className="flex justify-center">
                                        {type.includes("CO") ?
                                        `${type} (${data[Object.keys(data)[0]][type].allotted})`:type
                                        }
                                    </tr>
                                    <tr>
                                        { !type.includes("CO") && Object.keys(data[Object.keys(data)[0]][type]).map((number)=>{
                                            if(typeof Number.parseInt(number) == typeof 1)
                                            return <td className="text-xs text-center px-1">
                                                <tr className="flex justify-center">{`${number}`}</tr>
                                                <tr>
                                                   {
                                                    Object.keys(data[Object.keys(data)[0]][type][number]).map((co)=>{
                                                        return <td className="text-xs w-10">
                                                            <tr>{`CO${co}`}</tr>
                                                            <tr>{`(${data[Object.keys(data)[0]][type][number][co].allotted})`}</tr>
                                                        </td>
                                                    })
                                                   } 
                                                </tr>
                                            </td>
                                        })}
                                    </tr>
                                    </th>
                                }
                            })
                        }
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {
                        Object.keys(data).map((register, sno)=>
                        <tr className={` py-2 text-lg font-medium text-gray-800 whitespace-nowrap`} >
                            <td className="p-3 text-sm text-gray-800 whitespace-nowrap hover:cursor-pointer  " >
                                {sno+1}
                            </td>
                            <td className="p-3 text-sm text-gray-800 whitespace-nowrap hover:cursor-pointer  " >
                                {register}
                            </td>
                                <td className="p-3 text-sm text-left text-gray-800 whitespace-nowrap hover:cursor-pointer  " >
                                {data[register].name}
                            </td>
                            <td className="flex justify-around pt-3">
                                {
                                   Object.keys(data[register]).map((type)=>{
                                    if(!type.includes("CO") && typeof data[register][type]== typeof {}){
                                        return Object.keys(data[register][type]).map((number)=>{
                                            return Object.keys(data[register][type][number]).map((co)=>{
                                                return <td className="text-sm w-10">
                                            {data[register][type][number][co].obtained}
                                        </td>
                                            })
                                        })
                                       
                                    }
                                }) 
                                }
                            </td>
                                {
                                   Object.keys(data[register]).map((type)=>{
                                    if(type.includes("CO")){
                                        return <td className="text-sm px-1">
                                            {data[register][type].obtained}
                                        </td>
                                    }
                                }) 
                                }
                        </tr>  
                        )
                        
                    }
                </tbody>
            </table>
        </div>
    )
}

const CourseOutcome = () => {

    const [meta, setMeta] = useState()
    const [batch, setBatch] = useState()
    const [semester, setSemester] = useState()
    const [course, setCourse] = useState()
    const [get, setGet] = useState(false)
    const [co, setCO] = useState()
    
    useEffect(()=>{
        axios.get("/ci/co/courses", {params:{facultyId: "63f42892a8a5c50a79ed2664"}})
            .then((response)=>{
                setMeta(response.data)
                let btc = Object.keys(response.data).sort((a, b)=>b-a)[0]
                setBatch(btc)
                let sem = Object.keys(response.data[btc]).sort((a, b)=>b-a)[0]
                setSemester(sem)
                setCourse(Object.keys(response.data[btc][sem]).sort((a, b)=>b-a)[0])
            })
            .catch((err)=>console.log(err.message))

    }, [])

    useEffect(()=>{
        if(get){
            setGet(false)
            axios.get("/ci/co", {params: {courseId: meta[batch][semester][course]._id}})
                .then((response)=>{
                    setCO(response.data)
                })
                    .catch((err)=>console.log(err.message))
        }
    })

    return meta  && <div className="grid grid-rows-16 h-full">
        <div className="flex justify-between row-span-1">
            <div className="flex space-x-10">
                <Dropdown name="Batch" intial={batch} update={setBatch} data={Object.keys(meta).sort((a, b)=>b-a)}/>
                <Dropdown name="Sem" intial={semester} update={setSemester} data={Object.keys(meta[batch]).sort((a, b)=>b-a)} active/>
                <Dropdown name="Course" intial={course} update={setCourse} data={Object.keys(meta[batch][semester]).sort((a, b)=>b-a)} active/>
                <Dropdown name="Course Title" intial={meta[batch][semester][course]["title"]} data={[meta[batch][semester][course]["title"]]} active disabled/>
            </div>
            <div className="align-center">
                <Button name="Get" color="blue" event={()=>setGet(true)}/>
            </div>
        </div>
        {co && <div className="row-span-15 py-5 px-2">
            <Table data={co} indexed/>
        </div>}
    </div>
}

export default CourseOutcome