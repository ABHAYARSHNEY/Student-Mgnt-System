# EduTrack — Student Management System

A professional, fully front-end student management app. Data is stored in your browser's **localStorage** — no server, database or `npm install` needed.

## Run
Open `frontend/index.html` (or the root `index.html`) in a browser.
Click **Load sample data** on the dashboard to explore with demo records.

## Features (full CRUD on every page)
| Page | Create | Read | Update | Delete |
|---|---|---|---|---|
| Students | modal form | search, sort, filter, paginate | edit | delete (cascades to enrollments & attendance) |
| Courses | modal form | search, sort, filter, paginate | edit | delete (cascades) |
| Enrollments | pick student + course from dropdowns | search, sort, filter | edit status/date/course | delete |
| Attendance | single record **or** whole-class roll call | search, sort, filter by course/status/date | edit | delete |

Also: validation (unique email/course code, duplicate & capacity checks, enrolled-only attendance), toast notifications, confirm dialogs, CSV export per page, JSON backup/restore, dark mode, keyboard-accessible modals, responsive layout.

## Storage keys
`sms_students`, `sms_courses`, `sms_enrollments`, `sms_attendance` (+ `sms_theme`).

localStorage is browser/device-specific; clearing site data removes records. Use **Backup (JSON)** on the dashboard to keep a copy.
