const express = require("express");
const validateToken = require("../middlewares/validateTokenHandler");
const { getAllPosts, createPost, getPost } = require("../controllers/postController");

const router = express.Router();

router.route("/")
    .get(getAllPosts)
    .post(validateToken,createPost);

router.route("/:postID")
    .get(validateToken,getPost)

module.exports = router;