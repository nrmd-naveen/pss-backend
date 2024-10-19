const { Router } = require('express');
const { OrderModel, ItemModel, UserModel } = require('../../db');
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
    const orders = formatOrders(rawOrders);
    
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


orderRouter.post('/create', async (req, res)=>{
    const data = req.body;
    try{
        if(data && req.userId){
            const createdOrder = await OrderModel.create({
                createdBy : req.userId,
                userLimit: data.userLimit?data.userLimit:10,
                bookings: [],
    
            })
            if(createdOrder){
                console.log(createdOrder._id)
                res.status(201).json({
                    message: "New Order Created",

                })
            }
        }
    }catch(err){
        res.status(404).json({
            message : `Error in Creating Order `,
            errData : err
        })
    }
    res.status(404).json({
        message : `Order Not Created`
    })
})

const formatOrders = (data) =>{
    return data.map((order,ind) =>{
        return {
            id : order._id,
            createdBy : getUserName(order.createdBy),
            NoOfBookings : order.bookings.length(),
            createdAt : order.createdAt,
            closingTime : calculateClosingTime(order.createdAt),
            booking : formatBookings(order.bookings)
        }

    })
}

const calculateClosingTime = (createdTime)=> {
    const date = new Date(createdTime);
    date.setHours(date.getHours() + 2);
    return date.toISOString();
}

const getUserName = async (id) =>{
    const user = await UserModel.findById(id);
    return user.name;
}

const formatBookings = (bookings)=>{
    return bookings.map((booking)=>{
        return{
            bookedBy : getUserName(booking.createdBy),
            bookedAt : booking.createdAt,
            items : formatItems(items)
        }
    })
}

const formatItems = (items)=>{
    return items.map( item =>{
        return {
            itemName : getItemName(item.item),
            quantity : item.quantity
        }
    })
}

const getItemName = async(id) =>{
    const item = await ItemModel.findById(id);
    return item.name;
}


module.exports = {
    orderRouter : orderRouter
}