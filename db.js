const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const User = new Schema({
    email : { type : String, unique : true},
    name : String,
    password : String
})

const Admin = new Schema({
    email : { type : String, unique : true},
    name : String,
    password : String
})

const Item = new Schema({
    name: { type : String, unique : true},
    price : Number,

})

const Booking = new Schema({
    createdBy: { type: ObjectId, ref: 'users' }, 
    createdAt: { type: Date, default: Date.now },
    items: [
        {
            item: { type: Schema.Types.ObjectId, ref: 'items', required: true }, 
            quantity: { type: Number, required: true, min: 1 } 
        }
    ],
    isSelected: { type: Boolean, default: false }
});

const Order = new Schema({
    createdBy: { type: ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
    userLimit: { type: Number, default: 10},    
    isClosed: { type: Boolean, default: false },
    closedAt: { type: Date, required: false },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'booking' }],
    closedBy: { type: ObjectId, ref: 'users' },
    hourLimit: { type: Number, default: 4}
});

const UserModel = mongoose.model('users', User);
const AdminModel = mongoose.model('admins', Admin);
const ItemModel = mongoose.model('items', Item);
const BookingModel = mongoose.model('booking', Booking);
const OrderModel = mongoose.model('order', Order);

module.exports = {
    UserModel : UserModel,
    ItemModel : ItemModel ,
    AdminModel : AdminModel,
    BookingModel : BookingModel,
    OrderModel : OrderModel
} 