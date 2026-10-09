document.addEventListener("DOMContentLoaded", () => {
  UI.mountShell("dashboard", "Dashboard", "Overview of your institution at a glance");
  const root = document.getElementById("dash");
  const sName = id => (findStudent(id) || {}).name || "Unknown";
  const cName = id => (findCourse(id) || {}).course_name || "Unknown";

  function draw() {
    const students = getStudents(), courses = getCourses(), enrollments = getEnrollments(), attendance = getAttendance();
    const present = attendance.filter(a => a.status === "Present").length;
    const late = attendance.filter(a => a.status === "Late").length;
    const absent = attendance.filter(a => a.status === "Absent").length;
    const total = attendance.length;
    const rate = total ? Math.round(((present + late) / total) * 100) : 0;
    const pct = n => (total ? (n / total) * 100 : 0);

    const byCourse = courses.map(c => ({ label: c.course_name, n: enrollments.filter(e => e.course_id === c.course_id).length })).sort((a, b) => b.n - a.n).slice(0, 6);
    const depts = {};
    students.forEach(s => { depts[s.department] = (depts[s.department] || 0) + 1; });
    const byDept = Object.entries(depts).map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, 6);
    const bars = rows => rows.length ? `<div class="bars">${rows.map(r => `<div class="bar-row"><div class="bar-top"><span>${UI.esc(r.label)}</span><span>${r.n}</span></div><div class="bar"><i data-w="${(r.n / Math.max(...rows.map(x => x.n), 1)) * 100}"></i></div></div>`).join("")}</div>` : `<p class="muted">No data yet.</p>`;

    const recentStudents = students.slice().sort((a, b) => b.student_id - a.student_id).slice(0, 5);
    const recentAtt = attendance.slice().sort((a, b) => (b.date + String(b.attendance_id).padStart(8, "0")).localeCompare(a.date + String(a.attendance_id).padStart(8, "0"))).slice(0, 5);
    const TONE = { Present: "success", Late: "warning", Absent: "danger" };

    root.innerHTML = `
      ${!hasAnyData() ? `<div class="banner"><div><h3>Welcome to EduTrack 👋</h3><p>Your workspace is empty. Load sample data to explore, or start by adding students and courses.</p></div><button type="button" class="btn" id="seedBtn">Load sample data</button></div>` : ""}
      <div class="stat-grid">
        <a class="stat" href="students.html"><span class="stat-ico c1">${UI.icon("students", 24)}</span><div><p>Total Students</p><strong>${students.length}</strong></div></a>
        <a class="stat" href="courses.html"><span class="stat-ico c2">${UI.icon("courses", 24)}</span><div><p>Total Courses</p><strong>${courses.length}</strong></div></a>
        <a class="stat" href="enrollments.html"><span class="stat-ico c3">${UI.icon("enrollments", 24)}</span><div><p>Enrollments</p><strong>${enrollments.length}</strong></div></a>
        <a class="stat" href="attendance.html"><span class="stat-ico c4">${UI.icon("attendance", 24)}</span><div><p>Attendance Rate</p><strong>${total ? rate + "%" : "—"}</strong></div></a>
      </div>
      <div class="dash-grid">
        <section class="panel span-7"><div class="panel-head"><div><h3>Enrollments by course</h3><p>Top courses by number of students</p></div></div><div class="panel-body">${bars(byCourse)}</div></section>
        <section class="panel span-5"><div class="panel-head"><div><h3>Attendance overview</h3><p>${total} records</p></div></div><div class="panel-body">
          ${total ? `<div class="donut-wrap"><div class="donut" style="background:conic-gradient(var(--success) 0 ${pct(present)}%, #d97706 ${pct(present)}% ${pct(present) + pct(late)}%, var(--danger) ${pct(present) + pct(late)}% 100%)"><div class="donut-in"><div><strong>${rate}%</strong><span>attended</span></div></div></div>
          <div class="legend"><div><i style="background:var(--success)"></i>Present<b>${present}</b></div><div><i style="background:#d97706"></i>Late<b>${late}</b></div><div><i style="background:var(--danger)"></i>Absent<b>${absent}</b></div></div></div>` : `<p class="muted">No attendance recorded yet.</p>`}
        </div></section>
      </div>
      <div class="dash-grid">
        <section class="panel span-4"><div class="panel-head"><div><h3>Students by department</h3></div></div><div class="panel-body">${bars(byDept)}</div></section>
        <section class="panel span-4"><div class="panel-head"><h3>Recent students</h3><a href="students.html" class="btn btn-sm btn-ghost">View all</a></div><div class="panel-body">
          ${recentStudents.length ? `<ul class="list">${recentStudents.map(s => `<li>${UI.avatar(s.name, s.student_id)}<div class="grow"><b>${UI.esc(s.name)}</b><small>${UI.esc(s.department)}</small></div></li>`).join("")}</ul>` : `<p class="muted">No students yet.</p>`}</div></section>
        <section class="panel span-4"><div class="panel-head"><h3>Recent attendance</h3><a href="attendance.html" class="btn btn-sm btn-ghost">View all</a></div><div class="panel-body">
          ${recentAtt.length ? `<ul class="list">${recentAtt.map(a => `<li>${UI.avatar(sName(a.student_id), a.student_id)}<div class="grow"><b>${UI.esc(sName(a.student_id))}</b><small>${UI.esc(cName(a.course_id))} · ${UI.esc(formatDate(a.date))}</small></div>${UI.badge(a.status, TONE[a.status] || "neutral")}</li>`).join("")}</ul>` : `<p class="muted">No attendance yet.</p>`}</div></section>
      </div>
      <div class="dash-grid">
        <section class="panel span-6"><div class="panel-head"><h3>Quick actions</h3></div><div class="panel-body"><div class="quick">
          <a class="btn" href="students.html?new=1">${UI.icon("plus", 16)} Add student</a>
          <a class="btn" href="courses.html?new=1">${UI.icon("plus", 16)} Add course</a>
          <a class="btn" href="enrollments.html?new=1">${UI.icon("plus", 16)} New enrollment</a>
          <a class="btn" href="attendance.html">${UI.icon("attendance", 16)} Take attendance</a></div></div></section>
        <section class="panel span-6"><div class="panel-head"><div><h3>Data management</h3><p>Everything is saved in this browser. Back it up regularly.</p></div></div><div class="panel-body">
          <div class="data-actions">
            <button type="button" class="btn" id="expBtn">${UI.icon("download", 16)} Backup (JSON)</button>
            <button type="button" class="btn" id="impBtn">${UI.icon("upload", 16)} Restore backup</button>
            <button type="button" class="btn" id="seedBtn2">${UI.icon("refresh", 16)} Load sample data</button>
            <button type="button" class="btn btn-danger" id="resetBtn">${UI.icon("trash", 16)} Reset all data</button>
            <input type="file" id="impFile" accept="application/json,.json" hidden></div></div></section>
      </div>`;
    requestAnimationFrame(() => root.querySelectorAll("[data-w]").forEach(el => { el.style.width = el.dataset.w + "%"; }));
    UI.refreshCounts();

    const seed = async () => {
      if (hasAnyData() && !(await UI.confirmDialog({ title: "Replace existing data?", message: "Loading sample data will <b>replace</b> all current records.", confirmText: "Replace", danger: true }))) return;
      seedSampleData(); UI.toast("Sample data loaded."); draw();
    };
    ["seedBtn", "seedBtn2"].forEach(id => { const b = document.getElementById(id); if (b) b.addEventListener("click", seed); });
    document.getElementById("expBtn").addEventListener("click", () => { UI.downloadFile(`edutrack-backup-${today()}.json`, exportAll(), "application/json"); UI.toast("Backup downloaded."); });
    const file = document.getElementById("impFile");
    document.getElementById("impBtn").addEventListener("click", () => file.click());
    file.addEventListener("change", () => {
      const f = file.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          JSON.parse(reader.result);
          if (!(await UI.confirmDialog({ title: "Restore backup?", message: "This will <b>replace</b> all current records with the backup.", confirmText: "Restore" }))) return;
          importAll(reader.result); UI.toast("Backup restored."); draw();
        } catch (err) { UI.toast("That file is not a valid backup.", "error"); }
      };
      reader.readAsText(f); file.value = "";
    });
    document.getElementById("resetBtn").addEventListener("click", async () => {
      if (!(await UI.confirmDialog({ title: "Reset all data?", message: "This permanently deletes <b>all</b> students, courses, enrollments and attendance." , confirmText: "Delete everything" }))) return;
      resetAll(); UI.toast("All data cleared.", "info"); draw();
    });
  }
  draw();
});
