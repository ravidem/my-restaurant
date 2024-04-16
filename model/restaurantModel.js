const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contactPersonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    description: {
        type: String,
    },
    openingHours: {
        monday: {
            open: String,
            close: String
        },
        tuesday: {
            open: String,
            close: String
        },
        wednesday: {
            open: String,
            close: String
        },
        thursday: {
            open: String,
            close: String
        },
        friday: {
            open: String,
            close: String
        },
        saturday: {
            open: String,
            close: String
        },
        sunday: {
            open: String,
            close: String
        }
    },
    website: {
        type: String,
    },
    logo: {
        type: String,
    },
    reviews: [{
        username: String,
        rating: Number,
        comment: String
    }],
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, default: '' },
        latitude: Number,
        longitude: Number
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    } 
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;