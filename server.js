const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const calculateRoute = require('./routes/calculatorRoutes');  // Updated route import

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/calculate', calculateRoute);  // Use the updated route

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('Failed to connect to MongoDB', err));

// Start Server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});
