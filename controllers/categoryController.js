const asyncHandler = require("express-async-handler");
const Category = require("../modules/categoryModule");
const Post = require("../modules/postModule");

// Private function to get posts under a category
const get_cat_posts = asyncHandler(
    async(categoryId) => {
        const categoryPosts = await Post.find({category:categoryId});
        let _categoryPosts = [];
        _categoryPosts = categoryPosts.map((post) => {
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
            }
        });
        return _categoryPosts;
    }
)

// Method GET
// Endpoint {baseUrl}/categories/
// Desc Gets all categories
// Access Public

const getAllCategories = asyncHandler(
    async (req, res, next) => {
        let _categories = [];

        
        const categories = await Category.find();

        _categories = categories.map((category) => {
            return {
                id: category.id,
                title: category.title,
                posts: category.posts,
            };
        });

        res.status(200).json(_categories);

    }
);

// Method GET
// Endpoint {baseUrl}/categories/:categoryId
// Desc Gets all categories
// Access Public

const getCategory = asyncHandler(
    async(req,res,next) => {
        const {categoryTitle} = req.params;
        const category = await Category.findOne({ title: { $regex: new RegExp('^' + categoryTitle + '$', 'i') } });
        
        if (!category) {
            res.status(404);
            throw new Error("Category not found");
        };
        
        const categoryId = category.id;
        const posts = await get_cat_posts(categoryId);
        return res.status(200)
        .json({
            title: category.title,
            posts
        });
    }
);

// Method POST
// Endpoint {baseUrl}/categories/
// Desc Add a category to the database
// Access Admins only

const createCategory = asyncHandler(
    async(req, res) => {
        const {title} = req.body;
        if (!title) {
            res.status(400);
            throw new Error("All fields are required!");
        }

        const {role} = req.user;

        if (role !== "admin") {
            res.status(401);
            throw new Error("Unauthorized access");
        }

        const newCategory = await Category.create({
            title: title
        });

        return res.json({
            message: "New Category created",
            newCategory
        })
    }
)


module.exports = {getAllCategories, createCategory, getCategory}