const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        expiryDate: { type: Date, required: true },
        category: {
            type: String,
            enum: ["fruit", "vegetable"],
            required: true,
        },
    },
    {
        timestamps: true
    }
);

// Optional: Index on category field for better performance on category-based queries
itemSchema.index({ category: 1 });

module.exports = mongoose.model("Item", itemSchema);
