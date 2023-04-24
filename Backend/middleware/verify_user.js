import jwt from "jsonwebtoken"
import { UsersModel } from "../models/UsersModel.js"

export const protect = async (req, res, next) => {

    if(req.path.includes("auth")) next()

    // const cookie = req.cookies["cred"];

    try{

        // const decoded = jwt.verify(cookie,process.env.JWT_SECRET)
        
        // if(!decoded){
        //     return res.status(401).json({
        //         success:false,
        //         message:"Invalid Credentials",
        //         authenticated:false
        //     })
        // }   

        // const user = await UsersModel.findOne({email:decoded.email},{password:0,__v:0,createdAt:0,updatedAt:0})

        // if(!user){
        //     return res.status(404).json({success:false, message:"No user is found with this id", authenticated:false});
        // }

        // req.user = user
        next()

    } catch(error) {
        res.status(400).json({success:false, message:'Invalid - '+ error.message, authenticated:false});
    }
}