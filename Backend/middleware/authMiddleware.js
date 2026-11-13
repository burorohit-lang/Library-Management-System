const jwt = require('jsonwebtoken');

// ১. টোকেন ভেরিফিকেশন মিডলওয়্যার (লগইন করা ইউজার চেক করতে)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'library_secret_key_2026');
    req.user = decoded; // ইউজার ইনফো যেমন: { id, email, role } রিকোয়েস্টে যুক্ত করা হলো
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// ২. শুধু অ্যাডমিন রাউটের জন্য (Admin Only)
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  });
};

// ৩. স্টাফ বা লাইব্রেরিয়ান ও অ্যাডমিনের জন্য (Admin & Librarian)
const verifyStaff = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'librarian')) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Staff privileges required.' });
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyStaff
};