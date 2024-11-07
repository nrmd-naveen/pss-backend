const { OrderModel } = require('../db');

const closeOrderMiddleware = async (req, res, next) => {
    const orderIdArray = req.headers.toclose.split(',');
    console.log("Ids", orderIdArray);

    if (orderIdArray && orderIdArray[0].length > 1) {
        try {
            const closePromises = orderIdArray.map(async (orderId) => {
                console.log("closing ---- ", orderId);
                if (orderId && req.userId) {
                    return await OrderModel.findByIdAndUpdate(orderId, {
                        $set: {
                            isClosed: true,
                            closedAt: Date.now(),
                            closedBy: req.userId
                        }
                    });
                } else {
                    throw new Error("Invalid orderId or userId");
                }
            });

            const closedOrders = await Promise.all(closePromises);
            console.log(closedOrders)
            // res.status(200).json({
            //     message: "Orders Closed",
            //     orders: closedOrders.filter(order => order) // Filter out null results
            // });
        } catch (err) {
            console.error(err);
            // res.status(500).json({
            //     message: "Error in Closing Orders",
            //     errData: err.message
            // });
        }
    }
    next();
};


module.exports = {
    closeOrderMiddleware : closeOrderMiddleware
}