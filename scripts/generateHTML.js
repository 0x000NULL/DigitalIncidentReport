const readline = require('readline');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const { generateIncidentReportHTML } = require('../utils/htmlGenerator');
const IncidentReport = require('../models/IncidentReport');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            user: process.env.MONGODB_USER,
            pass: process.env.MONGODB_PASSWORD,
            ssl: process.env.NODE_ENV === 'production',
            authSource: 'admin',
            retryWrites: true,
            w: 'majority'
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}

async function main() {
    try {
        console.log('Welcome to the Incident Report HTML Generator');
        console.log('-------------------------------------------');

        // Connect to database
        await connectToDatabase();

        // Get all incident reports
        const reports = await IncidentReport.find({})
            .select('_id personalInfo.firstName personalInfo.lastName createdAt status')
            .sort({ createdAt: -1 });

        if (reports.length === 0) {
            console.log('No incident reports found in the database.');
            return false;
        }

        // Display available reports
        console.log('\nAvailable Incident Reports:');
        reports.forEach((report, index) => {
            console.log(`${index + 1}. ${report.personalInfo.firstName} ${report.personalInfo.lastName} (${new Date(report.createdAt).toLocaleDateString()}) - Status: ${report.status} - ID: ${report._id}`);
        });

        // Ask user to select a report
        const reportIndex = await askQuestion('\nEnter the number of the report you want to generate HTML for: ');
        const selectedIndex = parseInt(reportIndex) - 1;

        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= reports.length) {
            console.log('Invalid selection. Please try again.');
            return false;
        }

        const selectedReport = reports[selectedIndex];
        const fullReport = await IncidentReport.findById(selectedReport._id);

        // Ask for output directory
        const outputDir = await askQuestion('\nEnter the output directory (press Enter for default: ./public/html): ') || './public/html';
        const filename = `incident-report-${selectedReport._id}.html`;
        const outputPath = path.join(process.cwd(), outputDir, filename);

        // Generate HTML
        console.log('\nGenerating HTML report...');
        await generateIncidentReportHTML(fullReport.toObject(), outputPath);
        console.log(`\nHTML report generated successfully at: ${outputPath}`);

        // Ask if user wants to generate another HTML
        const generateAnother = await askQuestion('\nDo you want to generate another HTML report? (y/n): ');
        if (generateAnother.toLowerCase() === 'y') {
            return await main();
        }

        return true;
    } catch (error) {
        console.error('\nError generating HTML report:', error.message);
        return false;
    } finally {
        await mongoose.disconnect();
        rl.close();
    }
}

main(); 