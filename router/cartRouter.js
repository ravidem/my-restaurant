const express = require("express");
const router = express.Router();
const cart = require("../controller/cart");
const{authJWT}= require("../middleware/auth");


router.post("/addCart",cart.addCart);
router.get("/getCart/:cartId",cart.getCart);
router.patch("/editCart/:cartId",cart.editCart );
router.delete("/deleteCart/:cartId",cart.deleteCart);

module.exports=router