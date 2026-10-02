# Student Management System — LocalStorage Version

This version uses **browser localStorage only**. It does NOT use MySQL, SQL, Express, a database, or a login backend.

## How to use

1. Extract the ZIP.
2. Open the `frontend` folder.
3. Double-click `index.html`.
4. Use Students, Courses, Enrollments and Attendance.
5. Data is saved in your browser's localStorage and remains after refreshing the page.

You do not need `npm install` or `npm start` for this version.

## Storage

The browser stores:
- `sms_students`
- `sms_courses`
- `sms_enrollments`
- `sms_attendance`

## Important

localStorage is browser/device-specific. Clearing browser site data will remove the saved records. It is suitable for a front-end college project/demo, but it is not a replacement for a shared production database.
