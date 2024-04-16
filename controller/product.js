const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Product = require("../model/productModel")
const fs = require('fs');

exports.addProduct = async (req, res) => {
    try {
        const details = req.body;
        const image = req.file;

        let productData = new Product(details);
        if (image) {
            productData.image = image.filename
        }
        await productData.save();

        res.status(201).send({
            status: 'success',
            message: 'product saved successfully',
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

exports.getProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send({ message: "product not found" });
        }

        return res.status(200).send({
            message: 'product found',
            data: product
        });

    } catch (error) {
        console.error('Error retrieving product:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.getAllProduct = async (req, res) => {
    try {
        const { restaurantId, category, name, available } = req.query;

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        let query = {};

        if (restaurantId) {
            query = { restaurant: restaurantId };
        }
        if (category) {
            query['category'] = { $regex: category, $options: 'i' };
        }
        if (name) {
            query['name'] = { $regex: name, $options: 'i' };
        }
        if (available) {
            query['isAvailable'] = available;
        }

        const product = await Product.find(query)
            .skip(skip)
            .limit(pageSize);

        if (!product || product.length === 0) {
            return res.status(404).send({ message: "product not found" });
        }

        const totalRecords = await Product.countDocuments(query);

        res.status(200).send({
            message: 'Success',
            currentPage: page,
            pageSize: pageSize,
            totalRecords: totalRecords,
            data: product,
        });

    } catch (error) {
        console.error('Error retrieving product:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.editProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const productData = await Product.findByIdAndUpdate(
            productId,
            { $set: req.body },
            { new: true }
        );

        if (!productData) {
            return res.status(404).send({ message: 'product not found' });
        }

        return res.status(200).send({
            message: 'product updated',
            data: productData,
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).send({ message: 'Product not found' });
        }

        return res.status(200).send({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting Product:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.editProductImage = async (req, res) => {
    try {
        const productId = req.params.productId;
        const image = req.file;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'product not found' });
        }

        // Delete previous logo if exists
        if (product.image) {
            fs.unlinkSync(`./public/productImage/${product.image}`);
            console.log('Previous image deleted successfully');
        }

        // Update restaurant with new logo
        const updatedproduct = await Product.findByIdAndUpdate(
            productId,
            { $set: { image: image.filename } },
            { new: true }
        );

        return res.status(200).json({
            message: 'product image updated successfully',
            data: updatedproduct,
        });
    } catch (error) {
        console.error('Error updating updatedproduct image:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};