const readline = require('readline');
const mongoose = require('mongoose');
const { generateIncidentReportPDF } = require('../utils/pdfGenerator');
const path = require('path');
require('dotenv').config();

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to ask a question and return a promise
const askQuestion = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digitalincidentreport');
        console.log('Connected to MongoDB successfully!');

        // Get all incident reports
        const IncidentReport = require('../models/IncidentReport');
        const reports = await IncidentReport.find({}).select('_id personalInfo.firstName personalInfo.lastName createdAt').sort({ createdAt: -1 });

        if (reports.length === 0) {
            console.log('No incident reports found in the database.');
            return false;
        }

        // Display available reports
        console.log('\nAvailable Incident Reports:');
        reports.forEach((report, index) => {
            console.log(`${index + 1}. ${report.personalInfo.firstName} ${report.personalInfo.lastName} (${new Date(report.createdAt).toLocaleDateString()}) - ID: ${report._id}`);
        });

        // Ask user to select a report
        const reportIndex = await askQuestion('\nEnter the number of the report you want to generate a PDF for: ');
        const selectedIndex = parseInt(reportIndex) - 1;

        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= reports.length) {
            console.log('Invalid selection. Please try again.');
            return false;
        }

        const selectedReport = reports[selectedIndex];
        const fullReport = await IncidentReport.findById(selectedReport._id);

        // Ask for output directory
        const outputDir = await askQuestion('\nEnter the output directory (press Enter for default: ./public/pdfs): ') || './public/pdfs';
        const filename = `incident-report-${selectedReport._id}.pdf`;
        const outputPath = path.join(process.cwd(), outputDir, filename);

        // Generate PDF
        console.log('\nGenerating PDF...');
        await generateIncidentReportPDF(fullReport, outputPath);
        console.log(`\nPDF generated successfully at: ${outputPath}`);

        // Ask if user wants to generate another PDF
        const generateAnother = await askQuestion('\nDo you want to generate another PDF? (y/n): ');
        if (generateAnother.toLowerCase() === 'y') {
            return await main();
        }

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    } finally {
        rl.close();
        await mongoose.disconnect();
    }
}

// Start the script
if (require.main === module) {
    main().then(success => {
        if (!success) {
            process.exit(1);
        }
    });
}

module.exports = { main }; 