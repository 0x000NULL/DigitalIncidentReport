const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
    // Status of the report
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
        default: 'draft'
    },

    // Policy Agreements
    termsAgreement: { type: Boolean, required: true },
    privacyAgreement: { type: Boolean, required: true },
    esignatureAgreement: { type: Boolean, required: true },

    // Personal Information
    personalInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        homePhone: { type: String, default: '' },
        workPhone: { type: String, default: '' },
        email: { type: String, default: '' },
        ownsVehicle: { type: String, default: '' },
        insuranceCompany: { type: String, default: '' },
        policyNumber: { type: String, default: '' }
    },

    // Vehicle Information
    vehicleInfo: {
        vehicleNumber: { type: String, default: '' },
        licensePlate: { type: String, default: '' },
        licenseState: { type: String, default: '' },
        vehicleMake: { type: String, default: '' },
        vehicleModel: { type: String, default: '' },
        odometer: { type: Number, default: null }
    },

    // Incident Details
    incidentDetails: {
        renterOperating: { type: String, default: '' },
        operatorInfo: {
            firstName: { type: String, default: '' },
            lastName: { type: String, default: '' },
            dob: { type: Date, default: null },
            phone: { type: String, default: '' },
            address: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            zip: { type: String, default: '' },
            licenseNumber: { type: String, default: '' },
            licenseState: { type: String, default: '' },
            ownsVehicle: { type: String, default: '' },
            employer: { type: String, default: '' },
            workPhone: { type: String, default: '' },
            workAddress: { type: String, default: '' },
            workCity: { type: String, default: '' },
            workState: { type: String, default: '' },
            workZip: { type: String, default: '' },
            insuranceCompany: { type: String, default: '' },
            policyNumber: { type: String, default: '' }
        },
        vehicleUse: { type: String, default: '' },
        creditCardCoverage: { type: String, default: '' },
        description: { type: String, default: '' }
    },

    // Incident Location
    incidentLocation: {
        knowsLocation: { type: String, default: '' },
        date: { type: Date, default: null },
        time: { type: String, default: '' },
        weather: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        policeDepartment: { type: String, default: '' },
        policeReportNumber: { type: String, default: '' }
    },

    // Vehicle Damage
    vehicleDamage: {
        otherVehicleInvolved: { type: String, default: '' },
        otherVehicleInfo: {
            owner: {
                firstName: { type: String, default: '' },
                lastName: { type: String, default: '' },
                address: { type: String, default: '' },
                city: { type: String, default: '' },
                state: { type: String, default: '' },
                zip: { type: String, default: '' },
                phone: { type: String, default: '' }
            },
            operator: {
                firstName: { type: String, default: '' },
                lastName: { type: String, default: '' },
                address: { type: String, default: '' },
                city: { type: String, default: '' },
                state: { type: String, default: '' },
                zip: { type: String, default: '' },
                phone: { type: String, default: '' },
                licenseNumber: { type: String, default: '' },
                licenseState: { type: String, default: '' },
                insuranceCompany: { type: String, default: '' },
                policyNumber: { type: String, default: '' }
            },
            vehicle: {
                make: { type: String, default: '' },
                model: { type: String, default: '' },
                odometer: { type: Number, default: null },
                licensePlate: { type: String, default: '' },
                licenseState: { type: String, default: '' },
                damageDescription: { type: String, default: '' },
                driveable: { type: String, default: '' }
            }
        },
        rentalVehicleDamage: [{
            coordinates: {
                x: { type: Number, default: null },
                y: { type: Number, default: null }
            },
            type: { type: String, default: '' },
            description: { type: String, default: '' },
            severity: { type: String, default: '' }
        }],
        additionalDamageDescription: { type: String, default: '' }
    },

    // Witness Information
    witnesses: [{
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        phone: { type: String, default: '' }
    }],

    // Accident Description
    accidentDescription: {
        directionOfTravel: { type: String, default: '' },
        trafficControls: [{ type: String, default: '' }],
        trafficControlStatus: { type: String, default: '' },
        description: { type: String, default: '' },
        roadConditions: { type: String, default: '' },
        lightingConditions: { type: String, default: '' }
    },

    // Signature and Confirmation
    signature: {
        accuracyConfirmation: { type: Boolean, default: false },
        signatureData: { type: String, default: '' }
    },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Add indexes for common queries
incidentReportSchema.index({ 'personalInfo.email': 1 });
incidentReportSchema.index({ 'vehicleInfo.licensePlate': 1 });
incidentReportSchema.index({ 'incidentLocation.date': 1 });
incidentReportSchema.index({ status: 1 });

// Update the updatedAt timestamp before saving
incidentReportSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);

module.exports = IncidentReport; 