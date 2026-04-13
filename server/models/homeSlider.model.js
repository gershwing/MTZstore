import mongoose from 'mongoose';

const homeSliderSchema = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: false,
            default: null,
            index: true,
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        dateCreated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const HomeSliderModel = mongoose.model('HomeSlider', homeSliderSchema);

export default HomeSliderModel;
