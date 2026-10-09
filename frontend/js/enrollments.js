document.addEventListener("DOMContentLoaded", () => {
  UI.mountShell("enrollments", "Enrollments", "Connect students to the courses they take");

  const sName = id => (findStudent(id) || {}).name || "Unknown student";
  const cName = id => (findCourse(id) || {}).course_name || "Unknown course";
  const STATUS_TONE = { Active: "success", Completed: "info", Dropped: "danger" };

  UI.createCrud({
    mount: "crud", noun: "Enrollment", idField: "enrollment_id",
    getAll: getEnrollments, saveAll: saveEnrollments,
    addLabel: "New Enrollment", addTitle: "Enroll a student", editTitle: "Edit enrollment",
    searchPlaceholder: "Search student or course…",
    defaultSort: { key: "enrollment_id", dir: "desc" },
    emptyTitle: "No enrollments yet", emptyText: "Enroll a student in a course to get started.",
    csvName: "enrollments",
    csv: [
      { label: "ID", value: r => r.enrollment_id }, { label: "Student ID", value: r => r.student_id }, { label: "Student", value: r => sName(r.student_id) },
      { label: "Course ID", value: r => r.course_id }, { label: "Course", value: r => cName(r.course_id) },
      { label: "Enrolled on", value: r => r.enrolled_on || "" }, { label: "Status", value: r => r.status || "Active" }
    ],
    searchText: r => `${sName(r.student_id)} ${cName(r.course_id)} ${r.status || "Active"}`,
    filters: [
      { id: "course", label: "Course", options: () => getCourses().map(c => ({ value: c.course_id, label: c.course_name })), match: (r, v) => String(r.course_id) === String(v) },
      { id: "status", label: "Status", options: ["Active", "Completed", "Dropped"].map(s => ({ value: s, label: s })), match: (r, v) => (r.status || "Active") === v }
    ],
    columns: [
      { key: "enrollment_id", label: "ID", width: "70px", render: r => `<span class="mono">#${r.enrollment_id}</span>` },
      { key: "student", label: "Student", sortValue: r => sName(r.student_id), render: r => `<div class="cell-person">${UI.avatar(sName(r.student_id), r.student_id)}<div><b>${UI.esc(sName(r.student_id))}</b><small>ID #${r.student_id}</small></div></div>` },
      { key: "course", label: "Course", sortValue: r => cName(r.course_id), render: r => `<b>${UI.esc(cName(r.course_id))}</b><br><small class="muted">${UI.esc((findCourse(r.course_id) || {}).instructor || "")}</small>` },
      { key: "enrolled_on", label: "Enrolled on", render: r => formatDate(r.enrolled_on) },
      { key: "status", label: "Status", sortValue: r => r.status || "Active", render: r => UI.badge(r.status || "Active", STATUS_TONE[r.status || "Active"]) }
    ],
    fields: () => [
      { name: "student_id", label: "Student", type: "select", required: true, placeholder: "Select a student", full: true,
        options: () => getStudents().sort((a, b) => a.name.localeCompare(b.name)).map(s => ({ value: s.student_id, label: `${s.name} (#${s.student_id})` })) },
      { name: "course_id", label: "Course", type: "select", required: true, placeholder: "Select a course", full: true,
        options: () => getCourses().sort((a, b) => a.course_name.localeCompare(b.course_name)).map(c => ({ value: c.course_id, label: `${c.course_name}${c.code ? " · " + c.code : ""}` })) },
      { name: "enrolled_on", label: "Enrollment date", type: "date", required: true, default: today },
      { name: "status", label: "Status", type: "select", options: ["Active", "Completed", "Dropped"].map(s => ({ value: s, label: s })), default: "Active" }
    ],
    validate(v, existing) {
      const e = {};
      v.student_id = Number(v.student_id); v.course_id = Number(v.course_id);
      if (!findStudent(v.student_id)) e.student_id = "Please select a valid student.";
      if (!findCourse(v.course_id)) e.course_id = "Please select a valid course.";
      if (e.student_id || e.course_id) return e;
      if (getEnrollments().some(x => x.student_id === v.student_id && x.course_id === v.course_id && (!existing || x.enrollment_id !== existing.enrollment_id)))
        e.course_id = "This student is already enrolled in this course.";
      const cap = (findCourse(v.course_id) || {}).capacity;
      if (cap && v.status !== "Dropped") {
        const used = getEnrollments().filter(x => x.course_id === v.course_id && (x.status || "Active") !== "Dropped" && (!existing || x.enrollment_id !== existing.enrollment_id)).length;
        if (used >= cap) e.course_id = `This course is full (${cap} seats).`;
      }
      return e;
    },
    deleteMessage: r => `Remove <b>${UI.esc(sName(r.student_id))}</b> from <b>${UI.esc(cName(r.course_id))}</b>? Their attendance records for this course are kept.`
  });
});
