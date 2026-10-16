# SpendWise — Expense Tracker

A personal expense-tracking web application built using Python, FastAPI, SQLite, HTML, CSS, and JavaScript.

## Features

- Add expenses with amount, category, description, and date
- View all saved transactions
- Search and filter expenses
- Edit and delete expenses
- View total spending and transaction statistics
- View spending totals by category
- Store expense records in SQLite
- Responsive dashboard interface

## Technologies Used

- Python
- FastAPI
- SQLite
- Pydantic
- HTML, CSS, JavaScript
- Uvicorn

## Project Structure

```text
expenses-tracker/
├── api.py
├── database.py
├── main.py
├── expenses.db
├── README.md
├── requirements.txt
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

## How to Run

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd expenses-tracker
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the application

```bash
uvicorn api:app --reload
```

Open the dashboard at http://127.0.0.1:8000.

Open the interactive API documentation at http://127.0.0.1:8000/docs.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/expenses` | View expenses |
| GET | `/expenses/total` | Get total spending |
| GET | `/expenses/category-totals` | Get category totals |
| POST | `/expenses` | Add an expense |
| PUT | `/expenses/{expense_id}` | Update an expense |
| DELETE | `/expenses/{expense_id}` | Delete an expense |

## What I Learned

- Building REST API endpoints with FastAPI
- Validating request data with Pydantic
- Performing CRUD operations
- Connecting Python applications to SQLite
- Connecting a frontend to a backend API

## Future Improvements

- Automated tests
- Monthly spending charts
- CSV export
- Pagination

---

This project was built for learning and portfolio development.