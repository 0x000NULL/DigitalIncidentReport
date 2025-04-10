const fs = require('fs');
const path = require('path');

/**
 * Safely gets a value from an object with a default fallback
 * @param {Object} obj - The object to get the value from
 * @param {string} path - The path to the value (e.g., 'personalInfo.firstName')
 * @param {any} defaultValue - The default value if the path doesn't exist
 * @returns {any} - The value or default
 */
function getSafeValue(obj, path, defaultValue = 'N/A') {
    if (!obj) return defaultValue;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current[key] === undefined || current[key] === null) return defaultValue;
        current = current[key];
    }
    return current;
}

/**
 * Generates an HTML report from an incident report
 * @param {Object} report - The incident report document
 * @param {string} outputPath - Where to save the HTML file
 * @returns {Promise<string>} - Path to the generated HTML
 */
async function generateIncidentReportHTML(report, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Safely get values with defaults
            const firstName = getSafeValue(report, 'personalInfo.firstName', '');
            const lastName = getSafeValue(report, 'personalInfo.lastName', '');
            const reportId = getSafeValue(report, '_id', '');
            const status = getSafeValue(report, 'status', 'unknown');
            const createdAt = getSafeValue(report, 'createdAt', new Date());
            const updatedAt = getSafeValue(report, 'updatedAt', new Date());

            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Incident Report - ${firstName} ${lastName}</title>
    <link rel="stylesheet" href="/stylesheets/vehicle-diagram.css">
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --text-color: #333;
            --light-bg: #f8f9fa;
            --border-color: #dee2e6;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--light-bg);
            margin: 0;
            padding: 20px;
        }

        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        .header {
            background: var(--primary-color);
            color: white;
            padding: 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 2em;
        }

        .header .subtitle {
            opacity: 0.9;
            margin-top: 5px;
        }

        .section {
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
        }

        .section:last-child {
            border-bottom: none;
        }

        .section-title {
            color: var(--primary-color);
            font-size: 1.4em;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid var(--secondary-color);
        }

        .field-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }

        .field {
            background: var(--light-bg);
            padding: 10px;
            border-radius: 4px;
        }

        .field-label {
            font-weight: bold;
            color: var(--primary-color);
            display: block;
            margin-bottom: 5px;
        }

        .field-value {
            color: var(--text-color);
        }

        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.9em;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-draft { background: #f1c40f; color: #000; }
        .status-submitted { background: #2ecc71; color: #fff; }
        .status-under_review { background: #3498db; color: #fff; }
        .status-approved { background: #27ae60; color: #fff; }
        .status-rejected { background: #e74c3c; color: #fff; }

        .vehicle-diagram {
            border: 2px solid var(--border-color);
            padding: 20px;
            margin: 20px 0;
            position: relative;
            min-height: 400px;
            background: white;
        }

        .damage-point {
            position: absolute;
            width: 16px;
            height: 16px;
            background-color: var(--accent-color);
            border: 2px solid white;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
        }

        .damage-point-label {
            position: absolute;
            background: white;
            border: 1px solid var(--border-color);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8em;
            transform: translate(-50%, -50%);
        }

        .collapsible {
            background-color: var(--light-bg);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .collapsible:hover {
            background-color: #e9ecef;
        }

        .content {
            display: none;
            padding: 10px;
            background: white;
            border-radius: 4px;
            margin-top: 5px;
        }

        .show {
            display: block;
        }

        .signature-container {
            text-align: center;
            margin: 20px 0;
        }

        .signature-image {
            max-width: 300px;
            border: 1px solid var(--border-color);
            padding: 10px;
            background: white;
        }

        @media print {
            body {
                background-color: white;
            }
            .report-container {
                box-shadow: none;
            }
            .content {
                display: block;
            }
            .collapsible {
                background-color: white;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>Incident Report</h1>
            <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
        </div>

        <!-- Report Status -->
        <div class="section">
            <div class="section-title">Report Status</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Report ID:</span>
                    <span class="field-value">${reportId}</span>
                </div>
                <div class="field">
                    <span class="field-label">Status:</span>
                    <span class="field-value status-badge status-${status}">${status.replace('_', ' ')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Created:</span>
                    <span class="field-value">${new Date(createdAt).toLocaleString()}</span>
                </div>
                <div class="field">
                    <span class="field-label">Last Updated:</span>
                    <span class="field-value">${new Date(updatedAt).toLocaleString()}</span>
                </div>
            </div>
        </div>

        <!-- Policy Agreements -->
        <div class="section">
            <div class="section-title">Policy Agreements</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Terms Agreement:</span>
                    <span class="field-value">${getSafeValue(report, 'termsAgreement') ? '✓ Accepted' : '✗ Not Accepted'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Privacy Agreement:</span>
                    <span class="field-value">${getSafeValue(report, 'privacyAgreement') ? '✓ Accepted' : '✗ Not Accepted'}</span>
                </div>
                <div class="field">
                    <span class="field-label">E-Signature Agreement:</span>
                    <span class="field-value">${getSafeValue(report, 'esignatureAgreement') ? '✓ Accepted' : '✗ Not Accepted'}</span>
                </div>
            </div>
        </div>

        <!-- Personal Information -->
        <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Name:</span>
                    <span class="field-value">${firstName} ${lastName}</span>
                </div>
                <div class="field">
                    <span class="field-label">Address:</span>
                    <span class="field-value">${getSafeValue(report, 'personalInfo.address')}, ${getSafeValue(report, 'personalInfo.city')}, ${getSafeValue(report, 'personalInfo.state')} ${getSafeValue(report, 'personalInfo.zip')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Home Phone:</span>
                    <span class="field-value">${getSafeValue(report, 'personalInfo.homePhone')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Work Phone:</span>
                    <span class="field-value">${getSafeValue(report, 'personalInfo.workPhone')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Email:</span>
                    <span class="field-value">${getSafeValue(report, 'personalInfo.email')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Owns Vehicle:</span>
                    <span class="field-value">${getSafeValue(report, 'personalInfo.ownsVehicle')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Insurance Company:</span>
                    <span class="field-value">${getSafeValue(report, 'personalInfo.insuranceCompany')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Policy Number:</span>
                    <span class="field-value">${getSafeValue(report, 'personalInfo.policyNumber')}</span>
                </div>
            </div>
        </div>

        <!-- Vehicle Information -->
        <div class="section">
            <div class="section-title">Vehicle Information</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Vehicle Number:</span>
                    <span class="field-value">${getSafeValue(report, 'vehicleInfo.vehicleNumber')}</span>
                </div>
                <div class="field">
                    <span class="field-label">License Plate:</span>
                    <span class="field-value">${getSafeValue(report, 'vehicleInfo.licensePlate')} (${getSafeValue(report, 'vehicleInfo.licenseState')})</span>
                </div>
                <div class="field">
                    <span class="field-label">Make/Model:</span>
                    <span class="field-value">${getSafeValue(report, 'vehicleInfo.vehicleMake')} ${getSafeValue(report, 'vehicleInfo.vehicleModel')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Odometer:</span>
                    <span class="field-value">${getSafeValue(report, 'vehicleInfo.odometer')}</span>
                </div>
            </div>
        </div>

        <!-- Incident Details -->
        <div class="section">
            <div class="section-title">Incident Details</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Renter Operating:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.renterOperating')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Vehicle Use:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.vehicleUse')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Credit Card Coverage:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.creditCardCoverage')}</span>
                </div>
            </div>
            <div class="field">
                <span class="field-label">Description:</span>
                <div class="field-value" style="white-space: pre-wrap;">${getSafeValue(report, 'incidentDetails.description')}</div>
            </div>
        </div>

        <!-- Operator Information -->
        <div class="section">
            <div class="section-title">Operator Information</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Name:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.firstName')} ${getSafeValue(report, 'incidentDetails.operatorInfo.lastName')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Date of Birth:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.dob') ? new Date(getSafeValue(report, 'incidentDetails.operatorInfo.dob')).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Phone:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.phone')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Address:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.address')}, ${getSafeValue(report, 'incidentDetails.operatorInfo.city')}, ${getSafeValue(report, 'incidentDetails.operatorInfo.state')} ${getSafeValue(report, 'incidentDetails.operatorInfo.zip')}</span>
                </div>
                <div class="field">
                    <span class="field-label">License Number:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.licenseNumber')} (${getSafeValue(report, 'incidentDetails.operatorInfo.licenseState')})</span>
                </div>
                <div class="field">
                    <span class="field-label">Owns Vehicle:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.ownsVehicle')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Employer:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.employer')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Work Phone:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.workPhone')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Work Address:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.workAddress')}, ${getSafeValue(report, 'incidentDetails.operatorInfo.workCity')}, ${getSafeValue(report, 'incidentDetails.operatorInfo.workState')} ${getSafeValue(report, 'incidentDetails.operatorInfo.workZip')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Insurance Company:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.insuranceCompany')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Policy Number:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentDetails.operatorInfo.policyNumber')}</span>
                </div>
            </div>
        </div>

        <!-- Incident Location -->
        <div class="section">
            <div class="section-title">Incident Location</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Knows Location:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentLocation.knowsLocation')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Date:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentLocation.date') ? new Date(getSafeValue(report, 'incidentLocation.date')).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Time:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentLocation.time')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Weather:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentLocation.weather')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Address:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentLocation.address')}, ${getSafeValue(report, 'incidentLocation.city')}, ${getSafeValue(report, 'incidentLocation.state')} ${getSafeValue(report, 'incidentLocation.zip')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Police Department:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentLocation.policeDepartment')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Police Report Number:</span>
                    <span class="field-value">${getSafeValue(report, 'incidentLocation.policeReportNumber')}</span>
                </div>
            </div>
        </div>

        <!-- Vehicle Damage -->
        <div class="section">
            <div class="section-title">Vehicle Damage</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Other Vehicle Involved:</span>
                    <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInvolved')}</span>
                </div>
            </div>

            ${getSafeValue(report, 'vehicleDamage.otherVehicleInfo') ? `
            <div class="collapsible">
                <strong>Other Vehicle Information (Click to expand)</strong>
                <div class="content">
                    <h4>Owner Information</h4>
                    <div class="field-group">
                        <div class="field">
                            <span class="field-label">Name:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.owner.firstName')} ${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.owner.lastName')}</span>
                        </div>
                        <div class="field">
                            <span class="field-label">Address:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.owner.address')}, ${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.owner.city')}, ${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.owner.state')} ${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.owner.zip')}</span>
                        </div>
                        <div class="field">
                            <span class="field-label">Phone:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.owner.phone')}</span>
                        </div>
                    </div>

                    <h4>Operator Information</h4>
                    <div class="field-group">
                        <div class="field">
                            <span class="field-label">Name:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.operator.firstName')} ${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.operator.lastName')}</span>
                        </div>
                        <div class="field">
                            <span class="field-label">License:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.operator.licenseNumber')} (${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.operator.licenseState')})</span>
                        </div>
                        <div class="field">
                            <span class="field-label">Insurance:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.operator.insuranceCompany')} - ${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.operator.policyNumber')}</span>
                        </div>
                    </div>

                    <h4>Vehicle Details</h4>
                    <div class="field-group">
                        <div class="field">
                            <span class="field-label">Make/Model:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.vehicle.make')} ${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.vehicle.model')}</span>
                        </div>
                        <div class="field">
                            <span class="field-label">License Plate:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.vehicle.licensePlate')} (${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.vehicle.licenseState')})</span>
                        </div>
                        <div class="field">
                            <span class="field-label">Damage:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.vehicle.damageDescription')}</span>
                        </div>
                        <div class="field">
                            <span class="field-label">Driveable:</span>
                            <span class="field-value">${getSafeValue(report, 'vehicleDamage.otherVehicleInfo.vehicle.driveable')}</span>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            ${getSafeValue(report, 'vehicleDamage.rentalVehicleDamage') && getSafeValue(report, 'vehicleDamage.rentalVehicleDamage').length > 0 ? `
            <div class="vehicle-diagram">
                <div class="vehicle-diagram-container">
                    <div class="vehicle-image-wrapper">
                        <img src="/images/vehicle-diagram.png" alt="Vehicle Diagram" class="vehicle-image">
                        <div id="damageMarkers">
                            ${getSafeValue(report, 'vehicleDamage.rentalVehicleDamage').map((damage, index) => `
                                <div class="damage-marker" style="left: ${getSafeValue(damage, 'coordinates.x', 0) * 100}%; top: ${getSafeValue(damage, 'coordinates.y', 0) * 100}%">
                                    <span class="damage-number">${index + 1}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <style>
                    .vehicle-diagram {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin: 20px 0;
                    }

                    .vehicle-diagram-container {
                        position: relative;
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid var(--border-color);
                        border-radius: 4px;
                    }

                    .vehicle-image-wrapper {
                        position: relative;
                        width: 100%;
                    }

                    .vehicle-image {
                        width: 100%;
                        height: auto;
                        display: block;
                    }

                    #damageMarkers {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                    }

                    .damage-marker {
                        position: absolute;
                        width: 24px;
                        height: 24px;
                        background-color: #e74c3c;
                        border: 2px solid white;
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 0 5px rgba(0,0,0,0.3);
                        pointer-events: auto;
                        z-index: 10;
                    }

                    .damage-number {
                        color: white;
                        font-size: 14px;
                        font-weight: bold;
                    }

                    .damage-marker:hover {
                        background-color: #c0392b;
                        cursor: pointer;
                        transform: translate(-50%, -50%) scale(1.1);
                        transition: transform 0.2s ease;
                    }
                </style>

                <div class="collapsible">
                    <strong>Damage Details (Click to expand)</strong>
                    <div class="content">
                        ${getSafeValue(report, 'vehicleDamage.rentalVehicleDamage').map((damage, index) => `
                            <div class="damage-detail" data-marker="${index + 1}">
                                <h4>Damage Point ${index + 1}</h4>
                                <div class="field-group">
                                    <div class="field">
                                        <span class="field-label">Type:</span>
                                        <span class="field-value">${getSafeValue(damage, 'type')}</span>
                                    </div>
                                    <div class="field">
                                        <span class="field-label">Severity:</span>
                                        <span class="field-value">${getSafeValue(damage, 'severity')}</span>
                                    </div>
                                </div>
                                <div class="field">
                                    <span class="field-label">Description:</span>
                                    <div class="field-value" style="white-space: pre-wrap;">${getSafeValue(damage, 'description')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="field">
                <span class="field-label">Additional Damage Description:</span>
                <div class="field-value" style="white-space: pre-wrap;">${getSafeValue(report, 'vehicleDamage.additionalDamageDescription', 'None')}</div>
            </div>
        </div>

        <!-- Witnesses -->
        ${getSafeValue(report, 'witnesses') && getSafeValue(report, 'witnesses').length > 0 ? `
        <div class="section">
            <div class="section-title">Witnesses</div>
            ${getSafeValue(report, 'witnesses').map((witness, index) => `
                <div class="field-group" style="margin-bottom: 15px;">
                    <h4>Witness ${index + 1}</h4>
                    <div class="field">
                        <span class="field-label">Name:</span>
                        <span class="field-value">${getSafeValue(witness, 'firstName')} ${getSafeValue(witness, 'lastName')}</span>
                    </div>
                    <div class="field">
                        <span class="field-label">Address:</span>
                        <span class="field-value">${getSafeValue(witness, 'address')}, ${getSafeValue(witness, 'city')}, ${getSafeValue(witness, 'state')} ${getSafeValue(witness, 'zip')}</span>
                    </div>
                    <div class="field">
                        <span class="field-label">Phone:</span>
                        <span class="field-value">${getSafeValue(witness, 'phone')}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Accident Description -->
        <div class="section">
            <div class="section-title">Accident Description</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Direction of Travel:</span>
                    <span class="field-value">${getSafeValue(report, 'accidentDescription.directionOfTravel')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Traffic Controls:</span>
                    <span class="field-value">${Array.isArray(getSafeValue(report, 'accidentDescription.trafficControls')) ? getSafeValue(report, 'accidentDescription.trafficControls').join(', ') : 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Traffic Control Status:</span>
                    <span class="field-value">${getSafeValue(report, 'accidentDescription.trafficControlStatus')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Road Conditions:</span>
                    <span class="field-value">${getSafeValue(report, 'accidentDescription.roadConditions')}</span>
                </div>
                <div class="field">
                    <span class="field-label">Lighting Conditions:</span>
                    <span class="field-value">${getSafeValue(report, 'accidentDescription.lightingConditions')}</span>
                </div>
            </div>
            <div class="field">
                <span class="field-label">Description:</span>
                <div class="field-value" style="white-space: pre-wrap;">${getSafeValue(report, 'accidentDescription.description')}</div>
            </div>
        </div>

        <!-- Signature -->
        <div class="section">
            <div class="section-title">Signature and Confirmation</div>
            <div class="field-group">
                <div class="field">
                    <span class="field-label">Accuracy Confirmation:</span>
                    <span class="field-value">${getSafeValue(report, 'signature.accuracyConfirmation') ? '✓ Confirmed' : '✗ Not Confirmed'}</span>
                </div>
            </div>
            ${getSafeValue(report, 'signature.signatureData') ? `
            <div class="signature-container">
                <div class="field-label">Signature:</div>
                <img src="${getSafeValue(report, 'signature.signatureData')}" alt="Signature" class="signature-image">
            </div>
            ` : ''}
        </div>
    </div>

    <script>
        // Add click handlers for collapsible sections
        document.querySelectorAll('.collapsible').forEach(button => {
            button.addEventListener('click', () => {
                button.querySelector('.content').classList.toggle('show');
            });
        });
    </script>
</body>
</html>`;

            // Create output directory if it doesn't exist
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write the HTML file
            fs.writeFileSync(outputPath, html);
            resolve(outputPath);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateIncidentReportHTML
}; 