const express = require("express");
const validateToken = require("../middlewares/validateTokenHandler");
const { getAllPosts, createPost, getPost, searchPosts, feed } = require("../controllers/postController");
const { likePost, fetchLikes } = require("../controllers/likeController");
const { getAllComments, createComment } = require("../controllers/commentController");

const router = express.Router();

router.route("/")
    .get(getAllPosts)
    .post(validateToken,createPost);

router.get('/search',searchPosts);
router.get('/feed',validateToken,feed)

router.route("/:postID/like")
    .post(validateToken,likePost)
    .get(validateToken,fetchLikes)
    
router.route('/:postID/comments')
    .post(validateToken,createComment)
    .get(validateToken,getAllComments)

router.route("/:postID")
    .get(validateToken,getPost)
    .delete(validateToken)
    .put(validateToken);



module.exports = router;