const mongoose = require('mongoose');
const express = require('express')
const cors  = require('cors')
const app = express()
const allowedOrigins = ['http://localhost:5173'];
app.use(cors({
    origin: allowedOrigins
  }));

const { userRouter } = require('./routes/user/user'); 
const { adminRouter } = require('./routes/admin/admin');
const { userMiddleware } = require('./middlewares/userAuth');
const { orderRouter } = require('./routes/user/order');
const { bookingRouter } = require('./routes/user/booking');
const { profileRouter } = require('./routes/user/profile');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
app.use(express.json())

app.use('/user', userRouter)
app.use('/admin', adminRouter)

// Authenticated API calls
app.use(userMiddleware);

app.use('/profile', profileRouter)
app.use('/order', orderRouter)
app.use('/booking', bookingRouter)

app.listen(5000, ()=>{
    console.log("Server is Running !")
})
