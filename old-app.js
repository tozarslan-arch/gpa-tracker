// -----------------------------
// Grade weight map for sorting
// -----------------------------
const gradeWeight = {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0,
    "F": 0.0
};

let semesterOrder = [];
let gpaChart = null;

// -----------------------------
// Load all semesters + GPA
// -----------------------------
async function loadSemesters() {
    const res = await fetch("/semesters");
    const data = await res.json();
    const semesters = data.semesters;
    semesterOrder = data.order || Object.keys(semesters);

    const gpaRes = await fetch("/gpa");
    const gpaData = await gpaRes.json();

    const list = document.getElementById("semesterList");
    list.innerHTML = "";

    const sortMode = document.getElementById("sortMode").value;

    semesterOrder.forEach((sem, index) => {
        let courses = semesters[sem] || [];

        // Sorting logic
        courses.sort((a, b) => {
            if (sortMode === "name") return a[0].localeCompare(b[0]);
            if (sortMode === "grade") return gradeWeight[b[1]] - gradeWeight[a[1]];
            if (sortMode === "credits") return a[2] - b[2];
        });

        const div = document.createElement("div");
        div.className = "p-6 bg-white rounded shadow border";

        const canMoveUp = index > 0;
        const canMoveDown = index < semesterOrder.length - 1;

        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <h3 class="text-xl font-bold cursor-pointer" onclick="toggleSemester('${sem}')">
                        ${sem}
                    </h3>
                    <div class="flex space-x-1 text-sm">
                        ${canMoveUp ? `<button class="text-gray-500" onclick="moveSemester('${sem}', 'up')">↑</button>` : ""}
                        ${canMoveDown ? `<button class="text-gray-500" onclick="moveSemester('${sem}', 'down')">↓</button>` : ""}
                    </div>
                </div>

                <div class="space-x-3">
                    <button class="text-blue-600" onclick="editSemesterPrompt('${sem}')">Edit</button>
                    <button class="text-red-600" onclick="deleteSemester('${sem}')">Delete</button>
                </div>
            </div>

            <p class="text-gray-700 mb-3">
                Semester GPA: <strong>${gpaData.semester_gpas[sem] ?? "-"}</strong>
            </p>

            <div id="content-${sem}">
                <table class="min-w-full bg-white border mt-3">
                    <thead>
                        <tr class="bg-gray-100 border-b">
                            <th class="text-left p-2">Course</th>
                            <th class="text-left p-2">Grade</th>
                            <th class="text-left p-2">Credits</th>
                            <th class="text-left p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${courses.map(c => `
                            <tr class="border-b">
                                <td class="p-2">${c[0]}</td>
                                <td class="p-2">${c[1]}</td>
                                <td class="p-2">${c[2]}</td>
                                <td class="p-2">
                                    <button class="text-blue-600" onclick="editCoursePrompt('${sem}', '${c[0]}')">Edit</button>
                                    <button class="text-red-600 ml-2" onclick="deleteCourse('${sem}', '${c[0]}')">Delete</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>

                <button onclick="addCoursePrompt('${sem}')"
                    class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    + Add Course
                </button>
            </div>
        `;

        list.appendChild(div);
    });

    renderGPAChart(
        semesterOrder,
        semesterOrder.map(s => gpaData.semester_gpas[s] ?? 0)
    );
}

// -----------------------------
// Move semester up/down
// -----------------------------
async function moveSemester(sem, direction) {
    const idx = semesterOrder.indexOf(sem);
    if (idx === -1) return;

    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= semesterOrder.length) return;

    const newOrder = [...semesterOrder];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];

    await fetch("/semester/order", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ order: newOrder })
    });

    semesterOrder = newOrder;
    loadSemesters();
}

// -----------------------------
// Collapsible Semesters
// -----------------------------
function toggleSemester(sem) {
    const el = document.getElementById(`content-${sem}`);
    if (el) el.classList.toggle("hidden");
}

// -----------------------------
// Load cumulative GPA
// -----------------------------
async function loadGPA() {
    const res = await fetch("/gpa");
    const data = await res.json();

    document.getElementById("gpaDisplay").innerHTML = `
        <strong>Cumulative GPA:</strong> ${data.cumulative}
    `;
}

// -----------------------------
// GPA Chart (with cumulative trendline + 3.00 line)
// -----------------------------
function renderGPAChart(semesterOrder, semesterGPAs) {
    const ctx = document.getElementById("gpaChart");

    if (gpaChart) gpaChart.destroy();

    // Compute cumulative GPA trendline
    let cumulative = [];
    let total = 0;

    for (let i = 0; i < semesterGPAs.length; i++) {
        total += semesterGPAs[i];
        cumulative.push((total / (i + 1)).toFixed(2));
    }

    // Horizontal line at 3.00
    const targetLine = new Array(semesterOrder.length).fill(3.00);

    gpaChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: semesterOrder,
            datasets: [
                {
                    label: "Semester GPA",
                    data: semesterGPAs,
                    borderColor: "rgb(37, 99, 235)",
                    backgroundColor: "rgba(37, 99, 235, 0.3)",
                    tension: 0.3
                },
                {
                    label: "Cumulative GPA",
                    data: cumulative,
                    borderColor: "rgb(16, 185, 129)",
                    backgroundColor: "rgba(16, 185, 129, 0.3)",
                    borderDash: [5, 5],
                    tension: 0.3
                },
                {
                    label: "Target 3.00",
                    data: targetLine,
                    borderColor: "rgb(239, 68, 68)",
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [10, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 2.0,
                    suggestedMax: 4.3
                }
            }
        }
    });
}

// -----------------------------
// Add Semester
// -----------------------------
async function addSemesterPrompt() {
    const name = prompt("Semester name:");
    if (!name) return;

    await fetch("/semester", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name})
    });

    loadSemesters();
    loadGPA();
}

// -----------------------------
// Edit Semester
// -----------------------------
async function editSemesterPrompt(oldName) {
    const newName = prompt("New semester name:", oldName);
    if (!newName) return;

    await fetch("/semester", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ old_name: oldName, new_name: newName })
    });

    loadSemesters();
    loadGPA();
}

// -----------------------------
// Delete Semester
// -----------------------------
async function deleteSemester(name) {
    if (!confirm(`Delete semester "${name}"?`)) return;

    await fetch("/semester", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name })
    });

    loadSemesters();
    loadGPA();
}

// -----------------------------
// Add Course
// -----------------------------
async function addCoursePrompt(semester) {
    const name = prompt("Course name:");
    const letter = prompt("Letter grade:");
    const credits = prompt("Credits:");

    if (!name || !letter || !credits) return;

    await fetch("/course", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({semester, name, letter, credits})
    });

    loadSemesters();
    loadGPA();
}

// -----------------------------
// Edit Course
// -----------------------------
async function editCoursePrompt(semester, oldName) {
    const newName = prompt("New course name:", oldName);
    const newLetter = prompt("New letter grade:");
    const newCredits = prompt("New credits:");

    if (!newName || !newLetter || !newCredits) return;

    await fetch("/course", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            semester,
            old_name: oldName,
            new_name: newName,
            new_letter: newLetter,
            new_credits: newCredits
        })
    });

    loadSemesters();
    loadGPA();
}

// -----------------------------
// Delete Course
// -----------------------------
async function deleteCourse(semester, name) {
    if (!confirm(`Delete ${name}?`)) return;

    await fetch("/course", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ semester, name })
    });

    loadSemesters();
    loadGPA();
}

// -----------------------------
// Download Transcript
// -----------------------------
function downloadTranscript() {
    window.location = "/export";
}

// -----------------------------
// Initialize
// -----------------------------
loadSemesters();
loadGPA();
