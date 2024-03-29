const asyncHandler = require("express-async-handler");
const Comment = require("../modules/commentModule");
const Post = require("../modules/postModule");

// Method GET
// Endpoint {baseUrl}/posts/:postID/comments
// Desc Gets all comments under a post
// Access Authorized users only

const getAllComments = asyncHandler(
    async(req,res,next)=>{
        let _comments = [];
        const {postID} = req.params;
        const comments = await Comment.find({post:postID}).populate('post','title').populate('user','username');

        if (!comments) {
            res.status(404);
            throw new Error("Comments not found");
        };

        _comments = comments.map((_comment) => {
            const {user,post,comment,likes,dislikes} = _comment;
            return{
                post: post.title,
                user: user.username,
                comment,
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

// Method POST
// Endpoint {baseUrl}/posts/:postID/comments
// Desc Create a comment under a post
// Access Authorized users only

const createComment = asyncHandler(
    async(req,res,next)=>{
        const {postID} = req.params;
        const {content} = req.body; 
        const {id} = req.user;

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
            user: id,
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

module.exports = {getAllComments,createComment}