require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const campaignRoutes = require('./src/routes/campaigns');
const authRoutes = require('./src/routes/auth');

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'MONGO_URI',
  'CLIENT_URL',
  'GOOGLE_CLIENT_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

console.log('✅ Environment variables validated');

const app = express();
const port = process.env.PORT || 5000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno CRM API Documentation',
      version: '1.0.0',
      description: 'API documentation for Xeno CRM system',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
require('./src/config/passport');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });
  next();
});

// Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Xeno CRM API',
    version: '1.0.0',
    endpoints: {
      documentation: '/api-docs',
      health: '/health',
      campaigns: '/api/campaigns',
      auth: '/auth'
    },
    status: {
      server: 'running',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({ 
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Database not connected');
    }
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Database initialization
const initializeDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin_CRM:Admincrm1423@crmdatabase.4qvnyfp.mongodb.net/';
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Atlas connected successfully');

    // Initialize collections if they don't exist
    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Create collections only if they don't exist
    try {
      if (!collectionNames.includes('campaigns')) {
        await db.createCollection('campaigns');
        console.log('Campaigns collection created');
      }

      if (!collectionNames.includes('communication_log')) {
        await db.createCollection('communication_log');
        console.log('Communication log collection created');
      }

      if (!collectionNames.includes('customers')) {
        await db.createCollection('customers');
        console.log('Customers collection created');
      }

      if (!collectionNames.includes('users')) {
        await db.createCollection('users');
        console.log('Users collection created');
      }

      // Ensure indexes
      await db.collection('customers').createIndex({ "email": 1 }, { unique: true });
      await db.collection('users').createIndex({ "googleId": 1 }, { unique: true });
      await db.collection('users').createIndex({ "email": 1 }, { unique: true });

      console.log('✅ Database initialized successfully');
    } catch (err) {
      // If collections already exist, just log and continue
      if (err.code === 48) {
        console.log('Collections already exist, continuing...');
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    // Don't exit process on collection exists error
    if (err.code !== 48) {
      process.exit(1);
    }
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('💤 MongoDB disconnected through app termination');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
});