const express = require("express");
const router = express.Router();
const user = require("../controller/user");
const{authJWT}= require("../middleware/auth");


router.post("/addUser",user.addUser);
router.post("/login",user.login);
router.get("/getUser/:userId",user.getUser);
router.get("/getAllUser",user.getAllUser);
router.patch("/editUser/:userId",user.editUser);
router.delete("/deleteUser/:userId",user.deleteUser);
router.post("/forgotPassword",user.forgotPassword);
router.post("/resetPassword",user.resetPassword);

module.exports=router