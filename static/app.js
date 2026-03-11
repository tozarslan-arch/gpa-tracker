// -------------------------------
// SAMPLE DATA
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
// LOAD / SAVE / RESET
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
}

function resetAllData() {
    if (confirm("Reset everything?")) {
        localStorage.removeItem("gpa_data");
        location.reload();
    }
}

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

function semesterGPA(sem) {
    let pts = 0, cr = 0;
    sem.courses.forEach(c => {
        if (gradePoints[c.grade]) {
            pts += gradePoints[c.grade] * c.credits;
            cr += c.credits;
        }
    });
    return cr === 0 ? 0 : pts / cr;
}

function cumulativeGPA() {
    let pts = 0, cr = 0;
    gpaData.semesters.forEach(sem => {
        sem.courses.forEach(c => {
            if (gradePoints[c.grade]) {
                pts += gradePoints[c.grade] * c.credits;
                cr += c.credits;
            }
        });
    });
    return cr === 0 ? 0 : pts / cr;
}

// -------------------------------
// RENDER SEMESTERS
// -------------------------------
function renderSemesters() {
    const container = document.getElementById("semesterList");
    container.innerHTML = "";

    gpaData.semesters.forEach((sem, index) => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 rounded shadow mb-4";

        div.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <div class="flex items-center space-x-2">
                    <span 
                        id="sem-name-${sem.id}" 
                        class="text-xl font-bold px-1 rounded hover:bg-gray-100 cursor-text"
                        contenteditable="false"
                        onblur="finishEditSemester('${sem.id}')"
                    >${sem.name}</span>
                    <button 
                        onclick="startEditSemester('${sem.id}')" 
                        class="px-2 py-1 bg-yellow-400 rounded text-sm"
                    >Edit</button>
                    <button 
                        onclick="deleteSemester('${sem.id}')" 
                        class="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >Delete</button>
                </div>
                <div class="space-x-1">
                    <button onclick="moveSemester(${index}, -1)" class="px-2 py-1 bg-gray-300 rounded">↑</button>
                    <button onclick="moveSemester(${index}, 1)" class="px-2 py-1 bg-gray-300 rounded">↓</button>
                    <button onclick="addCourse('${sem.id}')" class="px-2 py-1 bg-blue-500 text-white rounded">Add Course</button>
                </div>
            </div>

            <div class="mt-3">
                ${sem.courses.map(c => `
                    <div class="p-2 border rounded mb-2 flex justify-between">
                        <div>
                            <strong>${c.name}</strong> — ${c.credits} credits — ${c.grade}
                        </div>
                        <div class="space-x-1">
                            <button onclick="editCourse('${sem.id}', '${c.id}')" class="px-2 py-1 bg-yellow-400 rounded text-sm">Edit</button>
                            <button onclick="deleteCourse('${sem.id}', '${c.id}')" class="px-2 py-1 bg-red-500 text-white rounded text-sm">X</button>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;

        container.appendChild(div);
    });

    updateChart();
    saveData();
}

// -------------------------------
// SEMESTER INLINE EDIT / ADD / DELETE / MOVE
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

function startEditSemester(semId) {
    const span = document.getElementById(`sem-name-${semId}`);
    span.contentEditable = "true";
    span.focus();
    const range = document.createRange();
    range.selectNodeContents(span);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function finishEditSemester(semId) {
    const span = document.getElementById(`sem-name-${semId}`);
    span.contentEditable = "false";
    const newName = span.textContent.trim();
    if (!newName) return;

    const sem = gpaData.semesters.find(s => s.id === semId);
    sem.name = newName;
    saveData();
    updateChart();
}

function deleteSemester(semId) {
    if (!confirm("Delete this semester and all its courses?")) return;
    gpaData.semesters = gpaData.semesters.filter(s => s.id !== semId);
    renderSemesters();
}

function moveSemester(index, dir) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= gpaData.semesters.length) return;

    const temp = gpaData.semesters[index];
    gpaData.semesters[index] = gpaData.semesters[newIndex];
    gpaData.semesters[newIndex] = temp;

    renderSemesters();
}

// -------------------------------
// COURSE FUNCTIONS
// -------------------------------
function addCourse(semId) {
    const sem = gpaData.semesters.find(s => s.id === semId);
    const name = prompt("Course name:");
    if (!name) return;

    const creditsRaw = prompt("Credits:");
    const credits = parseInt(creditsRaw, 10);
    if (isNaN(credits) || credits <= 0) return;

    const grade = prompt("Grade (A, B+, C-, etc):");
    if (!grade) return;

    sem.courses.push({
        id: "c" + Date.now(),
        name,
        credits,
        grade: grade.toUpperCase()
    });

    renderSemesters();
}

function editCourse(semId, courseId) {
    const sem = gpaData.semesters.find(s => s.id === semId);
    const course = sem.courses.find(c => c.id === courseId);

    const name = prompt("Course name:", course.name);
    if (!name) return;

    const creditsRaw = prompt("Credits:", course.credits);
    const credits = parseInt(creditsRaw, 10);
    if (isNaN(credits) || credits <= 0) return;

    const grade = prompt("Grade:", course.grade);
    if (!grade) return;

    course.name = name;
    course.credits = credits;
    course.grade = grade.toUpperCase();

    renderSemesters();
}

function deleteCourse(semId, courseId) {
    const sem = gpaData.semesters.find(s => s.id === semId);
    sem.courses = sem.courses.filter(c => c.id !== courseId);
    renderSemesters();
}

// -------------------------------
// GPA CHART
// -------------------------------
let chart;

function updateChart() {
    const ctx = document.getElementById("gpaChart").getContext("2d");

    const labels = gpaData.semesters.map(s => s.name);
    const semGPA = gpaData.semesters.map(s => semesterGPA(s));
    const cum = cumulativeGPA();
    const cumGPA = semGPA.map(() => cum);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Semester GPA",
                    data: semGPA,
                    borderColor: "blue",
                    fill: false
                },
                {
                    label: "Cumulative GPA",
                    data: cumGPA,
                    borderColor: "green",
                    fill: false
                },
                {
                    label: "Target 3.0",
                    data: semGPA.map(() => 3.0),
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
