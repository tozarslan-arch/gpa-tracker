from flask import Flask, request, jsonify, send_file, render_template
from gpa_core import (
    load_data, save_data, add_semester, add_course,
    edit_course, delete_course, calculate_gpa,
    calculate_cumulative_gpa, export_transcript,
    sorted_semester_keys, load_order, save_order
)

app = Flask(__name__, static_folder="static", template_folder="templates")


# -----------------------------
# FRONTEND ROUTE
# -----------------------------
@app.get("/")
def home():
    return render_template("index.html")


# -----------------------------
# API: GET ALL SEMESTERS + ORDER
# -----------------------------
@app.get("/semesters")
def get_semesters():
    semesters = load_data()
    manual_order = load_order()
    order = sorted_semester_keys(semesters, manual_order)
    return jsonify({"semesters": semesters, "order": order})


# -----------------------------
# API: CREATE SEMESTER
# -----------------------------
@app.post("/semester")
def create_semester():
    data = request.json
    semesters = load_data()
    add_semester(semesters, data["name"])
    save_data(semesters)
    return jsonify({"status": "ok"})


# -----------------------------
# API: EDIT SEMESTER
# -----------------------------
@app.put("/semester")
def update_semester():
    data = request.json
    old_name = data["old_name"]
    new_name = data["new_name"]

    semesters = load_data()
    order = load_order()

    if old_name in semesters:
        semesters[new_name] = semesters.pop(old_name)
        # Update order list
        order = [new_name if s == old_name else s for s in order]
        save_data(semesters)
        save_order(order)
        return jsonify({"success": True})

    return jsonify({"success": False, "error": "Semester not found"}), 404


# -----------------------------
# API: DELETE SEMESTER
# -----------------------------
@app.delete("/semester")
def remove_semester():
    data = request.json
    name = data["name"]

    semesters = load_data()
    order = load_order()

    if name in semesters:
        del semesters[name]
        order = [s for s in order if s != name]
        save_data(semesters)
        save_order(order)
        return jsonify({"success": True})

    return jsonify({"success": False, "error": "Semester not found"}), 404


# -----------------------------
# API: UPDATE SEMESTER ORDER
# -----------------------------
@app.put("/semester/order")
def update_semester_order():
    data = request.json
    new_order = data.get("order", [])

    semesters = load_data()
    # Keep only semesters that still exist
    filtered = [s for s in new_order if s in semesters]

    save_order(filtered)
    return jsonify({"success": True, "order": filtered})


# -----------------------------
# API: ADD COURSE
# -----------------------------
@app.post("/course")
def create_course():
    data = request.json
    semesters = load_data()
    add_course(
        semesters,
        data["semester"],
        data["name"],
        data["letter"],
        float(data["credits"])
    )
    save_data(semesters)
    return jsonify({"status": "ok"})


# -----------------------------
# API: EDIT COURSE
# -----------------------------
@app.put("/course")
def update_course():
    data = request.json
    semesters = load_data()
    success = edit_course(
        semesters,
        data["semester"],
        data["old_name"],
        data["new_name"],
        data["new_letter"],
        float(data["new_credits"])
    )
    save_data(semesters)
    return jsonify({"success": success})


# -----------------------------
# API: DELETE COURSE
# -----------------------------
@app.delete("/course")
def remove_course():
    data = request.json
    semesters = load_data()
    success = delete_course(semesters, data["semester"], data["name"])
    save_data(semesters)
    return jsonify({"success": success})


# -----------------------------
# API: GPA SUMMARY
# -----------------------------
@app.get("/gpa")
def get_gpa():
    semesters = load_data()
    semester_gpas = {
        sem: calculate_gpa(courses)
        for sem, courses in semesters.items()
    }
    cumulative = calculate_cumulative_gpa(semesters)
    return jsonify({"semester_gpas": semester_gpas, "cumulative": cumulative})


# -----------------------------
# API: EXPORT TRANSCRIPT
# -----------------------------
@app.get("/export")
def export():
    semesters = load_data()
    filename = export_transcript(semesters)
    return send_file(filename, as_attachment=True)


# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
