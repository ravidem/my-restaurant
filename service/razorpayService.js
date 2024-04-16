const Razorpay = require('razorpay');


const razorpay = new Razorpay({
    key_id: process.env.ROZORPAY_ID_KEY,
    key_secret: process.env.ROZORPAY_SECRET_KEY 
});

exports.createOrder = async (totalAmount, orderId) => {
    try {
        const amount = totalAmount * 100; // Convert totalAmount to paise
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'order_receipt_' + orderId, // Use your own order ID from the database
        };

        return new Promise((resolve, reject) => {
            razorpay.orders.create(options, (error, razorpayOrder) => {
                if (error) {
                    console.error(error);
                    reject('Failed to create Razorpay order');
                } else {
                    resolve(razorpayOrder);
                }
            });
        });
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
    }
};