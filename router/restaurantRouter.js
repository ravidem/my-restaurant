const express = require("express");
const router = express.Router();
const restaurant = require("../controller/restaurant");
const{authJWT}= require("../middleware/auth");
const{uploadLogo}= require("../service/imageService");



router.post("/addRestaurant",uploadLogo.single("logo"),restaurant.addRestaurant);
router.patch("/editLogo/:restaurantId",uploadLogo.single("logo"),restaurant.editLogo);
router.get("/getRestaurant/:restaurantId",restaurant.getRestaurant);
router.get("/getAllRestaurant",restaurant.getAllRestaurant);
router.get("/viewRestaurant/:userId",restaurant.viewRestaurant);
router.patch("/editrestaurant/:restaurantId",restaurant.editrestaurant);
router.delete("/deleteRestaurant/:restaurantId",restaurant.deleteRestaurant);

module.exports=router