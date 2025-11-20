import express from 'express';
import { pool } from '../database/connection';

const router = express.Router();

router.get('/test', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time, COUNT(*) as ward_count FROM wards');
    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Database connection working'
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

router.get('/test-issues', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        u.full_name as reporter_name,
        w.ward_name
      FROM issues i
      JOIN users u ON i.reporter_id = u.id
      JOIN wards w ON i.ward_id = w.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);
    res.json({ 
      success: true, 
      count: result.rows.length,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

export default router;
