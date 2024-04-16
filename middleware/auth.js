const jwt = require("jsonwebtoken")


exports.authJWT = (req, res, next) => {
    var token = req.headers['authorization'] || req.headers['Authorization']
    if (token) {
        token = token.split(' ')[0];
        var privateKey = process.env.PRIVATE_KEY
        jwt.verify(token, privateKey, function (err, docs) {
            if (err) {
                return res.status(401).send({ message: "Please provide valid token" })
            } else {
                next();
            }
        })
    } else {
        return res.status(403).send({ message: 'Please provide valid token' })
    }
}