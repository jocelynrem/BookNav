// backend/src/middleware/roleAuth.js
const roleAuth = (roles) => {
    return (req, res, next) => {
        console.log('User role:', req.user ? req.user.role : 'No user');
        console.log('Required roles:', roles);

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