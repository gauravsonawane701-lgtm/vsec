# Viva Notes: Farmer Crop & Expense Tracker

## 30-second project explanation

“My project is Farmer Crop & Expense Tracker. It helps a farmer keep a simple digital record of each crop. The farmer enters the crop name, seed variety, sowing date and land area. Whenever money is spent, the farmer records an expense such as fertilizer or labour. At the end of the season, the farmer enters the sale income. The application subtracts total expenses from sale income and shows profit or loss. I built the frontend using HTML, CSS and JavaScript, the backend using Node.js and Express, and I store the records in local MongoDB.”

## Common viva questions and simple answers

**1. What problem does this project solve?**  
It helps farmers remember which crops they planted and how much they spent on each crop. It also helps them calculate the final profit or loss.

**2. Why did you choose this project?**  
It is a simple real-life problem. It also demonstrates frontend development, REST APIs, CRUD operations and a database.

**3. What is the role of HTML?**  
HTML creates the structure of the webpage, including forms, buttons, cards and tables.

**4. What is the role of CSS?**  
CSS controls colours, spacing, layout, fonts and responsive design.

**5. What is the role of JavaScript?**  
JavaScript checks form data, sends requests to the backend, and updates crop cards, expense tables and totals without reloading the page.

**6. What are Node.js and Express.js?**  
Node.js runs JavaScript on the server. Express.js makes it easier to create server routes and REST API endpoints.

**7. What is MongoDB?**  
MongoDB is a document database. It stores information as documents inside collections.

**8. Why use local MongoDB?**  
The database runs on the same computer. It does not require an online database account or cloud connection.

**9. What is a REST API?**  
It is a way for the frontend and backend to communicate through HTTP requests. This project uses GET, POST, PUT, PATCH and DELETE requests.

**10. What does CRUD mean?**  
Create, Read, Update and Delete. The project can add, display, edit and delete crop and expense records.

**11. What is the database relationship?**  
One crop can have many expenses. Each expense contains `cropId`, which points to the crop it belongs to.

**12. How is profit/loss calculated?**  
Profit or loss = total sale income − total expenses for that completed crop. A positive answer means profit; a negative answer means loss.

**13. What validation is used?**  
Required-field, text-length, date, positive-number and expense-date checks are done on the frontend and checked again by the backend. The backend is important because frontend validation alone can be bypassed.

**14. Why is validation needed on both frontend and backend?**  
Frontend validation gives the user quick feedback. Backend validation protects the database if a request skips the webpage or contains invalid data.

**15. What happens when a crop is deleted?**  
The crop document and its linked expense documents are deleted, so expense records do not remain without a crop.

**16. Does the app have login?**  
No. For this beginner mini project, the app is a single-farmer local record book. Login and multi-user access can be added in a future version.

**17. What happens when the season is completed?**  
The farmer enters the sale income and the crop status changes from “Growing” to “Completed”. New expenses are not accepted for that completed season.

**18. What are future improvements?**  
Login for multiple farmers, downloadable reports, Marathi language support, cloud backup and reminders could be added later.
