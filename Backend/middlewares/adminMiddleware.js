const isAdmin = (req, res, next)=>{
    if(req.user.role !== "admin"){
        return res.status(403).json({
            success:false,
            message:"Access denied"
        })
    }

    next()
}

const isTrainerOrAdmin = (req, res, next) => {
  if (!["trainer", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Trainers and admins only.",
    });
  }
  next();
};

module.exports ={isAdmin, isTrainerOrAdmin}
