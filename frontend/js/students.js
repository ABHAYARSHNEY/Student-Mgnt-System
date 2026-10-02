document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("studentForm");
  const table = document.getElementById("studentTable");

  function loadStudents() {
    const data = getStudents();
    table.innerHTML = data.length ? data.map(s => `
      <tr>
        <td>${escapeHtml(s.student_id)}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td>${escapeHtml(s.phone)}</td>
        <td>${escapeHtml(s.department)}</td>
        <td>
          <button type="button" data-edit="${s.student_id}">Edit</button>
          <button type="button" class="danger" data-delete="${s.student_id}">Delete</button>
        </td>
      </tr>`).join("") : `<tr><td colspan="6">No students found.</td></tr>`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const students = getStudents();
    const editingId = form.dataset.editingId;
    const student = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      department: document.getElementById("department").value.trim()
    };

    if (!student.name || !student.email || !student.phone || !student.department) {
      alert("Please fill all fields.");
      return;
    }

    if (editingId) {
      const index = students.findIndex(s => String(s.student_id) === String(editingId));
      if (index !== -1) {
        students[index] = { ...students[index], ...student };
      }
      delete form.dataset.editingId;
      form.querySelector("button[type=submit]").textContent = "Add Student";
    } else {
      students.push({
        student_id: nextId(students, "student_id"),
        ...student
      });
    }

    saveStudents(students);
    form.reset();
    loadStudents();
  });

  table.addEventListener("click", e => {
    const editButton = e.target.closest("[data-edit]");
    const deleteButton = e.target.closest("[data-delete]");

    if (editButton) {
      const student = getStudents().find(s => String(s.student_id) === String(editButton.dataset.edit));
      if (!student) return;

      document.getElementById("name").value = student.name;
      document.getElementById("email").value = student.email;
      document.getElementById("phone").value = student.phone;
      document.getElementById("department").value = student.department;
      form.dataset.editingId = student.student_id;
      form.querySelector("button[type=submit]").textContent = "Update Student";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (deleteButton) {
      if (!confirm("Delete this student?")) return;

      const id = Number(deleteButton.dataset.delete);
      saveStudents(getStudents().filter(s => s.student_id !== id));

      // Remove dependent local records too.
      saveEnrollments(getEnrollments().filter(e => e.student_id !== id));
      saveAttendance(getAttendance().filter(a => a.student_id !== id));
      loadStudents();
    }
  });

  loadStudents();
});
