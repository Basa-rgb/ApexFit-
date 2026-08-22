const express = require('express');
const router = express.Router()
const {createBlog , getAllBlogs ,getBlogById ,updateBlog ,deleteBlog} =require("../controllers/blogController")
const {protect} = require("../middlewares/authMiddleware")
const {isAdmin} = require("../middlewares/adminMiddleware")
const upload = require("../middlewares/upload");

// Create Blog (Admin only)
router.post("/", protect, isAdmin, upload.single("image"), createBlog);

// Get All Blogs
router.get("/", getAllBlogs);

// Get Single Blog
router.get("/:id", getBlogById);

// Update Blog (Admin only)
router.put("/:id", protect, isAdmin, upload.single("image"), updateBlog);

// Delete Blog (Admin only)
router.delete("/:id", protect, isAdmin, deleteBlog);


module.exports = router