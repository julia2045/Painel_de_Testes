const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.status(401).json({error: "Token não fornecido"});
    }
    const splitToken = authHeader.split(' ');
    const bearerToken = splitToken[0];
    const token = splitToken[1];
    if(bearerToken !== "Bearer" || !token){
        return res.status(401).json({error: "Token inválido"});
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({error: "Token inválido"});
    }

}

module.exports = authMiddleware;