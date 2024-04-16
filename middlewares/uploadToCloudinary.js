const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs');

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImagesToCloudinary = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (!role || role == "reader") {
            res.status(401);
            throw new Error("You are not authorized to create a post \n Activate your account to become a blogger");
        }else{
            const images = req.files; // Assuming you're using multer or similar middleware to handle file uploads

            // Upload each image to Cloudinary and get the URLs
            const uploadedImages = await Promise.all(images.map(async (image) => {
                const result = await cloudinary.uploader.upload(image.path, {folder: "TrendsTalkAssets"});
                return {
                    url: result.secure_url,
                    originalname: image.originalname
                }; // Get the URL of the uploaded image
            }));
            

            req.body.images = uploadedImages;
            images.forEach(image => {
                const filePath = image.path;
                fs.unlinkSync(filePath);
            });
            next();
        }
    

    } catch (error) {
        const statusCode = res.statusCode ? res.statusCode : 500;
        res.status(statusCode).json({
            message: error.message,
            stackTrace: error.stack
        });
    }
};
 module.exports = uploadImagesToCloudinary;