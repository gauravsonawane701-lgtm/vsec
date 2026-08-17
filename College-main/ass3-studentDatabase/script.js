let names = [];
let mathsMarks = [];
let scienceMarks = [];
let englishMarks = [];

function addStudent() {
    let name = document.getElementById("name").value.trim();
    let maths = Number(document.getElementById("maths").value);
    let science = Number(document.getElementById("science").value);
    let english = Number(document.getElementById("english").value);

    let marksEntered = document.getElementById("maths").value !== "" &&
                        document.getElementById("science").value !== "" &&
                        document.getElementById("english").value !== "";

    let marksValid = marksEntered &&
        maths >= 0 && maths <= 100 &&
        science >= 0 && science <= 100 &&
        english >= 0 && english <= 100;

    if (name == "" || !marksValid) {
        alert("Enter a valid name and marks between 0 and 100 for all subjects.");
        return;
    }

    names.push(name);
    mathsMarks.push(maths);
    scienceMarks.push(science);
    englishMarks.push(english);

    displayStudents();

    document.getElementById("name").value = "";
    document.getElementById("maths").value = "";
    document.getElementById("science").value = "";
    document.getElementById("english").value = "";
    document.getElementById("name").focus();
}

function getTotal(index) {
    return mathsMarks[index] + scienceMarks[index] + englishMarks[index];
}

function getPercentage(index) {
    return (getTotal(index) / 300 * 100).toFixed(2);
}

function findTopperIndex() {
    if (names.length === 0) {
        return -1;
    }
    let topperIndex = 0;
    for (let i = 1; i < names.length; i++) {
        if (getTotal(i) > getTotal(topperIndex)) {
            topperIndex = i;
        }
    }
    return topperIndex;
}

function displayStudents() {
    let tableBody = document.getElementById("studentTableBody");
    let topperBanner = document.getElementById("topperBanner");
    let topperText = document.getElementById("topperText");

    if (names.length === 0) {
        tableBody.innerHTML = "<tr id='emptyRow'><td colspan='8' class='empty-note'>No students added yet — fill the form above and click \"Add to Register\".</td></tr>";
        topperBanner.style.display = "none";
        return;
    }

    let topperIndex = findTopperIndex();
    let output = "";

    for (let i = 0; i < names.length; i++) {
        let isTopper = (i === topperIndex);
        let rowClass = isTopper ? " class='topper-row'" : "";
        let stampBadge = isTopper ? " <span class='stamp'>Topper</span>" : "";

        output += "<tr" + rowClass + ">";
        output += "<td>" + (i + 1) + "</td>";
        output += "<td><span class='name-cell'>" + names[i] + stampBadge + "</span></td>";
        output += "<td>" + mathsMarks[i] + "</td>";
        output += "<td>" + scienceMarks[i] + "</td>";
        output += "<td>" + englishMarks[i] + "</td>";
        output += "<td>" + getTotal(i) + "</td>";
        output += "<td>" + getPercentage(i) + "%</td>";
        output += "<td><button class='ghost' onclick='deleteStudent(" + i + ")'>Remove</button></td>";
        output += "</tr>";
    }

    tableBody.innerHTML = output;

    topperBanner.style.display = "flex";
    topperText.innerHTML = names[topperIndex] + " leads the class with " + getTotal(topperIndex) +
        " / 300 (" + getPercentage(topperIndex) + "%)";
}

function deleteStudent(index) {
    names.splice(index, 1);
    mathsMarks.splice(index, 1);
    scienceMarks.splice(index, 1);
    englishMarks.splice(index, 1);
    displayStudents();
}