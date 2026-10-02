const STORAGE_KEYS = {
  students: "sms_students",
  courses: "sms_courses",
  enrollments: "sms_enrollments",
  attendance: "sms_attendance"
};

function readData(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error("Could not read localStorage:", error);
    return [];
  }
}

function writeData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId(items, field) {
  return items.length ? Math.max(...items.map(x => Number(x[field]) || 0)) + 1 : 1;
}

function getStudents() {
  return readData(STORAGE_KEYS.students);
}
function saveStudents(data) {
  writeData(STORAGE_KEYS.students, data);
}

function getCourses() {
  return readData(STORAGE_KEYS.courses);
}
function saveCourses(data) {
  writeData(STORAGE_KEYS.courses, data);
}

function getEnrollments() {
  return readData(STORAGE_KEYS.enrollments);
}
function saveEnrollments(data) {
  writeData(STORAGE_KEYS.enrollments, data);
}

function getAttendance() {
  return readData(STORAGE_KEYS.attendance);
}
function saveAttendance(data) {
  writeData(STORAGE_KEYS.attendance, data);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
