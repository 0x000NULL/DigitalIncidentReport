const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF from an incident report
 * @param {Object} report - The incident report document
 * @param {string} outputPath - Where to save the PDF
 * @returns {Promise<string>} - Path to the generated PDF
 */
async function generateIncidentReportPDF(report, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: 'Incident Report',
                    Author: 'Digital Incident Report System',
                    CreationDate: new Date()
                }
            });

            // Create output directory if it doesn't exist
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Pipe the PDF to a file
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Add header
            doc.fontSize(20)
               .text('Incident Report', { align: 'center' })
               .moveDown();

            // Add report ID and date
            doc.fontSize(12)
               .text(`Report ID: ${report._id}`)
               .text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`)
               .moveDown();

            // Personal Information Section
            doc.fontSize(14)
               .text('Personal Information', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Name: ${report.personalInfo.firstName} ${report.personalInfo.lastName}`)
               .text(`Address: ${report.personalInfo.address}, ${report.personalInfo.city}, ${report.personalInfo.state} ${report.personalInfo.zip}`)
               .text(`Phone: ${report.personalInfo.homePhone}`)
               .text(`Email: ${report.personalInfo.email}`)
               .moveDown();

            // Vehicle Information Section
            doc.fontSize(14)
               .text('Vehicle Information', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Vehicle Number: ${report.vehicleInfo.vehicleNumber}`)
               .text(`License Plate: ${report.vehicleInfo.licensePlate} (${report.vehicleInfo.licenseState})`)
               .text(`Make/Model: ${report.vehicleInfo.vehicleMake} ${report.vehicleInfo.vehicleModel}`)
               .text(`Odometer: ${report.vehicleInfo.odometer}`)
               .moveDown();

            // Incident Details Section
            doc.fontSize(14)
               .text('Incident Details', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Date: ${new Date(report.incidentLocation.date).toLocaleDateString()}`)
               .text(`Time: ${report.incidentLocation.time}`)
               .text(`Location: ${report.incidentLocation.address}, ${report.incidentLocation.city}, ${report.incidentLocation.state} ${report.incidentLocation.zip}`)
               .text(`Weather: ${report.incidentLocation.weather}`)
               .moveDown();

            // Accident Description
            doc.fontSize(14)
               .text('Accident Description', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Direction of Travel: ${report.accidentDescription.directionOfTravel}`)
               .text(`Road Conditions: ${report.accidentDescription.roadConditions}`)
               .text(`Lighting Conditions: ${report.accidentDescription.lightingConditions}`)
               .moveDown()
               .text('Description:')
               .text(report.accidentDescription.description, { align: 'justify' })
               .moveDown();

            // Vehicle Damage Section
            if (report.vehicleDamage.rentalVehicleDamage.length > 0) {
                doc.fontSize(14)
                   .text('Vehicle Damage', { underline: true })
                   .moveDown();
                
                doc.fontSize(12);
                report.vehicleDamage.rentalVehicleDamage.forEach((damage, index) => {
                    doc.text(`Damage ${index + 1}:`)
                       .text(`Type: ${damage.type}`)
                       .text(`Severity: ${damage.severity}`)
                       .text(`Description: ${damage.description}`)
                       .moveDown();
                });
            }

            // Witnesses Section
            if (report.witnesses && report.witnesses.length > 0) {
                doc.fontSize(14)
                   .text('Witnesses', { underline: true })
                   .moveDown();
                
                doc.fontSize(12);
                report.witnesses.forEach((witness, index) => {
                    doc.text(`Witness ${index + 1}:`)
                       .text(`Name: ${witness.firstName} ${witness.lastName}`)
                       .text(`Phone: ${witness.phone}`)
                       .text(`Address: ${witness.address}, ${witness.city}, ${witness.state} ${witness.zip}`)
                       .moveDown();
                });
            }

            // Add footer
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(10)
                   .text(
                       `Page ${i + 1} of ${pages.count}`,
                       50,
                       doc.page.height - 50,
                       { align: 'center' }
                   );
            }

            // Finalize the PDF
            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateIncidentReportPDF
}; 