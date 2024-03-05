const asyncHandler = require("express-async-handler");
const Post = require("../modules/postModule");

// Method POST
// Endpoint {baseUrl}/posts/:postID/like
// Desc Allows Users to like/unlike a post
// Access Authorized users

const likePost = asyncHandler(
    async (req, res, next) => {
        const { postID } = req.params;
        const { id } = req.user;
        const post = await Post.findById(postID);
        if (!post) {
            res.status(404);
            throw new Error("Post not found");
        };
        // Unlike post if already liked
        
        const hasLiked = post.likes.findIndex((like) => like && like.liker && like.liker.equals(id));
        if (hasLiked > -1) {
            post.likes.splice(post.likes.indexOf(hasLiked), 1);
            await post.save();
            return res.status(200).json({
                title: `Post unliked`,
                message: `You unliked this post`,
                likes: post.likes.length
            });
        };
        post.likes.push({liker:id});
        await post.save();
        return res.status(201).json({
            title: `Post liked`,
            message: `You liked this post`,
            likes: post.likes.length
        });
    }
);


// Method GET
// Endpoint {baseUrl}/posts/:postID/like
// Desc fetch all the likes for post :postID
// Access Authorized users

const fetchLikes = asyncHandler(
    async (req, res, next) => {
        const { postID } = req.params;
        const post = await Post.findById(postID).populate('likes.liker','username');
        if (!post) {
            res.status(404);
            throw new Error("Post not found");
        };
        const likes = post.likes;
        res.status(200).json({
            likes
        });
    }
);



module.exports = {likePost,fetchLikes}