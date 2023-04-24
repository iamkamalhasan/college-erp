import Image from "next/image"
import logo from "../public/logo.svg"
import { useEffect, useState } from "react"

const Screen = () => {

    const [ waiting, setWaiting ] = useState(0)

    useEffect(() => { 
    
        let interval = setInterval(() => {

            if(waiting > 3) clearInterval(interval)
        
            setWaiting(waiting => waiting + 1)
        
        }, 10000)

        return () => clearInterval(interval)

    }, [])

    return (
        <div className="absolute flex justify-center items-center border-5 border-black w-screen h-screen bg-white z-50">
            <div className="p-20">
                <div className="m-auto w-fit">
                    <Image src={logo} width={150} alt="GCT"/>
                </div>
                <div className="text-3xl fond-bold text-center my-10">
                    GCTERP
                </div>
                <div className="h-2 w-[300px] bg-white border rounded-full shadow">
                    <div className="progress-bar h-2 bg-blue-500 rounded-full"></div>
                </div>
                { waiting > 0 &&
                <div className="text-sm text-center text-slate-400 mt-10">
                    {
                        waiting == 1 ? <>Taking more time than expected. <br/> Please wait</> :
                        waiting == 2 ? <>Please check you internet <br/> connection and try again</> :
                        <>Looks like an error, <br/> try reloading the page.</>
                    }
                </div>}
            </div>
        </div>
    )
}

export default Screen