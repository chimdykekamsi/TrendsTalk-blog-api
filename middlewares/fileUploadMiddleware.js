const multer = require("multer");
const path = require("path");

// Function to dynamically set the destination directory based on the route
const destination = (req, file, cb) => {
    let uploadPath;
    if (req.originalUrl.startsWith('/api/posts')) {
        uploadPath = path.join(__dirname, "../uploads/posts");
    } else if (req.originalUrl.startsWith('/api/users')) {
        uploadPath = path.join(__dirname, "../uploads/users");
    } else {
        // Default upload path
        uploadPath = path.join(__dirname, "../uploads");
    }
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
        file.finalname = uniqueSuffix + ext;
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
