const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Restaurant = require("../model/restaurantModel")
const fs = require('fs');
const User = require("../model/userModel")


exports.addRestaurant = async (req, res) => {
    try {
        const details = req.body;
        const image = req.file
        let restaurantData = new Restaurant(details);
        if (image) {
            restaurantData.logo = image.filename
        }
        await restaurantData.save();

        res.status(201).send({
            status: 'success',
            message: 'Data saved successfully',
        });

    } catch (error) {
        console.error('Error saving restaurant:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

exports.getRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).send({ message: "restaurant not found" });
        }

        return res.status(200).send({
            message: 'restaurant found',
            data: restaurant
        });

    } catch (error) {
        console.error('Error retrieving restaurant:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.getAllRestaurant = async (req, res) => {
    try {
        const { restaurantId, city, name, contactPersonId } = req.query;

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        let query = {};

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

exports.editrestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const restaurantData = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $set: req.body },
            { new: true }
        );

        if (!restaurantData) {
            return res.status(404).send({ message: 'restaurant not found' });
        }

        return res.status(200).send({
            message: 'restaurant updated',
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

exports.deleteRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const deletedrestaurant = await Restaurant.findByIdAndDelete(restaurantId);

        if (!deletedrestaurant) {
            return res.status(404).send({ message: 'restaurant not found' });
        }

        return res.status(200).send({ message: 'restaurant deleted' });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.editLogo = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;
        const image = req.file;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Delete previous logo if exists
        if (restaurant.logo) {
            fs.unlinkSync(`./public/logoImage/${restaurant.logo}`);
            console.log('Previous logo deleted successfully');
        }

        // Update restaurant with new logo
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $set: { logo: image.filename } },
            { new: true }
        );

        return res.status(200).json({
            message: 'Restaurant logo updated successfully',
            data: updatedRestaurant,
        });
    } catch (error) {
        console.error('Error updating restaurant logo:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

exports.viewRestaurant = async (req, res) => {
    try {
        const userId = req.params.userId;
        const maxDistance = req.body.distance || 10;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const { latitude: userLat, longitude: userLon } = user.address;

        const restaurants = await Restaurant.find({});
        
        const distances = [];
        for (const restaurant of restaurants) {
            const { latitude: restLat, longitude: restLon } = restaurant.address;
            const distance = calculateDistance(userLat, userLon, restLat, restLon);
            
            // Check if the distance is within the maximum distance provided
            if (distance <= maxDistance) {
                distances.push({
                    restaurant: restaurant,
                    distance: distance
                });
            }
        }

        console.log(distances, "@@@@@@@@@@@@@@@")
        res.status(200).send({
            message: 'Success',
            data: distances
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
