import axios from "../../axios.config"
import { useContext, useEffect, useState } from "react"
import Button from "../../utilities/Button";
import { AppContext } from "../_app"


const Feedback = () => {

    const { data: context } = useContext(AppContext)
    
    const { user } = context

    console.log(user);
    const [feedback, setFeedback] = useState()
    const [next, setNext] = useState(0)
    const [submit, setSubmit] = useState(false)
    const [refresh, setRefresh] =useState(false)

    useEffect(()=>{
        setRefresh(false)
        axios.get(process.env.NEXT_PUBLIC_URL+"/student/feedback", {params:{batch:user.batch, semester: user.currentSemester, _id:user._id}})
            .then((response)=>{
                setFeedback(response.data)
            }).catch((err)=>console.log(err.message))
    }, [refresh])

    useEffect(() => {

        if(submit) {
            axios.post(process.env.NEXT_PUBLIC_URL + "/student/feedback/post", feedback)
                .then(res => {setRefresh(true)})
                .catch(err => console.log(err.message))
        }   

    }, [ submit ])
    

    return (typeof feedback == typeof []) ?
        <div className="h-full">
        <div className="grid grid-rows-16 h-full">
            <div className="flex w-full space-x-20 px-5 row-span-1">
                <div>
                    <div className="text-lg font-medium">Course Code</div>
                    <div className="text-slate-400">{feedback[next].courseCode}</div>
                </div>
                <div>
                    <div className="text-lg font-medium">Course Title</div>
                    <div className="text-slate-400">{feedback[next].courseTitle}</div>
                </div>
                <div>
                    <div className="text-lg font-medium">Course Type</div>
                    <div className="text-slate-400">{feedback[next].courseType}</div>
                </div>
                <div>
                    <div className="text-lg font-medium">Faculty Name</div>
                    <div className="text-slate-400">{feedback[next].facultyName}</div>
                </div>
            </div>
            <form className="row-span-14 overflow-auto p-5" onSubmit={(e)=>{ e.preventDefault(); next == feedback.length-1 ? setSubmit(true): setNext(next+1);}}>
                {  
                    Object.keys(feedback[next].feedback).map((type, ridx)=>{
                        return <div className="py-5">
                            <div className="text-lg font-medium pb-5 text-blue-500">{type}</div>
                                <div>
                                    {
                                        Object.keys(feedback[next].feedback[type]).map((question, idx)=>{

                                            let id = feedback[next].feedback[type][question]._id
                                            return <div key={idx}>
                                                <div>{question}</div>
                                                <div className="pl-10 flex pt-4 pb-6 space-x-10">
                                                    <div className="flex space-x-2"  onClick={(e) => { feedback[next].feedback[type][question].score = 5; setFeedback([...feedback]) }}>
                                                        <input type="radio" name={id} required checked={feedback[next].feedback[type][question].score == 5}/>
                                                        <label>Excellent</label>
                                                    </div>
                                                    <div className="flex space-x-2"  onClick={(e) => { feedback[next].feedback[type][question].score = 4; setFeedback([...feedback]) }}>
                                                        <input type="radio" name={id} required checked={feedback[next].feedback[type][question].score == 4}/>
                                                        <label>Very Good</label>
                                                    </div>
                                                    <div className="flex space-x-2" onClick={(e) => { feedback[next].feedback[type][question].score = 3; setFeedback([...feedback]) }}>
                                                        <input type="radio" name={id} required checked={feedback[next].feedback[type][question].score == 3}/>
                                                        <label>Good</label>
                                                    </div>
                                                    <div className="flex space-x-2" onClick={(e) => { feedback[next].feedback[type][question].score = 2; setFeedback([...feedback]) }}>
                                                        <input type="radio" name={id} required checked={feedback[next].feedback[type][question].score == 2}/>
                                                        <label>Very Poor</label>
                                                    </div>
                                                    <div className="flex space-x-2" onClick={(e) => { feedback[next].feedback[type][question].score = 1; setFeedback([...feedback]) }}>
                                                        <input type="radio" name={id} required checked={feedback[next].feedback[type][question].score == 1}/>
                                                        <label>Poor</label>
                                                    </div>
                                                </div>
                                            </div>
                                        })
                                    }
                                </div>
                        </div>
                    })
                    }
                    <div className="row-span-1 justify-between flex">
                    {next!=0 ?
                    <Button name="Previous" color="blue" outlined event={()=>{setNext(next-1); setSubmit(false)}}/>:<div></div>
                    }
                    {!submit && <input type="submit" value={next < feedback.length-1 ? "Next" : "Submit"} className="bg-blue-500 mt-3 p-2 rounded-md justify-center text-sm font-medium items-center text-white text-md hover:bg-blue-600"/>}
                    </div>
                </form>
                
            </div>
        </div>: <div class="h-full w-full flex justify-center items-center">
  <div class="text-xl mb-4 h-fit  text-blue-500 font-medium bg-white rounded-lg shadow-sm p-10 w-fit border">{feedback}</div>
  
</div>

}

export default Feedback
