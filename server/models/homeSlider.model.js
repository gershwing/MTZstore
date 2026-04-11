import mongoose from 'mongoose';

const homeSliderSchema = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true, // 🔑 para consultas rápidas por tienda
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
