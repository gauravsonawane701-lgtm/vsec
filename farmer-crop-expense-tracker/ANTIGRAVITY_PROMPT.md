# Antigravity Prompt: Farmer Crop & Expense Tracker

Build a simple, beginner-friendly full-stack mini project named **Farmer Crop & Expense Tracker (Kisan Crop Diary)**. This is a college Full Stack Development assignment based on CRUD REST APIs. Do not over-engineer it. Do not use React, Tailwind, TypeScript, authentication, payment gateways, external APIs, or cloud databases.

## Required stack
- Frontend: plain HTML, CSS and vanilla JavaScript in separate files.
- Backend: Node.js and Express.js.
- Database: MongoDB Community Server running locally at `mongodb://127.0.0.1:27017/farmer_crop_tracker`.
- Use REST API endpoints with JSON.
- Keep the project structure small and make the code easy to explain in a viva.

## User story
A farmer records each crop when it is sown. The record contains crop name, seed/variety name, sowing date and field area in acres. When the farmer spends money on that crop, they add an expense with date, category, amount and an optional note. At the end of the growing season, the farmer marks the crop completed and enters the total sale income. The website shows the total expenses and calculates the crop's profit/loss.

## Required features
1. Add crop records.
2. View crop history and the status of each crop (Growing or Completed).
3. Add multiple expenses linked to a selected crop; allowed categories: Seeds, Fertilizer, Pesticide, Labour, Irrigation, Transport and Other.
4. View expense history and filter it by crop.
5. Edit and delete crops and expenses.
6. When deleting a crop, also delete its linked expenses.
7. Complete a crop season by entering total sale income.
8. Calculate `profit/loss = sale income - total expenses` for completed crops. For an active crop, show expense total so far instead of calling it profit.
9. Summary cards: crop count, total expenses, sale income from completed crops, and realized profit/loss from completed crops.
10. Responsive design that works on laptops and phones. Use a clean, green, farmer-friendly colour palette and readable labels. Do not make a complicated dashboard.

## Validation requirements
- Crop name and seed/variety name are required and trimmed; crop name length 2–50 and seed name length 2–80.
- Sowing date is required, must be valid and cannot be in the future.
- Land area must be numeric, at least 0.01 and within a reasonable maximum.
- Expense category/date/amount are required; amount must be greater than zero.
- Expense date must not be in the future and cannot be earlier than the crop's sowing date.
- A new expense cannot be added after a crop season is completed.
- Sale income can be zero but cannot be negative.
- Validate in both the frontend and backend; never rely only on browser validation.
- Return friendly JSON error messages and handle invalid IDs and missing records.

## Suggested database design
`crops`: cropName, seedVariety, sowingDate, area, status, saleIncome, timestamps.  
`expenses`: cropId reference to crops, category, expenseDate, amount, note, timestamps.

## API routes
- GET `/api/crops`
- POST `/api/crops`
- PUT `/api/crops/:id`
- PATCH `/api/crops/:id/complete`
- DELETE `/api/crops/:id`
- GET `/api/expenses`
- POST `/api/crops/:id/expenses`
- PUT `/api/expenses/:id`
- DELETE `/api/expenses/:id`
- GET `/api/health`

## Keep the file structure clear
Use `server.js`, `models/Crop.js`, `models/Expense.js`, `public/index.html`, `public/css/style.css`, `public/js/app.js`, `package.json`, `.gitignore` and `README.md`. The Express server should serve the frontend files, so the farmer can open the website at `http://localhost:5000` after starting local MongoDB and running `npm install` and `npm start`.

## Delivery checks
- Give complete working code, not pseudocode.
- Explain how to run it on macOS in a short README.
- Include a short viva explanation and REST endpoint list.
- Verify that JavaScript syntax is valid.
- Ensure dates and money are displayed clearly and all buttons work.
- Keep the project simple enough for a student to explain file by file.
