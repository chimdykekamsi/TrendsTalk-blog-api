const express = require("express");
const validateToken = require("../middlewares/validateTokenHandler");
const { getAllCategories, createCategory, getCategory } = require("../controllers/categoryController");

const router = express.Router();

router.route('/')
    .get(getAllCategories)
    .post(validateToken,createCategory)

router.route('/:categoryId')
    .get(getCategory)
    .put(getCategory)
    .delete(getCategory)

module.exports = router;