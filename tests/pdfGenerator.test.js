const { generateIncidentReportPDF } = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Mock fs and PDFDocument
jest.mock('fs');
jest.mock('pdfkit');

describe('PDF Generator', () => {
    const mockReport = {
        _id: '123456789',
        createdAt: new Date('2024-03-15'),
        personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345',
            homePhone: '555-123-4567',
            email: 'john.doe@example.com'
        },
        vehicleInfo: {
            vehicleNumber: 'V123',
            licensePlate: 'ABC123',
            licenseState: 'CA',
            vehicleMake: 'Toyota',
            vehicleModel: 'Camry',
            odometer: 50000
        },
        incidentLocation: {
            date: new Date('2024-03-14'),
            time: '14:30',
            address: '456 Oak St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345',
            weather: 'Sunny'
        },
        accidentDescription: {
            directionOfTravel: 'North',
            roadConditions: 'Dry',
            lightingConditions: 'Daylight',
            description: 'Test accident description'
        },
        vehicleDamage: {
            rentalVehicleDamage: [
                {
                    type: 'Scratch',
                    severity: 'Minor',
                    description: 'Front bumper scratch'
                }
            ]
        },
        witnesses: [
            {
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '555-987-6543',
                address: '789 Pine St',
                city: 'Anytown',
                state: 'CA',
                zip: '12345'
            }
        ]
    };

    const outputPath = path.join(__dirname, '..', 'public', 'pdfs', 'test-report.pdf');
    let mockDoc;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Mock fs.existsSync to return false (directory doesn't exist)
        fs.existsSync.mockReturnValue(false);
        
        // Mock fs.mkdirSync
        fs.mkdirSync.mockImplementation(() => {});
        
        // Mock fs.createWriteStream
        fs.createWriteStream.mockReturnValue({
            on: jest.fn((event, callback) => {
                if (event === 'finish') {
                    callback();
                }
                return {
                    on: jest.fn()
                };
            })
        });

        // Create a mock PDFDocument instance
        mockDoc = {
            pipe: jest.fn(),
            fontSize: jest.fn().mockReturnThis(),
            text: jest.fn().mockReturnThis(),
            moveDown: jest.fn().mockReturnThis(),
            end: jest.fn(),
            bufferedPageRange: jest.fn().mockReturnValue({ count: 1 }),
            switchToPage: jest.fn().mockReturnThis(),
            page: { height: 800 }
        };

        // Mock PDFDocument constructor
        PDFDocument.mockImplementation(() => mockDoc);
    });

    test('should create output directory if it doesn\'t exist', async () => {
        await generateIncidentReportPDF(mockReport, outputPath);
        
        expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(outputPath));
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(outputPath), { recursive: true });
    });

    test('should generate PDF with correct content structure', async () => {
        await generateIncidentReportPDF(mockReport, outputPath);

        // Verify PDF structure
        expect(mockDoc.fontSize).toHaveBeenCalledWith(20);
        expect(mockDoc.text).toHaveBeenCalledWith('Incident Report', { align: 'center' });
        
        // Verify personal information section
        expect(mockDoc.fontSize).toHaveBeenCalledWith(14);
        expect(mockDoc.text).toHaveBeenCalledWith('Personal Information', { underline: true });
        
        // Verify vehicle information section
        expect(mockDoc.text).toHaveBeenCalledWith('Vehicle Information', { underline: true });
        
        // Verify incident details section
        expect(mockDoc.text).toHaveBeenCalledWith('Incident Details', { underline: true });
        
        // Verify accident description section
        expect(mockDoc.text).toHaveBeenCalledWith('Accident Description', { underline: true });
        
        // Verify vehicle damage section
        expect(mockDoc.text).toHaveBeenCalledWith('Vehicle Damage', { underline: true });
        
        // Verify witnesses section
        expect(mockDoc.text).toHaveBeenCalledWith('Witnesses', { underline: true });
    });

    test('should handle reports without optional sections', async () => {
        const minimalReport = {
            ...mockReport,
            vehicleDamage: { rentalVehicleDamage: [] },
            witnesses: []
        };

        await generateIncidentReportPDF(minimalReport, outputPath);

        // Verify that the PDF was still generated successfully
        expect(fs.createWriteStream).toHaveBeenCalledWith(outputPath);
    });

    test('should handle errors during PDF generation', async () => {
        const error = new Error('PDF generation failed');
        fs.createWriteStream.mockImplementation(() => {
            throw error;
        });

        await expect(generateIncidentReportPDF(mockReport, outputPath))
            .rejects
            .toThrow('PDF generation failed');
    });

    test('should include page numbers in footer', async () => {
        mockDoc.bufferedPageRange.mockReturnValue({ count: 2 });

        await generateIncidentReportPDF(mockReport, outputPath);

        // Verify page numbers were added
        expect(mockDoc.switchToPage).toHaveBeenCalledTimes(2);
        expect(mockDoc.fontSize).toHaveBeenCalledWith(10);
        expect(mockDoc.text).toHaveBeenCalledWith(
            expect.stringContaining('Page'),
            expect.any(Number),
            expect.any(Number),
            { align: 'center' }
        );
    });
}); 