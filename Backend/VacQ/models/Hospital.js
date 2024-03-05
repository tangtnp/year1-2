const mongoose = require('mongoose')

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name."],
        unique: true,
        trim: true,
        maxlength: [50, "name cannot be more than 50 characters."]
    },
    address: {
        type: String,
        required: [true, "Please add an address."]
    },
    district: {
        type: String,
        required: [true, "Please add a district."]
    },
    province: {
        type: String,
        required: [true, "Please add a province."]
    },
    postalcode: {
        type: String,
        maxlength: [5, "postal code cannot be more than 5 characters"],
        required: [true, "Please add a postal code."]
    },
    tel: {
        type: String
    },
    region: {
        type: String,
        required: [true, "Please add a region."]
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


// Reverse populate with virtual
HospitalSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'hospital',
    justOne: false
});

// Cascade delete appointments when a hospital is deleted
HospitalSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
        console.log(`Appointments being removed for hospital ${this._id}`);
        await this.model('Appointment').deleteMany({ hospital: this._id });
        next();
});



module.exports = mongoose.model('Hospital', HospitalSchema)