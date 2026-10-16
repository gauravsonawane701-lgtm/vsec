const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: [true, 'Please choose a crop.']
    },
    category: {
      type: String,
      required: [true, 'Expense category is required.'],
      enum: ['Seeds', 'Fertilizer', 'Pesticide', 'Labour', 'Irrigation', 'Transport', 'Other']
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required.']
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required.'],
      min: [0.01, 'Expense amount must be greater than 0.'],
      max: [100000000, 'Expense amount is too large.']
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters.'],
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
