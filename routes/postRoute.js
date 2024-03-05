const express = require("express");
const validateToken = require("../middlewares/validateTokenHandler");
const { getAllPosts, createPost, getPost, searchPosts } = require("../controllers/postController");
const { likePost, fetchLikes } = require("../controllers/likeController");

const router = express.Router();

router.route("/")
    .get(getAllPosts)
    .post(validateToken,createPost);

router.get('/search',searchPosts);

router.route("/:postID/like")
    .post(validateToken,likePost)
    .get(validateToken,fetchLikes)

router.route("/:postID")
    .get(validateToken,getPost)


module.exports = router;