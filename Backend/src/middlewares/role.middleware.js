/**
 * role.middleware.js
 *
 * Enforces role-based access on routes that require it.
 * Must be used AFTER auth.middleware (which populates req.user).
 *
 * Usage:
 *   router.post("/create", authenticate, requireRole("hr"), handler);
 *   router.post("/submit", authenticate, requireRole("hr", "admin"), handler);
 */

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

module.exports = requireRole;
