document.addEventListener("DOMContentLoaded", () => {
  UI.mountShell("courses", "Courses", "Maintain the course catalogue and instructors");

  const DEFAULT_DEPTS = ["Computer Science", "Electronics", "Mechanical", "Business", "Design"];
  const departments = () => [...new Set([...DEFAULT_DEPTS, ...getCourses().map(c => c.department)])].filter(Boolean).sort();
  const enrolled = id => getEnrollments().filter(e => e.course_id === id).length;

  UI.createCrud({
    mount: "crud", noun: "Course", idField: "course_id",
    getAll: getCourses, saveAll: saveCourses,
    addLabel: "Add Course", addTitle: "Add new course", editTitle: "Edit course",
    searchPlaceholder: "Search course, code, instructor…",
    defaultSort: { key: "course_id", dir: "desc" },
    emptyTitle: "No courses yet", emptyText: "Create a course so students can be enrolled in it.",
    csvName: "courses",
    csv: [
      { label: "ID", value: r => r.course_id }, { label: "Code", value: r => r.code || "" }, { label: "Course", value: r => r.course_name },
      { label: "Instructor", value: r => r.instructor }, { label: "Department", value: r => r.department || "" },
      { label: "Credits", value: r => r.credits ?? "" }, { label: "Enrolled", value: r => enrolled(r.course_id) }
    ],
    searchText: r => `${r.course_name} ${r.code || ""} ${r.instructor} ${r.department || ""} ${r.course_id}`,
    filters: [{ id: "dept", label: "Department", options: () => departments().map(d => ({ value: d, label: d })), match: (r, v) => r.department === v }],
    columns: [
      { key: "course_id", label: "ID", width: "70px", render: r => `<span class="mono">#${r.course_id}</span>` },
      { key: "course_name", label: "Course", render: r => `<b>${UI.esc(r.course_name)}</b>${r.code ? `<br><small class="muted">${UI.esc(r.code)}</small>` : ""}` },
      { key: "instructor", label: "Instructor" },
      { key: "department", label: "Department", render: r => r.department ? `<span class="tag">${UI.esc(r.department)}</span>` : '<span class="muted">—</span>' },
      { key: "credits", label: "Credits", render: r => r.credits ?? "—" },
      { key: "enrolled", label: "Enrolled", sortValue: r => enrolled(r.course_id), render: r => `${enrolled(r.course_id)}${r.capacity ? ` <span class="muted">/ ${r.capacity}</span>` : ""}` }
    ],
    fields: [
      { name: "course_name", label: "Course name", required: true, placeholder: "e.g. Data Structures", maxlength: 80, full: true },
      { name: "code", label: "Course code", placeholder: "e.g. CS201", maxlength: 12 },
      { name: "instructor", label: "Instructor", required: true, placeholder: "e.g. Dr. Rao" },
      { name: "department", label: "Department", list: departments, placeholder: "Choose or type" },
      { name: "credits", label: "Credits", type: "number", min: 1, max: 10, placeholder: "1–10" },
      { name: "capacity", label: "Seat capacity", type: "number", min: 1, max: 1000, placeholder: "Optional", hint: "Leave empty for unlimited seats." }
    ],
    validate(v, existing) {
      const e = {};
      if (v.course_name.length < 2) e.course_name = "Course name must be at least 2 characters.";
      if (v.code && getCourses().some(c => (c.code || "").toLowerCase() === v.code.toLowerCase() && (!existing || c.course_id !== existing.course_id))) e.code = "This course code is already used.";
      if (existing && v.capacity !== "" && v.capacity < enrolled(existing.course_id)) e.capacity = `Already ${enrolled(existing.course_id)} students enrolled.`;
      return e;
    },
    deleteRow: r => deleteCourseCascade(r.course_id),
    deleteMessage: r => `<b>${UI.esc(r.course_name)}</b> will be removed along with ${enrolled(r.course_id)} enrollment(s) and its attendance records. This cannot be undone.`
  });
});
