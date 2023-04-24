import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import sendEmail from "../utilities/send-email.js"

import { UsersModel } from "../models/UsersModel.js"
import { StudentsModel } from "../models/StudentsModel.js"
import { FacultyModel } from "../models/FacultyModel.js"
import { AdminModel } from "../models/AdminModel.js"

export const checkUser = async (req, res) => {

    try {

        let { email } = req.query

        let user = await UsersModel.findOne({ email }, { __v: 0, _id: 0 })

        let result = { 
            exists: user ? true : false, 
            user: user ? { 
                email: user.email, 
                userType: user.userType,
                isCredentialCreated: user.isCredentialCreated,
                password: user.isCredentialCreated ? user.password : undefined
            } : undefined,
            token: user ? jwt.sign({ email: user.email, userType: user.userType }, process.env.JWT_SECRET) : undefined
        }
        
        res.status(200).json(result)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const sendOTP = async (req, res) => {

    try {

        let { email } = req.query

        let random = Math.abs(Math.floor(Math.random() * 1000000)).toString()

        let hash = await bcrypt.hash(random, 10)

        let options = {
            to: email,
            subject: "GCTERP Account Verification",
            text: `<div>Please enter OTP: ${random} to authenticate this account (${email}) <hr/> Government College of Technology, Coimbatore - 641 013</div>`
        }

        let cred = jwt.verify(process.env.MAILER_CRED, process.env.JWT_SECRET)

        let result = await sendEmail(options, cred)

        result = { email, password: result.errno == undefined ? hash : undefined, sent: result.errno == undefined }

        res.status(200).json(result)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const savePassword = async (req, res) => {

    try {

        let { email, password, forgot } = req.body

        await UsersModel.updateOne({ email }, { password, isCredentialCreated: true })

        let options = {
            to: email,
            subject: `GCTERP Account ${forgot ? "Recovery" : "Creation"} - Successful`,
            text: `<div>Welcome to GCTERP Portal. You new password has been set successfully. Use the new password to access the portal. <hr/> Government College of Technology, Coimbatore - 641 013</div>`
        }

        let cred = jwt.verify(process.env.PORTAL_CRED, process.env.JWT_SECRET)

        let result = await sendEmail(options, cred)

        res.status(200).send({ success: true, sent: result.errno == undefined, email })

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const fetchUserData = async (req, res) => {

    try {

        let { email, userType } = req.query, result = null

        if(userType == "Student")
            result = await StudentsModel.findOne({ email }, { __v: 0 })
        else if(userType == "Faculty")
            result = await FacultyModel.findOne({ email }, { __v: 0 })
        else
            result = await AdminModel.findOne({ email }, { __v: 0 })

        res.status(200).json({ ...result.toObject(), userType })

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const prefetchUser = async (req, res) => {

    try {

        let token = req.cookies["gcterp"], decode = null

        if(token)
            decode = jwt.verify(token, process.env.JWT_SECRET)

        if(decode)
            delete decode.iat

        let result = { exists: decode ? true : false, user: decode ?? undefined }

        res.status(200).json(result)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const sendReport = async (req, res) => {

    try {

        let body = req.body, token = req.cookies["gcterp"], decode = null

        if(token)
            decode = jwt.verify(token, process.env.JWT_SECRET)
        
        if(!decode) {
            res.status(400).json({ exists: false })
            return
        }

        delete decode.iat
        
        let { user: admin } = jwt.verify(process.env.PORTAL_CRED, process.env.JWT_SECRET), cred = jwt.verify(process.env.MAILER_CRED, process.env.JWT_SECRET)

        let tagsTitle = (body.repeater || body.deadend || body.stopper) ? "<div style=\"font-size: 0.875rem\">The following tags were provided</div>" : ""

        let options = {
            to: admin,
            subject: "GCTERP Portal Error Report",
            text: `
            <div>Portal user with the id <code>${decode.email}</code> of type <code>${decode.userType}</code> reported an error at ${body.endpoint} with the following content:<br/>
                <div style="padding: 15px; font-family: Tahoma; font-style: italic; color: gray">
                    ${body.issue}
                </div>
                ${tagsTitle}<br/>
                <div style="display: flex; align-items: center">
                    ${ body.repeater ? '<code style="font-size: 0.50rem; text-transform: uppercase; margin-left: 1rem">Repeater</code>' : '' }
                    ${ body.deadend ? '<code style="font-size: 0.50rem; text-transform: uppercase; margin-left: 1rem">Dead End</code>' : '' }
                    ${ body.stopper ? '<code style="font-size: 0.50rem; text-transform: uppercase; margin-left: 1rem">Show Stopper</code>' : '' }
                </div><br/>
                <hr/>
                Government College of Technology, Coimbatore - 641 013
            </div>`
        }

        let result = await sendEmail(options, cred)

        res.status(200).json({ sent: result.errno == undefined, email: decode.email })

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}