const asyncHandler = require("express-async-handler");
const Post = require("../modules/postModule");

// Private function to filter Posts based on queries like tags, search etc.
const filteredPosts = asyncHandler(
    async (req) => {
        const {tags,author} = req.query; 
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit)||10;
        const skip = (page - 1) * limit;
        let posts = await Post.find().populate('author', 'username').skip(skip).limit(limit);

        // Apply filters based on query parameters
        if (tags && Array.isArray(tags)) {
            posts = await Post.find({ tags: { $in: tags } }).populate('author', 'username').skip(skip).limit(limit);
        }else if(tags){
            posts = await Post.find({ tags: tags }).populate('author', 'username').skip(skip).limit(limit);
        }
        if(author){
            posts = await Post.find({ username: author.username }).populate('author', 'username').skip(skip).limit(limit);
        }

        let _posts = posts.map((post) => {
            return {
                id: post.id,
                author: post.author.username,
                title: post.title,
                content: post.content,
                date:post.createdAt,
                tags: post.tags,
                viewCount: post.views.length, 
                likeCount: post.likes.length, 
                dislikeCount: post.dislikes.length,
                commentsCount: post.comments.length
            };
        });

        return _posts;
    }
);


// Method GET
// Endpoint {baseUrl}/posts/
// Desc Get all posts
// access Public

const getAllPosts = asyncHandler(
    async (req, res, next) => {
        let _posts = [];

        if (req.query.tags || req.query.author) {
            _posts = await filteredPosts(req);
        }else{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit)||10;
            const skip = (page - 1) * limit;
            const posts = await Post.find().populate('author', 'username').skip(skip).limit(limit);

            _posts = posts.map((post) => {
                return {
                    id: post.id,
                    author: post.author.username,
                    title: post.title,
                    content: post.content,
                    tags: post.tags,
                    date:post.createdAt,
                    viewsCount: post.views.length, // Using virtual property
                    likesCount: post.likes.length, // Using virtual property
                    dislikesCount: post.dislikes.length, // Using virtual property
                    commentsCount: post.comments.length
                };
            });
        }

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
            res.status(401);
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
                return res.status(201)
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
// Endpoint {baseUrl}/posts/:postID
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
            date:post.createdAt,
            views: post.views, 
            viewCount: post.views.length, 
            likes: post.likes,
            likeCount: post.likes.length,
            dislikes: post.dislikes,
            dislikeCount: post.dislikes.length,
            comments: post.comments,
            commentsCount: post.comments.length
        };

        res.status(200).json(_post);
    } catch (error) {
        res.status(404);
        throw new Error("Post Not found");
    }
});


// Method GET
// Endpoint {baseUrl}/posts/search
// Desc Search post array based on part of the title or the content
// Access Every User

const searchPosts = asyncHandler(async (req, res, next) => {
    const { query, tags, author } = req.query;
    let _posts = [];

    if (!query) {
        res.status(400);
        throw new Error("Search term is required");
    }
    let searchQuery = {
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
        ],
    };

    if (tags && Array.isArray(tags)) {
        searchQuery.tags = { $in: tags };
    } else if (tags) {
        searchQuery.tags = tags;
    }

    if (author) {
        searchQuery['author.username'] = { $regex: author, $options: 'i' };
    }

    const posts = await Post.find(searchQuery).populate('author', 'username');

    _posts = posts.map((post) => {
        return {
            id: post._id,
            author: post.author.username,
            title: post.title,
            content: post.content,
            date: post.createdAt,
            tags: post.tags,
            views: post.views.length,
            likes: post.likes.length,
            dislikes: post.dislikes.length,
        };
    });

    res.status(200).json(_posts);
});


module.exports = {
    getAllPosts,
    createPost,
    getPost,
    searchPosts
}