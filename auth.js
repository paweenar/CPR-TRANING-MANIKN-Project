/**
 * auth.js — Authentication Middleware
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'กรุณา Login ก่อน', redirect: '/login.html' });
}

module.exports = { requireAuth };
