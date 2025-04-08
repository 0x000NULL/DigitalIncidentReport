const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to generate PDF from incident report
const generatePDF = (report) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document with autoFirstPage enabled
            const doc = new PDFDocument({
                autoFirstPage: true,
                size: 'A4',
                margin: 50
            });

            const pdfPath = path.join(__dirname, '../temp', `report_${report._id}.pdf`);
            
            // Ensure temp directory exists
            if (!fs.existsSync(path.join(__dirname, '../temp'))) {
                fs.mkdirSync(path.join(__dirname, '../temp'));
            }

            // Create write stream
            const stream = fs.createWriteStream(pdfPath);

            // Handle stream errors
            stream.on('error', (error) => {
                console.error('Stream error:', error);
                reject(error);
            });

            // Pipe the PDF document to the write stream
            doc.pipe(stream);

            // Helper function to safely add text
            const safeText = (text) => {
                return text ? String(text).trim() : 'N/A';
            };

            // Helper function to draw the vehicle diagram
            const drawVehicleDiagram = (x, y, width, height) => {
                try {
                    doc.save();
                    
                    // Move to the starting position
                    doc.translate(x, y);
                    
                    // Draw the top view (rectangle with rounded corners)
                    doc.roundedRect(width * 0.1, 0, width * 0.8, height * 0.4, 5)
                       .lineWidth(1)
                       .stroke();
                    
                    // Draw the side view
                    doc.rect(width * 0.1, height * 0.5, width * 0.8, height * 0.2)
                       .lineWidth(1)
                       .stroke();
                    
                    // Draw circles for wheels (top view)
                    const wheelRadius = 8;
                    doc.lineWidth(1);
                    // Front left wheel
                    doc.circle(width * 0.2, height * 0.1, wheelRadius).stroke();
                    // Front right wheel
                    doc.circle(width * 0.2, height * 0.3, wheelRadius).stroke();
                    // Rear left wheel
                    doc.circle(width * 0.8, height * 0.1, wheelRadius).stroke();
                    // Rear right wheel
                    doc.circle(width * 0.8, height * 0.3, wheelRadius).stroke();
                    
                    // Draw wheels for side view
                    doc.circle(width * 0.25, height * 0.65, wheelRadius).stroke();
                    doc.circle(width * 0.75, height * 0.65, wheelRadius).stroke();
                    
                    // Add labels
                    doc.fontSize(8);
                    doc.text('Front', width * 0.45, -15, { align: 'center' });
                    doc.text('Top View', width * 0.45, height * 0.15, { align: 'center' });
                    doc.text('Side View', width * 0.45, height * 0.55, { align: 'center' });
                    
                    doc.restore();
                } catch (error) {
                    console.error('Error drawing vehicle diagram:', error);
                }
            };

            // Helper function to plot damage points
            const plotDamagePoint = (x, y, damageType) => {
                try {
                    const colors = {
                        'dent': '#FF0000',
                        'scratch': '#FFA500',
                        'crack': '#FF00FF',
                        'break': '#800000',
                        'missing': '#000000',
                        'paint': '#0000FF',
                        'glass': '#00FFFF',
                        'mechanical': '#008000',
                        'other': '#808080'
                    };

                    const symbols = {
                        'dent': '●',
                        'scratch': '▬',
                        'crack': '★',
                        'break': '■',
                        'missing': '✕',
                        'paint': '◆',
                        'glass': '△',
                        'mechanical': '⬡',
                        'other': '⬢'
                    };

                    doc.save();
                    doc.fill(colors[damageType] || colors.other);
                    doc.fontSize(12);
                    doc.text(symbols[damageType] || symbols.other, x - 4, y - 6);
                    doc.restore();
                } catch (error) {
                    console.error('Error plotting damage point:', error);
                }
            };

            // Add content to PDF
            doc.fontSize(20).text('Incident Report', { align: 'center' });
            doc.moveDown();

            // Policy Agreements
            doc.fontSize(16).text('Policy Agreements');
            doc.fontSize(12);
            doc.text(`Terms Agreement: ${report.termsAgreement ? 'Accepted' : 'Not Accepted'}`);
            doc.text(`Privacy Agreement: ${report.privacyAgreement ? 'Accepted' : 'Not Accepted'}`);
            doc.text(`E-Signature Agreement: ${report.esignatureAgreement ? 'Accepted' : 'Not Accepted'}`);
            doc.moveDown();

            // Personal Information
            doc.fontSize(16).text('Personal Information');
            doc.fontSize(12);
            doc.text(`Name: ${safeText(report.personalInfo.firstName)} ${safeText(report.personalInfo.lastName)}`);
            doc.text(`Address: ${safeText(report.personalInfo.address)}, ${safeText(report.personalInfo.city)}, ${safeText(report.personalInfo.state)} ${safeText(report.personalInfo.zip)}`);
            doc.text(`Home Phone: ${safeText(report.personalInfo.homePhone)}`);
            doc.text(`Work Phone: ${safeText(report.personalInfo.workPhone)}`);
            doc.text(`Email: ${safeText(report.personalInfo.email)}`);
            doc.text(`Owns Vehicle: ${safeText(report.personalInfo.ownsVehicle)}`);
            doc.text(`Insurance Company: ${safeText(report.personalInfo.insuranceCompany)}`);
            doc.text(`Policy Number: ${safeText(report.personalInfo.policyNumber)}`);
            doc.moveDown();

            // Vehicle Information
            doc.fontSize(16).text('Vehicle Information');
            doc.fontSize(12);
            doc.text(`Vehicle Number: ${safeText(report.vehicleInfo.vehicleNumber)}`);
            doc.text(`License Plate: ${safeText(report.vehicleInfo.licensePlate)} (${safeText(report.vehicleInfo.licenseState)})`);
            doc.text(`Make/Model: ${safeText(report.vehicleInfo.vehicleMake)} ${safeText(report.vehicleInfo.vehicleModel)}`);
            doc.text(`Odometer: ${safeText(report.vehicleInfo.odometer)}`);
            doc.moveDown();

            // Incident Details
            doc.fontSize(16).text('Incident Details');
            doc.fontSize(12);
            doc.text(`Renter Operating: ${report.incidentDetails.renterOperating}`);
            
            if (report.incidentDetails.renterOperating === 'no' && report.incidentDetails.operatorInfo) {
                doc.text('Operator Information:');
                doc.text(`Name: ${report.incidentDetails.operatorInfo.firstName} ${report.incidentDetails.operatorInfo.lastName}`);
                doc.text(`DOB: ${report.incidentDetails.operatorInfo.dob}`);
                doc.text(`Phone: ${report.incidentDetails.operatorInfo.phone}`);
                doc.text(`Address: ${report.incidentDetails.operatorInfo.address}, ${report.incidentDetails.operatorInfo.city}, ${report.incidentDetails.operatorInfo.state} ${report.incidentDetails.operatorInfo.zip}`);
                doc.text(`License: ${report.incidentDetails.operatorInfo.licenseNumber} (${report.incidentDetails.operatorInfo.licenseState})`);
                doc.text(`Owns Vehicle: ${report.incidentDetails.operatorInfo.ownsVehicle}`);
                doc.text(`Employer: ${report.incidentDetails.operatorInfo.employer}`);
                doc.text(`Work Phone: ${report.incidentDetails.operatorInfo.workPhone}`);
                doc.text(`Work Address: ${report.incidentDetails.operatorInfo.workAddress}, ${report.incidentDetails.operatorInfo.workCity}, ${report.incidentDetails.operatorInfo.workState} ${report.incidentDetails.operatorInfo.workZip}`);
                doc.text(`Insurance: ${report.incidentDetails.operatorInfo.insuranceCompany} (${report.incidentDetails.operatorInfo.policyNumber})`);
            }
            
            doc.text(`Vehicle Use: ${report.incidentDetails.vehicleUse}`);
            doc.text(`Credit Card Coverage: ${report.incidentDetails.creditCardCoverage}`);
            doc.text(`Description: ${report.incidentDetails.description}`);
            doc.moveDown();

            // Incident Location
            doc.fontSize(16).text('Incident Location');
            doc.fontSize(12);
            doc.text(`Knows Location: ${report.incidentLocation.knowsLocation}`);
            doc.text(`Date: ${report.incidentLocation.date}`);
            doc.text(`Time: ${report.incidentLocation.time}`);
            doc.text(`Weather: ${report.incidentLocation.weather || 'N/A'}`);
            doc.text(`Address: ${report.incidentLocation.address || 'N/A'}`);
            doc.text(`City: ${report.incidentLocation.city || 'N/A'}`);
            doc.text(`State: ${report.incidentLocation.state || 'N/A'}`);
            doc.text(`ZIP: ${report.incidentLocation.zip || 'N/A'}`);
            doc.text(`Police Department: ${report.incidentLocation.policeDepartment || 'N/A'}`);
            doc.text(`Police Report Number: ${report.incidentLocation.policeReportNumber || 'N/A'}`);
            doc.moveDown();

            // Vehicle Damage
            doc.fontSize(16).text('Vehicle Damage');
            doc.fontSize(12);
            doc.text(`Other Vehicle Involved: ${report.vehicleDamage.otherVehicleInvolved}`);
            
            if (report.vehicleDamage.otherVehicleInvolved === 'yes' && report.vehicleDamage.otherVehicleInfo) {
                doc.text('Other Vehicle Information:');
                doc.text('Owner:');
                doc.text(`Name: ${report.vehicleDamage.otherVehicleInfo.owner.firstName} ${report.vehicleDamage.otherVehicleInfo.owner.lastName}`);
                doc.text(`Address: ${report.vehicleDamage.otherVehicleInfo.owner.address}, ${report.vehicleDamage.otherVehicleInfo.owner.city}, ${report.vehicleDamage.otherVehicleInfo.owner.state} ${report.vehicleDamage.otherVehicleInfo.owner.zip}`);
                doc.text(`Phone: ${report.vehicleDamage.otherVehicleInfo.owner.phone}`);
                
                if (report.vehicleDamage.otherVehicleInfo.operator) {
                    doc.text('Operator:');
                    doc.text(`Name: ${report.vehicleDamage.otherVehicleInfo.operator.firstName} ${report.vehicleDamage.otherVehicleInfo.operator.lastName}`);
                    doc.text(`Address: ${report.vehicleDamage.otherVehicleInfo.operator.address}, ${report.vehicleDamage.otherVehicleInfo.operator.city}, ${report.vehicleDamage.otherVehicleInfo.operator.state} ${report.vehicleDamage.otherVehicleInfo.operator.zip}`);
                    doc.text(`Phone: ${report.vehicleDamage.otherVehicleInfo.operator.phone}`);
                    doc.text(`License: ${report.vehicleDamage.otherVehicleInfo.operator.licenseNumber} (${report.vehicleDamage.otherVehicleInfo.operator.licenseState})`);
                    doc.text(`Insurance: ${report.vehicleDamage.otherVehicleInfo.operator.insuranceCompany} (${report.vehicleDamage.otherVehicleInfo.operator.policyNumber})`);
                }
                
                doc.text('Vehicle:');
                doc.text(`Make/Model: ${report.vehicleDamage.otherVehicleInfo.vehicle.make} ${report.vehicleDamage.otherVehicleInfo.vehicle.model}`);
                doc.text(`Odometer: ${report.vehicleDamage.otherVehicleInfo.vehicle.odometer}`);
                doc.text(`License: ${report.vehicleDamage.otherVehicleInfo.vehicle.licensePlate} (${report.vehicleDamage.otherVehicleInfo.vehicle.licenseState})`);
                doc.text(`Damage Description: ${report.vehicleDamage.otherVehicleInfo.vehicle.damageDescription}`);
                doc.text(`Driveable: ${report.vehicleDamage.otherVehicleInfo.vehicle.driveable}`);
            }
            
            if (report.vehicleDamage.rentalVehicleDamage && report.vehicleDamage.rentalVehicleDamage.length > 0) {
                doc.addPage(); // Add a new page for the diagram
                doc.fontSize(16).text('Rental Vehicle Damage');
                doc.moveDown();

                // Insert vehicle diagram image
                const imagePath = path.join(__dirname, '../public/images/vehicle-diagram.png');
                const imageWidth = 400;
                const imageHeight = 300;
                const startX = 100;
                const startY = doc.y;

                // Add the vehicle diagram image
                if (fs.existsSync(imagePath)) {
                    doc.image(imagePath, startX, startY, {
                        width: imageWidth,
                        height: imageHeight
                    });
                } else {
                    console.error('Vehicle diagram image not found:', imagePath);
                    doc.text('Vehicle diagram image not found', startX, startY);
                }

                // Plot damage points
                report.vehicleDamage.rentalVehicleDamage.forEach(damage => {
                    if (damage.coordinates) {
                        const x = startX + (damage.coordinates.x / 100 * imageWidth);
                        const y = startY + (damage.coordinates.y / 100 * imageHeight);
                        plotDamagePoint(x, y, damage.type);
                    }
                });

                // Add legend
                doc.y = startY + imageHeight + 20;
                doc.fontSize(12).text('Damage Type Legend:');
                doc.moveDown(0.5);

                const damageTypes = ['dent', 'scratch', 'crack', 'break', 'missing', 'paint', 'glass', 'mechanical', 'other'];
                let legendX = startX;
                let legendY = doc.y;

                damageTypes.forEach((type, index) => {
                    if (index > 0 && index % 3 === 0) {
                        legendY += 20;
                        legendX = startX;
                    }
                    
                    plotDamagePoint(legendX, legendY, type);
                    doc.fill('#000000');
                    doc.text(` ${type.charAt(0).toUpperCase() + type.slice(1)}`, legendX + 15, legendY - 6);
                    
                    legendX += 120;
                });

                doc.moveDown(2);

                // List damage details
                report.vehicleDamage.rentalVehicleDamage.forEach((damage, index) => {
                    doc.fontSize(10);
                    doc.text(`Damage ${index + 1}:`);
                    doc.fontSize(9);
                    doc.text(`Type: ${safeText(damage.type)}`);
                    doc.text(`Description: ${safeText(damage.description)}`);
                    doc.text(`Severity: ${safeText(damage.severity)}`);
                    doc.text(`Timestamp: ${safeText(damage.timestamp)}`);
                    doc.moveDown(0.5);
                });
            }
            
            doc.text(`Additional Damage Description: ${report.vehicleDamage.additionalDamageDescription || 'N/A'}`);
            doc.moveDown();

            // Witness Information
            if (report.witnesses && report.witnesses.length > 0) {
                doc.fontSize(16).text('Witness Information');
                doc.fontSize(12);
                report.witnesses.forEach((witness, index) => {
                    doc.text(`Witness ${index + 1}:`);
                    doc.text(`Name: ${witness.firstName} ${witness.lastName}`);
                    doc.text(`Address: ${witness.address}, ${witness.city}, ${witness.state} ${witness.zip}`);
                    doc.text(`Phone: ${witness.phone}`);
                    doc.moveDown();
                });
            }

            // Accident Description
            doc.fontSize(16).text('Accident Description');
            doc.fontSize(12);
            doc.text(`Direction of Travel: ${report.accidentDescription.directionOfTravel || 'N/A'}`);
            if (report.accidentDescription.trafficControls && report.accidentDescription.trafficControls.length > 0) {
                doc.text('Traffic Controls:');
                report.accidentDescription.trafficControls.forEach(control => {
                    doc.text(`- ${control}`);
                });
            }
            doc.text(`Traffic Control Status: ${report.accidentDescription.trafficControlStatus || 'N/A'}`);
            doc.text(`Description: ${report.accidentDescription.description}`);
            doc.text(`Road Conditions: ${report.accidentDescription.roadConditions || 'N/A'}`);
            doc.text(`Lighting Conditions: ${report.accidentDescription.lightingConditions || 'N/A'}`);
            doc.moveDown();

            // Signature and Confirmation
            doc.fontSize(16).text('Signature and Confirmation');
            doc.fontSize(12);
            doc.text(`Accuracy Confirmation: ${report.signature.accuracyConfirmation ? 'Confirmed' : 'Not Confirmed'}`);
            doc.text(`Signature Date: ${safeText(report.signature.signedAt)}`);
            doc.moveDown();

            // Metadata
            doc.fontSize(16).text('Metadata');
            doc.fontSize(12);
            doc.text(`Created At: ${safeText(report.createdAt)}`);
            doc.text(`Updated At: ${safeText(report.updatedAt)}`);

            // Finalize the PDF
            doc.end();

            // Handle stream finish
            stream.on('finish', () => {
                resolve(pdfPath);
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
};

// Function to send email with PDF attachment
const sendReportEmail = async (report) => {
    try {
        // Generate PDF
        const pdfPath = await generatePDF(report);

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_TO,
            subject: `New Incident Report - ${report.personalInfo.firstName} ${report.personalInfo.lastName}`,
            text: 'Please find the attached incident report.',
            attachments: [{
                filename: `incident_report_${report._id}.pdf`,
                path: pdfPath
            }]
        });

        // Clean up temporary PDF file
        fs.unlinkSync(pdfPath);

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendReportEmail
}; 