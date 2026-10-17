let descriptions = [];
let amounts = [];
let types = [];

function addTransaction() {

    let description = document.getElementById("description").value;

    let amount = Number(document.getElementById("amount").value);

    let income = document.getElementsByName("type")[0].checked;

    let type;

    if (income) {
        type = "Income";
    }
    else {
        type = "Expense";
    }

    if (description == "" || amount <= 0) {
        alert("Enter valid details");
        return;
    }

    descriptions.push(description);
    amounts.push(amount);
    types.push(type);

    displayTransactions();

    updateSummary();

    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
}

function displayTransactions() {

    let output = "";

    for (let i = 0; i < descriptions.length; i++) {

        output += "<li>";

        output += descriptions[i];

        output += " | ";

        output += types[i];

        output += " | ₹";

        output += amounts[i];

        output += " ";

        output += "<button onclick='deleteTransaction(" + i + ")'>Delete</button>";

        output += "</li>";
    }

    document.getElementById("transactionList").innerHTML = output;

}

function updateSummary() {

    let income = 0;

    let expense = 0;

    for (let i = 0; i < amounts.length; i++) {

        if (types[i] == "Income") {

            income = income + amounts[i];

        }

        else {

            expense = expense + amounts[i];

        }

    }

    let balance = income - expense;

    document.getElementById("income").innerHTML = income;

    document.getElementById("expense").innerHTML = expense;

    document.getElementById("balance").innerHTML = balance;

}

function deleteTransaction(index) {

    descriptions.splice(index, 1);

    amounts.splice(index, 1);

    types.splice(index, 1);

    displayTransactions();

    updateSummary();

}