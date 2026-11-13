const { readToken } = require('../services/auth');

function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const user = readToken(token);
  if (!user) return res.status(401).json({ message: 'Please sign in again.' });
  req.user = user;
  next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = { allowRoles, requireAuth };
