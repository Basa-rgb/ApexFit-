const multer = require("multer");

// store files in memory
const storage = multer.memoryStorage();

// Allows only images

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};


const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize:5* 1024* 1024 , //5 Mb
    }
});

module.exports = upload;