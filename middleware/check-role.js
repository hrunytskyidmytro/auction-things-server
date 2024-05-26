module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userData.role)) {
      return res.status(403).json({ message: "Доступ заборонено!" });
    }
    next();
  };
};
