const rbac = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    // No user
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Role not allowed
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Base restriction (for commander)
    if (user.role === "commander") {
      const baseIdFromRequest =
        req.body.base_id || req.query.base_id;

      if (baseIdFromRequest && baseIdFromRequest != user.base_id) {
        return res.status(403).json({
          message: "Access restricted to your base only",
        });
      }
    }

    next();
  };
};

module.exports = rbac;