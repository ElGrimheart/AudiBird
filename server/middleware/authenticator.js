import { verifyJwtToken } from "../utils/jwt.js";

export const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            status: "failure",
            message: "Unauthorized access"
        });
    }

    const decoded = verifyJwtToken(token);
    if (!decoded) {
        return res.status(401).json({
            status: "failure",
            message: "Invalid token"
        });
    }

    req.user = decoded;
    next();
};
