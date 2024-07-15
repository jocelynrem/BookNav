// backend/src/middleware/roleAuth.js
const roleAuth = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const hasRole = Array.isArray(roles)
            ? roles.includes(req.user.role)
            : req.user.role === roles;

        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};

module.exports = roleAuth;