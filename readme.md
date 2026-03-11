# GPA Tracker (Flask + Tailwind + Chart.js)

A simple, clean GPA tracking web app built with Flask.  
Supports:

- Add/Edit/Delete semesters
- Add/Edit/Delete courses
- Manual semester reordering (Move Up / Move Down)
- Smart semester sorting (Fall 22 → Fall 2022)
- GPA chart with:
  - Semester GPA line
  - Cumulative GPA trendline
  - 3.00 target line
- Transcript export
- JSON persistence

---

## 🚀 Deploy on Render (Free)

1. Push this repo to GitHub  
2. Go to https://render.com  
3. Click **New → Web Service**  
4. Connect your GitHub repo  
5. Use these settings:

- **Environment:** Python  
- **Build Command:** `pip install -r requirements.txt`  
- **Start Command:** `gunicorn app:app`  
- **Plan:** Free  

Render will give you a public URL like:

