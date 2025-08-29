const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, "secret");
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: "Invalid token." });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token." });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required." });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        
        next();
    };
};

module.exports = { auth, requireRole };
