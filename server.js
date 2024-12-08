const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = require('./src/app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
