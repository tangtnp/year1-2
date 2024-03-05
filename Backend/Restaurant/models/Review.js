const mongoose=require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: [0,"Value must in between 0 - 5"],
        max: [5,"Value must in between 0 - 5"]
    },
    description: {
        type: String,
        maxlength: [255,'Description cannot be morethan 255 characters']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant:{
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', ReviewSchema);

