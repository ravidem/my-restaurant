const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require("../model/userModel")
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { mailTransporter } = require('../service/emailService');



exports.addUser = async (req, res) => {
    try {
        const { name, password, email, mobile, role, address, orgId } = req.body;
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).send({ message: 'Email is already present in the database' });
        }

        const userData = new User({
            name,
            password: bcrypt.hashSync(password, 10),
            email,
            mobile,
            role,
            address,
            orgId
        });

        await userData.save();

        res.status(201).send({
            status: 'success',
            message: 'Data saved successfully',
        });

    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ message: "Invalid email" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).send({ message: "Invalid password" });
        }

        const privateKey = process.env.PRIVATE_KEY;
        const tokenPayload = {
            email: user.email,
            user: user._id,
            role: user.role
        };
        const token = jwt.sign(tokenPayload, privateKey, { expiresIn: "24h" });

        res.status(200).send({ message: "Login successful", token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        return res.status(200).send({
            message: 'User found',
            data: user
        });

    } catch (error) {
        console.error('Error retrieving user:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.getAllUser = async (req, res) => {
    try {
        const { orgId, city, name, state } = req.query;

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * pageSize;

        let query = {};

        if (orgId) {
            query = { orgId: orgId };
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

exports.editUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.status(200).send({
            message: 'User updated',
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

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.status(200).send({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token and set expiration time (1 hour in this example)
        const resetToken = Math.random().toString(36).slice(-8);
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save the token and expiration time to the user document
        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;
        await user.save();

        // Send reset email
        const resetLink = `http://your-frontend-url/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Click the link to reset your password: ${resetLink},
        expire in 1 hr`,
        };

        await mailTransporter.sendMail(mailOptions);

        return res.status(200).send({ message: 'Password reset email sent successfully', resetLink });
    } catch (error) {
        console.log('Error sending password reset email:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Reset password
        user.password = bcrypt.hashSync(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        return res.status(200).send({ message: 'Password reset successfully' });

    } catch (error) {
        console.log('Error resetting password:', error);
        res.status(500).send({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};