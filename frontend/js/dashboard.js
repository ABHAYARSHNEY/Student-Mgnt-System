document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("studentCount").textContent = getStudents().length;
  document.getElementById("courseCount").textContent = getCourses().length;

  const enrollmentCount = document.getElementById("enrollmentCount");
  const attendanceCount = document.getElementById("attendanceCount");
  if (enrollmentCount) enrollmentCount.textContent = getEnrollments().length;
  if (attendanceCount) attendanceCount.textContent = getAttendance().length;
});
