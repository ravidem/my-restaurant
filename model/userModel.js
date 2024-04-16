const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    mobile: { type: Number, default: "", trim: true },
    role: {
        type: String,
        default: "USER",
        enum: ['ADMIN', 'USER']
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, default: '' },
        latitude: Number,
        longitude: Number
    },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    }  
},
    {
        timestamps: true
    });

module.exports = mongoose.model('User', userSchema);