const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const Post = require("../models/postModel");

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
                commentsCount: post.comments.length,
                images: post.images
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
        
        // const containsSpaces = /\s/.test(title);

        // check if category title already exists make sure its case insensitive
        const categoryExists  = await Category.findOne({ title: { $regex: new RegExp('^' + title + '$', 'i') } });

        // if (containsSpaces) {
        //     res.status(400);
        //     throw new Error("Title cannot contain spaces");
        // }
        if (categoryExists) {
            res.status(400);
            throw new Error("Category already exists");
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

// Method PUT
// Endpoint {baseUrl}/categories/:categoryTitle
// Desc Fetch category by title and replace the title with the title in the request body
// Access Admins only

const updateCategory = asyncHandler(
    async(req, res) => {
        const {categoryTitle} = req.params;
        const {title} = req.body;
        const {role} = req.user;
        if (!title) {
            res.status(400);
            throw new Error("All fields are required!");
        }
        if (role!== "admin") {
            res.status(401);
            throw new Error("Unauthorized access");
        }
        const category = await Category.findOne({ title: { $regex: new RegExp('^' + categoryTitle + '$', 'i') } });
        if (!category) {
            res.status(404);
            throw new Error("Category not found");
        }
        category.title = title;
        await category.save();
        const categoryId = category.id;
        const posts = await get_cat_posts(categoryId);
        return res.status(201)
        .json({
            title: category.title,
            posts
        });
    });

// Method DELETE
// Endpoint {baseUrl}/categories/:categoryTitle
// Desc Fetch category by title and delete the category if there is no post under it
// Access Admins only

const deleteCategory = asyncHandler(
    async(req, res) => {
        const {categoryTitle} = req.params;
        const {role} = req.user;
        if (role !== "admin") {
            res.status(401);
            throw new Error("Unauthorized access");
        }
        const category = await Category.findOne({ title: { $regex: new RegExp('^' + categoryTitle + '$', 'i') } });
        if (!category) {
            res.status(404);
            throw new Error("Category not found");
        }
        const categoryId = category._id;
        const categoryPosts = category.posts;
        if (categoryPosts.length!== 0) {
            res.status(400);
            throw new Error("Category is not empty try migrating all posts to another category before deleting");
        }
        await Category.findByIdAndDelete(categoryId);
        return res.status(200).json({
            message: "Category deleted"
        });
    });

module.exports = {getAllCategories, createCategory, getCategory, updateCategory, deleteCategory}