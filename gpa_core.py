import json
import os
import re

DATA_FILE = "gpa_data.json"
ORDER_FILE = "gpa_order.json"

grade_points = {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0,
    "F": 0.0
}

SEASON_MAP = {
    "spring": 1, "spr": 1, "sp": 1,
    "summer": 2, "sum": 2, "su": 2,
    "fall": 3, "autumn": 3, "fa": 3, "f": 3
}


# -----------------------------
# Data load/save
# -----------------------------
def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(semesters):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(semesters, f, indent=2)


def load_order():
    if not os.path.exists(ORDER_FILE):
        return []
    with open(ORDER_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_order(order):
    with open(ORDER_FILE, "w", encoding="utf-8") as f:
        json.dump(order, f, indent=2)


# -----------------------------
# Semester normalization & sorting
# -----------------------------
def normalize_semester_name(name):
    if not name:
        return None

    s = name.lower().replace("_", " ").replace("-", " ")
    s = re.sub(r"\s+", " ", s)

    # Extract year (2 or 4 digits)
    year_match = re.search(r"\b(\d{2}|\d{4})\b", s)
    if not year_match:
        return None

    year = int(year_match.group(1))
    if year < 100:
        year += 2000

    # Extract season
    season_val = None
    for key, val in SEASON_MAP.items():
        if key in s:
            season_val = val
            break

    if season_val is None:
        return None

    return (year, season_val)


def sorted_semester_keys(semesters, manual_order=None):
    names = list(semesters.keys())

    # If manual order exists, respect it first
    ordered = []
    if manual_order:
        for name in manual_order:
            if name in semesters:
                ordered.append(name)

    remaining = [n for n in names if n not in ordered]

    parsed = []
    for sem in remaining:
        norm = normalize_semester_name(sem)
        if norm:
            parsed.append((norm[0], norm[1], sem))
        else:
            parsed.append((9999, 99, sem))  # push unknowns to bottom

    parsed.sort()
    ordered.extend([x[2] for x in parsed])
    return ordered


# -----------------------------
# GPA calculations
# -----------------------------
def calculate_gpa(courses):
    total_points = 0
    total_credits = 0

    for name, letter, credits in courses:
        credits = float(credits)
        gp = grade_points.get(letter, 0.0)
        total_points += gp * credits
        total_credits += credits

    if total_credits == 0:
        return 0.0

    return round(total_points / total_credits, 2)


def calculate_cumulative_gpa(semesters):
    total_points = 0
    total_credits = 0

    for courses in semesters.values():
        for name, letter, credits in courses:
            credits = float(credits)
            gp = grade_points.get(letter, 0.0)
            total_points += gp * credits
            total_credits += credits

    if total_credits == 0:
        return 0.0

    return round(total_points / total_credits, 2)


# -----------------------------
# Semester & course operations
# -----------------------------
def add_semester(semesters, name):
    if name not in semesters:
        semesters[name] = []
        # Also append to order file
        order = load_order()
        if name not in order:
            order.append(name)
            save_order(order)


def add_course(semesters, semester, name, letter, credits):
    if semester not in semesters:
        semesters[semester] = []
    semesters[semester].append([name, letter, credits])


def edit_course(semesters, semester, old_name, new_name, new_letter, new_credits):
    if semester not in semesters:
        return False

    for c in semesters[semester]:
        if c[0] == old_name:
            c[0] = new_name
            c[1] = new_letter
            c[2] = new_credits
            return True

    return False


def delete_course(semesters, semester, name):
    if semester not in semesters:
        return False

    before = len(semesters[semester])
    semesters[semester] = [c for c in semesters[semester] if c[0] != name]
    return len(semesters[semester]) < before


# -----------------------------
# Export transcript
# -----------------------------
def export_transcript(semesters):
    order = sorted_semester_keys(semesters, load_order())
    lines = []

    for sem in order:
        lines.append(sem)
        for name, letter, credits in semesters.get(sem, []):
            lines.append(f"  {name} - {letter} ({credits} credits)")
        lines.append("")

    filename = "gpa_transcript.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return filename
