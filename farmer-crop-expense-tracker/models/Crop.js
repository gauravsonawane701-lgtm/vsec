const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: [true, 'Crop name is required.'],
      trim: true,
      minlength: [2, 'Crop name must contain at least 2 characters.'],
      maxlength: [50, 'Crop name cannot exceed 50 characters.']
    },
    seedVariety: {
      type: String,
      required: [true, 'Seed name or variety is required.'],
      trim: true,
      minlength: [2, 'Seed name must contain at least 2 characters.'],
      maxlength: [80, 'Seed name cannot exceed 80 characters.']
    },
    sowingDate: {
      type: Date,
      required: [true, 'Sowing date is required.'],
      validate: {
        validator(value) {
          if (!value || Number.isNaN(value.getTime())) return false;
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return value <= today;
        },
        message: 'Sowing date cannot be in the future.'
      }
    },
    area: {
      type: Number,
      required: [true, 'Land area is required.'],
      min: [0.01, 'Land area must be greater than 0.'],
      max: [100000, 'Land area is too large.']
    },
    status: {
      type: String,
      enum: ['Growing', 'Completed'],
      default: 'Growing'
    },
    saleIncome: {
      type: Number,
      default: 0,
      min: [0, 'Sale income cannot be negative.']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', cropSchema);
