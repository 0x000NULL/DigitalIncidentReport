const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Draws a vehicle outline on the PDF
 * @param {PDFDocument} doc - The PDF document
 * @param {number} x - Starting x coordinate
 * @param {number} y - Starting y coordinate
 * @param {number} width - Width of the vehicle outline
 */
function drawVehicleOutline(doc, x, y, width) {
    const height = width * 0.6; // Maintain aspect ratio
    
    // Draw top view (rectangle with rounded corners)
    doc.roundedRect(x, y, width, height * 0.4, 10)
       .stroke();

    // Draw side view below
    doc.roundedRect(x, y + height * 0.45, width, height * 0.4, 10)
       .stroke();
}

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
               .text(`Status: ${report.status}`)
               .text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`)
               .moveDown();

            // Policy Agreements Section
            doc.fontSize(14)
               .text('Policy Agreements', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Terms Agreement: ${report.termsAgreement ? 'Yes' : 'No'}`)
               .text(`Privacy Agreement: ${report.privacyAgreement ? 'Yes' : 'No'}`)
               .text(`E-Signature Agreement: ${report.esignatureAgreement ? 'Yes' : 'No'}`)
               .moveDown();

            // Personal Information Section
            doc.fontSize(14)
               .text('Personal Information', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Name: ${report.personalInfo.firstName} ${report.personalInfo.lastName}`)
               .text(`Address: ${report.personalInfo.address}, ${report.personalInfo.city}, ${report.personalInfo.state} ${report.personalInfo.zip}`)
               .text(`Home Phone: ${report.personalInfo.homePhone}`)
               .text(`Work Phone: ${report.personalInfo.workPhone}`)
               .text(`Email: ${report.personalInfo.email}`)
               .text(`Owns Vehicle: ${report.personalInfo.ownsVehicle}`)
               .text(`Insurance Company: ${report.personalInfo.insuranceCompany}`)
               .text(`Policy Number: ${report.personalInfo.policyNumber}`)
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
               .text(`Renter Operating: ${report.incidentDetails.renterOperating}`)
               .text(`Vehicle Use: ${report.incidentDetails.vehicleUse}`)
               .text(`Credit Card Coverage: ${report.incidentDetails.creditCardCoverage}`)
               .text(`Description: ${report.incidentDetails.description}`)
               .moveDown();

            // Operator Information Section
            if (report.incidentDetails.operatorInfo) {
                doc.fontSize(14)
                   .text('Operator Information', { underline: true })
                   .moveDown();
                
                const op = report.incidentDetails.operatorInfo;
                doc.fontSize(12)
                   .text(`Name: ${op.firstName} ${op.lastName}`)
                   .text(`DOB: ${op.dob ? new Date(op.dob).toLocaleDateString() : ''}`)
                   .text(`Phone: ${op.phone}`)
                   .text(`Address: ${op.address}, ${op.city}, ${op.state} ${op.zip}`)
                   .text(`License Number: ${op.licenseNumber} (${op.licenseState})`)
                   .text(`Owns Vehicle: ${op.ownsVehicle}`)
                   .text(`Employer: ${op.employer}`)
                   .text(`Work Phone: ${op.workPhone}`)
                   .text(`Work Address: ${op.workAddress}, ${op.workCity}, ${op.workState} ${op.workZip}`)
                   .text(`Insurance Company: ${op.insuranceCompany}`)
                   .text(`Policy Number: ${op.policyNumber}`)
                   .moveDown();
            }

            // Incident Location Section
            doc.fontSize(14)
               .text('Incident Location', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Knows Location: ${report.incidentLocation.knowsLocation}`)
               .text(`Date: ${new Date(report.incidentLocation.date).toLocaleDateString()}`)
               .text(`Time: ${report.incidentLocation.time}`)
               .text(`Weather: ${report.incidentLocation.weather}`)
               .text(`Address: ${report.incidentLocation.address}, ${report.incidentLocation.city}, ${report.incidentLocation.state} ${report.incidentLocation.zip}`)
               .text(`Police Department: ${report.incidentLocation.policeDepartment}`)
               .text(`Police Report Number: ${report.incidentLocation.policeReportNumber}`)
               .moveDown();

            // Vehicle Damage Section
            doc.fontSize(14)
               .text('Vehicle Damage', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Other Vehicle Involved: ${report.vehicleDamage.otherVehicleInvolved}`)
               .moveDown();

            // Other Vehicle Information
            if (report.vehicleDamage.otherVehicleInfo) {
                const other = report.vehicleDamage.otherVehicleInfo;
                
                // Owner Information
                doc.fontSize(12)
                   .text('Other Vehicle Owner Information:', { underline: true })
                   .text(`Name: ${other.owner.firstName} ${other.owner.lastName}`)
                   .text(`Address: ${other.owner.address}, ${other.owner.city}, ${other.owner.state} ${other.owner.zip}`)
                   .text(`Phone: ${other.owner.phone}`)
                   .moveDown();

                // Operator Information
                doc.fontSize(12)
                   .text('Other Vehicle Operator Information:', { underline: true })
                   .text(`Name: ${other.operator.firstName} ${other.operator.lastName}`)
                   .text(`Address: ${other.operator.address}, ${other.operator.city}, ${other.operator.state} ${other.operator.zip}`)
                   .text(`Phone: ${other.operator.phone}`)
                   .text(`License Number: ${other.operator.licenseNumber} (${other.operator.licenseState})`)
                   .text(`Insurance Company: ${other.operator.insuranceCompany}`)
                   .text(`Policy Number: ${other.operator.policyNumber}`)
                   .moveDown();

                // Vehicle Information
                doc.fontSize(12)
                   .text('Other Vehicle Details:', { underline: true })
                   .text(`Make/Model: ${other.vehicle.make} ${other.vehicle.model}`)
                   .text(`Odometer: ${other.vehicle.odometer}`)
                   .text(`License Plate: ${other.vehicle.licensePlate} (${other.vehicle.licenseState})`)
                   .text(`Damage Description: ${other.vehicle.damageDescription}`)
                   .text(`Driveable: ${other.vehicle.driveable}`)
                   .moveDown();
            }

            // Draw vehicle diagram with damage indicators
            if (report.vehicleDamage.rentalVehicleDamage && report.vehicleDamage.rentalVehicleDamage.length > 0) {
                doc.fontSize(12)
                   .text('Vehicle Damage Diagram:', { underline: true })
                   .moveDown();

                // Calculate diagram dimensions
                const pageWidth = doc.page.width - 2 * doc.page.margins.left;
                const diagramWidth = Math.min(pageWidth, 400); // Max width of 400
                const startX = doc.page.margins.left;
                const startY = doc.y;

                // Draw the vehicle outline
                drawVehicleOutline(doc, startX, startY, diagramWidth);

                // Draw damage indicators
                report.vehicleDamage.rentalVehicleDamage.forEach((damage, index) => {
                    // Calculate position based on the diagram dimensions
                    const x = startX + (damage.coordinates.x * diagramWidth);
                    const y = startY + (damage.coordinates.y * (diagramWidth * 0.6));

                    // Draw damage marker (larger, more visible circle)
                    doc.circle(x, y, 8)
                       .fillColor('red')
                       .fill()
                       .strokeColor('black')
                       .lineWidth(1)
                       .stroke();

                    // Add number reference with white background for better visibility
                    doc.fillColor('white')
                       .circle(x, y, 6)
                       .fill()
                       .fillColor('black')
                       .fontSize(10)
                       .text(`${index + 1}`, x - 3, y - 5);
                });

                doc.moveDown(2);

                // Add damage legend
                doc.fontSize(12)
                   .fillColor('black')
                   .text('Damage Details:', { underline: true })
                   .moveDown();

                report.vehicleDamage.rentalVehicleDamage.forEach((damage, index) => {
                    doc.fontSize(12)
                       .text(`${index + 1}. Type: ${damage.type}`)
                       .text(`   Severity: ${damage.severity}`)
                       .text(`   Description: ${damage.description}`)
                       .moveDown(0.5);
                });
            }

            // Additional Damage Description
            doc.fontSize(12)
               .text('Additional Damage Description:', { underline: true })
               .text(report.vehicleDamage.additionalDamageDescription || 'None')
               .moveDown();

            // Witnesses Section
            if (report.witnesses && report.witnesses.length > 0) {
                doc.fontSize(14)
                   .text('Witnesses', { underline: true })
                   .moveDown();
                
                report.witnesses.forEach((witness, index) => {
                    doc.fontSize(12)
                       .text(`Witness ${index + 1}:`)
                       .text(`Name: ${witness.firstName} ${witness.lastName}`)
                       .text(`Address: ${witness.address}, ${witness.city}, ${witness.state} ${witness.zip}`)
                       .text(`Phone: ${witness.phone}`)
                       .moveDown();
                });
            }

            // Accident Description Section
            doc.fontSize(14)
               .text('Accident Description', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Direction of Travel: ${report.accidentDescription.directionOfTravel}`)
               .text(`Traffic Controls: ${report.accidentDescription.trafficControls.join(', ')}`)
               .text(`Traffic Control Status: ${report.accidentDescription.trafficControlStatus}`)
               .text(`Road Conditions: ${report.accidentDescription.roadConditions}`)
               .text(`Lighting Conditions: ${report.accidentDescription.lightingConditions}`)
               .moveDown()
               .text('Description:')
               .text(report.accidentDescription.description, { align: 'justify' })
               .moveDown();

            // Signature Section
            doc.fontSize(14)
               .text('Signature and Confirmation', { underline: true })
               .moveDown();
            
            doc.fontSize(12)
               .text(`Accuracy Confirmation: ${report.signature.accuracyConfirmation ? 'Yes' : 'No'}`)
               .moveDown();

            // Add footer with page numbers
            doc.on('pageAdded', () => {
                const pages = doc.bufferedPageRange();
                doc.fontSize(10)
                   .text(
                       `Page ${pages.start + 1} of ${pages.start + pages.count}`,
                       50,
                       doc.page.height - 50,
                       { align: 'center' }
                   );
            });

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