document.addEventListener("DOMContentLoaded", () => {
  UI.mountShell("students", "Students", "Add, update and manage student records");

  const DEFAULT_DEPTS = ["Computer Science", "Electronics", "Mechanical", "Business", "Design"];
  const departments = () => [...new Set([...DEFAULT_DEPTS, ...getStudents().map(s => s.department)])].filter(Boolean).sort();
  const courseCount = id => getEnrollments().filter(e => e.student_id === id).length;

  UI.createCrud({
    mount: "crud", noun: "Student", idField: "student_id",
    getAll: getStudents, saveAll: saveStudents,
    addLabel: "Add Student", addTitle: "Add new student", editTitle: "Edit student",
    searchPlaceholder: "Search name, email, phone…",
    defaultSort: { key: "student_id", dir: "desc" },
    emptyTitle: "No students yet", emptyText: "Add your first student to start building the roster.",
    csvName: "students",
    csv: [
      { label: "ID", value: r => r.student_id }, { label: "Name", value: r => r.name }, { label: "Email", value: r => r.email },
      { label: "Phone", value: r => r.phone }, { label: "Department", value: r => r.department },
      { label: "Status", value: r => r.status || "Active" }, { label: "Courses", value: r => courseCount(r.student_id) }
    ],
    searchText: r => `${r.name} ${r.email} ${r.phone} ${r.department} ${r.student_id}`,
    filters: [
      { id: "dept", label: "Department", options: () => departments().map(d => ({ value: d, label: d })), match: (r, v) => r.department === v },
      { id: "status", label: "Status", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }], match: (r, v) => (r.status || "Active") === v }
    ],
    columns: [
      { key: "student_id", label: "ID", width: "70px", render: r => `<span class="mono">#${r.student_id}</span>` },
      { key: "name", label: "Student", render: r => `<div class="cell-person">${UI.avatar(r.name, r.student_id)}<div><b>${UI.esc(r.name)}</b><small>${UI.esc(r.email)}</small></div></div>` },
      { key: "phone", label: "Phone" },
      { key: "department", label: "Department", render: r => `<span class="tag">${UI.esc(r.department)}</span>` },
      { key: "courses", label: "Courses", sortValue: r => courseCount(r.student_id), render: r => courseCount(r.student_id) },
      { key: "status", label: "Status", sortValue: r => r.status || "Active", render: r => UI.badge(r.status || "Active", (r.status || "Active") === "Active" ? "success" : "neutral") }
    ],
    fields: [
      { name: "name", label: "Full name", required: true, placeholder: "e.g. Aarav Sharma", maxlength: 80, full: true },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "name@college.edu" },
      { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "10-digit number" },
      { name: "department", label: "Department", required: true, list: departments, placeholder: "Choose or type" },
      { name: "status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }], default: "Active" }
    ],
    validate(v, existing) {
      const e = {};
      if (v.name.length < 2) e.name = "Name must be at least 2 characters.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = "Enter a valid email address.";
      else if (getStudents().some(s => s.email.toLowerCase() === v.email.toLowerCase() && (!existing || s.student_id !== existing.student_id))) e.email = "This email is already registered.";
      const digits = v.phone.replace(/\D/g, "");
      if (!/^[+\d\s\-()]+$/.test(v.phone) || digits.length < 7 || digits.length > 15) e.phone = "Enter a valid phone number (7–15 digits).";
      return e;
    },
    deleteRow: r => deleteStudentCascade(r.student_id),
    deleteMessage: r => `<b>${UI.esc(r.name)}</b> will be removed along with ${courseCount(r.student_id)} enrollment(s) and all attendance records. This cannot be undone.`
  });
});
