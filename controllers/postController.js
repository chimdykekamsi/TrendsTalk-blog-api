const asyncHandler = require("express-async-handler");
const Post = require("../modules/postModule");
// Private function to filter Posts based on queries like tags,

// Method GET
// Endpoint {baseUrl}/posts/
// Desc Get all posts
// access Public

const getAllPosts = asyncHandler(
    async (req, res, next) => {
        const posts = await Post.find().populate('author', 'username');

        const _posts = posts.map((post) => {
            return {
                id: post.id,
                author: post.author.username,
                title: post.title,
                content: post.content,
                tags: post.tags,
                views: post.views.length, // Using virtual property
                likes: post.likes.length, // Using virtual property
                dislikes: post.dislikes.length, // Using virtual property
            };
        });

        res.status(200).json(_posts);

    }
);

// Method POST
// Endpoint {baseUrl}/posts
// Desc Create new post
// Access Authorized Users

const createPost = asyncHandler(
    async (req, res, next) => {
        const {title,content,tags} = req.body;

        if (!title || !content) {
            res.status(400);
            throw new Error("All fields are required!");
        }

        const role = req.user.role;
        if (!role || role == "reader") {
            res.status(400);
            throw new Error("You are not authorized to create a post \n Activate your account to become a blogger");
        }else{
            const post = await Post.create({
                author: req.user.id,
                title,
                content,
                tags
            });
            if (post) {
                const {id,title,content,tags} = post;
                res.status(201)
                    .json({
                        title: "Post created",
                        messge: "Post has been created and stored",
                        post: {
                            title,
                            content,
                            tags,
                            id
                        }
                    })
            }
        }
    }
);


// Method GET
// Endpoint {baseUrl}/posts/{postID}
// Desc Get a single post based on postID and increment view count with the logged in user id
// Access Authorized Users

const getPost = asyncHandler(async (req, res, next) => {
    const postID = req.params.postID;
    const viewerID = req.user.id;

    try {
        const post = await Post.findById(postID).populate('author', 'username');

        if (!post) {
            res.status(404);
            throw new Error("Post not found");
        }

        // Check if the viewer has already viewed the post
        const hasViewed = post.views.some((view) => view.viewer.equals(viewerID));

        if (!hasViewed) {
            // If the viewer hasn't viewed the post, increment views and add the viewer
            post.views.push({ viewer: viewerID });
            await post.save();
        }

        const _post = {
            author: post.author.username, // Access username through the populated author field
            title: post.title,
            content: post.content,
            tags: post.tags,
            views: post.views, 
            viewCount: post.views.length, 
            likes: post.likes,
            likeCount: post.likes.length,
            dislikes: post.dislikes,
            dislikeCount: post.dislikes.length,
        };

        res.status(200).json(_post);
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});




module.exports = {
    getAllPosts,
    createPost,
    getPost
}