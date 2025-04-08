const express = require('express');
const router = express.Router();

// GET route for the report form
router.get('/', (req, res) => {
    res.render('report', { 
        title: 'Incident Report',
        currentPage: 1,
        totalPages: 3
    });
});

// POST route to handle form submissions
router.post('/submit', (req, res) => {
    // Handle form submission logic here
    res.json({ success: true });
});

module.exports = router; 