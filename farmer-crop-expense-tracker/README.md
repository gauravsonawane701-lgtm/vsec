# Farmer Crop & Expense Tracker (Kisan Crop Diary)

A simple full-stack mini project for a farmer to record sowing details, save expenses for each crop, keep a crop-season history, and calculate profit or loss when the season is completed.

## Technologies used

- **Frontend:** HTML, CSS and vanilla JavaScript
- **Backend:** Node.js and Express.js
- **Database:** Local MongoDB
- **API:** REST API using JSON

There is no login or online hosting. It is intentionally kept small and suitable for a college mini project and viva.

## Features

1. Add a crop with crop name, seed/variety, sowing date and land area.
2. View crop history and the total expenses linked to each crop.
3. Add expenses such as seeds, fertilizer, pesticide, labour, irrigation and transport.
4. Edit or delete crop and expense records.
5. Mark a season complete by entering the total sale income.
6. Calculate the result for a completed crop: **Profit/Loss = Sale Income − Total Expenses**.
7. Validate required fields, text length, valid dates, positive area/expense amounts, expense dates after sowing, and server-side API input.
8. Delete a crop along with its expense records to avoid orphaned data.

## Requirements

- Node.js (LTS version)
- MongoDB Community Server running on the same computer
- A browser such as Chrome, Safari or Firefox

## Run on macOS

1. Start local MongoDB. If MongoDB Community Server was installed as a Homebrew service, run:

   ```bash
   brew services start mongodb-community@7.0
   ```

   *(Or `brew services start mongodb-community` if your Homebrew formula is unversioned).*

   If MongoDB was installed another way, start its `mongod` service:

   ```bash
   mongod --config /opt/homebrew/etc/mongod.conf
   ```

2. Open Terminal and go to this project folder:

   ```bash
   cd farmer-crop-expense-tracker
   ```

3. Install the project packages:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npm start
   ```

5. Open **http://localhost:5000** in the browser.

The app uses this local database connection by default:

```text
mongodb://127.0.0.1:27017/farmer_crop_tracker
```

MongoDB creates the database and collections when the first record is saved. Nothing is sent to an online database. Press `Control + C` in Terminal to stop the server.

## If MongoDB does not connect

- Check that the MongoDB service is running (`brew services start mongodb-community@7.0`).
- Confirm that the local address is `127.0.0.1:27017`.
- Start MongoDB first, then run `npm start` again.
- Do not enter an Atlas URL if you want to use local MongoDB.

## If Port 5000 is already in use (`EADDRINUSE`)

- On macOS Monterey/Ventura/Sonoma/Sequoia, the **AirPlay Receiver** feature listens on port 5000 by default.
- The server will automatically fallback to **http://localhost:5001**.
- Alternatively, disable AirPlay Receiver in **System Settings > General > AirDrop & AirPlay > AirPlay Receiver (toggle off)**, or run with: `PORT=3000 npm start`.

## REST API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API/database status |
| GET | `/api/crops` | List crops and their expense totals |
| POST | `/api/crops` | Add a crop |
| PUT | `/api/crops/:id` | Update crop details |
| PATCH | `/api/crops/:id/complete` | Complete a season and save sale income |
| DELETE | `/api/crops/:id` | Delete a crop and its expenses |
| GET | `/api/expenses` | List all expense records |
| POST | `/api/crops/:id/expenses` | Add an expense to a crop |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

## Database design

### `crops` collection

`cropName`, `seedVariety`, `sowingDate`, `area`, `status`, `saleIncome`, `createdAt`, `updatedAt`.

### `expenses` collection

`cropId` (reference to a crop document), `category`, `expenseDate`, `amount`, `note`, `createdAt`, `updatedAt`.

Each expense stores a `cropId` reference so expenses can be totalled for the correct crop. When a crop is deleted, its expenses are deleted as well.

## Profit/loss example

Suppose Soybean expenses are ₹12,000 for seeds, ₹8,000 for fertilizer and ₹10,000 for labour. Total expense = ₹30,000. If the farmer records ₹45,000 as sale income, the result is ₹45,000 − ₹30,000 = **₹15,000 profit**. If the expenses exceed income, the displayed result is a loss.

## Validation examples for demonstration

Try these during a practical or viva:

- Submit a crop with an empty crop name: it should be rejected.
- Enter a sowing date in the future: it should be rejected.
- Enter zero or a negative land area: it should be rejected.
- Add an expense of ₹0 or a negative amount: it should be rejected.
- Add an expense date earlier than that crop's sowing date: it should be rejected.
- Try adding a new expense to a completed crop: it should be rejected.
- Enter sale income as zero: it is accepted because a farmer may have no sale income.

## Quick code check

```bash
npm run check
```

This checks the JavaScript syntax. It does not replace testing the app with MongoDB running.
