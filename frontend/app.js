
const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalElement = document.getElementById("total");
const countElement = document.getElementById("count");
const averageElement = document.getElementById("average");

const statusElement = document.getElementById("status");
const categoryList = document.getElementById("category-list");
const searchInput = document.getElementById("search");

const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-edit");
const formMessage = document.getElementById("form-message");

let expenses = [];
let editingId = null;


// Format amounts as Indian Rupees
function formatMoney(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// Display readable dates
function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    const parts = dateValue.split("-");

    if (parts.length !== 3) {
        return dateValue;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


// Escape text before placing it in HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}


// Get all expenses from FastAPI
async function loadExpenses() {
    try {
        const response = await fetch("/expenses");

        if (!response.ok) {
            throw new Error("Could not load expenses");
        }

        const data = await response.json();

        // SQLite rows are returned as arrays:
        // [id, amount, category, description, date]
        expenses = data.map(function (row) {
            if (Array.isArray(row)) {
                return {
                    id: Number(row[0]),
                    amount: Number(row[1]),
                    category: row[2],
                    description: row[3] || "",
                    date: row[4]
                };
            }

            return row;
        });

        statusElement.textContent = "API connected";
        statusElement.className = "status online";

        displaySummary();
        displayCategories();
        displayExpenses();

    } catch (error) {
        statusElement.textContent = "API disconnected";
        statusElement.className = "status offline";

        expenseList.innerHTML = `
            <tr>
                <td colspan="5">
                    Could not load expenses. Check your FastAPI server.
                </td>
            </tr>
        `;

        categoryList.innerHTML =
            '<p class="muted">Could not load categories.</p>';
    }
}


// Calculate total, count, and average
function displaySummary() {
    let total = 0;

    for (let i = 0; i < expenses.length; i++) {
        total += expenses[i].amount;
    }

    totalElement.textContent = formatMoney(total);
    countElement.textContent = expenses.length;

    let average = 0;

    if (expenses.length > 0) {
        average = total / expenses.length;
    }

    averageElement.textContent = formatMoney(average);
}


// Display category-wise spending
function displayCategories() {
    const categoryTotals = {};

    for (let i = 0; i < expenses.length; i++) {
        const category = expenses[i].category;

        if (categoryTotals[category] === undefined) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += expenses[i].amount;
    }

    const categories = Object.keys(categoryTotals);

    if (categories.length === 0) {
        categoryList.innerHTML =
            '<p class="muted">Add an expense to see category totals.</p>';
        return;
    }

    let highestAmount = 0;

    for (let i = 0; i < categories.length; i++) {
        if (categoryTotals[categories[i]] > highestAmount) {
            highestAmount = categoryTotals[categories[i]];
        }
    }

    let html = "";

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const amount = categoryTotals[category];
        const percentage = (amount / highestAmount) * 100;

        html += `
            <div class="category-item">
                <span class="category-name">
                    ${escapeHTML(category)}
                </span>

                <div class="category-track">
                    <div class="category-bar"
                         style="width: ${percentage}%">
                    </div>
                </div>

                <span class="category-amount">
                    ${formatMoney(amount)}
                </span>
            </div>
        `;
    }

    categoryList.innerHTML = html;
}


// Display expenses in the table
function displayExpenses() {
    const searchText = searchInput.value.toLowerCase();
    let html = "";
    let visibleCount = 0;

    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];

        const searchContent = (
            expense.category + " " +
            expense.description + " " +
            expense.date
        ).toLowerCase();

        if (!searchContent.includes(searchText)) {
            continue;
        }

        visibleCount++;

        const description = expense.description || "Expense";

        html += `
            <tr>
                <td class="expense-description">
                    ${escapeHTML(description)}
                </td>

                <td>
                    <span class="category-tag">
                        ${escapeHTML(expense.category)}
                    </span>
                </td>

                <td>${escapeHTML(formatDate(expense.date))}</td>

                <td class="amount">
                    ${formatMoney(expense.amount)}
                </td>

                <td>
                    <div class="action-buttons">
                        <button class="edit-button"
                                data-action="edit"
                                data-id="${expense.id}">
                            Edit
                        </button>

                        <button class="delete-button"
                                data-action="delete"
                                data-id="${expense.id}">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    if (visibleCount === 0) {
        html = `
            <tr>
                <td colspan="5">No matching expenses found.</td>
            </tr>
        `;
    }

    expenseList.innerHTML = html;

    document.getElementById("transaction-count").textContent =
        `Showing ${visibleCount} of ${expenses.length} expenses`;
}


// Add a new expense or update an existing one
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const amount = Number(amountInput.value);
    const category = categoryInput.value.trim();
    const description = descriptionInput.value.trim();
    const date = dateInput.value;

    if (amount <= 0 || !category || !date) {
        formMessage.textContent =
            "Enter a valid amount, category, and date.";
        return;
    }

    const expense = {
        amount: amount,
        category: category,
        description: description,
        date: date
    };

    let url = "/expenses";
    let method = "POST";

    if (editingId !== null) {
        url = `/expenses/${editingId}`;
        method = "PUT";
    }

    submitButton.disabled = true;
    formMessage.textContent = "Saving...";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(
                typeof result.detail === "string"
                    ? result.detail
                    : "Please check the expense details."
            );
        }

        resetForm();
        await loadExpenses();

    } catch (error) {
        formMessage.textContent = error.message;

    } finally {
        submitButton.disabled = false;
    }
});


// Handle Edit and Delete button clicks
expenseList.addEventListener("click", async function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = Number(button.dataset.id);

    if (button.dataset.action === "edit") {
        const expense = expenses.find(function (item) {
            return item.id === id;
        });

        if (!expense) {
            return;
        }

        editingId = id;

        amountInput.value = expense.amount;
        categoryInput.value = expense.category;
        descriptionInput.value = expense.description;
        dateInput.value = expense.date;

        formTitle.textContent = "Edit expense";
        submitButton.textContent = "Save changes";
        cancelButton.hidden = false;
        formMessage.textContent = "";

        form.scrollIntoView({ behavior: "smooth" });
    }

    if (button.dataset.action === "delete") {
        const confirmed = confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/expenses/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Could not delete the expense");
            }

            await loadExpenses();

        } catch (error) {
            alert(error.message);
        }
    }
});


// Reset the form after saving or cancelling an edit
function resetForm() {
    form.reset();

    editingId = null;

    formTitle.textContent = "Add a new expense";
    submitButton.textContent = "+ Add expense";
    cancelButton.hidden = true;
    formMessage.textContent = "";

    dateInput.value = new Date().toLocaleDateString("en-CA");
}


// Cancel edit mode
cancelButton.addEventListener("click", resetForm);


// Search expenses
searchInput.addEventListener("input", displayExpenses);


// Start the application
resetForm();
loadExpenses();
