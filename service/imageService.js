const multer  = require('multer')

const logo  = multer.diskStorage({
    destination: "public/logoImage",
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_"  + Date.now() + ".png");
    },
  });
  console.log(logo);
  
  const uploadLogo = multer({
    storage: logo 
  });

  const product  = multer.diskStorage({
    destination: "public/productImage",
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_"  + Date.now() + ".png");
    },
  });
  console.log(logo);
  
  const uploadProduct = multer({
    storage: product 
  });

  module.exports={
    uploadLogo,
    uploadProduct
  }