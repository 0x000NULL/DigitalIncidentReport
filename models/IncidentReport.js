const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
    // Policy Agreements
    termsAgreement: {
        type: Boolean,
        required: true
    },
    privacyAgreement: {
        type: Boolean,
        required: true
    },
    esignatureAgreement: {
        type: Boolean,
        required: true
    },

    // Personal Information
    personalInfo: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        zip: {
            type: String,
            required: true,
            trim: true
        },
        homePhone: {
            type: String,
            required: true,
            trim: true
        },
        workPhone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        ownsVehicle: {
            type: String,
            required: true,
            enum: ['yes', 'no']
        },
        insuranceCompany: {
            type: String,
            required: true,
            trim: true
        },
        policyNumber: {
            type: String,
            required: true,
            trim: true
        }
    },

    // Vehicle Information
    vehicleInfo: {
        vehicleNumber: {
            type: String,
            required: true,
            trim: true
        },
        licensePlate: {
            type: String,
            required: true,
            trim: true
        },
        licenseState: {
            type: String,
            required: true,
            trim: true
        },
        vehicleMake: {
            type: String,
            required: true,
            trim: true
        },
        vehicleModel: {
            type: String,
            required: true,
            trim: true
        },
        odometer: {
            type: Number,
            required: true,
            min: 0
        }
    },

    // Incident Details
    incidentDetails: {
        renterOperating: {
            type: String,
            required: true,
            enum: ['yes', 'no']
        },
        operatorInfo: {
            firstName: String,
            lastName: String,
            dob: Date,
            phone: String,
            address: String,
            city: String,
            state: String,
            zip: String,
            licenseNumber: String,
            licenseState: String,
            ownsVehicle: {
                type: String,
                enum: ['yes', 'no']
            },
            employer: String,
            workPhone: String,
            workAddress: String,
            workCity: String,
            workState: String,
            workZip: String,
            insuranceCompany: String,
            policyNumber: String
        },
        vehicleUse: {
            type: String,
            required: true,
            enum: ['work', 'personal']
        },
        creditCardCoverage: {
            type: String,
            required: true,
            enum: ['yes', 'no']
        },
        description: {
            type: String,
            required: true,
            trim: true
        }
    },

    // Incident Location
    incidentLocation: {
        knowsLocation: {
            type: String,
            required: true,
            enum: ['yes', 'no']
        },
        date: Date,
        time: String,
        weather: {
            type: String,
            enum: ['clear', 'cloudy', 'rain', 'snow', 'fog', 'other']
        },
        address: String,
        city: String,
        state: String,
        zip: String,
        policeDepartment: String,
        policeReportNumber: String
    },

    // Vehicle Damage
    vehicleDamage: {
        otherVehicleInvolved: {
            type: String,
            required: true,
            enum: ['yes', 'no']
        },
        otherVehicleInfo: {
            owner: {
                firstName: String,
                lastName: String,
                address: String,
                city: String,
                state: String,
                zip: String,
                phone: String
            },
            operator: {
                firstName: String,
                lastName: String,
                address: String,
                city: String,
                state: String,
                zip: String,
                phone: String,
                licenseNumber: String,
                licenseState: String,
                insuranceCompany: String,
                policyNumber: String
            },
            vehicle: {
                make: String,
                model: String,
                odometer: Number,
                licensePlate: String,
                licenseState: String,
                damageDescription: String,
                driveable: {
                    type: String,
                    enum: ['yes', 'no']
                }
            }
        },
        rentalVehicleDamage: [{
            coordinates: {
                x: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100 // Percentage of image width
                },
                y: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100 // Percentage of image height
                }
            },
            type: {
                type: String,
                required: true,
                enum: ['dent', 'scratch', 'crack', 'break', 'missing', 'paint', 'glass', 'mechanical', 'other']
            },
            description: String,
            severity: {
                type: String,
                enum: ['minor', 'moderate', 'severe'],
                default: 'moderate'
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
        additionalDamageDescription: String
    },

    // Witness Information
    witnesses: [{
        firstName: String,
        lastName: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        phone: String
    }],

    // Accident Description
    accidentDescription: {
        directionOfTravel: {
            type: String,
            enum: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest']
        },
        trafficControls: [{
            type: String,
            enum: ['traffic_light', 'stop_sign', 'yield_sign', 'crosswalk', 'school_zone', 'construction_zone', 'none']
        }],
        trafficControlStatus: {
            type: String,
            enum: ['working', 'malfunctioning', 'not_applicable']
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        roadConditions: {
            type: String,
            enum: ['dry', 'wet', 'icy', 'snow_covered', 'gravel', 'construction', 'other']
        },
        lightingConditions: {
            type: String,
            enum: ['daylight', 'dawn', 'dusk', 'dark_lit', 'dark_unlit']
        }
    },

    // Signature and Confirmation
    signature: {
        accuracyConfirmation: {
            type: Boolean,
            required: true
        },
        signatureData: {
            type: String,
            required: true
        },
        signedAt: {
            type: Date,
            default: Date.now
        }
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for common queries
incidentReportSchema.index({ 'personalInfo.email': 1 });
incidentReportSchema.index({ 'vehicleInfo.licensePlate': 1 });
incidentReportSchema.index({ 'incidentLocation.date': 1 });
incidentReportSchema.index({ status: 1 });

const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);

module.exports = IncidentReport; 