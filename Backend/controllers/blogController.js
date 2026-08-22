const { default: mongoose } = require("mongoose");
const Blog = require("../models/Blog");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
// create the the blog

const createBlog = async (req, res) => {
  try {
    // Comes from the Blog models
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      author,
      featured,
      status,
    } = req.body;

    // Validate the  fields

    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find images or not

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Blog image is required",
      });
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    //   find slug exist or not

    const existingSlug = await Blog.findOne({ slug });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Blog already exists",
      });
    }

    // Upload image to Cloudinary
    const uploaded = await uploadToCloudinary(req.file.buffer, "apexfit/blogs");

    const image = uploaded.url;

    const newBlog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      image,
      category,
      tags,
      author,
      featured,
      status,
    });
    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Error while creating Blog ", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//  Get all Blog
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    if (blogs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No blogs found",
        count: 0,
        blogs: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("Error while getting blogs:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// const get Blog by Id

const getBlogById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Blog Id",
      });
    }

    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error while getting blog:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update the Blog

const updateBlog = async (req, res) => {
  try {
    // Validate the id

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Blog Id",
      });
    }

    const { id } = req.params;

    // Find the blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Req body
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      author,
      featured,
      status,
    } = req.body;

    // Update the Fields
    if (title !== undefined && title !== blog.title) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

      const existingBlog = await Blog.findOne({ slug });

      if (existingBlog && existingBlog._id.toString() !== blog._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "A blog with this title already exists.",
        });
      }

      blog.title = title;
      blog.slug = slug;
    }

    if (excerpt !== undefined) {
      blog.excerpt = excerpt;
    }

    if (content !== undefined) {
      blog.content = content;
    }

    if (category !== undefined) {
      blog.category = category;
    }

    if (tags !== undefined) {
      blog.tags = tags;
    }

    if (author !== undefined) {
      blog.author = author;
    }

    if (featured !== undefined) {
      blog.featured = featured;
    }

    if (status !== undefined) {
      blog.status = status;
    }

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, "apexfit/blogs");
      blog.image = uploaded.url;
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog update successfully",
      blog,
    });
  } catch (error) {
    console.error("Error while updating blog:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete the Blog

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Blog ID",
      });
    }

    // Find blog
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Delete blog
    await blog.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting blog:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
