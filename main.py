
import database
from datetime import date


def add_expense_menu():
    try:
        amount = float(input("Enter amount: "))
        if amount <= 0:
            print("Amount must be greater than zero.")
            return

        category = input("Enter category: ").strip()
        if not category:
            print("Category cannot be empty.")
            return

        description = input("Enter description: ").strip()
        expense_date = input(
            "Enter date (YYYY-MM-DD) or press Enter for today: "
        ).strip()

        if not expense_date:
            expense_date = date.today().isoformat()
        else:
            date.fromisoformat(expense_date)

        database.add_expense(
            amount, category, description, expense_date
        )
        print("Expense saved successfully.")

    except ValueError:
        print("Invalid amount or date.")


def view_expenses_menu():
    expenses = database.view_expenses()

    if not expenses:
        print("No expenses found.")
        return

    for expense in expenses:
        print(expense)

    print("Total spending:", database.get_total_expenses())


def filter_expenses_menu():
    category = input("Enter category to search: ").strip()
    expenses = database.filter_by_category(category)

    if not expenses:
        print("No expenses found in this category.")
        return

    for expense in expenses:
        print(expense)


def update_expense_menu():
    try:
        expense_id = int(input("Enter expense ID to update: "))
        amount = float(input("Enter new amount: "))
        if amount <= 0:
            print("Amount must be greater than zero.")
            return

        category = input("Enter new category: ").strip()
        if not category:
            print("Category cannot be empty.")
            return

        description = input("Enter new description: ").strip()
        expense_date = input("Enter new date (YYYY-MM-DD): ").strip()
        date.fromisoformat(expense_date)

        updated = database.update_expense(
            expense_id, amount, category, description, expense_date
        )

        print("Expense updated." if updated else "Expense ID not found.")

    except ValueError:
        print("Invalid ID, amount, or date.")


def delete_expense_menu():
    try:
        expense_id = int(input("Enter expense ID to delete: "))
        deleted = database.delete_expense(expense_id)

        print("Expense deleted." if deleted else "Expense ID not found.")

    except ValueError:
        print("Please enter a valid numeric ID.")


def show_category_totals():
    totals = database.get_category_totals()

    if not totals:
        print("No expenses found.")
        return

    for category, total in totals:
        print(f"{category}: {total:.2f}")


def main():
    while True:
        print("\n===== EXPENSE TRACKER =====")
        print("1. Add expense")
        print("2. View expenses")
        print("3. Filter by category")
        print("4. Update expense")
        print("5. Delete expense")
        print("6. View category totals")
        print("7. Exit")

        choice = input("Choose an option: ").strip()

        if choice == "1":
            add_expense_menu()
        elif choice == "2":
            view_expenses_menu()
        elif choice == "3":
            filter_expenses_menu()
        elif choice == "4":
            update_expense_menu()
        elif choice == "5":
            delete_expense_menu()
        elif choice == "6":
            show_category_totals()
        elif choice == "7":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Try again.")


if __name__ == "__main__":
    main()
