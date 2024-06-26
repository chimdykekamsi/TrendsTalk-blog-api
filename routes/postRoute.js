const express = require("express");
const validateToken = require("../middlewares/validateTokenHandler");
const { getAllPosts, createPost, getPost, searchPosts, feed, updatePost, deletePost } = require("../controllers/postController");
const { likePost, fetchLikes } = require("../controllers/likeController");
const { getAllComments, createComment, updateComment, deleteComment, getComment } = require("../controllers/commentController");
const {uploadImagesToCloudinary} = require("../middlewares/uploadToCloudinary");
const multer = require('multer');

// Set up multer middleware
const upload = multer({ dest: 'uploads/' }); 

const router = express.Router();

router.route("/")
    .get(getAllPosts)
    .post(validateToken,upload.array('images'),uploadImagesToCloudinary,createPost);

router.get('/search',searchPosts);
router.get('/feed',validateToken,feed)

router.route("/:postID/like")
    .post(validateToken,likePost)
    .get(fetchLikes)
    
router.route('/:postID/comments')
    .post(validateToken,createComment)
    .get(getAllComments)

router.route('/:postID/comments/:commentId')
    .put(validateToken,updateComment)
    .get(getComment)
    .delete(validateToken,deleteComment)

router.route("/:postID")
    .get(validateToken,getPost)
    .delete(validateToken,deletePost)
    .put(validateToken,upload.array('images'),uploadImagesToCloudinary,updatePost);



module.exports = router;