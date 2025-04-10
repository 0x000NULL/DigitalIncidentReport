const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const reportRouter = require('../routes/report');
const IncidentReport = require('../models/IncidentReport');
const path = require('path');

// Create an Express app and use the report router
const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use('/report', reportRouter);

// Mock console.log and console.error
console.log = jest.fn();
console.error = jest.fn();

describe('Report Routes', () => {
    let mongoServer;
    let validReportData;

    beforeAll(async () => {
        // Start MongoDB memory server
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create valid report data for testing
        validReportData = {
            // Policy Agreements
            termsAgreement: true,
            privacyAgreement: true,
            esignatureAgreement: true,

            // Personal Information
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345',
            homePhone: '555-123-4567',
            workPhone: '555-987-6543',
            email: 'john.doe@example.com',
            ownsVehicle: 'yes',
            insuranceCompany: 'ABC Insurance',
            policyNumber: 'POL123456',

            // Vehicle Information
            vehicleNumber: 'VH123456',
            licensePlate: 'ABC123',
            licenseState: 'CA',
            vehicleMake: 'Toyota',
            vehicleModel: 'Camry',
            odometer: '50000',

            // Incident Details
            renterOperating: 'yes',
            vehicleUse: 'personal',
            creditCardCoverage: 'yes',
            description: 'Test incident description',

            // Incident Location
            knowsLocation: 'yes',
            incidentDate: '2024-04-10',
            incidentTime: '14:30',
            weather: 'clear',
            incidentAddress: '456 Oak St',
            incidentCity: 'Anytown',
            incidentState: 'CA',
            incidentZip: '12345',
            policeDepartment: 'Anytown PD',
            policeReportNumber: 'PR123456',

            // Vehicle Damage
            otherVehicleInvolved: 'no',
            damageDescription: 'Minor scratch on rear bumper',

            // Accident Description
            directionOfTravel: 'north',
            trafficControls: ['traffic_light', 'stop_sign'],
            trafficControlStatus: 'working',
            accidentDescription: 'Test accident description',
            roadConditions: 'dry',
            lightingConditions: 'daylight',

            // Signature and Confirmation
            accuracyConfirmation: true,
            signatureData: 'John Doe'
        };
    });

    afterEach(async () => {
        // Clear the database after each test
        await IncidentReport.deleteMany({});
    });

    describe('GET /report', () => {
        it('should render the report form', async () => {
            const response = await request(app)
                .get('/report')
                .expect('Content-Type', /html/)
                .expect(200);

            // Check if the response contains the expected template variables
            expect(response.text).toContain('Incident Report');
            expect(response.text).toContain('data-progress="11.11111111111111"'); // (1/9) * 100
            expect(response.text).toContain('data-page="1"');
        });
    });

    describe('POST /report/submit', () => {
        it('should successfully submit a valid report', async () => {
            const response = await request(app)
                .post('/report/submit')
                .send(validReportData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Incident report submitted successfully');
            expect(response.body.reportId).toBeDefined();

            // Verify the report was saved in the database
            const savedReport = await IncidentReport.findById(response.body.reportId);
            expect(savedReport).toBeTruthy();
            expect(savedReport.personalInfo.firstName).toBe(validReportData.firstName);
            expect(savedReport.status).toBe('submitted');
        });

        it('should return 400 when required fields are missing', async () => {
            const incompleteData = { ...validReportData };
            delete incompleteData.firstName;
            delete incompleteData.lastName;

            const response = await request(app)
                .post('/report/submit')
                .send(incompleteData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Missing required fields');
            expect(response.body.errors).toContain('Missing required field: firstName');
            expect(response.body.errors).toContain('Missing required field: lastName');
        });

        it('should return 400 when agreements are not accepted', async () => {
            const dataWithoutAgreements = { ...validReportData };
            dataWithoutAgreements.termsAgreement = false;
            dataWithoutAgreements.privacyAgreement = false;
            dataWithoutAgreements.esignatureAgreement = false;

            const response = await request(app)
                .post('/report/submit')
                .send(dataWithoutAgreements)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('All agreements must be accepted');
        });

        it('should return 400 when odometer is invalid', async () => {
            const dataWithInvalidOdometer = { ...validReportData };
            dataWithInvalidOdometer.odometer = 'invalid';

            const response = await request(app)
                .post('/report/submit')
                .send(dataWithInvalidOdometer)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid odometer reading');
        });

        it('should handle operator information when renter is not operating', async () => {
            const dataWithOperator = { ...validReportData };
            dataWithOperator.renterOperating = 'no';
            dataWithOperator.operatorFirstName = 'Jane';
            dataWithOperator.operatorLastName = 'Smith';
            dataWithOperator.operatorDOB = '1990-01-01';
            dataWithOperator.operatorPhone = '555-111-2222';
            dataWithOperator.operatorAddress = '789 Pine St';
            dataWithOperator.operatorCity = 'Anytown';
            dataWithOperator.operatorState = 'CA';
            dataWithOperator.operatorZip = '12345';
            dataWithOperator.operatorLicense = 'DL123456';
            dataWithOperator.operatorLicenseState = 'CA';
            dataWithOperator.operatorOwnsVehicle = 'yes';
            dataWithOperator.operatorEmployer = 'ABC Corp';
            dataWithOperator.operatorWorkPhone = '555-333-4444';
            dataWithOperator.operatorWorkAddress = '321 Work St';
            dataWithOperator.operatorWorkCity = 'Worktown';
            dataWithOperator.operatorWorkState = 'CA';
            dataWithOperator.operatorWorkZip = '54321';
            dataWithOperator.operatorInsuranceCompany = 'XYZ Insurance';
            dataWithOperator.operatorPolicyNumber = 'POL789012';

            const response = await request(app)
                .post('/report/submit')
                .send(dataWithOperator)
                .expect(200);

            const savedReport = await IncidentReport.findById(response.body.reportId);
            expect(savedReport.incidentDetails.operatorInfo).toBeTruthy();
            expect(savedReport.incidentDetails.operatorInfo.firstName).toBe('Jane');
            expect(savedReport.incidentDetails.operatorInfo.lastName).toBe('Smith');
        });

        it('should handle other vehicle information when another vehicle is involved', async () => {
            const dataWithOtherVehicle = { ...validReportData };
            dataWithOtherVehicle.otherVehicleInvolved = 'yes';
            dataWithOtherVehicle.otherOwnerFirstName = 'Bob';
            dataWithOtherVehicle.otherOwnerLastName = 'Johnson';
            dataWithOtherVehicle.otherOwnerAddress = '321 Maple St';
            dataWithOtherVehicle.otherOwnerCity = 'Anytown';
            dataWithOtherVehicle.otherOwnerState = 'CA';
            dataWithOtherVehicle.otherOwnerZip = '12345';
            dataWithOtherVehicle.otherOwnerPhone = '555-555-5555';
            dataWithOtherVehicle.ownerOperating = 'no';
            dataWithOtherVehicle.otherOperatorFirstName = 'Alice';
            dataWithOtherVehicle.otherOperatorLastName = 'Johnson';
            dataWithOtherVehicle.otherOperatorAddress = '321 Maple St';
            dataWithOtherVehicle.otherOperatorCity = 'Anytown';
            dataWithOtherVehicle.otherOperatorState = 'CA';
            dataWithOtherVehicle.otherOperatorZip = '12345';
            dataWithOtherVehicle.otherOperatorPhone = '555-666-7777';
            dataWithOtherVehicle.otherOperatorLicense = 'DL789012';
            dataWithOtherVehicle.otherOperatorLicenseState = 'CA';
            dataWithOtherVehicle.otherOperatorInsurance = 'DEF Insurance';
            dataWithOtherVehicle.otherOperatorPolicy = 'POL345678';
            dataWithOtherVehicle.otherVehicleMake = 'Honda';
            dataWithOtherVehicle.otherVehicleModel = 'Civic';
            dataWithOtherVehicle.otherVehicleOdometer = '30000';
            dataWithOtherVehicle.otherVehicleLicense = 'XYZ789';
            dataWithOtherVehicle.otherVehicleLicenseState = 'CA';
            dataWithOtherVehicle.otherVehicleDamage = 'Front bumper damage';
            dataWithOtherVehicle.otherVehicleDriveable = 'yes';

            const response = await request(app)
                .post('/report/submit')
                .send(dataWithOtherVehicle)
                .expect(200);

            const savedReport = await IncidentReport.findById(response.body.reportId);
            expect(savedReport.vehicleDamage.otherVehicleInfo).toBeTruthy();
            expect(savedReport.vehicleDamage.otherVehicleInfo.owner.firstName).toBe('Bob');
            expect(savedReport.vehicleDamage.otherVehicleInfo.operator.firstName).toBe('Alice');
            expect(savedReport.vehicleDamage.otherVehicleInfo.vehicle.make).toBe('Honda');
        });

        it('should handle damage markers correctly', async () => {
            const dataWithDamageMarkers = { ...validReportData };
            dataWithDamageMarkers.damageMarkers = JSON.stringify([
                {
                    coordinates: { x: 10, y: 20 },
                    type: 'dent',
                    description: 'Small dent on driver side door',
                    severity: 'minor'
                },
                {
                    coordinates: { x: 30, y: 40 },
                    type: 'scratch',
                    description: 'Long scratch on rear bumper',
                    severity: 'moderate'
                }
            ]);

            const response = await request(app)
                .post('/report/submit')
                .send(dataWithDamageMarkers)
                .expect(200);

            const savedReport = await IncidentReport.findById(response.body.reportId);
            expect(savedReport.vehicleDamage.rentalVehicleDamage).toHaveLength(2);
            expect(savedReport.vehicleDamage.rentalVehicleDamage[0].type).toBe('dent');
            expect(savedReport.vehicleDamage.rentalVehicleDamage[1].type).toBe('scratch');
        });

        it('should handle witness information correctly', async () => {
            const dataWithWitnesses = { ...validReportData };
            dataWithWitnesses.hasWitnesses = 'yes';
            dataWithWitnesses.witnessCount = '2';
            dataWithWitnesses['witnessFirstName[0]'] = 'Witness1';
            dataWithWitnesses['witnessLastName[0]'] = 'One';
            dataWithWitnesses['witnessAddress[0]'] = '111 Witness St';
            dataWithWitnesses['witnessCity[0]'] = 'Anytown';
            dataWithWitnesses['witnessState[0]'] = 'CA';
            dataWithWitnesses['witnessZip[0]'] = '12345';
            dataWithWitnesses['witnessPhone[0]'] = '555-111-1111';
            dataWithWitnesses['witnessFirstName[1]'] = 'Witness2';
            dataWithWitnesses['witnessLastName[1]'] = 'Two';
            dataWithWitnesses['witnessAddress[1]'] = '222 Witness St';
            dataWithWitnesses['witnessCity[1]'] = 'Anytown';
            dataWithWitnesses['witnessState[1]'] = 'CA';
            dataWithWitnesses['witnessZip[1]'] = '12345';
            dataWithWitnesses['witnessPhone[1]'] = '555-222-2222';

            const response = await request(app)
                .post('/report/submit')
                .send(dataWithWitnesses)
                .expect(200);

            const savedReport = await IncidentReport.findById(response.body.reportId);
            expect(savedReport.witnesses).toHaveLength(2);
            expect(savedReport.witnesses[0].firstName).toBe('Witness1');
            expect(savedReport.witnesses[1].firstName).toBe('Witness2');
        });

        it('should handle database errors gracefully', async () => {
            // Mock the save method to throw an error
            const originalSave = IncidentReport.prototype.save;
            IncidentReport.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/report/submit')
                .send(validReportData)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Error submitting incident report');

            // Restore the original save method
            IncidentReport.prototype.save = originalSave;
        });

        it('should handle validation errors from mongoose', async () => {
            // Mock the save method to throw a validation error
            const originalSave = IncidentReport.prototype.save;
            IncidentReport.prototype.save = jest.fn().mockRejectedValue({
                name: 'ValidationError',
                errors: {
                    'personalInfo.email': { message: 'Invalid email format' }
                }
            });

            const response = await request(app)
                .post('/report/submit')
                .send(validReportData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation error');
            expect(response.body.errors).toContain('Invalid email format');

            // Restore the original save method
            IncidentReport.prototype.save = originalSave;
        });
    });
}); 