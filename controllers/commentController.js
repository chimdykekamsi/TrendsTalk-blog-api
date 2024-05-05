const asyncHandler = require("express-async-handler");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");

// Method GET
// Endpoint {baseUrl}/posts/:postID/comments
// Desc Gets all comments under a post
// Access Authorized users only

const getAllComments = asyncHandler(
    async(req,res,next)=>{
        let _comments = [];
        const {postID} = req.params;
        const post = await Post.findById(postID);
        if (!post) {
            res.status(404);
            throw new Error("Post requested not found");
        }
        const comments = await Comment.find({post:postID}).populate('user','username').populate("post","title");


        _comments = comments.map((_comment) => {
            const {user,post,comment,likes,dislikes} = _comment;
            return{
                id: _comment._id,
                user: user.username,
                comment,
                post: post.title,
                likes,
                likeCount: likes.length,
                dislikes,
                dislikeCount: dislikes.length
            }
        })

        return res.status(200)
            .json(_comments);
    }
)

// Method GET
// Endpoint {baseUrl}/posts/:postID/comments/:commentId
// Desc Gets comment under a post by Id
// Access Authorized users only

const getComment = asyncHandler(
    async(req,res,next)=>{
        const {postID, commentId} = req.params;
        const post = await Post.findById(postID);
        if (!post) {
            res.status(404);
            throw new Error("Post requested not found");
        }
        const comment = await Comment.findOne({post:postID}).populate('user','username').populate("post","title");

        if (!comment) {
            return res.status(404)
                .json({
                    message: "Comment not found"
                });
        }

        return res.status(200)
            .json(comment);
    }
)

// Method POST
// Endpoint {baseUrl}/posts/:postID/comments
// Desc Create a comment under a post
// Access Authorized users only

const createComment = asyncHandler(
    async(req,res,next)=>{
        const {postID} = req.params;
        const {content} = req.body; 
        const {id} = req.user;

        const author = await User.findById(id);
        if (!author) {
            res.status(404);
            throw new Error("Error finding author for this user \n login with an apropriate user");
        }

        if (!content) {
            res.status(401);
            throw new Error("All fields are required");
        }

        const post = await Post.findById(postID);

        if (!post) {
            res.status(404);
            throw new Error("post not found");
        }
        const comment = await Comment.create({
            post: post.id,
            user: author,
            comment: content
        });

        if (!comment) {
            res.status(500);
            throw new Error("An error ocurred while adding comment");
        }

        post.comments.push(comment.id);
        post.save();

        return res.status(201)
            .json({
                message: "Comment created with success",
                comment
            });

    }
)

// Method PUT
// Endpoint {baseUrl}/posts/:postID/comments/:commentId
// Desc fetch comment by comment id and replace with the new comment in the request body comment can only be edited by the creators of the comment
// Access Comment Authors only

const updateComment = asyncHandler(
    async(req,res,next)=>{
        const {postID,commentId} = req.params;
        const {content} = req.body; 
        const {id} = req.user;
        const author = await User.findById(id);
        if (!author) {
            res.status(404);
            throw new Error("Error finding author for this user \n login with an apropriate user");
        }
        const post = await Post.findById(postID);
        if (!post) {
            res.status(404);
            throw new Error("post not found");
        }
        const comment = await Comment.findById(commentId).populate('user','username');
        if (!comment) {
            res.status(404);
            throw new Error("comment not found");
        }
        if (author.username!== comment.user.username) {
            res.status(401);
            throw new Error("Unauthorized Access Only Comment authors can edit this comment");
        }
        if (!content) {
            res.status(401);
            throw new Error("All fields are required");
        }
        comment.comment = content;
        await comment.save();
        return res.status(200)
        .json({
             message: "Comment updated with success",
             comment
         });
    }
)

// Method DELETE
// Endpoint {baseUrl}/posts/:postID/comments/:commentId
// Desc fetch comment by comment id and delete comment can only be deleted by the creators of the comment or admins
// Access Comment Authors and admins

const deleteComment = asyncHandler(
    async(req,res)=>{
        const {postID,commentId} = req.params;
        const {id} = req.user;
        const author = await User.findById(id);
        if (!author) {
            res.status(404);
            throw new Error("Error finding author for this user \n login with an apropriate user");
        }
        const post = await Post.findById(postID);
        if (!post) {
            res.status(404);
            throw new Error("post not found");
        }
        const comment = await Comment.findById(commentId).populate('user','username');
        if (!comment) {
            res.status(404);
            throw new Error("comment not found");
        }
        if (author.username!== comment.user.username && req.user.role !== "admin") {
            res.status(401);
            throw new Error("Unauthorized Access Only Comment authors can edit this comment");
        }

        await Comment.findByIdAndDelete(commentId);
        return res.status(200)
            .json({
                message: "comment deleted",
            })
    }
)


module.exports = {getAllComments,createComment,updateComment, getComment, deleteComment}