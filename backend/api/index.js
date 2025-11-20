// Vercel serverless function entry point
try {
  const app = require('../dist/app').default || require('../dist/app');
  module.exports = app;
} catch (error) {
  console.error('Failed to load app:', error);
  // Export error handler
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Failed to initialize application',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };
}
