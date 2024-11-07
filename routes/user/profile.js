const { Router } = require('express');
const profileRouter = Router();
const { UserModel } = require('../../db');

profileRouter.get('/data', async(req,res)=>{
    const userId = req.userId;
    try{
        if (userId) {
            try{
                const userData =  await UserModel.findById(userId);
                if(userData){
                    res.status(201).json({
                        name:userData.name,
                        email:userData.email,
                        createdAt: userData.createdAt 
                    })
                }

            }
            catch(err){
                res.status(400).json({
                    message:"invalid credientials"
                })
            }
        };
    }
    catch(err){
        res.status(400).json({
            message:"invalid credientials"
        })
    }
   
})

profileRouter.post('/update_profile', async(req,res)=>{
    const userId = req.userId;
    const newData = req.body;

    if (userId && newData){
        console.log("updated - ")
        try{
            console.log("updated")
            const updated = await UserModel.findByIdAndUpdate( 
                userId,
                {
                    $set : {
                        name:newData.name,
                        email:newData.email
                    }
                }
            )
            console.log("updated - " ,updated)
            res.status(200).json({
                message: "user profile updated successfully",
                data: {
                    name: newData.name,
                    email: newData.email
                }
            }) 
        }
        catch(err){
            res.status(400).json({
                message: "Profile not updated",
                data: err
            })
        }
    }else{
        res.status(400).json({
            message: "Profile not updated"
        })
    }


})


profileRouter.post('/change_pass', async(req,res)=>{
    const userId = req.userId;
    const reqData = req.body;

    if (userId && reqData.newPass){
        console.log("updated - ")
        try{
            const userData =  await UserModel.findById(userId);
            console.log(userData.password , reqData.oldPass)
            if(userData.password === reqData.oldPass){
                const updated = await UserModel.findByIdAndUpdate(
                    userId,
                    {
                        $set : {
                            password : reqData.newPass
                        }
                    }
                )
                if(updated){
                    res.status(200).json({
                        message: "Password updated successfully",
                        data: {
                            name : userData.name,
                            email: userData.email,
                            userId: userData._id
                        }
                    }) 
                }
            }
        }
        catch(err){
            res.status(400).json({
                message: "Password not changed",
                data: err
            })
        }
    }else{
        res.status(400).json({
            message: "unable to change Password"
        })
    }
})



module.exports = {
    profileRouter : profileRouter
}

 