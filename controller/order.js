const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Order = require("../model/orderModel")
const Cart = require("../model/cartModel")
const { createOrder } = require('../service/razorpayService');

exports.addOrder = async (req, res) => {
    try {
        const { userId } = req.body;

        // Find cart items for the user
        const cartItems = await Cart.find({ userId }).populate('products.productId');

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send({ message: 'Cart is empty' });
        }

        let totalAmount = 0;
        const orderProducts = [];

        for (const cartItem of cartItems) {
            for (const product of cartItem.products) {
                const { productId, quantity, price } = product;
                totalAmount += price * quantity;
                orderProducts.push({
                    productId: productId._id,
                    quantity: quantity,
                    price: price
                });
            }
        }

        // Create order object
        const order = new Order({
            userId,
            cartItems: orderProducts,
            totalAmount,
        });

        // Save the order to the database
        await order.save();

        // Clear the user's cart (optional)
        await Cart.deleteMany({ userId });

        res.status(201).send({
            status: 'success',
            message: 'Order placed successfully',
            orderId: order._id
        });


    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find orders for the user
        const orders = await Order.find({ userId }).populate('cartItems.productId');

        if (!orders|| orders.length === 0) {
            return res.status(404).send({ message: "orders not found" });
        }

        res.status(200).json({
            status: 'success',
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.processPayment = async (req, res) => {
    try {
        const { totalAmount, orderId, paymentDetails } = req.body;

        const razorpayOrder = await createOrder(totalAmount, orderId);

        await Order.findByIdAndUpdate(
            orderId,
            { $set:{ status:"processing"} },
            { new: true }
        );

        // Handle success response
        res.status(200).json({ success: true, order: razorpayOrder });


    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.getAllOrder = async (req, res) => {
    try {
        const { userId, orderId, status} = req.query;

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        let query = {};

        if (userId) {
            query = { userId: userId };
        }
        if (orderId) {
            query = { _id: orderId };
        }
        if (status) {
            query['status'] = status;
        }
    
        const order = await Order.find(query)
        .populate('cartItems.productId')
            .skip(skip)
            .limit(pageSize);

        if (!order || order.length === 0) {
            return res.status(404).send({ message: "order not found" });
        }

        const totalRecords = await Order.countDocuments(query);

        res.status(200).send({
            message: 'Success',
            currentPage: page,
            pageSize: pageSize,
            totalRecords: totalRecords,
            data: order,
        });

    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};
