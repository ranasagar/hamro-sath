import express from 'express';

const router = express.Router();

router.get('/env', (_req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    hasJWT: !!process.env.JWT_SECRET,
    hasDBURL: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20),
  });
});

export default router;
