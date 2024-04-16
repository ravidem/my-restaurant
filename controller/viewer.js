const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Restaurant = require("../model/restaurantModel")
const fs = require('fs');
const User = require("../model/userModel")

exports.getAllUsers = async (req, res) => {
    try {
        const { city, name, state, status } = req.query;

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        let query = {};

        if (status) {
            query = { status: status };
        }
        if (city) {
            query['address.city'] = city;
        }
        if (state) {
            query['address.state'] = state;
        }
        if (name) {
            query['name'] = { $regex: name, $options: 'i' };
        }
        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(pageSize);

        if (!users || users.length === 0) {
            return res.status(404).send({ message: "Users not found" });
        }

        const totalRecords = await User.countDocuments(query);

        res.status(200).send({
            message: 'Success',
            currentPage: page,
            pageSize: pageSize,
            totalRecords: totalRecords,
            data: users,
        });

    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.getAllRestaurants = async (req, res) => {
    try {
        const { restaurantId, status, city, name, contactPersonId } = req.query;

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        let query = {};

        if (status) {
            query = { status: status };
        }
        if (restaurantId) {
            query = { _id: restaurantId };
        }
        if (contactPersonId) {
            query = { contactPersonId: contactPersonId };
        }
        if (city) {
            query['address.city'] = city;
        }
        if (name) {
            query['name'] = { $regex: name, $options: 'i' };
        }
        const restaurant = await Restaurant.find(query)
            .skip(skip)
            .limit(pageSize);

        if (!restaurant || restaurant.length === 0) {
            return res.status(404).send({ message: "restaurant not found" });
        }

        const totalRecords = await Restaurant.countDocuments(query);

        res.status(200).send({
            message: 'Success',
            currentPage: page,
            pageSize: pageSize,
            totalRecords: totalRecords,
            data: restaurant,
        });

    } catch (error) {
        console.error('Error retrieving restaurant:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.userStatus = async (req, res) => {
    try {
        const userId = req.params.userId;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set:req.body},
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.status(200).send({
            message: 'User status updated',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.restaurantStatus = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const restaurantData = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $set:req.body},
            { new: true }
        );

        if (!restaurantData) {
            return res.status(404).send({ message: 'restaurant not found' });
        }

        return res.status(200).send({
            message: 'restaurant status updated',
            data: restaurantData,
        });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};