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

    try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const country = data.country;

        const spanishCountries = [
            "ES","MX","AR","CO","CL","PE","VE","UY","PY","BO",
            "DO","CR","PA","GT","SV","HN","NI"
        ];
        if (country === "TR") return "tr";
        if (spanishCountries.includes(country)) return "es";
    } catch (e) {
        // ignore errors
    }

    return "en";
}

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
// SEMESTER SORTING (SEASON + YEAR)
// -------------------------------
const seasonOrder = {
    "Winter": 1,
    "Spring": 2,
    "Summer": 3,
    "Fall": 4,
    "Kış": 1,
    "İlkbahar": 2,
    "Yaz": 3,
    "Güz": 4,
    "Invierno": 1,
    "Primavera": 2,
    "Verano": 3,
    "Otoño": 4
};

function parseSemesterName(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) {
        return { season: "", year: 0 };
    }
    const season = parts[0];
    const year = parseInt(parts[1], 10) || 0;
    return { season, year };
}

function sortSemesters() {
    gpaData.semesters.sort((a, b) => {
        const pa = parseSemesterName(a.name);
        const pb = parseSemesterName(b.name);

        if (pa.year !== pb.year) {
            return pa.year - pb.year;
        }

        const sa = seasonOrder[pa.season] || 0;
        const sb = seasonOrder[pb.season] || 0;
        return sa - sb;
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
    if (!container) return;
    container.innerHTML = "";

    gpaData.semesters.forEach((sem, index) => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 rounded shadow";

        div.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                <div class="flex items-center gap-2">
                    <span
                        id="sem-name-${sem.id}"
                        class="text-xl font-bold px-1 rounded hover:bg-gray-100 cursor-text"
                        contenteditable="false"
                        onblur="finishEditSemester('${sem.id}')"
                    >${sem.name}</span>
                    <button
                        onclick="startEditSemester('${sem.id}')"
                        class="px-2 py-1 bg-yellow-400 rounded text-xs md:text-sm"
                    >${t("edit")}</button>
                    <button
                        onclick="deleteSemester('${sem.id}')"
                        class="px-2 py-1 bg-red-500 text-white rounded text-xs md:text-sm"
                    >${t("delete")}</button>
                </div>
                <div class="flex gap-1">
                    <button onclick="moveSemester(${index}, -1)" class="px-2 py-1 bg-gray-300 rounded text-xs md:text-sm">↑</button>
                    <button onclick="moveSemester(${index}, 1)" class="px-2 py-1 bg-gray-300 rounded text-xs md:text-sm">↓</button>
                    <button onclick="addCourse('${sem.id}')" class="px-2 py-1 bg-blue-500 text-white rounded text-xs md:text-sm">${t("addCourse")}</button>
                </div>
            </div>

            <div class="mt-2 space-y-2">
                ${sem.courses.map(c => `
                    <div class="p-2 border rounded flex justify-between items-center">
                        <div class="text-sm md:text-base">
                            <strong>${c.name}</strong> — ${c.credits} credits — ${c.grade}
                        </div>
                        <div class="flex gap-1">
                            <button onclick="editCourse('${sem.id}', '${c.id}')" class="px-2 py-1 bg-yellow-400 rounded text-xs md:text-sm">${t("edit")}</button>
                            <button onclick="deleteCourse('${sem.id}', '${c.id}')" class="px-2 py-1 bg-red-500 text-white rounded text-xs md:text-sm">${t("delete")}</button>
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
    if (!span) return;
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
    if (!span || span.contentEditable !== "true") return;

    span.contentEditable = "false";
    const newName = span.textContent.trim();
    if (!newName) return;

    const sem = gpaData.semesters.find(s => s.id === semId);
    if (!sem) return;
    sem.name = newName;

    sortSemesters();
    renderSemesters();
}

function deleteSemester(semId) {
    if (!confirm(t("confirmDeleteSemester"))) return;
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
// COURSE FUNCTIONS (PROMPT-BASED)
// -------------------------------
function addCourse(semId) {
    const sem = gpaData.semesters.find(s => s.id === semId);
    if (!sem) return;

    const name = prompt(t("promptCourseName"));
    if (!name) return;

    const creditsRaw = prompt(t("promptCredits"));
    const credits = parseInt(creditsRaw, 10);
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
    if (!sem) return;
    const course = sem.courses.find(c => c.id === courseId);
    if (!course) return;

    const name = prompt(t("promptCourseName"), course.name);
    if (!name) return;

    const creditsRaw = prompt(t("promptCredits"), course.credits);
    const credits = parseInt(creditsRaw, 10);
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
    if (!sem) return;
    sem.courses = sem.courses.filter(c => c.id !== courseId);
    renderSemesters();
}

// -------------------------------
// GPA CHART (RESPONSIVE)
// -------------------------------
function updateChart() {
    const canvas = document.getElementById("gpaChart");
    if (!canvas) return;
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
// INIT
// -------------------------------
(async function init() {
    currentLanguage = await detectLanguage();
    applyTranslations();
    sortSemesters();
    renderSemesters();
})();
