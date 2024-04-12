const multer = require("multer");
const path = require("path");
require('dotenv').config();

// Function to dynamically set the destination directory based on the route
const destination = (req, file, cb) => {
    let uploadPath;
    const rootDirectory = path.resolve(__dirname);
    if (req.originalUrl.startsWith('/api/posts')) {
        uploadPath = path.join(rootDirectory, '..', 'uploads', 'posts');
    } else if (req.originalUrl.startsWith('/api/users')) {
        uploadPath = path.join(rootDirectory, '..', 'uploads', 'users');
    } else {
        // Default upload path
        uploadPath = path.join(rootDirectory, '..', 'uploads');
    }
    console.log(uploadPath);
    cb(null, uploadPath);
};


// Multer disk storage configuration
const storage = multer.diskStorage({
    destination: destination,
    filename: (req, file, cb) => {
        // Use Date.now() to make sure the file name is unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Keep the original file extension
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// Multer upload configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25 MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Check file types, for example, accept only images
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});



module.exports = upload;
