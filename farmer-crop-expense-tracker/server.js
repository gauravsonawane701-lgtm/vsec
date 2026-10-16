const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Crop = require('./models/Crop');
const Expense = require('./models/Expense');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmer_crop_tracker';

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function isValidPastOrTodayDate(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validationMessage(error) {
  if (error && error.name === 'ValidationError') {
    return Object.values(error.errors).map((item) => item.message).join(' ');
  }
  if (error && error.name === 'CastError') return 'Please enter a valid value.';
  return 'Something went wrong. Please try again.';
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.get('/api/health', (req, res) => {
  res.json({ api: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Read all crops and attach a total expense amount to each one.
app.get('/api/crops', asyncRoute(async (req, res) => {
  const crops = await Crop.find().sort({ createdAt: -1 }).lean();
  const totals = await Expense.aggregate([
    { $group: { _id: '$cropId', total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  const totalMap = new Map(totals.map((item) => [String(item._id), item]));
  res.json(crops.map((crop) => {
    const summary = totalMap.get(String(crop._id));
    return { ...crop, expenseTotal: summary ? summary.total : 0, expenseCount: summary ? summary.count : 0 };
  }));
}));

// Create a crop record.
app.post('/api/crops', asyncRoute(async (req, res) => {
  const cropName = cleanText(req.body.cropName);
  const seedVariety = cleanText(req.body.seedVariety);
  const { sowingDate } = req.body;
  const area = Number(req.body.area);

  if (cropName.length < 2 || cropName.length > 50) {
    return res.status(400).json({ message: 'Crop name must contain 2 to 50 characters.' });
  }
  if (seedVariety.length < 2 || seedVariety.length > 80) {
    return res.status(400).json({ message: 'Seed name or variety must contain 2 to 80 characters.' });
  }
  if (!isValidPastOrTodayDate(sowingDate)) {
    return res.status(400).json({ message: 'Enter a valid sowing date that is today or earlier.' });
  }
  if (!Number.isFinite(area) || area < 0.01 || area > 100000) {
    return res.status(400).json({ message: 'Land area must be greater than 0 and no more than 100000 acres.' });
  }

  const crop = await Crop.create({ cropName, seedVariety, sowingDate, area });
  res.status(201).json({ message: 'Crop added successfully.', crop });
}));

// Update crop details.
app.put('/api/crops/:id', asyncRoute(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid crop ID.' });
  const cropName = cleanText(req.body.cropName);
  const seedVariety = cleanText(req.body.seedVariety);
  const { sowingDate } = req.body;
  const area = Number(req.body.area);

  if (cropName.length < 2 || cropName.length > 50) {
    return res.status(400).json({ message: 'Crop name must contain 2 to 50 characters.' });
  }
  if (seedVariety.length < 2 || seedVariety.length > 80) {
    return res.status(400).json({ message: 'Seed name or variety must contain 2 to 80 characters.' });
  }
  if (!isValidPastOrTodayDate(sowingDate)) {
    return res.status(400).json({ message: 'Enter a valid sowing date that is today or earlier.' });
  }
  if (!Number.isFinite(area) || area < 0.01 || area > 100000) {
    return res.status(400).json({ message: 'Land area must be greater than 0 and no more than 100000 acres.' });
  }

  // Preserve data integrity: an updated sowing date must not be later than an existing expense.
  const earlierExpense = await Expense.findOne({
    cropId: req.params.id,
    expenseDate: { $lt: new Date(sowingDate) }
  }).lean();
  if (earlierExpense) {
    return res.status(400).json({ message: 'Sowing date cannot be moved after an existing expense date.' });
  }

  const crop = await Crop.findByIdAndUpdate(
    req.params.id,
    { cropName, seedVariety, sowingDate, area },
    { new: true, runValidators: true }
  );
  if (!crop) return res.status(404).json({ message: 'Crop not found.' });
  res.json({ message: 'Crop updated successfully.', crop });
}));

// Mark the growing season complete and save the total sale income.
app.patch('/api/crops/:id/complete', asyncRoute(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid crop ID.' });
  const saleIncome = Number(req.body.saleIncome);
  if (!Number.isFinite(saleIncome) || saleIncome < 0 || saleIncome > 1000000000) {
    return res.status(400).json({ message: 'Sale income must be a valid amount of 0 or more.' });
  }
  const crop = await Crop.findByIdAndUpdate(
    req.params.id,
    { status: 'Completed', saleIncome },
    { new: true, runValidators: true }
  );
  if (!crop) return res.status(404).json({ message: 'Crop not found.' });
  res.json({ message: 'Crop season marked as completed.', crop });
}));

// Delete a crop and its expense history so no orphan records remain.
app.delete('/api/crops/:id', asyncRoute(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid crop ID.' });
  const crop = await Crop.findByIdAndDelete(req.params.id);
  if (!crop) return res.status(404).json({ message: 'Crop not found.' });
  await Expense.deleteMany({ cropId: crop._id });
  res.json({ message: 'Crop and its expense history deleted.' });
}));

// Read expense records. The crop name is included for the table.
app.get('/api/expenses', asyncRoute(async (req, res) => {
  const expenses = await Expense.find().populate('cropId', 'cropName status sowingDate').sort({ expenseDate: -1, createdAt: -1 }).lean();
  res.json(expenses.map((expense) => ({
    ...expense,
    cropName: expense.cropId ? expense.cropId.cropName : 'Deleted crop',
    cropStatus: expense.cropId ? expense.cropId.status : 'Unknown',
    cropSowingDate: expense.cropId ? expense.cropId.sowingDate : null,
    cropId: expense.cropId ? String(expense.cropId._id) : ''
  })));
}));

// Add an expense to a growing crop.
app.post('/api/crops/:id/expenses', asyncRoute(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid crop ID.' });
  const crop = await Crop.findById(req.params.id);
  if (!crop) return res.status(404).json({ message: 'Crop not found.' });
  if (crop.status === 'Completed') {
    return res.status(400).json({ message: 'This crop season is completed, so new expenses cannot be added.' });
  }

  const allowedCategories = ['Seeds', 'Fertilizer', 'Pesticide', 'Labour', 'Irrigation', 'Transport', 'Other'];
  const category = cleanText(req.body.category);
  const expenseDate = req.body.expenseDate;
  const amount = Number(req.body.amount);
  const note = cleanText(req.body.note);

  if (!allowedCategories.includes(category)) return res.status(400).json({ message: 'Choose a valid expense category.' });
  if (!isValidPastOrTodayDate(expenseDate)) return res.status(400).json({ message: 'Enter a valid expense date that is today or earlier.' });
  if (new Date(expenseDate) < new Date(crop.sowingDate)) {
    return res.status(400).json({ message: 'Expense date cannot be before the crop sowing date.' });
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
    return res.status(400).json({ message: 'Expense amount must be greater than 0 and within the allowed limit.' });
  }
  if (note.length > 200) return res.status(400).json({ message: 'Note cannot exceed 200 characters.' });

  const expense = await Expense.create({ cropId: crop._id, category, expenseDate, amount, note });
  res.status(201).json({ message: 'Expense added successfully.', expense });
}));

// Update an existing expense.
app.put('/api/expenses/:id', asyncRoute(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid expense ID.' });
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found.' });
  const crop = await Crop.findById(expense.cropId);
  if (!crop) return res.status(404).json({ message: 'Linked crop not found.' });

  const allowedCategories = ['Seeds', 'Fertilizer', 'Pesticide', 'Labour', 'Irrigation', 'Transport', 'Other'];
  const category = cleanText(req.body.category);
  const expenseDate = req.body.expenseDate;
  const amount = Number(req.body.amount);
  const note = cleanText(req.body.note);
  if (!allowedCategories.includes(category)) return res.status(400).json({ message: 'Choose a valid expense category.' });
  if (!isValidPastOrTodayDate(expenseDate)) return res.status(400).json({ message: 'Enter a valid expense date that is today or earlier.' });
  if (new Date(expenseDate) < new Date(crop.sowingDate)) return res.status(400).json({ message: 'Expense date cannot be before the crop sowing date.' });
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) return res.status(400).json({ message: 'Expense amount must be greater than 0 and within the allowed limit.' });
  if (note.length > 200) return res.status(400).json({ message: 'Note cannot exceed 200 characters.' });

  expense.category = category;
  expense.expenseDate = expenseDate;
  expense.amount = amount;
  expense.note = note;
  await expense.save();
  res.json({ message: 'Expense updated successfully.', expense });
}));

app.delete('/api/expenses/:id', asyncRoute(async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid expense ID.' });
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found.' });
  res.json({ message: 'Expense deleted successfully.' });
}));

// Return readable errors rather than an HTML stack trace.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON request body.' });
  }
  console.error(err);
  return res.status(400).json({ message: validationMessage(err) });
});

function listenWithFallback(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`\n==================================================`);
    console.log(`  Farmer Crop Tracker is running!`);
    console.log(`  Open in browser: http://localhost:${portToTry}`);
    console.log(`==================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = portToTry + 1;
      console.warn(`Port ${portToTry} is already in use. Trying port ${nextPort}...`);
      listenWithFallback(nextPort);
    } else {
      console.error('Server error:', err.message);
      process.exit(1);
    }
  });
}

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${MONGODB_URI}`);
    listenWithFallback(PORT);
  } catch (error) {
    console.error('Could not connect to MongoDB. Start your local MongoDB service and try again.');
    console.error(error.message);
    console.error('\nTo start MongoDB on macOS (Homebrew), run:');
    console.error('  brew services start mongodb-community@7.0');
    console.error('Or run mongod directly:');
    console.error('  mongod --config /opt/homebrew/etc/mongod.conf');
    process.exit(1);
  }
}

startServer();
