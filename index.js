const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
require("./config/mongodb"); // db connect
const path = require('path');


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname,'/public')));

// User router 
const userRouter = require("./router/userRouter");
app.use(userRouter)
//restaurant router
const restaurantRouter = require("./router/restaurantRouter");
app.use(restaurantRouter)
//product router
const productRouter = require("./router/productRouter");
app.use(productRouter)
//cart router
const cartRouter = require("./router/cartRouter");
app.use(cartRouter)
//order router
const orderRouter = require("./router/orderRouter");
app.use(orderRouter)
//viewer router
const viewerRouter = require("./router/viewerRouter");
app.use(viewerRouter)

// Error middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});
