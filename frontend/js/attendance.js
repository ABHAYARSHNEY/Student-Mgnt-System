document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("attendanceForm");
  const table = document.getElementById("attendanceTable");
  const dateInput = document.getElementById("date");

  dateInput.value = new Date().toISOString().split("T")[0];

  function loadAttendance() {
    const students = getStudents();
    const courses = getCourses();
    const data = getAttendance();

    table.innerHTML = data.length ? data.map(a => {
      const student = students.find(s => s.student_id === a.student_id);
      const course = courses.find(c => c.course_id === a.course_id);
      return `<tr>
        <td>${escapeHtml(a.attendance_id)}</td>
        <td>${escapeHtml(student?.name || "Unknown")} (ID: ${escapeHtml(a.student_id)})</td>
        <td>${escapeHtml(course?.course_name || "Unknown")} (ID: ${escapeHtml(a.course_id)})</td>
        <td>${escapeHtml(a.date)}</td>
        <td>${escapeHtml(a.status)}</td>
      </tr>`;
    }).join("") : `<tr><td colspan="5">No attendance records found.</td></tr>`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const studentId = Number(document.getElementById("student_id").value);
    const courseId = Number(document.getElementById("course_id").value);
    const date = dateInput.value;
    const status = document.getElementById("status").value;

    const students = getStudents();
    const courses = getCourses();
    const attendance = getAttendance();

    if (!students.some(s => s.student_id === studentId)) {
      alert("Student ID does not exist.");
      return;
    }
    if (!courses.some(c => c.course_id === courseId)) {
      alert("Course ID does not exist.");
      return;
    }
    if (!date) {
      alert("Please select a date.");
      return;
    }
    if (attendance.some(a => a.student_id === studentId && a.course_id === courseId && a.date === date)) {
      alert("Attendance is already marked for this student, course and date.");
      return;
    }

    attendance.push({
      attendance_id: nextId(attendance, "attendance_id"),
      student_id: studentId,
      course_id: courseId,
      date,
      status
    });

    saveAttendance(attendance);
    form.reset();
    dateInput.value = new Date().toISOString().split("T")[0];
    loadAttendance();
  });

  loadAttendance();
});
