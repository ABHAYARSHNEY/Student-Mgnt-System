document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("studentForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const students = getStudents();
    students.push({
      student_id: nextId(students, "student_id"),
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      department: document.getElementById("department").value.trim()
    });

    saveStudents(students);
    alert("Student added successfully.");
    form.reset();
  });
});
