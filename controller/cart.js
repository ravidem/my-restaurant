const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Cart = require("../model/cartModel")

exports.addCart = async (req, res) => {
    try {
        const { products, userId } = req.body;

        // Calculate total price for the cart item
        const totalPrice = products.reduce((acc, product) => acc + (product.price * product.quantity), 0);

        // Create a new cart item
        const cartItem = new Cart({
            products,
            totalPrice,
            userId
        });

        await cartItem.save();

        res.status(201).send({
            status: 'success',
            message: 'cart saved successfully',
        });

    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

exports.editCart = async (req, res) => {
    try {
        const { cartId } = req.params; 
        const { products } = req.body;

        // Calculate total price for the cart item
        const totalPrice = products.reduce((acc, product) => acc + (product.price * product.quantity), 0);

        const updatedCartItem = await Cart.findOneAndUpdate(
            { _id: cartId },
            { $set: { products, totalPrice } },
            { new: true }
        );

        if (!updatedCartItem) {
            return res.status(404).send({
                status: 'error',
                message: 'Cart item not found',
            });
        }

        res.status(200).send({
            status: 'success',
            message: 'Cart item updated successfully',
            cartItem: updatedCartItem,
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.getCart = async (req, res) => {
    try {
        const cartId = req.params.cartId;

        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).send({ message: "Cart not found" });
        }

        return res.status(200).send({
            message: 'Cart found',
            data: cart
        });

    } catch (error) {
        console.error('Error retrieving Cart:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.deleteCart = async (req, res) => {
    try {
        const cartId = req.params.cartId;

        const deletedcart = await Cart.findByIdAndDelete(cartId);

        if (!deletedcart) {
            return res.status(404).send({ message: 'cart not found' });
        }

        return res.status(200).send({ message: 'cart deleted' });
    } catch (error) {
        console.error('Error deleting cart:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};