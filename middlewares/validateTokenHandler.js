const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(
    async(req,res,next) =>{
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if(!authHeader){
            return res.status(404).json({
                message: "No token provided"
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded) => {
            if(err){
                res.status(401);
                throw new Error("Invalid token");
            };
            req.user = decoded.user;
        });
        next();
    }
)

module.exports = validateToken;