const express = require("express");
const validateToken = require("../middlewares/validateTokenHandler");
const { getAllCategories, createCategory, getCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.route('/')
    .get(getAllCategories)
    .post(validateToken,createCategory);

router.route('/:categoryTitle')
    .get(getCategory)
    .put(validateToken,updateCategory)
    .delete(validateToken,deleteCategory);

module.exports = router;