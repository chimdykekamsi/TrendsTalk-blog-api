const asyncHandler = require("express-async-handler");
const Post = require("../modules/postModule");
const User = require("../modules/userModule");
const Category = require("../modules/categoryModule");

// Private function to filter Posts based on queries like tags, search etc.
const filteredPosts = asyncHandler(async (req) => {
    const { tags, author } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let posts;

    // Apply filters based on query parameters
    if (tags && Array.isArray(tags)) {
        const tagsRegex = tags.map(tag => new RegExp(tag, 'i'));
        posts = await Post.find({ tags: { $in: tagsRegex } }).populate('author', 'username').populate('category','title').skip(skip).limit(limit);
    } else if (tags) {
        const tagsRegex = new RegExp(tags, 'i');
        posts = await Post.find({ tags: tagsRegex }).populate('author', 'username').populate('category','title').skip(skip).limit(limit);
    } 
    
    if (author) {
        const authorRegex = new RegExp(author.username, 'i'); 
        posts = await Post.find({ 'author.username': authorRegex }).populate('author', 'username').populate('category','title').skip(skip).limit(limit);
    } 

    let _posts = posts.map((post) => {
        return {
            id: post.id,
            author: post.author.username,
            title: post.title,
            content: post.content,
            date: post.createdAt,
            tags: post.tags,
            category: post.category,
            viewCount: post.views.length,
            likeCount: post.likes.length,
            dislikeCount: post.dislikes.length,
            commentsCount: post.comments.length
        };
    });

    return _posts;
});



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
            const posts = await Post.find().populate('author', 'username').populate('category','title').sort({createdAt: -1}).skip(skip).limit(limit);

            _posts = posts.map((post) => {
                return {
                    id: post.id,
                    author: post.author.username,
                    title: post.title,
                    content: post.content,
                    category: post.category.title || null,
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
        const {title,content,tags,category} = req.body;

        if (!title || !content || !tags || !category) {
            res.status(400);
            throw new Error("All fields are required!");
        }

        const role = req.user.role;
        if (!role || role == "reader") {
            res.status(401);
            throw new Error("You are not authorized to create a post \n Activate your account to become a blogger");
        }else{
            const _category = await Category.findById(category);
            if (!_category) {
                res.status(404);
                throw new Error("Category Selected for this post does not exist")
            }
            const post = await Post.create({
                author: req.user.id,
                title,
                content,
                tags,
                category
            });
            if (post) {                
                _category.posts.push(post.id);
                _category.save();
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
        const post = await Post.findById(postID).populate('category','title').populate('author', 'username');

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
            category: post.category.title,
            categoryId: post.category._id,
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
    const { query } = req.query;
    let _posts = [];

    if (!query) {
        res.status(400);
        throw new Error("Search term is required");
    }

    let searchQuery = {
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
        ],
    };

    const user = await User.findOne({ username: { $regex: query, $options: 'i' }  });
    // console.log(user);
    if (user) {
        searchQuery.$or.push({ 'author': user._id });
    }

    console.log(searchQuery);
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

// Method GET
// Endpoint {baseUrl}/posts/feed
// Desc Get a personalized feed based on user preferences (viewed and liked posts)
// Access Authorized Users

const feed = asyncHandler(
    async(req,res,next)=>{
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit)||10;
            const skip = (page - 1) * limit;

            const user = req.user;
    
            // Retrieve user's liked posts
            const userLikedPosts = await Post.find({ 'likes.liker': user.id });
    
            // Retrieve user's viewed posts
            const userViewedPosts = await Post.find({ 'views.viewer': user.id });
    
            // Combine and deduplicate liked and viewed posts
            const userInteractions = [...userLikedPosts, ...userViewedPosts];
            const uniqueInteractions = Array.from(new Set(userInteractions.map(post => post.id)))
                .map(id => userInteractions.find(post => post.id === id));


            // Sort posts by most views and likes
            const sortedPosts = uniqueInteractions.sort((a, b) => {
                const aInteractionCount = a.views.length + a.likes.length;
                const bInteractionCount = b.views.length + b.likes.length;
                return bInteractionCount - aInteractionCount;
            });
    
            // Retrieve tags of liked or viewed posts
            const userTags = sortedPosts.reduce((tags, post) => {
                return tags.concat(post.tags);
            }, []);

            
            // If the user hasn't liked any post yet, prioritize by most liked posts
            if (userTags < 1) {
                const posts = await Post.find().populate('author', 'username').sort({views: -1}).skip(skip).limit(limit);
    
                // Format the response as needed
                const formattedFeed = posts.map(post => ({
                    id: post.id,
                    author: post.author.username,
                    title: post.title,
                    content: post.content,
                    date: post.createdAt,
                    tags: post.tags,
                    viewsCount: post.views.length,
                    likesCount: post.likes.length,
                    dislikesCount: post.dislikes.length,
                    commentsCount: post.comments.length
                }));
    
                return res.status(200).json(formattedFeed);
            }
    

            // Filter personalized feed based on user's tags
            const userFeed = await Post.find({ tags: { $in: userTags } });
    
            // Format the response as needed
            const formattedFeed = userFeed.map(post => ({
                id: post.id,
                author: post.author.username,
                title: post.title,
                content: post.content,
                date: post.createdAt,
                tags: post.tags,
                viewsCount: post.views.length,
                likesCount: post.likes.length,
                dislikesCount: post.dislikes.length,
                commentsCount: post.comments.length
            }));
    
            res.status(200).json(formattedFeed);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        
    }
);

module.exports = {
    getAllPosts,
    createPost,
    getPost,
    searchPosts,
    feed
}