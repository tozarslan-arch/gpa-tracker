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
// FUZZY SEASON PARSING
// -------------------------------
const seasonOrder = {
    winter: 1,
    spring: 2,
    summer: 3,
    fall: 4
};

function parseSemesterName(name) {
    const raw = (name || "").toString().toLowerCase();

    // Year detection (4-digit or 2-digit)
    let yearMatch = raw.match(/(20\d{2})/);
    let year = 0;
    if (yearMatch) {
        year = parseInt(yearMatch[1], 10);
    } else {
        const twoDigit = raw.match(/(?:[^0-9]|^)(\d{2})(?:[^0-9]|$)/);
        if (twoDigit) {
            const yy = parseInt(twoDigit[1], 10);
            year = yy >= 50 ? 1900 + yy : 2000 + yy;
        }
    }

    // Season detection (fuzzy, EN/TR/ES)
    let seasonKey = null;

    const checks = [
        { key: "winter", patterns: ["winter", "kış", "kis", "invierno", "inv"] },
        { key: "spring", patterns: ["spring", "ilkbahar", "bahar", "primavera", "prim"] },
        { key: "summer", patterns: ["summer", "yaz", "verano", "ver"] },
        { key: "fall",   patterns: ["fall", "autumn", "güz", "guz", "otoño", "otono", "oto"] }
    ];

    for (const entry of checks) {
        if (entry.patterns.some(p => raw.includes(p))) {
            seasonKey = entry.key;
            break;
        }
    }

    const isKnown = !!seasonKey && !!year;
    return { seasonKey, year, isKnown };
}

// -------------------------------
// COLOR DOT BY SEASON
// -------------------------------
function getSeasonColor(name) {
    const { seasonKey } = parseSemesterName(name);

    if (seasonKey === "winter") return "#3b82f6";   // blue
    if (seasonKey === "spring") return "#22c55e";   // green
    if (seasonKey === "summer") return "#eab308";   // yellow
    if (seasonKey === "fall")   return "#f97316";   // orange

    return "#6b7280"; // gray default
}

// -------------------------------
// SMART SORTING (YEAR + SEASON, FUZZY)
// -------------------------------
function sortSemesters() {
    gpaData.semesters.sort((a, b) => {
        const pa = parseSemesterName(a.name);
        const pb = parseSemesterName(b.name);

        // If both known, sort by year then season
        if (pa.isKnown && pb.isKnown) {
            if (pa.year !== pb.year) return pa.year - pb.year;

            const sa = seasonOrder[pa.seasonKey] || 0;
            const sb = seasonOrder[pb.seasonKey] || 0;
            return sa - sb;
        }

        // Known seasons come before unknown
        if (pa.isKnown && !pb.isKnown) return -1;
        if (!pa.isKnown && pb.isKnown) return 1;

        // Both unknown: alphabetical
        return a.name.localeCompare(b.name);
    });
}

// -------------------------------
// GLOBAL DATA
// -------------------------------
let gpaData = loadData();
let chart;

// -------------------------------
// RENDER SEMESTERS
// -------------------------------
function renderSemesters() {
    const container = document.getElementById("semesterList");
    container.innerHTML = "";

    gpaData.semesters.forEach((sem, index) => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 rounded shadow";

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
                    <button onclick="moveSemester(${index}, -1)" 
                            class="px-2 py-1 bg-gray-300 rounded text-xs md:text-sm">
                        ↑
                    </button>

                    <button onclick="moveSemester(${index}, 1)" 
                            class="px-2 py-1 bg-gray-300 rounded text-xs md:text-sm">
                        ↓
                    </button>

                    <button onclick="addCourse('${sem.id}')" 
                            class="px-2 py-1 bg-blue-500 text-white rounded text-xs md:text-sm">
                        ${t("addCourse")}
                    </button>
                </div>
            </div>

            <!-- COMPACT TABLE (NO BORDERS, SCROLLABLE ON MOBILE) -->
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="text-gray-600 font-semibold">
                        <tr>
                            <th class="text-left pr-4 pb-1">Course</th>
                            <th class="text-left pr-4 pb-1">Cr</th>
                            <th class="text-left pb-1">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sem.courses.map(c => `
                            <tr class="align-top">
                                <td class="pr-4 py-1">${c.name}</td>
                                <td class="pr-4 py-1">${c.credits}</td>
                                <td class="py-1">${c.grade}</td>
                                <td class="pl-4 py-1">
                                    <button onclick="editCourse('${sem.id}', '${c.id}')" 
                                            class="px-2 py-1 bg-yellow-400 rounded text-xs md:text-sm">
                                        ${t("edit")}
                                    </button>
                                    <button onclick="deleteCourse('${sem.id}', '${c.id}')" 
                                            class="px-2 py-1 bg-red-500 text-white rounded text-xs md:text-sm">
                                        ${t("delete")}
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
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
// MOVE SEMESTER UP / DOWN
// -------------------------------
function moveSemester(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= gpaData.semesters.length) return;

    const temp = gpaData.semesters[index];
    gpaData.semesters[index] = gpaData.semesters[newIndex];
    gpaData.semesters[newIndex] = temp;

    saveData();
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
    const cum = cumulativeG
