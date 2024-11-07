const { Router } = require('express')
const jwt = require('jsonwebtoken');
const { UserModel } = require('../../db');
const userRouter = Router();

require('dotenv').config();

const USER_JWT_SECRET = process.env.USER_JWT_SECRET;

userRouter.post('/signup', async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    try{
        const createdUser = await UserModel.create({
            email : email,
            password : password,
            name : name,
            createdAt : Date.now()
        })
        
        const token = jwt.sign({
            id : createdUser._id
        },USER_JWT_SECRET)
        
        res.status(201).json({
            message : `user sign up success `,
            token: token

        })
    }catch(err){
        res.status(404).json({
            message : `Error in SignUp `,
            ...err
        })
    }
})

userRouter.post('/login',async(req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    try{
        const matchedUser = await UserModel.findOne({
            email : email,
            password : password
        })
        if(matchedUser){
            const token = jwt.sign({
                id : matchedUser._id
            },USER_JWT_SECRET)
            
            res.status(201).json({
                message : `user sign in success -> ${matchedUser.name}`,
                token: token
            })
        }else{
            console.log("lsss",matchedUser)
            res.status(401).json({
                code:"INV_CRED",
                message : `Invalid Credentials`
            })
        }
    }catch(err){
        res.status(404).json({
            message : `Error in SignIn `,
            errData : err
        })
    }
})


module.exports = {
    userRouter : userRouter
}

