const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

// MongoDB connection
let db;
const client = new MongoClient(process.env.ATLAS_URI || 'mongodb://localhost:27017/employees');

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db('employees');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Initialize DB connection
connectDB();

// Get frontend URLs from environment variables
const frontendUrls = [
  process.env.FRONTEND_URL_1,
  process.env.FRONTEND_URL_2,
  'https://employee-management-system-mern-b92o-q3ttq3pdf.vercel.app',
  'https://employee-management-system-mern-hazel.vercel.app'
].filter(Boolean);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    ...frontendUrls,
    /^https:\/\/employee-management-system-mern-.*\.vercel\.app$/
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ]
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database helper functions
async function getRecordById(id) {
  try {
    const collection = db.collection('records');
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    throw new Error(`Error fetching record: ${error.message}`);
  }
}

async function createRecord(recordData) {
  try {
    const collection = db.collection('records');
    const result = await collection.insertOne({
      ...recordData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return await collection.findOne({ _id: result.insertedId });
  } catch (error) {
    throw new Error(`Error creating record: ${error.message}`);
  }
}

async function updateRecord(id, recordData) {
  try {
    const collection = db.collection('records');
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...recordData, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    return result.value;
  } catch (error) {
    throw new Error(`Error updating record: ${error.message}`);
  }
}

async function deleteRecord(id) {
  try {
    const collection = db.collection('records');
    const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });
    return result.value;
  } catch (error) {
    throw new Error(`Error deleting record: ${error.message}`);
  }
}

async function getAllRecords() {
  try {
    const collection = db.collection('records');
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
  } catch (error) {
    throw new Error(`Error fetching records: ${error.message}`);
  }
}

// API Routes

// Get single record by ID
app.get('/api/record/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid record ID format' });
    }

    const record = await getRecordById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new record
app.post('/api/record', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Validate required fields
    const requiredFields = ['firstname', 'lastname', 'email', 'contact', 'designation', 'salary'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Check if email already exists
    const existingRecord = await db.collection('records').findOne({ email: req.body.email });
    if (existingRecord) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newRecord = await createRecord(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update record
app.patch('/api/record/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid record ID format' });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Check if email is being updated and already exists
    if (req.body.email) {
      const existingRecord = await db.collection('records').findOne({ 
        email: req.body.email,
        _id: { $ne: new ObjectId(req.params.id) }
      });
      if (existingRecord) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const updatedRecord = await updateRecord(req.params.id, req.body);
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete record
app.delete('/api/record/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid record ID format' });
    }

    const deletedRecord = await deleteRecord(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully', deletedRecord });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all records
app.get('/api/records', async (req, res) => {
  try {
    const records = await getAllRecords();
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search records
app.get('/api/records/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const collection = db.collection('records');
    const searchRegex = new RegExp(q, 'i');
    
    const records = await collection.find({
      $or: [
        { firstname: searchRegex },
        { lastname: searchRegex },
        { email: searchRegex },
        { designation: searchRegex }
      ]
    }).toArray();

    res.json(records);
  } catch (error) {
    console.error('Error searching records:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate entry found' });
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5050;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel
module.exports = app;
