require('dotenv').config();
const mongoose = require('mongoose');
const { sendReportEmail } = require('../utils/emailService');
const IncidentReport = require('../models/IncidentReport');
const yargs = require('yargs');

// Configure command line arguments
const argv = yargs
    .option('start-date', {
        alias: 's',
        description: 'Start date for filtering reports (YYYY-MM-DD)',
        type: 'string'
    })
    .option('end-date', {
        alias: 'e',
        description: 'End date for filtering reports (YYYY-MM-DD)',
        type: 'string'
    })
    .option('report-ids', {
        alias: 'r',
        description: 'Comma-separated list of specific report IDs to process',
        type: 'string'
    })
    .option('dry-run', {
        alias: 'd',
        description: 'Run in dry-run mode (no emails will be sent)',
        type: 'boolean',
        default: false
    })
    .option('verbose', {
        alias: 'v',
        description: 'Enable verbose logging',
        type: 'boolean',
        default: false
    })
    .option('debug', {
        description: 'Enable debug mode to show raw data',
        type: 'boolean',
        default: false
    })
    .option('limit', {
        alias: 'l',
        description: 'Limit the number of reports to process',
        type: 'number'
    })
    .help()
    .alias('help', 'h')
    .argv;

// Enhanced logging function
function log(message, level = 'info', error = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (error) {
        console.error(logMessage);
        if (argv.verbose || argv.debug) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }
    } else {
        console.log(logMessage);
    }
}

async function sendExistingReports() {
    try {
        // Debug MongoDB connection
        log(`Attempting to connect to MongoDB at: ${process.env.MONGODB_URI}`);
        
        // Set debug mode for mongoose
        if (argv.debug) {
            mongoose.set('debug', true);
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        log('Connected to MongoDB');

        // Debug: Show database info
        if (argv.debug) {
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();
            log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
            
            // Show all reports in database
            const allReports = await IncidentReport.find({});
            log(`Found ${allReports.length} total reports in database`);
            
            log('\nDetailed report information:');
            allReports.forEach(report => {
                log(`Report ID: ${report._id}`);
                log(`Created: ${report.createdAt || 'no creation date'}`);
                log(`Name: ${report.personalInfo?.firstName || 'no first name'} ${report.personalInfo?.lastName || 'no last name'}`);
                if (argv.verbose) {
                    log(`Email: ${report.personalInfo?.email || 'no email'}`);
                    log(`Vehicle: ${report.vehicleInfo?.vehicleMake || 'no make'} ${report.vehicleInfo?.vehicleModel || 'no model'}`);
                }
                log('---');
            });
        }

        // Build query based on command line arguments
        const query = {};

        // Add date range filter if provided
        if (argv.startDate || argv.endDate) {
            query.createdAt = {};
            if (argv.startDate) {
                query.createdAt.$gte = new Date(argv.startDate);
                log(`Filtering reports from ${argv.startDate}`);
            }
            if (argv.endDate) {
                query.createdAt.$lte = new Date(argv.endDate);
                log(`Filtering reports until ${argv.endDate}`);
            }
        }

        // Add specific report IDs if provided
        if (argv.reportIds) {
            const reportIds = argv.reportIds.split(',').map(id => id.trim());
            query._id = { $in: reportIds };
            log(`Filtering specific report IDs: ${reportIds.join(', ')}`);
        }

        // Debug: Show the query being used
        if (argv.debug) {
            log('Query being used:', 'debug');
            log(JSON.stringify(query, null, 2), 'debug');
        }

        // Find reports based on query
        let reports = await IncidentReport.find(query).sort({ createdAt: -1 });

        // Apply limit if specified
        if (argv.limit && argv.limit > 0) {
            reports = reports.slice(0, argv.limit);
            log(`Limited to ${argv.limit} most recent reports`);
        }

        log(`Found ${reports.length} reports to process`);

        if (argv.dryRun) {
            log('DRY RUN MODE: No emails will be sent');
        }

        let successCount = 0;
        let errorCount = 0;
        const errorDetails = [];

        // Process each report
        for (const report of reports) {
            try {
                log(`Processing report ${report._id} for ${report.personalInfo.firstName} ${report.personalInfo.lastName}`);
                
                if (argv.dryRun) {
                    log(`[DRY RUN] Would send email for report ${report._id}`);
                    successCount++;
                    continue;
                }

                await sendReportEmail(report);
                log(`Successfully sent email for report ${report._id}`);
                successCount++;
            } catch (error) {
                log(`Error processing report ${report._id}`, 'error', error);
                errorCount++;
                errorDetails.push({
                    reportId: report._id,
                    name: report.personalInfo.firstName + ' ' + report.personalInfo.lastName,
                    error: error.message
                });
            }
        }

        // Print summary
        log('\nProcessing complete:');
        log(`Successfully processed: ${successCount} reports`);
        log(`Failed to process: ${errorCount} reports`);

        if (errorCount > 0) {
            log('\nError Details:');
            errorDetails.forEach(detail => {
                log(`Report ID: ${detail.reportId}`);
                log(`Name: ${detail.name}`);
                log(`Error: ${detail.error}`);
                log('---');
            });
        }

    } catch (error) {
        log('Fatal error occurred', 'error', error);
    } finally {
        // Close MongoDB connection
        await mongoose.disconnect();
        log('Disconnected from MongoDB');
    }
}

// Run the script
sendExistingReports(); 