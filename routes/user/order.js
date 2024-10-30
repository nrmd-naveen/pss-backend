const { Router } = require('express');
const { OrderModel, ItemModel, UserModel, BookingModel } = require('../../db');
const orderRouter = Router();

// menu Items
orderRouter.get('/items', async (req, res)=>{
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


orderRouter.get('/liveOrders', async (req, res)=>{
    
    const rawOrders = await OrderModel.find({
        isClosed : false
    })
    const orders = await formatOrders(rawOrders);
    
    if(orders){
        res.status(201).json({
        message : "Orders Retreived",
        orders :  orders
        })
    }else{
        res.status(404).json({
            message : "Can't get orders"
        })
    }
})

orderRouter.post('/close', async (req,res)=>{
    const orderId = req.body.orderId;
    console.log(orderId, req.userId)
    try{
        if(orderId && req.userId){
            const closedOrder = await OrderModel.findByIdAndUpdate(orderId,
                {
                    $set : {
                        isClosed : true,
                        closedAt : Date.now(),
                        closedBy : req.userId
                    }
                }
            )
            if(closedOrder){
                console.log("---",closedOrder);
                res.status(201).json({
                        message : "Order Closed",
                        order :  closedOrder
                    })
            }else{
                res.status(404).json({
                    message : "Can't close orders"
                })
            }
        }else{ 
            res.status(404).json({
                message : `Order Not Closed`
            })
        }
    }catch(err){
        res.status(404).json({
            message : `Error in Closing Order `,
            errData : err
        })
    }
})

orderRouter.post('/create', async (req, res)=>{
    const data = req.body;
    console.log(data, req.userId)
    try{
        if(data && req.userId){
            const createdOrder = await OrderModel.create({
                createdBy : req.userId,
                userLimit: data.userLimit?data.userLimit:10,
                hourLimit: data.hourLimit?data.hourLimit:4,
                bookings: []
            })
            if(createdOrder){
                res.status(201).json({
                    message: "New Order Created",

                })
            }
        }else{ 
            res.status(404).json({
                message : `Order Not Created`
            })
        }
    }catch(err){
        res.status(404).json({
            message : `Error in Creating Order `,
            errData : err
        })
    }
})

const formatOrders = async(data) =>{
    return Promise.all(
    data.map(async (order,ind) =>{
        const createdBy = await getUserName(order.createdBy);
        const bookings = await formatBookings(order.bookings);
        return {
            id : order._id,
            createdBy : createdBy,
            NoOfBookings : order.bookings.length,
            createdAt : order.createdAt,
            closingTime : calculateClosingTime(order.createdAt, order.hourLimit?order.hourLimit:4),
            bookings : bookings
        }

    })
    )
}

const calculateClosingTime = (createdTime, limit)=> {
    const date = new Date(createdTime);
    // console.log("created Date", createdTime,"--", date)
    date.setHours(date.getHours() + (limit? limit :4));
    // console.log("created Date", createdTime,"--", date)
    return date.toISOString();
}

const getUserName = async (id) =>{
    const user = await UserModel.findById(id);
    return user.name;
}

const formatBookings = async (bookings)=>{

    return Promise.all(
        bookings.map(async (bookingId)=>{
            
        const booking = await BookingModel.findById(bookingId)
        const {formattedItems, total} = await formatItems(booking.items);
        const bookedBy = await getUserName(booking.createdBy);

        return{
            bookedBy : bookedBy,
            bookedAt : booking.createdAt,
            items : formattedItems,
            total : total
        }
    })
    )
}

const formatItems = async (items) => {
    let total = 0;

    const formattedItems = await Promise.all(
        items.map(async item => {
            const itemData = await getItemDetails(item.item);
            total += (itemData.price * item.quantity);
            return {
                itemName: itemData.name,
                price: itemData.price,
                quantity: item.quantity
            };
        })
    );

    return { formattedItems, total };
};

const getItemDetails = async(id) =>{
    const item = await ItemModel.findById(id);
    return {
        name : item.name,
        price : item.price
    };
}


module.exports = {
    orderRouter : orderRouter
}