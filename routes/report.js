const express = require('express');
const router = express.Router();
const IncidentReport = require('../models/IncidentReport');

// GET route for the report form
router.get('/', (req, res) => {
    res.render('report', { 
        title: 'Incident Report',
        currentPage: 1,
        totalPages: 9
    });
});

// POST route to handle form submissions
router.post('/submit', async (req, res) => {
    try {
        console.log('Received submission request:', req.body);
        
        // Validate required fields
        const requiredFields = [
            'firstName', 'lastName', 'address', 'city', 'state', 'zip',
            'homePhone', 'email', 'ownsVehicle', 'insuranceCompany', 'policyNumber',
            'vehicleNumber', 'licensePlate', 'licenseState', 'vehicleMake', 'vehicleModel',
            'odometer', 'renterOperating', 'vehicleUse', 'creditCardCoverage', 'description',
            'knowsLocation', 'otherVehicleInvolved', 'directionOfTravel', 'trafficControlStatus',
            'accidentDescription', 'roadConditions', 'lightingConditions', 'signatureData'
        ];

        // Log missing fields
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                errors: missingFields.map(field => `Missing required field: ${field}`)
            });
        }

        // Validate agreements
        if (!req.body.termsAgreement || !req.body.privacyAgreement || !req.body.esignatureAgreement) {
            console.log('Missing agreements:', {
                termsAgreement: req.body.termsAgreement,
                privacyAgreement: req.body.privacyAgreement,
                esignatureAgreement: req.body.esignatureAgreement
            });
            return res.status(400).json({
                success: false,
                message: 'All agreements must be accepted'
            });
        }

        // Validate odometer
        const odometer = parseInt(req.body.odometer);
        if (isNaN(odometer)) {
            console.log('Invalid odometer value:', req.body.odometer);
            return res.status(400).json({
                success: false,
                message: 'Invalid odometer reading'
            });
        }

        // Create a new incident report from the form data
        const report = new IncidentReport({
            // Policy Agreements
            termsAgreement: req.body.termsAgreement,
            privacyAgreement: req.body.privacyAgreement,
            esignatureAgreement: req.body.esignatureAgreement,

            // Personal Information
            personalInfo: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip,
                homePhone: req.body.homePhone,
                workPhone: req.body.workPhone,
                email: req.body.email,
                ownsVehicle: req.body.ownsVehicle,
                insuranceCompany: req.body.insuranceCompany,
                policyNumber: req.body.policyNumber
            },

            // Vehicle Information
            vehicleInfo: {
                vehicleNumber: req.body.vehicleNumber,
                licensePlate: req.body.licensePlate,
                licenseState: req.body.licenseState,
                vehicleMake: req.body.vehicleMake,
                vehicleModel: req.body.vehicleModel,
                odometer: odometer
            },

            // Incident Details
            incidentDetails: {
                renterOperating: req.body.renterOperating,
                operatorInfo: req.body.renterOperating === 'no' ? {
                    firstName: req.body.operatorFirstName,
                    lastName: req.body.operatorLastName,
                    dob: req.body.operatorDOB,
                    phone: req.body.operatorPhone,
                    address: req.body.operatorAddress,
                    city: req.body.operatorCity,
                    state: req.body.operatorState,
                    zip: req.body.operatorZip,
                    licenseNumber: req.body.operatorLicense,
                    licenseState: req.body.operatorLicenseState,
                    ownsVehicle: req.body.operatorOwnsVehicle,
                    employer: req.body.operatorEmployer,
                    workPhone: req.body.operatorWorkPhone,
                    workAddress: req.body.operatorWorkAddress,
                    workCity: req.body.operatorWorkCity,
                    workState: req.body.operatorWorkState,
                    workZip: req.body.operatorWorkZip,
                    insuranceCompany: req.body.operatorInsuranceCompany,
                    policyNumber: req.body.operatorPolicyNumber
                } : null,
                vehicleUse: req.body.vehicleUse,
                creditCardCoverage: req.body.creditCardCoverage,
                description: req.body.description
            },

            // Incident Location
            incidentLocation: {
                knowsLocation: req.body.knowsLocation,
                date: req.body.incidentDate,
                time: req.body.incidentTime,
                weather: ['clear', 'cloudy', 'rain', 'snow', 'fog', 'other'].includes(req.body.weather) ? req.body.weather : null,
                address: req.body.incidentAddress,
                city: req.body.incidentCity,
                state: req.body.incidentState,
                zip: req.body.incidentZip,
                policeDepartment: req.body.policeDepartment,
                policeReportNumber: req.body.policeReportNumber
            },

            // Vehicle Damage
            vehicleDamage: {
                otherVehicleInvolved: req.body.otherVehicleInvolved,
                otherVehicleInfo: req.body.otherVehicleInvolved === 'yes' ? {
                    owner: {
                        firstName: req.body.otherOwnerFirstName,
                        lastName: req.body.otherOwnerLastName,
                        address: req.body.otherOwnerAddress,
                        city: req.body.otherOwnerCity,
                        state: req.body.otherOwnerState,
                        zip: req.body.otherOwnerZip,
                        phone: req.body.otherOwnerPhone
                    },
                    operator: req.body.ownerOperating === 'no' ? {
                        firstName: req.body.otherOperatorFirstName,
                        lastName: req.body.otherOperatorLastName,
                        address: req.body.otherOperatorAddress,
                        city: req.body.otherOperatorCity,
                        state: req.body.otherOperatorState,
                        zip: req.body.otherOperatorZip,
                        phone: req.body.otherOperatorPhone,
                        licenseNumber: req.body.otherOperatorLicense,
                        licenseState: req.body.otherOperatorLicenseState,
                        insuranceCompany: req.body.otherOperatorInsurance,
                        policyNumber: req.body.otherOperatorPolicy
                    } : null,
                    vehicle: {
                        make: req.body.otherVehicleMake,
                        model: req.body.otherVehicleModel,
                        odometer: parseInt(req.body.otherVehicleOdometer) || 0,
                        licensePlate: req.body.otherVehicleLicense,
                        licenseState: req.body.otherVehicleLicenseState,
                        damageDescription: req.body.otherVehicleDamage,
                        driveable: req.body.otherVehicleDriveable
                    }
                } : null,
                rentalVehicleDamage: (() => {
                    try {
                        if (req.body.damageMarkers) {
                            const markers = JSON.parse(req.body.damageMarkers);
                            if (Array.isArray(markers)) {
                                return markers.map(marker => ({
                                    coordinates: {
                                        x: marker.coordinates?.x || 0,
                                        y: marker.coordinates?.y || 0
                                    },
                                    type: marker.type || 'unknown',
                                    description: marker.description || '',
                                    severity: marker.severity || 'moderate'
                                }));
                            }
                        }
                        return [];
                    } catch (error) {
                        console.error('Error parsing damage markers:', error);
                        return [];
                    }
                })(),
                additionalDamageDescription: req.body.damageDescription
            },

            // Witness Information
            witnesses: req.body.hasWitnesses === 'yes' ? Array(parseInt(req.body.witnessCount)).fill().map((_, i) => ({
                firstName: req.body[`witnessFirstName[${i}]`],
                lastName: req.body[`witnessLastName[${i}]`],
                address: req.body[`witnessAddress[${i}]`],
                city: req.body[`witnessCity[${i}]`],
                state: req.body[`witnessState[${i}]`],
                zip: req.body[`witnessZip[${i}]`],
                phone: req.body[`witnessPhone[${i}]`]
            })) : [],

            // Accident Description
            accidentDescription: {
                directionOfTravel: req.body.directionOfTravel,
                trafficControls: req.body.trafficControls || [],
                trafficControlStatus: req.body.trafficControlStatus,
                description: req.body.accidentDescription,
                roadConditions: req.body.roadConditions,
                lightingConditions: req.body.lightingConditions
            },

            // Signature and Confirmation
            signature: {
                accuracyConfirmation: req.body.accuracyConfirmation,
                signatureData: req.body.signatureData
            },

            // Set status to submitted
            status: 'submitted'
        });

        // Save the report to the database
        await report.save();

        // Send success response
        res.json({ 
            success: true, 
            message: 'Incident report submitted successfully',
            reportId: report._id 
        });
    } catch (error) {
        console.error('Error submitting incident report:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            console.log('Validation errors:', errors);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        // Handle other errors
        res.status(500).json({ 
            success: false, 
            message: 'Error submitting incident report',
            error: error.message 
        });
    }
});

module.exports = router; 