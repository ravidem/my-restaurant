const express = require("express");
const router = express.Router();
const order = require("../controller/order");
const{authJWT}= require("../middleware/auth");

router.post("/addOrder",order.addOrder);
router.get("/getOrder/:userId",order.getOrder);
router.get("/getAllOrder",order.getAllOrder);
router.post("/processPayment",order.processPayment);

module.exports=router