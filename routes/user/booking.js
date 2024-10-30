const { Router } = require('express');
const { OrderModel, BookingModel } = require('../../db');
const bookingRouter = Router();


bookingRouter.post('/create', async (req, res)=>{
    const data = req.body;
    console.log(data)
    if(data && req.userId){
        const createdBooking = await BookingModel.create({
            createdBy : req.userId,
            items : data.items
        })
        if(createdBooking){
            console.log("Booking Created ", createdBooking)
            const updatedOrder = await OrderModel.findByIdAndUpdate(data.orderId,
                {
                    $push : {
                        bookings : createdBooking._id
                    }
                },
                { new : true }
            )
            if(updatedOrder){
                console.log(updatedOrder);
                res.status(201).json({
                        message : "Order Updated",
                        order :  updatedOrder
                    })
            }else{
                res.status(404).json({
                    message : "Can't Update orders"
                })
            }
        }
    }
})

module.exports = {
    bookingRouter : bookingRouter
}