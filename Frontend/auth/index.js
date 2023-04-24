import { useContext, useEffect, useState } from "react"
import Cookies from "universal-cookie"
import Image from "next/image"
import bcrypt from "bcryptjs"
import axios from "../axios.config"

import { getTimeString, isEmail, measureStrength } from "../utilities/helpers.js"
import Input from "../utilities/Input"
import Icon from "../utilities/Icon"
import logo from "../public/logo.svg"
import { AuthContext } from "../pages/_app"

const Authentication = () => {

    // 0 - Check User: Enter Email
    // 1 - Validate User: Enter Email & Password
    // 2 - Initiate OTP: Block Email and Prompt for OTP
    // 3 - Verify OTP: Block Email & Enter OTP
    // 4 - Set Password: Block Email, Enter Password and Confirm

    // Actions
    const [ user, setUser ] = useState(null)
    const [ status, setStatus ] = useState(0)
    const [ edit, setEdit ] = useState(false)
    const [ token, setToken ] = useState(null)
    const [ resend, setResend ] = useState(false)
    const [ forgot, setForgot ] = useState(false)
    const { setAuth } = useContext(AuthContext)
    const cookies = new Cookies()
    
    // Form Fields
    const [ OTP, setOTP ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ confirmPass, setConfirmPass ] = useState("")

    // Others
    const [ reveal, setReveal ] = useState({ first: false, second: false })
    const [ danger, setDanger ] = useState(false)
    const [ message, setMessage ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ timer, setTimer ] = useState(false)
    const [ count, setCount ] = useState(null)

    useEffect(() => {

        let closeTimer = setInterval(() => {
            if(timer)
                setCount(count - 1)
        }, 1000)

        if(!resend && count - 270 < 0)
            setResend(true)

        if(count == 0) {
            clearInterval(closeTimer)
            setMessage("OTP Expired")
            setResend(false)
            setDanger(true)
            setStatus(2)
        }

        return () => clearInterval(closeTimer)

    }, [ count ])

    const resetStates = (flush = false) => {

        setMessage(null)
        setEdit(false)
        setDanger(false)
        setReveal({ first: false, second: false })
        if(flush) setStatus(0)

        if(status != 3) setOTP("")
        if(status != 4) setPassword("")
        if(status != 4) setConfirmPass("")
        if(flush) setEmail("")
    }

    const checkUser = () => {

        if(!isEmail(email)) {
            setMessage("Invalid Email")
            setDanger(true)
            setLoading(false)
            return
        }

        axios.get(process.env.NEXT_PUBLIC_URL + "/auth", { params: { email } })
            .then(response => {

                if(response.data.exists) {
                    let user = response.data.user
                    if(forgot) {
                        setStatus(2)
                        setEdit(true)
                        setMessage("Verify email with OTP to proceed")
                    } else {
                        setStatus(user.isCredentialCreated ? 1 : 2)
                        if(!user.isCredentialCreated)
                            setMessage("Verify email with OTP to proceed")
                        setToken(response.data.token)
                        setUser(user)
                        setEdit(true)
                    }
                } else {
                    setMessage("User does not exist")
                    setDanger(true)
                }   setLoading(false)

            }).catch(err => console.log(err.message))
    }

    const validateUser = () => {

        if(user == null) {
            setMessage("Unexpected Error. Please try again")
            resetStates(true)
            setDanger(true)
            return
        }

        bcrypt.compare(password, user.password)
            .then(valid => {

                if(valid) {
                    resetStates(true)
                    cookies.set("gcterp", token, { path: "/" })
                    setAuth({ status: true, user: { email: user.email, userType: user.userType } })
                } else {
                    setMessage("Invalid Password")
                    setDanger(true)
                }   setLoading(false)

            }).catch(err => console.log(err.message))        
    }

    const initiateOTP = () => {

        axios.get(process.env.NEXT_PUBLIC_URL + "/auth/otp", { params: { email } })
            .then(response => {

                if(!response.data.sent) {
                    resetStates(true)
                    setMessage("OTP Not Sent. Try Again")
                    setDanger(true)
                    return
                }

                user.password = response.data.password
                setMessage((count && count - 270 < 0) ? "New OTP sent to inbox" : "OTP sent to below email")
                setCount(300)
                setUser({...user})
                setLoading(false)
                setResend(false)
                setDanger(false)
                setTimer(true)
                setEdit(true)
                setStatus(3)
                setOTP("")

            }).catch(err => console.log(err.message))
    }

    const verifyOTP = () => {

        bcrypt.compare(OTP, user.password)
            .then(valid => {

                if(valid) {
                    setTimer(false)
                    setMessage(forgot ? "Reset your password" : "Create your new password")
                    setEdit(true)
                    setStatus(4)
                } else {
                    setEdit(true)
                    setDanger(true)
                    setMessage("Invalid OTP")
                }   setLoading(false)

            }).catch(err => console.log(err.message))
    }

    const createPassword = () => {
        let isStrong = measureStrength(password) > 1
        if(isStrong) {
            if(password === confirmPass) {

                bcrypt.hash(password, 10)
                    .then(hash => {
                        axios.post(process.env.NEXT_PUBLIC_URL + "/auth", { email, password: hash, forgot })
                            .then(response => {

                                if(response.data.success) {
                                    resetStates(true)
                                    cookies.set("gcterp", token, { path: "/" })
                                    setAuth({ status: true, user: { email: user.email, userType: user.userType } })
                                }   setLoading(false)

                            }).catch(err => console.log(err.message))
                    }).catch(err => console.log(err.message))

            }   else {
                setMessage("Password not matched")
                setDanger(true)
            }
        } else {
            setMessage("Create more secure password")
            setConfirmPass("")
            setPassword("")
        }   
    }

    const authActions = [ checkUser, validateUser, initiateOTP, verifyOTP, createPassword ]

    const processStatus = (event = null) => {

        if(event == "change") {
            let old = email
            resetStates(true)
            setEmail(old)
            if(forgot)
                setMessage("Enter email to reset password")
            return
        }

        if(event == "forgot") {
            setForgot(true)
            setMessage("Verify email with OTP to proceed")
            setStatus(2)
            return
        }

        if(event == "cancel") {
            setForgot(false)
            if(timer) {
                setTimer(false)
                setCount(300)
            }
            resetStates(true)
            return
        }

        if(resend && event == "resend") {
            setLoading(true)
            initiateOTP()
            return
        }

        resetStates()
        setLoading(true)
        authActions[status]()
    }

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 p-5 border rounded-lg shadow bg-white">
            <div className="flex space-x-5 justify-center w-full mb-10">
                <Image width={30} src={logo} alt="GCT Logo"/>
                <div className="text-xl font-bold items-center pt-1.5">GCTERP</div>
            </div>
            
            { message &&
            <div className={`text-sm text-center p-2 border ${danger ? "bg-red-50 text-red-500 border-red-500" : "bg-blue-50 text-blue-500 border-blue-500"} rounded`}>
                { message }
            </div>}

            <div className="relative my-5">
                <Input type="email" name="Email" color="blue" size="w-full" value={email} update={(e) => setEmail(e)} disabled={edit}/>
                { edit &&
                <div className="absolute text-slate-500 hover:text-blue-500 cursor-pointer top-1.5 right-2" onClick={() => processStatus("change")}>
                    <Icon name="edit"/>
                </div>}
            </div>
            
            { (status == 1 || status == 4) &&
            <div className="relative my-5">
                <Input type={reveal.first ? "text" : "password"} name="Password" color="blue" size="w-full" value={password} update={(e) => setPassword(e)}/>
                <div className="absolute text-slate-500 hover:text-blue-500 cursor-pointer top-1.5 right-2" onClick={() => { reveal.first = !reveal.first; setReveal({...reveal}) }}>
                    <Icon name={reveal.first ? "visibility_off" : "visibility"}/>
                </div>
            </div>}
            
            { status == 3 &&
            <div className="relative my-5">
                <Input type={reveal.second ? "text" : "password"} name="OTP" color="blue" size="w-full" value={OTP} update={(e) => setOTP(e)}/>
                <div className="absolute text-slate-500 hover:text-blue-500 cursor-pointer top-1.5 right-2" onClick={() => { reveal.second = !reveal.second; setReveal({...reveal}) }}>
                    <Icon name={reveal.second ? "visibility_off" : "visibility"}/>
                </div>
            </div>}
            
            { status == 4 &&
            <div className="relative my-5">
                <Input type={reveal.second ? "text" : "password"} name="Confirm Password" color="blue" size="w-full" value={confirmPass} update={(e) => setConfirmPass(e)}/>
                <div className="absolute text-slate-500 hover:text-blue-500 cursor-pointer top-1.5 right-2" onClick={() => { reveal.second = !reveal.second; setReveal({...reveal}) }}>
                    <Icon name={reveal.second ? "visibility_off" : "visibility"}/>
                </div>
            </div>}

            { status == 4 && <>
            <div className="flex justify-between mb-2 px-1">
                <div className="text-sm">Strength</div>
                <div className={`text-sm text-${["slate", "red", "yellow", "green"][measureStrength(password)]}-500 font-bold uppercase`}>{["empty", "weak", "average", "good"][measureStrength(password)]}</div>
            </div>
            <div className="h-2.5 w-full bg-white border rounded-full shadow">
                <div className={`w-${["2", "1/3", "2/3", "full"][measureStrength(password)]} h-2 transition ease-in duration-300 bg-${["slate", "red", "yellow", "green"][measureStrength(password)]}-500 rounded-full`}></div>
            </div></>}
            
            <button onClick={() => processStatus()} disabled={(loading || count == 0) ? "disabled" : ""} className={`flex w-full mt-3 p-2 rounded-md justify-center cursor-pointer font-medium text-sm items-center text-white border border-blue-500 bg-blue-500 ${(loading || count == 0) ? "grayscale" : "hover:bg-blue-600"}`}>
                { loading &&
                <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>}
                <div className="font-bold">
                    {
                        status == 0 ? "Next" :
                        status == 1 ? "Login" :
                        status == 2 ? "Request OTP" :
                        status == 3 ? (count == 0 ? "Resend OTP" : "Verify in " + getTimeString(count)) :
                        "Submit"
                    }
                </div>
            </button>

            <div className="flex justify-between mt-3">
            
                { status == 3 &&
                <div onClick={() => (count - 270 < 0) && processStatus("resend")} className={`text-sm ${(count - 270 > 0) ? "text-slate-400" : "text-blue-500 hover:text-bold cursor-pointer"}`}>
                    { (count - 270) > 0 ? "Resend OTP in " + (count - 270) + " sec" : "Resend OTP" }
                </div>}
            
                { status > 0 && user && user.isCredentialCreated &&
                <div onClick={() => processStatus(forgot ? "cancel" : "forgot")} className="cursor-pointer text-sm text-slate-400 hover:text-blue-500">
                    { forgot ? "Cancel" : "Forgot Password ?" }
                </div>}
            
                { status > 1 && user && !user.isCredentialCreated &&
                <div onClick={() => processStatus("cancel")} className="cursor-pointer text-sm text-slate-400 hover:text-blue-500">
                    Cancel
                </div>}
            </div>

        </div>
    )
}

export default Authentication