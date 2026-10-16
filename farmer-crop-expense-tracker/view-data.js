const mongoose = require('mongoose');
const Crop = require('./models/Crop');
const Expense = require('./models/Expense');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmer_crop_tracker';

async function showDatabaseData() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('\n=================== SAVED CROPS ===================');
    const crops = await Crop.find().lean();
    if (!crops.length) {
      console.log('No crops found in database.');
    } else {
      console.table(
        crops.map((c) => ({
          ID: String(c._id).slice(-6),
          Name: c.cropName,
          Variety: c.seedVariety,
          SowingDate: c.sowingDate ? new Date(c.sowingDate).toISOString().slice(0, 10) : '',
          Area_Acres: c.area,
          Status: c.status,
          SaleIncome_INR: c.saleIncome
        }))
      );
    }

    console.log('\n================== SAVED EXPENSES ==================');
    const expenses = await Expense.find().populate('cropId', 'cropName').lean();
    if (!expenses.length) {
      console.log('No expenses found in database.');
    } else {
      console.table(
        expenses.map((e) => ({
          ID: String(e._id).slice(-6),
          Crop: e.cropId ? e.cropId.cropName : 'Unknown Crop',
          Category: e.category,
          Amount_INR: e.amount,
          Date: e.expenseDate ? new Date(e.expenseDate).toISOString().slice(0, 10) : '',
          Note: e.note || '—'
        }))
      );
    }
    console.log('');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    console.error('Ensure MongoDB is running (run: mongod --config /opt/homebrew/etc/mongod.conf --fork)');
    process.exit(1);
  }
}

showDatabaseData();
