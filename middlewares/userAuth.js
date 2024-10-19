const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.USER_JWT_SECRET;

const userMiddleware = (req, res, next) =>{

    const token = req.headers.token; 
    if(token){
        try{
            const jwtDecoded = jwt.verify( token , SECRET);
            req.userId = jwtDecoded.id;
            next();
            
        }catch(err){
            res.status(403).json({
                message : "Error - Not Authorized"
            })
        }
    }else{
        res.status(403).json({
            message : "Invalid User - not authenticated"
        })
    }
    // console.log("dec " , jwtDecoded)
    
}

module.exports = {
    userMiddleware : userMiddleware
}