import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import advancedFeaturesRoutes from './routes/advancedFeatures';
import authRoutes from './routes/auth.routes';
import challengeRoutes from './routes/challenge.routes';
import dbTestRoutes from './routes/dbtest.routes';
import issueRoutes from './routes/issue.routes';
import rewardRoutes from './routes/reward.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration - allow production and all preview deployments
const allowedOrigins = [
  config.cors.origin,
  'https://hamro-sath.vercel.app', // Production frontend
  'https://hamro-saath-safa-nepal-v3.vercel.app',
  /^https:\/\/hamro-saath-safa-nepal-v3-.*\.vercel\.app$/,
  /^https:\/\/hamro-sath-.*\.vercel\.app$/, // Production preview deployments
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin matches any allowed pattern
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Hamro Saath - Safa Nepal API',
    version: config.apiVersion,
    endpoints: {
      health: '/health',
      api: `/api/${config.apiVersion}`,
      docs: '/api/docs',
    },
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.get(`/api/${config.apiVersion}`, (_req, res) => {
  res.json({
    message: 'Hamro Saath - Safa Nepal API',
    version: config.apiVersion,
    documentation: '/api/docs',
  });
});

// Auth routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);

// User routes
app.use(`/api/${config.apiVersion}/users`, userRoutes);

// Issue routes
app.use(`/api/${config.apiVersion}/issues`, issueRoutes);

// Reward routes
app.use(`/api/${config.apiVersion}/rewards`, rewardRoutes);

// Challenge routes
app.use(`/api/${config.apiVersion}/challenges`, challengeRoutes);

// Upload routes
app.use(`/api/${config.apiVersion}/upload`, uploadRoutes);

// Advanced Features routes (Karma, Civic Hubs, Social Tools, Sustainability)
app.use(`/api/${config.apiVersion}`, advancedFeaturesRoutes);

// DB Test routes (temporary)
app.use(`/api/${config.apiVersion}/db`, dbTestRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
