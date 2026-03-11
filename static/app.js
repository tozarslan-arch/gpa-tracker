// -------------------------------
// TRANSLATIONS
// -------------------------------
const translations = {
    en: {
        title: "GPA Tracker",
        addSemester: "Add Semester",
        resetAll: "Reset All Data",
        localNote: "Your data is stored locally in your browser.",
        semestersHeader: "Your Semesters",
        chartHeader: "GPA Chart",
        addCourse: "Add Course",
        edit: "Edit",
        delete: "Delete",
        promptSemester: "Semester name (e.g., 'Fall 2024'):",
        promptCourseName: "Course name:",
        promptCredits: "Credits:",
        promptGrade: "Grade (A, B+, C-, etc):",
        confirmDeleteSemester: "Delete this semester and all its courses?",
        confirmReset: "Reset everything?",
        semesterGPA: "Semester GPA",
        cumulativeGPA: "Cumulative GPA",
        targetGPA: "Target 3.0"
    },
    tr: {
        title: "GPA Takipçisi",
        addSemester: "Dönem Ekle",
        resetAll: "Tüm Verileri Sıfırla",
        localNote: "Verileriniz tarayıcınızda yerel olarak saklanır.",
        semestersHeader: "Dönemleriniz",
        chartHeader: "GPA Grafiği",
        addCourse: "Ders Ekle",
        edit: "Düzenle",
        delete: "Sil",
        promptSemester: "Dönem adı (örn: 'Güz 2024'):",
        promptCourseName: "Ders adı:",
        promptCredits: "Kredi:",
        promptGrade: "Not (A, B+, C-, vb):",
        confirmDeleteSemester: "Bu dönemi ve tüm derslerini silmek istiyor musunuz?",
        confirmReset: "Her şeyi sıfırlamak istiyor musunuz?",
        semesterGPA: "Dönem Ortalaması",
        cumulativeGPA: "Genel Ortalama",
        targetGPA: "Hedef 3.0"
    },
    es: {
        title: "Rastreador de GPA",
        addSemester: "Agregar Semestre",
        resetAll: "Restablecer Datos",
        localNote: "Sus datos se almacenan localmente en su navegador.",
        semestersHeader: "Sus Semestres",
        chartHeader: "Gráfico de GPA",
        addCourse: "Agregar Curso",
        edit: "Editar",
        delete: "Eliminar",
        promptSemester: "Nombre del semestre (ej: 'Otoño 2024'):",
        promptCourseName: "Nombre del curso:",
        promptCredits: "Créditos:",
        promptGrade: "Calificación (A, B+, C-, etc):",
        confirmDeleteSemester: "¿Eliminar este semestre y todos sus cursos?",
        confirmReset: "¿Restablecer todo?",
        semesterGPA: "Promedio del Semestre",
        cumulativeGPA: "Promedio Acumulado",
        targetGPA: "Meta 3.0"
    }
};

let currentLanguage = "en";

// -------------------------------
// LANGUAGE HELPERS
// -------------------------------
function t(key) {
    return translations[currentLanguage][key];
}

function applyTranslations() {
    document.getElementById("titleText").textContent = t("title");
    document.getElementById("mobileTitle").textContent = t("title");

    document.getElementById("btnAddSemester").textContent = t("addSemester");
    document.getElementById("btnReset").textContent = t("resetAll");
    document.getElementById("localNote").textContent = t("localNote");

    document.getElementById("mBtnAddSemester").textContent = t("addSemester");
    document.getElementById("mBtnReset").textContent = t("resetAll");
    document.getElementById("mLocalNote").textContent = t("localNote");

    document.getElementById("semestersHeader").textContent = t("semestersHeader");
    document.getElementById("chartHeader").textContent = t("chartHeader");

    renderSemesters();
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem("language", lang);
    applyTranslations();
}

// -------------------------------
// AUTO-DETECT LANGUAGE
// -------------------------------
async function detectLanguage() {
    const saved = localStorage.getItem("language");
    if (saved && translations[saved]) return saved;

    const browserLang = (navigator.language || "").toLowerCase();
    if (browserLang.startsWith("tr")) return "tr";
    if (browserLang.startsWith("es")) return "es";

    return "en";
}

// -------------------------------
// SAMPLE DATA
// -------------------------------
const sampleData = {
    semesters: []
};

// -------------------------------
// LOCALSTORAGE LOAD / SAVE / RESET
// -------------------------------
function loadData() {
    let data = localStorage.getItem("gpa_data");
    if (!data) {
        localStorage.setItem("gpa_data", JSON.stringify(sampleData));
        return JSON.parse(JSON.stringify(sampleData));
    }
    return JSON.parse(data);
}

function saveData() {
    localStorage.setItem("gpa_data", JSON.stringify(gpaData));
}

function resetAllData() {
    if (confirm(t("confirmReset"))) {
        localStorage.removeItem("gpa_data");
        location.reload();
    }
}

// -------------------------------
// MOBILE MENU
// -------------------------------
function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    menu.classList.toggle("hidden");
}

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
// SEMESTER SORTING (ALPHABETICAL BY NAME)
// -------------------------------
function sortSemesters() {
    gpaData.semesters.sort((a, b) => a.name.localeCompare(b.name));
}

// -------------------------------
// COLOR DOT BY SEASON
// -------------------------------
function getSeasonColor(name) {
    const season = (name.split(/\s+/)[0] || "").toLowerCase();

    if (["winter", "kış", "invierno"].includes(season)) return "#3b82f6";   // blue
    if (["spring", "ilkbahar", "primavera"].includes(season)) return "#22c55e"; // green
    if (["summer", "yaz", "verano"].includes(season)) return "#eab308";   // yellow
    if (["fall", "güz", "otoño"].includes(season)) return "#f97316";      // orange

    return "#6b7280"; // gray default
}

// -------------------------------
// GLOBAL DATA
// -------------------------------
let gpaData = loadData();
let chart;
let dragIndex = null;

// -------------------------------
// DRAG & DROP HELPERS
// -------------------------------
function handleDragStart(index, event) {
    dragIndex = index;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());

    // Ghost preview: make the card semi-transparent
    event.target.classList.add("opacity-50");
}

function handleDragOver(index, event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    autoScroll(event.clientY);
}

function handleDrop(index, event) {
    event.preventDefault();
    const fromIndex = dragIndex;
    const toIndex = index;

    if (fromIndex === null || toIndex === null || fromIndex === toIndex) {
        handleDragEnd(event);
        return;
    }

    const moved = gpaData.semesters.splice(fromIndex, 1)[0];
    gpaData.semesters.splice(toIndex, 0, moved);

    dragIndex = null;
    saveData();
    renderSemesters();
}

function handleDragEnd(event) {
    dragIndex = null;
    if (event && event.target) {
        event.target.classList.remove("opacity-50");
    }
}

// Auto-scroll when dragging near top/bottom of viewport
function autoScroll(y) {
    const threshold = 80;
    const speed = 10;

    if (y < threshold) {
        window.scrollBy(0, -speed);
    } else if (window.innerHeight - y < threshold) {
        window.scrollBy(0, speed);
    }
}

// -------------------------------
// RENDER SEMESTERS
// -------------------------------
function renderSemesters() {
    const container = document.getElementById("semesterList");
    container.innerHTML = "";

    gpaData.semesters.forEach((sem, index) => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 rounded shadow transition-transform duration-150";
        div.setAttribute("draggable", "true");
        div.setAttribute("data-index", index);

        div.ondragstart = (e) => handleDragStart(index, e);
        div.ondragover = (e) => handleDragOver(index, e);
        div.ondrop = (e) => handleDrop(index, e);
        div.ondragend = (e) => handleDragEnd(e);

        const color = getSeasonColor(sem.name);

        div.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                <div class="flex items-center gap-2">
                    <span class="inline-block w-3 h-3 rounded-full" style="background-color: ${color};"></span>

                    <span
                        id="sem-name-${sem.id}"
                        class="text-xl font-bold px-1 rounded hover:bg-gray-100 cursor-text"
                        contenteditable="false"
                        onblur="finishEditSemester('${sem.id}')"
                    >${sem.name}</span>

                    <button onclick="startEditSemester('${sem.id}')" 
                            class="px-2 py-1 bg-yellow-400 rounded text-xs md:text-sm">
                        ${t("edit")}
                    </button>

                    <button onclick="deleteSemester('${sem.id}')" 
                            class="px-2 py-1 bg-red-500 text-white rounded text-xs md:text-sm">
                        ${t("delete")}
                    </button>
                </div>

                <div class="flex gap-1">
                    <button onclick="addCourse('${sem.id}')" 
                            class="px-2 py-1 bg-blue-500 text-white rounded text-xs md:text-sm">
                        ${t("addCourse")}
                    </button>
                </div>
            </div>

            <div class="mt-2 space-y-2">
                ${sem.courses.map(c => `
                    <div class="p-2 border rounded flex justify-between items-center">
                        <div class="text-sm md:text-base">
                            <strong>${c.name}</strong> — ${c.credits} credits — ${c.grade}
                        </div>
                        <div class="flex gap-1">
                            <button onclick="editCourse('${sem.id}', '${c.id}')" 
                                    class="px-2 py-1 bg-yellow-400 rounded text-xs md:text-sm">
                                ${t("edit")}
                            </button>

                            <button onclick="deleteCourse('${sem.id}', '${c.id}')" 
                                    class="px-2 py-1 bg-red-500 text-white rounded text-xs md:text-sm">
                                ${t("delete")}
                            </button>
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
// SEMESTER FUNCTIONS
// -------------------------------
function addSemester() {
    const name = prompt(t("promptSemester"));
    if (!name) return;

    gpaData.semesters.push({
        id: "sem" + Date.now(),
        name: name.trim(),
        courses: []
    });

    sortSemesters();
    renderSemesters();
}

function startEditSemester(semId) {
    const span = document.getElementById(`sem-name-${semId}`);
    span.contentEditable = "true";
    span.focus();
}

function finishEditSemester(semId) {
    const span = document.getElementById(`sem-name-${semId}`);
    span.contentEditable = "false";

    const newName = span.textContent.trim();
    if (!newName) return;

    const sem = gpaData.semesters.find(s => s.id === semId);
    sem.name = newName;

    sortSemesters();
    renderSemesters();
}

function deleteSemester(semId) {
    if (!confirm(t("confirmDeleteSemester"))) return;
    gpaData.semesters = gpaData.semesters.filter(s => s.id !== semId);
    renderSemesters();
}

// -------------------------------
// COURSE FUNCTIONS
// -------------------------------
function addCourse(semId) {
    const sem = gpaData.semesters.find(s => s.id === semId);

    const name = prompt(t("promptCourseName"));
    if (!name) return;

    const credits = parseInt(prompt(t("promptCredits")), 10);
    if (isNaN(credits) || credits <= 0) return;

    const grade = prompt(t("promptGrade"));
    if (!grade) return;

    sem.courses.push({
        id: "c" + Date.now(),
        name: name.trim(),
        credits,
        grade: grade.toUpperCase()
    });

    renderSemesters();
}

function editCourse(semId, courseId) {
    const sem = gpaData.semesters.find(s => s.id === semId);
    const course = sem.courses.find(c => c.id === courseId);

    const name = prompt(t("promptCourseName"), course.name);
    if (!name) return;

    const credits = parseInt(prompt(t("promptCredits"), course.credits), 10);
    if (isNaN(credits) || credits <= 0) return;

    const grade = prompt(t("promptGrade"), course.grade);
    if (!grade) return;

    course.name = name.trim();
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
function updateChart() {
    const canvas = document.getElementById("gpaChart");
    const ctx = canvas.getContext("2d");

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
                    label: t("semesterGPA"),
                    data: semGPA,
                    borderColor: "blue",
                    fill: false,
                    tension: 0.2
                },
                {
                    label: t("cumulativeGPA"),
                    data: cumGPA,
                    borderColor: "green",
                    fill: false,
                    tension: 0.2
                },
                {
                    label: t("targetGPA"),
                    data: semGPA.map(() => 3.0),
                    borderColor: "red",
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    suggestedMin: 0,
                    suggestedMax: 4.3
                }
            }
        }
    });
}

// -------------------------------
// TRANSCRIPT PDF
// -------------------------------
function downloadTranscriptPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 15;

    doc.setFontSize(18);
    doc.text("Academic Transcript", 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 10;

    gpaData.semesters.forEach((sem) => {
        doc.setFontSize(14);
        doc.text(sem.name, 14, y);
        y += 8;

        doc.setFontSize(11);

        sem.courses.forEach((c) => {
            doc.text(
                `${c.name} — ${c.credits} credits — Grade: ${c.grade}`,
                20,
                y
            );
            y += 6;

            if (y > 270) {
                doc.addPage();
                y = 15;
            }
        });

        const sgpa = semesterGPA(sem).toFixed(2);
        doc.text(`Semester GPA: ${sgpa}`, 20, y);
        y += 10;

        if (y > 270) {
            doc.addPage();
            y = 15;
        }
    });

    const cgpa = cumulativeGPA().toFixed(2);
    doc.setFontSize(14);
    doc.text(`Cumulative GPA: ${cgpa}`, 14, y);

    doc.save("transcript.pdf");
}

// -------------------------------
// INIT
// -------------------------------
(async function init() {
    currentLanguage = await detectLanguage();
    applyTranslations();
    sortSemesters();
    renderSemesters();
})();
