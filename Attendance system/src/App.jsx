import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [role, setRole] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [page, setPage] = useState("Dashboard");

  const [students, setStudents] = useState(() =>
    JSON.parse(localStorage.getItem("attendance_students") || "[]"),
  );

  const [attendance, setAttendance] = useState(() =>
    JSON.parse(localStorage.getItem("attendance_records") || "[]"),
  );

  const [assignments, setAssignments] = useState(() =>
    JSON.parse(localStorage.getItem("attendance_assignments") || "[]"),
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    className: "",
    section: "",
    rollNo: "",
    phone: "",
    password: "",
  });

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [subject, setSubject] = useState("DBMS");

  useEffect(() => {
    localStorage.setItem("attendance_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("attendance_records", JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem("attendance_assignments", JSON.stringify(assignments));
  }, [assignments]);

  function login(e) {
    e.preventDefault();

    if (role === "admin") {
      if (email === "admin@college.com" && password === "admin123") {
        setLoggedIn(true);
        setPage("Dashboard");
      } else {
        alert("Admin login ke liye admin@college.com / admin123 use karo.");
      }
      return;
    }

    const student = students.find(
      (s) =>
        s.email.toLowerCase() === email.trim().toLowerCase() &&
        s.password === password,
    );

    if (student) {
      setLoggedIn(true);
      setPage("Dashboard");
    } else {
      alert(
        "Student record nahi mila ya password galat hai. Admin se student account banwao.",
      );
    }
  }

  const currentStudent = students.find(
    (s) => s.email.toLowerCase() === email.trim().toLowerCase(),
  );

  function logout() {
    setLoggedIn(false);
    setRole("");
    setEmail("");
    setPassword("");
    setPage("Dashboard");
  }

  function addStudent(e) {
    e.preventDefault();

    const duplicate = students.some(
      (s) =>
        s.rollNo.trim().toLowerCase() === form.rollNo.trim().toLowerCase() &&
        s.className.trim().toLowerCase() ===
          form.className.trim().toLowerCase() &&
        s.section.trim().toLowerCase() === form.section.trim().toLowerCase(),
    );

    if (duplicate) {
      alert("Is class aur section mein ye roll number pehle se hai.");
      return;
    }

    if (
      students.some(
        (s) => s.email.toLowerCase() === form.email.trim().toLowerCase(),
      )
    ) {
      alert("Ye email pehle se registered hai.");
      return;
    }

    setStudents((old) => [
      ...old,
      {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        id: Date.now(),
      },
    ]);

    setForm({
      name: "",
      email: "",
      className: "",
      section: "",
      rollNo: "",
      phone: "",
      password: "",
    });

    alert("Student successfully add ho gaya!");
    setPage("Students");
  }

  function deleteStudent(id) {
    if (!window.confirm("Kya tum is student ko delete karna chahte ho?")) {
      return;
    }

    setStudents((old) => old.filter((s) => s.id !== id));
    setAttendance((old) => old.filter((a) => a.studentId !== id));
    alert("Student aur uske attendance records delete ho gaye.");
  }

  function markAttendance(studentId, status) {
    setAttendance((old) => {
      const exists = old.some(
        (a) =>
          a.studentId === studentId &&
          a.date === selectedDate &&
          a.subject === subject,
      );

      if (exists) {
        return old.map((a) =>
          a.studentId === studentId &&
          a.date === selectedDate &&
          a.subject === subject
            ? { ...a, status }
            : a,
        );
      }

      return [
        ...old,
        {
          id: Date.now() + studentId,
          studentId,
          date: selectedDate,
          subject,
          status,
        },
      ];
    });
  }

  function uploadAssignment(e) {
    e.preventDefault();

    const input = e.currentTarget.elements.namedItem("assignmentFile");
    const file = input?.files?.[0];

    if (!file) {
      alert("Pehle PDF ya image select karo.");
      return;
    }

    const allowed =
      file.type === "application/pdf" || file.type.startsWith("image/");

    if (!allowed) {
      alert("Sirf PDF aur image files upload karo.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Demo version mein 2 MB se chhoti file select karo.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAssignments((old) => [
        ...old,
        {
          id: Date.now(),
          name: file.name,
          type: file.type,
          data: reader.result,
        },
      ]);

      alert("Assignment upload ho gaya!");
      e.currentTarget.reset();
    };

    reader.readAsDataURL(file);
  }

  const visibleStudents =
    role === "admin"
      ? students.filter(
          (s) =>
            (!selectedClass || s.className === selectedClass) &&
            (!selectedSection || s.section === selectedSection),
        )
      : currentStudent
        ? [currentStudent]
        : [];

  const visibleAttendance =
    role === "student" && currentStudent
      ? attendance.filter((a) => a.studentId === currentStudent.id)
      : attendance;

  const today = new Date().toLocaleDateString("en-CA");

  if (!loggedIn) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={login}>
          <h1>Attendance System</h1>
          <p>Login to your portal</p>

          <label>Select Portal</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Choose portal</option>
            <option value="admin">Admin Portal</option>
            <option value="student">Student Portal</option>
          </select>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />

          <button type="submit">Login</button>
          <p className="hint">Demo admin: admin@college.com / admin123</p>
        </form>
      </div>
    );
  }

  const adminPages = [
    "Dashboard",
    "Add Student",
    "Students",
    "Attendance",
    "Assignments",
    "Delete Student Record",
  ];

  const studentPages = [
    "Dashboard",
    "Show My Attendance",
    "Today's Attendance",
    "All Attendance",
    "Show My Assignment",
  ];

  return (
    <div className="dashboard">
      <header>
        <div>
          <h2>Attendance System</h2>
          <span>{role === "admin" ? "Admin Portal" : "Student Portal"}</span>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <nav className="dashboard-grid">
        {(role === "admin" ? adminPages : studentPages).map((item) => (
          <button
            className={`dashboard-button ${page === item ? "active" : ""}`}
            key={item}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <main className="content">
        {page === "Dashboard" && (
          <>
            <h1>
              Welcome{" "}
              {role === "admin" ? "Admin" : currentStudent?.name || "Student"}!
            </h1>
            {role === "admin" ? (
              <>
                <p>Manage students, attendance and assignments here.</p>
                <h3>Total Students: {students.length}</h3>
                <h3>Total Attendance Entries: {attendance.length}</h3>
                <h3>Total Assignments: {assignments.length}</h3>
              </>
            ) : (
              <p>View your attendance and assignments from the menu above.</p>
            )}
          </>
        )}

        {page === "Add Student" && role === "admin" && (
          <>
            <h2>Add New Student</h2>
            <form className="student-form" onSubmit={addStudent}>
              {[
                ["name", "Full Name", "text"],
                ["email", "Email", "email"],
                ["className", "Class", "text"],
                ["section", "Section", "text"],
                ["rollNo", "Roll Number", "text"],
                ["phone", "Phone Number", "tel"],
                ["password", "Student Login Password", "password"],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    type={type}
                    value={form[key]}
                    required
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </label>
              ))}
              <button type="submit">Save Student</button>
            </form>
          </>
        )}

        {(page === "Students" || page === "Delete Student Record") &&
          role === "admin" && (
            <>
              <h2>{page}</h2>
              {students.length === 0 ? (
                <p>No students added yet. Use Add Student first.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll No.</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.rollNo}</td>
                        <td>{s.className}</td>
                        <td>{s.section}</td>
                        <td>{s.email}</td>
                        <td>{s.phone}</td>
                        <td>
                          <button onClick={() => deleteStudent(s.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

        {page === "Attendance" && role === "admin" && (
          <>
            <h2>Take Attendance</h2>

            <div className="filters">
              <label>
                Select Class
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {[...new Set(students.map((s) => s.className))].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label>
                Select Section
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="">All Sections</option>
                  {[...new Set(students.map((s) => s.section))].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label>
                Select Date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </label>

              <label>
                Select Subject
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {[
                    "DBMS",
                    "DSA",
                    "Operating Systems",
                    "Java",
                    "Mathematics",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>

            <h3>Student Records</h3>
            {visibleStudents.length === 0 ? (
              <p>No students found for this class/section.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Name</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((s) => {
                    const record = attendance.find(
                      (a) =>
                        a.studentId === s.id &&
                        a.date === selectedDate &&
                        a.subject === subject,
                    );

                    return (
                      <tr key={s.id}>
                        <td>{s.rollNo}</td>
                        <td>{s.name}</td>
                        <td>
                          <select
                            value={record?.status || ""}
                            onChange={(e) =>
                              e.target.value &&
                              markAttendance(s.id, e.target.value)
                            }
                          >
                            <option value="">Select Status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <p>Attendance is saved automatically in this browser.</p>
          </>
        )}

        {page === "Assignments" && role === "admin" && (
          <>
            <h2>Upload Assignment</h2>
            <p>Select a PDF or image file (maximum 2 MB in this demo).</p>
            <form onSubmit={uploadAssignment}>
              <input
                type="file"
                name="assignmentFile"
                accept=".pdf,image/*"
                required
              />
              <button type="submit">Upload Assignment</button>
            </form>

            <h3>Uploaded Assignments</h3>
            {assignments.length === 0 && <p>No assignments uploaded yet.</p>}
            {assignments.map((a) => (
              <p key={a.id}>
                <a
                  href={a.data}
                  target="_blank"
                  rel="noreferrer"
                  download={a.name}
                >
                  {a.name}
                </a>
              </p>
            ))}
          </>
        )}

        {[
          "Show My Attendance",
          "Today's Attendance",
          "All Attendance",
        ].includes(page) &&
          role === "student" && (
            <>
              <h2>{page}</h2>
              {!currentStudent ? (
                <p>Student record nahi mila. Admin se contact karo.</p>
              ) : (
                <>
                  <h3>
                    {currentStudent.name} — Roll No. {currentStudent.rollNo}
                  </h3>
                  <p>
                    Present:{" "}
                    {
                      visibleAttendance.filter((a) => a.status === "Present")
                        .length
                    }
                    {" | "}Absent:{" "}
                    {
                      visibleAttendance.filter((a) => a.status === "Absent")
                        .length
                    }
                    {" | "}Total records: {visibleAttendance.length}
                  </p>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAttendance
                        .filter(
                          (a) =>
                            page !== "Today's Attendance" || a.date === today,
                        )
                        .map((a) => (
                          <tr key={a.id}>
                            <td>{a.date}</td>
                            <td>{a.subject}</td>
                            <td>{a.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}

        {page === "Show My Assignment" && role === "student" && (
          <>
            <h2>My Assignments</h2>
            {assignments.length === 0 && <p>No assignments uploaded yet.</p>}
            {assignments.map((a) => (
              <p key={a.id}>
                <a
                  href={a.data}
                  target="_blank"
                  rel="noreferrer"
                  download={a.name}
                >
                  {a.name}
                </a>
              </p>
            ))}
          </>
        )}
      </main>
    </div>
  );
}