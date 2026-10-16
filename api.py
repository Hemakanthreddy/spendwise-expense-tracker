
from pathlib import Path
from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import database


# ---------- Application Setup ----------

app = FastAPI(
    title="Expense Tracker API",
    description="API to manage personal expenses",
    version="1.0.0"
)


# ---------- Frontend Setup ----------

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"
INDEX_FILE = FRONTEND_DIR / "index.html"

if FRONTEND_DIR.is_dir():
    app.mount(
        "/static",
        StaticFiles(directory=str(FRONTEND_DIR)),
        name="static"
    )


@app.get("/")
def home():
    if not INDEX_FILE.is_file():
        raise HTTPException(
            status_code=500,
            detail="Frontend file not found. Check frontend/index.html"
        )

    return FileResponse(INDEX_FILE)


# ---------- Request Models ----------

class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=50)
    description: str = Field(default="", max_length=200)
    date: date


class ExpenseUpdate(BaseModel):
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=50)
    description: str = Field(default="", max_length=200)
    date: date


# ---------- Read Expenses ----------

@app.get("/expenses")
def get_expenses(category: Optional[str] = Query(default=None)):
    if category:
        return database.filter_by_category(category)

    return database.view_expenses()


@app.get("/expenses/total")
def get_total():
    return {
        "total": database.get_total_expenses()
    }


@app.get("/expenses/category-totals")
def get_category_totals():
    totals = database.get_category_totals()

    return [
        {
            "category": category,
            "total": total
        }
        for category, total in totals
    ]


# ---------- Create Expense ----------

@app.post("/expenses", status_code=201)
def create_expense(expense: ExpenseCreate):
    database.add_expense(
        expense.amount,
        expense.category.strip(),
        expense.description.strip(),
        expense.date.isoformat()
    )

    return {
        "message": "Expense created successfully",
        "expense": expense.model_dump(mode="json")
    }


# ---------- Update Expense ----------

@app.put("/expenses/{expense_id}")
def update_expense(expense_id: int, expense: ExpenseUpdate):
    updated = database.update_expense(
        expense_id,
        expense.amount,
        expense.category.strip(),
        expense.description.strip(),
        expense.date.isoformat()
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return {
        "message": "Expense updated successfully"
    }


# ---------- Delete Expense ----------

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    deleted = database.delete_expense(expense_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return {
        "message": "Expense deleted successfully"
    }
