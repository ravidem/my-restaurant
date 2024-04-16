const express = require("express");
const router = express.Router();
const viewer = require("../controller/viewer");

const{authJWT}= require("../middleware/auth");


router.get("/getAllUsers",viewer.getAllUsers);
router.get("/getAllRestaurants",viewer.getAllRestaurants);
router.put("/userStatus/:userId",viewer.userStatus);
router.put("/restaurantStatus/:restaurantId",viewer.restaurantStatus);


module.exports=router