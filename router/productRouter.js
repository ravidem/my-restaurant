const express = require("express");
const router = express.Router();
const product = require("../controller/product");
const{authJWT}= require("../middleware/auth");
const{uploadProduct}= require("../service/imageService");


router.post("/addProduct",uploadProduct.single("image"),product.addProduct);
router.patch("/editProductImage/:productId",uploadProduct.single("image"),product.editProductImage);
router.get("/getProduct/:productId",product.getProduct);
router.get("/getAllProduct",product.getAllProduct);
router.patch("/editProduct/:productId",product.editProduct);
router.delete("/deleteProduct/:productId",product.deleteProduct);

module.exports=router