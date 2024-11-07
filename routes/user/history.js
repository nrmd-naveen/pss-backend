

app.get('/orders/closed', async (req, res) => {
    const { userId } = req.query;  // Assume userId is passed as a query parameter

    try {
        // Step 1: Find orders created by the user
        const orders = await Order.aggregate([
            {
                $match: { createdBy: mongoose.Types.ObjectId(userId), isClosed: true }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByUser'
                }
            },
            {
                $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookings',
                    foreignField: '_id',
                    as: 'bookings'
                }
            },
            {
                $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'items',
                    localField: 'bookings.item',
                    foreignField: '_id',
                    as: 'bookings.itemDetails'
                }
            },
            {
                $unwind: { path: '$bookings.itemDetails', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    createdBy: '$createdByUser.name',
                    closedAt: 1,
                    createdAt: 1,
                    bookings: 1,
                    'bookings.bookedBy': 1,
                    'bookings.itemDetails.name': 1,
                    'bookings.itemDetails.price': 1,
                    'bookings.quantity': 1
                }
            },
            {
                $group: {
                    _id: '$_id',
                    createdBy: { $first: '$createdBy' },
                    createdAt: { $first: '$createdAt' },
                    closedAt: { $first: '$closedAt' },
                    bookings: { $push: '$bookings' }
                }
            }
        ]);

        // Step 2: Format the response
        const formattedOrders = orders.map(order => {
            const totalValue = order.bookings.reduce((total, booking) => {
                return total + booking.itemDetails.price * booking.quantity;
            }, 0);

            return {
                id: order._id.toString(),
                createdBy: order.createdBy,
                paidBy: order.bookings.length > 0 ? order.bookings[0].bookedBy : null, // Assuming 'paidBy' is equal to 'bookedBy' of the first booking
                createdAt: order.createdAt.toISOString(),
                closedAt: order.closedAt ? order.closedAt.toISOString() : null,
                totalValue: totalValue,
                bookingsCount: order.bookings.length,
                bookings: order.bookings.map(booking => ({
                    id: booking._id.toString(),
                    bookedBy: booking.bookedBy,
                    item: booking.itemDetails.name,
                    quantity: booking.quantity,
                    price: booking.itemDetails.price
                }))
            };
        });

        // Step 3: Return the formatted result
        res.status(200).json(formattedOrders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching the orders.' });
    }
});
