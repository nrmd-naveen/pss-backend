const { Router } = require('express');
const jwt = require('jsonwebtoken')
const { AdminModel, ItemModel } = require('../../db');
const { adminMiddleware } = require('../../middlewares/adminAuth');
require('dotenv').config();
const adminRouter = Router();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

adminRouter.post('/signup', async(req, res)=>{
    console.log("admin---")
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    try{
        const createdAdmin = await AdminModel.create({
            email : email,
            password : password,
            name : name
        })
        
        const token = jwt.sign({
            id : createdAdmin._id
        },ADMIN_JWT_SECRET)
        
        res.status(201).json({
            message : `Admin sign up success `,
            token: token

        })
    }catch(err){
        res.status(404).json({
            message : `Error in SignUp `,
            errData : err
        })
    }
})

adminRouter.post('/login', async(req, res)=>{
    const email = req.body.email;
    const password = req.body.password;

    try{
        const matchedAdmin = await AdminModel.findOne({
            email : email,
            password : password
        })
        console.log(matchedAdmin)
        const token = jwt.sign({
            id : matchedAdmin._id
        },ADMIN_JWT_SECRET)
        console.log(token)
        
        res.status(201).json({
            message : `Admin sign in success -> ${matchedAdmin.name}`,
            token: token
        })
    }catch(err){
        res.status(404).json({
            message : `Error in Admin SignIn `,
            errData : err
        })
    }
})

adminRouter.use(adminMiddleware);

adminRouter.post('/addItem', async(req, res)=>{
    const ItemName = req.body.name;
    const ItemPrice = req.body.price;
    try{
        await ItemModel.create({
            name : ItemName,
            price : ItemPrice
        })
    }catch(err){
        console.log(err)
        res.status(404).json({
            message : "Can't Add Data",
            data :  err
        })
    }
    res.status(201).json({
        message : "Item Added "
    })
})

adminRouter.get('/items', async (req, res)=>{
    const data = await ItemModel.find();
    if(data){
        res.status(201).json({
        message : "Items Retreived",
        items :  data
        })
    }else{
        res.status(404).json({
            message : "Can't get Data",
            errData :  data
        })
    }
    
})

module.exports = {
    adminRouter : adminRouter
}