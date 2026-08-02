const express = require('express');
const router = express.Router()
const {createBlog , getAllBlogs ,getBlogById ,updateBlog ,deleteBlog} =require("../controllers/blogController")
const {protect} = require("../middlewares/authMiddleware")
const upload = require("../middlewares/upload");

// Create Blog
router.post("/", upload.single("image"),protect , createBlog);

// Get All Blogs
router.get("/", getAllBlogs);

// Get Single Blog
router.get("/:id", getBlogById);

// Update Blog
router.put("/:id", upload.single("image"),protect, updateBlog);

// Delete Blog
router.delete("/:id",protect, deleteBlog);


module.exports = router