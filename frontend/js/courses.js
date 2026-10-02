document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("courseForm");
  const table = document.getElementById("courseTable");

  function loadCourses() {
    const data = getCourses();
    table.innerHTML = data.length ? data.map(c => `
      <tr>
        <td>${escapeHtml(c.course_id)}</td>
        <td>${escapeHtml(c.course_name)}</td>
        <td>${escapeHtml(c.instructor)}</td>
        <td><button type="button" class="danger" data-delete="${c.course_id}">Delete</button></td>
      </tr>`).join("") : `<tr><td colspan="4">No courses found.</td></tr>`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const courses = getCourses();
    const course = {
      course_id: nextId(courses, "course_id"),
      course_name: document.getElementById("course_name").value.trim(),
      instructor: document.getElementById("instructor").value.trim()
    };

    if (!course.course_name || !course.instructor) {
      alert("Please fill all fields.");
      return;
    }

    courses.push(course);
    saveCourses(courses);
    form.reset();
    loadCourses();
  });

  table.addEventListener("click", e => {
    const button = e.target.closest("[data-delete]");
    if (!button || !confirm("Delete this course?")) return;

    const id = Number(button.dataset.delete);
    saveCourses(getCourses().filter(c => c.course_id !== id));
    saveEnrollments(getEnrollments().filter(en => en.course_id !== id));
    saveAttendance(getAttendance().filter(a => a.course_id !== id));
    loadCourses();
  });

  loadCourses();
});
