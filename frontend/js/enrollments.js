document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("enrollForm");
  const table = document.getElementById("enrollTable");

  function loadEnrollments() {
    const students = getStudents();
    const courses = getCourses();
    const data = getEnrollments();

    table.innerHTML = data.length ? data.map(e => {
      const student = students.find(s => s.student_id === e.student_id);
      const course = courses.find(c => c.course_id === e.course_id);
      return `<tr>
        <td>${escapeHtml(e.enrollment_id)}</td>
        <td>${escapeHtml(student?.name || "Unknown")} (ID: ${escapeHtml(e.student_id)})</td>
        <td>${escapeHtml(course?.course_name || "Unknown")} (ID: ${escapeHtml(e.course_id)})</td>
      </tr>`;
    }).join("") : `<tr><td colspan="3">No enrollments found.</td></tr>`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const studentId = Number(document.getElementById("student_id").value);
    const courseId = Number(document.getElementById("course_id").value);
    const students = getStudents();
    const courses = getCourses();
    const enrollments = getEnrollments();

    if (!students.some(s => s.student_id === studentId)) {
      alert("Student ID does not exist.");
      return;
    }
    if (!courses.some(c => c.course_id === courseId)) {
      alert("Course ID does not exist.");
      return;
    }
    if (enrollments.some(e => e.student_id === studentId && e.course_id === courseId)) {
      alert("Student is already enrolled in this course.");
      return;
    }

    enrollments.push({
      enrollment_id: nextId(enrollments, "enrollment_id"),
      student_id: studentId,
      course_id: courseId
    });

    saveEnrollments(enrollments);
    form.reset();
    loadEnrollments();
  });

  loadEnrollments();
});
