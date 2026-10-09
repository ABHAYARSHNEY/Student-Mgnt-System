document.addEventListener("DOMContentLoaded", () => {
  UI.mountShell("attendance", "Attendance", "Record, review and correct daily attendance");

  const sName = id => (findStudent(id) || {}).name || "Unknown student";
  const cName = id => (findCourse(id) || {}).course_name || "Unknown course";
  const TONE = { Present: "success", Late: "warning", Absent: "danger" };
  const STATUSES = ["Present", "Late", "Absent"];
  const enrolledCourseIds = sid => new Set(getEnrollments().filter(e => e.student_id === sid && (e.status || "Active") !== "Dropped").map(e => e.course_id));
  const isEnrolled = (sid, cid) => enrolledCourseIds(sid).has(cid);
  const courseOptions = ids => getCourses().filter(c => !ids || ids.has(c.course_id)).sort((a, b) => a.course_name.localeCompare(b.course_name)).map(c => ({ value: c.course_id, label: `${c.course_name}${c.code ? " · " + c.code : ""}` }));

  /* ---- Class roll-call: mark a whole course for one date ---- */
  function openRollCall(refresh) {
    const courses = getCourses();
    if (!courses.length) { UI.toast("Add a course first.", "info"); return; }
    const m = UI.openModal({
      title: "Take class attendance", size: "lg",
      body: `<div class="form-grid">
          <div class="field"><label for="rc_course">Course</label><select id="rc_course">${courseOptions().map(o => `<option value="${o.value}">${UI.esc(o.label)}</option>`).join("")}</select></div>
          <div class="field"><label for="rc_date">Date</label><input type="date" id="rc_date" value="${today()}" max="${today()}"></div>
        </div>
        <div id="rc_list"></div>`,
      footer: `<button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn btn-primary" id="rc_save">Save attendance</button>`
    });
    const $ = s => m.el.querySelector(s);
    const draw = () => {
      const cid = Number($("#rc_course").value), date = $("#rc_date").value;
      const students = getEnrollments().filter(e => e.course_id === cid && (e.status || "Active") !== "Dropped")
        .map(e => findStudent(e.student_id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
      const existing = getAttendance().filter(a => a.course_id === cid && a.date === date);
      if (!students.length) { $("#rc_list").innerHTML = `<div class="empty">${UI.icon("inbox", 32)}<h4>No students enrolled</h4><p>Enroll students in this course first.</p></div>`; $("#rc_save").disabled = true; return; }
      $("#rc_save").disabled = false;
      $("#rc_list").innerHTML = `
        <div class="roll-tools"><span>${students.length} students${existing.length ? ` · <b>${existing.length}</b> already recorded for this date (will be updated)` : ""}</span>
          <span><button type="button" class="btn btn-sm" data-all="Present">All present</button> <button type="button" class="btn btn-sm" data-all="Absent">All absent</button></span></div>
        <div class="roll">${students.map(s => {
          const cur = (existing.find(a => a.student_id === s.student_id) || {}).status || "Present";
          return `<div class="roll-row"><div class="who cell-person">${UI.avatar(s.name, s.student_id)}<div><b>${UI.esc(s.name)}</b><small>#${s.student_id}</small></div></div>
            <div class="seg" data-sid="${s.student_id}">${STATUSES.map(st => `<label><input type="radio" name="st_${s.student_id}" value="${st}" ${cur === st ? "checked" : ""}><span class="${st[0].toLowerCase()}">${st}</span></label>`).join("")}</div></div>`;
        }).join("")}</div>`;
    };
    draw();
    $("#rc_course").addEventListener("change", draw);
    $("#rc_date").addEventListener("change", draw);
    m.el.addEventListener("click", e => {
      const b = e.target.closest("[data-all]");
      if (b) m.el.querySelectorAll(`input[value="${b.dataset.all}"]`).forEach(r => { r.checked = true; });
    });
    $("#rc_save").addEventListener("click", () => {
      const cid = Number($("#rc_course").value), date = $("#rc_date").value;
      if (!date) { UI.toast("Please choose a date.", "error"); return; }
      const all = getAttendance();
      let created = 0, updated = 0;
      m.el.querySelectorAll(".seg").forEach(seg => {
        const sid = Number(seg.dataset.sid);
        const status = seg.querySelector("input:checked").value;
        const rec = all.find(a => a.student_id === sid && a.course_id === cid && a.date === date);
        if (rec) { rec.status = status; updated++; }
        else { all.push({ attendance_id: nextId(all, "attendance_id"), student_id: sid, course_id: cid, date, status, note: "" }); created++; }
      });
      if (saveAttendance(all) === false) return;
      m.close();
      UI.toast(`Attendance saved: ${created} new, ${updated} updated.`);
      refresh();
    });
  }

  UI.createCrud({
    mount: "crud", noun: "Attendance record", idField: "attendance_id",
    getAll: getAttendance, saveAll: saveAttendance,
    addLabel: "Add Record", addTitle: "Add attendance record", editTitle: "Edit attendance record",
    toolbarButtons: [{ label: "Take class attendance", icon: "attendance", onClick: openRollCall }],
    searchPlaceholder: "Search student or course…",
    defaultSort: { key: "date", dir: "desc" },
    emptyTitle: "No attendance recorded", emptyText: "Use “Take class attendance” to mark a whole class at once.",
    csvName: "attendance",
    csv: [
      { label: "ID", value: r => r.attendance_id }, { label: "Date", value: r => r.date }, { label: "Student ID", value: r => r.student_id },
      { label: "Student", value: r => sName(r.student_id) }, { label: "Course", value: r => cName(r.course_id) },
      { label: "Status", value: r => r.status }, { label: "Note", value: r => r.note || "" }
    ],
    searchText: r => `${sName(r.student_id)} ${cName(r.course_id)} ${r.date} ${r.status} ${r.note || ""}`,
    filters: [
      { id: "course", label: "Course", options: () => getCourses().map(c => ({ value: c.course_id, label: c.course_name })), match: (r, v) => String(r.course_id) === String(v) },
      { id: "status", label: "Status", options: STATUSES.map(s => ({ value: s, label: s })), match: (r, v) => r.status === v },
      { id: "date", label: "Date", type: "date", match: (r, v) => r.date === v }
    ],
    columns: [
      { key: "attendance_id", label: "ID", width: "70px", render: r => `<span class="mono">#${r.attendance_id}</span>` },
      { key: "date", label: "Date", render: r => formatDate(r.date) },
      { key: "student", label: "Student", sortValue: r => sName(r.student_id), render: r => `<div class="cell-person">${UI.avatar(sName(r.student_id), r.student_id)}<div><b>${UI.esc(sName(r.student_id))}</b><small>ID #${r.student_id}</small></div></div>` },
      { key: "course", label: "Course", sortValue: r => cName(r.course_id), render: r => UI.esc(cName(r.course_id)) },
      { key: "status", label: "Status", render: r => UI.badge(r.status, TONE[r.status] || "neutral") },
      { key: "note", label: "Note", sortable: false, render: r => r.note ? UI.esc(r.note) : '<span class="muted">—</span>' }
    ],
    fields: () => [
      { name: "student_id", label: "Student", type: "select", required: true, placeholder: "Select a student", full: true,
        options: () => getStudents().sort((a, b) => a.name.localeCompare(b.name)).map(s => ({ value: s.student_id, label: `${s.name} (#${s.student_id})` })) },
      { name: "course_id", label: "Course", type: "select", required: true, placeholder: "Select a course", full: true, options: () => courseOptions() },
      { name: "date", label: "Date", type: "date", required: true, default: today, max: today() },
      { name: "status", label: "Status", type: "select", options: STATUSES.map(s => ({ value: s, label: s })), default: "Present" },
      { name: "note", label: "Note", type: "textarea", full: true, placeholder: "Optional (e.g. medical leave)", maxlength: 200 }
    ],
    /* when a student is chosen, only offer the courses they are enrolled in */
    onFormOpen(form, existing) {
      const sSel = form.elements.student_id, cSel = form.elements.course_id;
      const fill = () => {
        const sid = Number(sSel.value);
        const ids = sid ? enrolledCourseIds(sid) : null;
        const keep = cSel.value;
        const opts = courseOptions(ids && existing && existing.student_id === sid ? new Set([...ids, existing.course_id]) : ids);
        cSel.innerHTML = `<option value="">${sid && !opts.length ? "No enrolled courses" : "Select a course"}</option>` + opts.map(o => `<option value="${o.value}" ${String(o.value) === keep ? "selected" : ""}>${UI.esc(o.label)}</option>`).join("");
      };
      sSel.addEventListener("change", fill);
      if (existing) fill();
    },
    validate(v, existing) {
      const e = {};
      v.student_id = Number(v.student_id); v.course_id = Number(v.course_id);
      if (!findStudent(v.student_id)) e.student_id = "Please select a valid student.";
      if (!findCourse(v.course_id)) e.course_id = "Please select a valid course.";
      if (e.student_id || e.course_id) return e;
      const unchanged = existing && existing.student_id === v.student_id && existing.course_id === v.course_id;
      if (!unchanged && !isEnrolled(v.student_id, v.course_id)) e.course_id = "This student is not enrolled in the course.";
      if (v.date > today()) e.date = "Date cannot be in the future.";
      if (getAttendance().some(a => a.student_id === v.student_id && a.course_id === v.course_id && a.date === v.date && (!existing || a.attendance_id !== existing.attendance_id)))
        e.date = "Attendance already recorded for this student, course and date.";
      return e;
    },
    deleteMessage: r => `Delete the record for <b>${UI.esc(sName(r.student_id))}</b> in <b>${UI.esc(cName(r.course_id))}</b> on ${UI.esc(formatDate(r.date))}?`
  });
});
