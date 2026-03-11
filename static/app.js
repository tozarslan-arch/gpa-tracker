// -------------------------------
// SAMPLE DATA (first-time users)
// -------------------------------
const sampleData = {
    semesters: [
        {
            id: "fall2024",
            name: "Fall 2024",
            courses: [
                { id: "c1", name: "Math 101", credits: 3, grade: "A" },
                { id: "c2", name: "History 201", credits: 3, grade: "B+" }
            ]
        }
    ]
};

// -------------------------------
// LOAD DATA FROM LOCALSTORAGE
// -------------------------------
function loadData() {
    let data = localStorage.getItem("gpa_data");
    if (!data) {
        localStorage.setItem("gpa_data", JSON.stringify(sampleData));
        return sampleData;
    }
    return JSON.parse(data);
}

function saveData() {
    localStorage.setItem("gpa_data", JSON.stringify(gpaData));
    alert("Saved!");
}

function autoSave() {
    localStorage.setItem("gpa_data", JSON.stringify(gpaData));
}

// -------------------------------
// RESET ALL DATA
// -------------------------------
function resetAllData() {
    if (confirm("Reset everything?")) {
        localStorage.removeItem("gpa_data");
        location.reload();
    }
}

// -------------------------------
// GLOBAL DATA OBJECT
// -------------------------------
let gpaData = loadData();

// -------------------------------
// GPA CALCULATION
// -------------------------------
const gradePoints = {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "F": 0.0
};

function calculateSemesterGPA(semester) {
    let totalPoints = 0;
    let totalCredits = 0;

    semester.courses.forEach(c => {
        if (gradePoints[c.grade]) {
            totalPoints += gradePoints[c.grade] * c.credits;
            totalCredits += c.credits;
        }
    });

    return totalCredits === 0 ? 0 : (totalPoints / totalCredits);
}

function calculateCumulativeGPA() {
    let totalPoints = 0;
    let totalCredits = 0;

    gpaData.semesters.forEach(sem => {
        sem.courses.forEach(c => {
            if (gradePoints[c.grade]) {
                totalPoints += gradePoints[c.grade] * c.credits;
                totalCredits += c.credits;
            }
        });
    });

    return totalCredits === 0 ? 0 : (totalPoints / totalCredits);
}

// -------------------------------
// RENDER SEMESTERS
// -------------------------------
function renderSemesters() {
    const container = document.getElementById("semesterList");
    container.innerHTML = "";

    gpaData.semesters.forEach((sem, index) => {
        const semDiv = document.createElement("div");
        semDiv.className = "bg-white p-4 rounded shadow mb-4";

        semDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold">${sem.name}</h2>
                <div>
                    <button onclick="moveSemester(${index}, -1)" class="px-2 py-1 bg-gray-300 rounded">↑</button>
                    <button onclick="moveSemester(${index}, 1)" class="px-2 py-1 bg-gray-300 rounded">↓</button>
                    <button onclick="toggleSemester('${sem.id}')" class="px-2 py-1 bg-blue-500 text-white rounded">Toggle</button>
                </div>
            </div>

            <div id="sem-${sem.id}" class="mt-3">
                ${sem.courses.map(c => `
                    <div class="p-2 border rounded mb-2">
                        <strong>${c.name}</strong> — ${c.credits} credits — ${c.grade}
                    </div>
                `).join("")}
            </div>
        `;

        container.appendChild(semDiv);
    });

    updateChart();
    autoSave();
}

// -------------------------------
// COLLAPSE SEMESTER
// -------------------------------
function toggleSemester(id) {
    const div = document.getElementById(`sem-${id}`);
    div.style.display = div.style.display === "none" ? "block" : "none";
}

// -------------------------------
// MOVE SEMESTER UP/DOWN
// -------------------------------
function moveSemester(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= gpaData.semesters.length) return;

    const temp = gpaData.semesters[index];
    gpaData.semesters[index] = gpaData.semesters[newIndex];
    gpaData.semesters[newIndex] = temp;

    renderSemesters();
}

// -------------------------------
// ADD SEMESTER
// -------------------------------
function addSemester() {
    const name = prompt("Semester name:");
    if (!name) return;

    gpaData.semesters.push({
        id: "sem" + Date.now(),
        name,
        courses: []
    });

    renderSemesters();
}

// -------------------------------
// GPA CHART
// -------------------------------
let chart;

function updateChart() {
    const ctx = document.getElementById("gpaChart").getContext("2d");

    const semesterGPAs = gpaData.semesters.map(s => calculateSemesterGPA(s));
    const cumulative = calculateCumulativeGPA();

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: gpaData.semesters.map(s => s.name),
            datasets: [
                {
                    label: "Semester GPA",
                    data: semesterGPAs,
                    borderColor: "blue",
                    fill: false
                },
                {
                    label: "Cumulative GPA",
                    data: semesterGPAs.map((_, i) =>
                        calculateCumulativeGPA()
                    ),
                    borderColor: "green",
                    fill: false
                },
                {
                    label: "Target 3.0",
                    data: semesterGPAs.map(() => 3.0),
                    borderColor: "red",
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        }
    });
}

// -------------------------------
// INITIAL RENDER
// -------------------------------
renderSemesters();
