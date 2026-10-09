/* ==========================================================================
   Data layer — browser localStorage only (no backend required)
   ========================================================================== */
const STORAGE_KEYS = {
  students: "sms_students",
  courses: "sms_courses",
  enrollments: "sms_enrollments",
  attendance: "sms_attendance"
};

function readData(key) {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read localStorage:", error);
    return [];
  }
}

function writeData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Could not write localStorage:", error);
    if (window.UI) UI.toast("Could not save — browser storage is full or blocked.", "error");
    return false;
  }
}

function nextId(items, field) {
  return items.length ? Math.max(...items.map(x => Number(x[field]) || 0)) + 1 : 1;
}

const getStudents = () => readData(STORAGE_KEYS.students);
const saveStudents = d => writeData(STORAGE_KEYS.students, d);
const getCourses = () => readData(STORAGE_KEYS.courses);
const saveCourses = d => writeData(STORAGE_KEYS.courses, d);
const getEnrollments = () => readData(STORAGE_KEYS.enrollments);
const saveEnrollments = d => writeData(STORAGE_KEYS.enrollments, d);
const getAttendance = () => readData(STORAGE_KEYS.attendance);
const saveAttendance = d => writeData(STORAGE_KEYS.attendance, d);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

/* Local-date helpers (toISOString() would shift the day for non-UTC timezones) */
function dateToISO(d) {
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const today = () => dateToISO(new Date());

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

/* Lookups */
const findStudent = id => getStudents().find(s => s.student_id === Number(id));
const findCourse = id => getCourses().find(c => c.course_id === Number(id));

/* Cascading deletes keep the data consistent */
function deleteStudentCascade(id) {
  saveStudents(getStudents().filter(s => s.student_id !== id));
  saveEnrollments(getEnrollments().filter(e => e.student_id !== id));
  saveAttendance(getAttendance().filter(a => a.student_id !== id));
}
function deleteCourseCascade(id) {
  saveCourses(getCourses().filter(c => c.course_id !== id));
  saveEnrollments(getEnrollments().filter(e => e.course_id !== id));
  saveAttendance(getAttendance().filter(a => a.course_id !== id));
}

/* Backup / restore / reset / sample data */
function exportAll() {
  return JSON.stringify({
    app: "student-management-system", version: 2, exported_at: new Date().toISOString(),
    students: getStudents(), courses: getCourses(),
    enrollments: getEnrollments(), attendance: getAttendance()
  }, null, 2);
}

function importAll(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== "object") throw new Error("Invalid backup file.");
  const arr = k => (Array.isArray(data[k]) ? data[k] : []);
  saveStudents(arr("students"));
  saveCourses(arr("courses"));
  saveEnrollments(arr("enrollments"));
  saveAttendance(arr("attendance"));
}

function resetAll() {
  Object.values(STORAGE_KEYS).forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
}

function hasAnyData() {
  return getStudents().length + getCourses().length + getEnrollments().length + getAttendance().length > 0;
}

function seedSampleData() {
  const names = [
    ["Aarav Sharma", "Computer Science"], ["Diya Patel", "Computer Science"], ["Rohan Mehta", "Electronics"],
    ["Ananya Iyer", "Business"], ["Kabir Singh", "Mechanical"], ["Isha Verma", "Business"],
    ["Vihaan Gupta", "Electronics"], ["Meera Nair", "Computer Science"], ["Arjun Reddy", "Mechanical"],
    ["Saanvi Joshi", "Design"], ["Dev Malhotra", "Design"], ["Tara Kapoor", "Business"]
  ];
  const students = names.map(([name, department], i) => ({
    student_id: i + 1, name,
    email: name.toLowerCase().replace(/ /g, ".") + "@campus.edu",
    phone: "98" + String(10000000 + i * 7919341).slice(0, 8),
    department, status: i === 10 ? "Inactive" : "Active",
    created_at: dateToISO(new Date(Date.now() - (30 - i) * 864e5))
  }));
  const courses = [
    ["Data Structures", "CS201", "Dr. Rao", 4, "Computer Science"],
    ["Database Systems", "CS305", "Prof. Menon", 3, "Computer Science"],
    ["Digital Circuits", "EC110", "Dr. Bose", 3, "Electronics"],
    ["Marketing Principles", "BU101", "Prof. Fernandes", 3, "Business"],
    ["Thermodynamics", "ME210", "Dr. Kulkarni", 4, "Mechanical"],
    ["Visual Design", "DS120", "Ms. Banerjee", 2, "Design"]
  ].map(([course_name, code, instructor, credits, department], i) => ({
    course_id: i + 1, course_name, code, instructor, credits, department
  }));
  const plan = { 1: [1, 2, 8, 3], 2: [1, 2, 8], 3: [3, 7], 4: [4, 6, 12], 5: [5, 9], 6: [10, 11, 4] };
  const enrollments = [];
  Object.entries(plan).forEach(([cid, sids]) => sids.forEach(sid => enrollments.push({
    enrollment_id: enrollments.length + 1, student_id: sid, course_id: Number(cid),
    enrolled_on: today(), status: sid === 3 && cid === "1" ? "Completed" : "Active"
  })));
  const attendance = [];
  let seed = 7;
  const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let back = 1; back <= 6; back++) {
    const d = new Date(); d.setDate(d.getDate() - back);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    enrollments.forEach(en => {
      const r = rand();
      attendance.push({
        attendance_id: attendance.length + 1, student_id: en.student_id, course_id: en.course_id,
        date: dateToISO(d), status: r < 0.76 ? "Present" : r < 0.88 ? "Late" : "Absent", note: ""
      });
    });
  }
  saveStudents(students); saveCourses(courses); saveEnrollments(enrollments); saveAttendance(attendance);
}
