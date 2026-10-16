
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "expenses.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


def create_table():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL CHECK (amount > 0),
                category TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL
            )
        """)


def add_expense(amount, category, description, date):
    with get_connection() as connection:
        connection.execute("""
            INSERT INTO expenses (amount, category, description, date)
            VALUES (?, ?, ?, ?)
        """, (amount, category, description, date))


def view_expenses():
    with get_connection() as connection:
        return connection.execute("""
            SELECT * FROM expenses
            ORDER BY date DESC, id DESC
        """).fetchall()


def filter_by_category(category):
    with get_connection() as connection:
        return connection.execute("""
            SELECT * FROM expenses
            WHERE category = ?
            ORDER BY date DESC, id DESC
        """, (category,)).fetchall()


def update_expense(expense_id, amount, category, description, date):
    with get_connection() as connection:
        cursor = connection.execute("""
            UPDATE expenses
            SET amount = ?, category = ?, description = ?, date = ?
            WHERE id = ?
        """, (amount, category, description, date, expense_id))

        return cursor.rowcount > 0


def delete_expense(expense_id):
    with get_connection() as connection:
        cursor = connection.execute("""
            DELETE FROM expenses
            WHERE id = ?
        """, (expense_id,))

        return cursor.rowcount > 0


def get_total_expenses():
    with get_connection() as connection:
        return connection.execute("""
            SELECT COALESCE(SUM(amount), 0)
            FROM expenses
        """).fetchone()[0]


def get_category_totals():
    with get_connection() as connection:
        return connection.execute("""
            SELECT category, SUM(amount)
            FROM expenses
            GROUP BY category
            ORDER BY SUM(amount) DESC
        """).fetchall()


create_table()
