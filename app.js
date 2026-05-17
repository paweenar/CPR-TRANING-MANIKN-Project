const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const { pool } = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const cprRoutes = require('./routes/cpr.routes');
const sessionRoutes = require('./routes/session.routes');

const app = express();

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(session({
  store: new pgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'cpr-trainer-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/cpr', cprRoutes);
app.use('/api/sessions', sessionRoutes);

app.use(errorHandler);

module.exports = app;
