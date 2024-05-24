module.exports = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Доступ заборонено!" });
    }
    next();
  };
};
