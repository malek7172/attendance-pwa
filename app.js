const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwdtJE_kAcyXEK8bacFvB7TXtFCMLbtLuK8xDU0fEpnQc9qfUU5J1_2X-Jgf98yyC9c/exec";

let students = [];
let teacher = "";
let teacherRole = "";
let assignedClass = "";
let pending = JSON.parse(localStorage.getItem("attendance") || "[]");
let submittedClasses = [];

const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");
const classSelect = document.getElementById("classSelect");
const attendanceForm = document.getElementById("attendanceForm");
const studentTable = document.getElementById("studentTable");
const msg = document.getElementById("msg");

// Load students
fetch(WEB_APP_URL + "?action=students")
  .then(r => r.json())
  .then(d => {
    students = d.slice(1);
  });

// Login
function login() {
  fetch(WEB_APP_URL + "?action=teachers")
    .then(r => r.json())
    .then(d => {
      const pinInput = document.getElementById("pin").value.trim();
      const found = d.slice(1).find(t => String(t[1]).trim() === pinInput);
      if (!found) { alert("ভুল পিন"); return; }

      teacher = found[0];
      teacherRole = found[2].toLowerCase();
      assignedClass = found[3];

      loginDiv.style.display = "none";
      appDiv.style.display = "block";

      loadClassOptions();
    });
}

// Load classes for dropdown
function loadClassOptions() {
  let classes = [];
  if (teacherRole === "admin") {
    classes = [...new Set(students.map(s => s[2]))];
  } else {
    classes = [assignedClass];
  }

  classSelect.innerHTML = "<option value=''>ক্লাস নির্বাচন</option>" +
    classes.map(c => `<option value="${c}">${c}</option>`).join("");
}

// Load students for selected class
function loadClass() {
  const cls = classSelect.value;
  if (!cls) return;

  // Check if attendance already submitted today
  checkSubmitted(cls).then(alreadySubmitted => {
    if (alreadySubmitted && teacherRole !== "admin") {
      msg.innerText = "আজকের জন্য এই ক্লাসের হাজিরা ইতিমধ্যেই নেওয়া হয়েছে।";
      studentTable.innerHTML = "";
      return;
    }

    studentTable.innerHTML = `
      <tr>
        <th>রোল</th><th>নাম</th><th>Present</th><th>Late</th>
      </tr>
    `;
    students.filter(s => s[2] === cls).forEach(s => {
      studentTable.innerHTML += `
        <tr>
          <td>${s[3]}</td>
          <td>${s[1]}</td>
          <td><input type="checkbox" name="p_${s[0]}" onchange="exclusiveCheck(this,'l_${s[0]}')"></td>
          <td><input type="checkbox" name="l_${s[0]}" onchange="exclusiveCheck(this,'p_${s[0]}')"></td>
        </tr>
      `;
    });
  });
}

// Prevent Present + Late both checked
function exclusiveCheck(chk, otherName) {
  if (chk.checked) attendanceForm[otherName].checked = false;
}

// Submit attendance
attendanceForm.addEventListener("submit", e => {
  e.preventDefault();
  const cls = classSelect.value;
  if (!cls) return;

  const today = new Date().toDateString();

  students.filter(s => s[2] === cls).forEach(s => {
    let status = "Absent";
    if (attendanceForm[`p_${s[0]}`]?.checked) status = "Present";
    if (attendanceForm[`l_${s[0]}`]?.checked) status = "Late";

    pending.push({
      studentId: s[0],
      name: s[1],
      class: s[2],
      roll: s[3],
      status,
      teacher
    });
  });

  localStorage.setItem("attendance", JSON.stringify(pending));
  msg.innerText = "✅ হাজিরা সংরক্ষিত (অফলাইন)";

  sync().then(() => {
    studentTable.innerHTML = ""; // Clear table after submit
    msg.innerText = "☁️ শিটে পাঠানো হয়েছে। ক্লাস লক করা হয়েছে।";
  });
});

// Sync offline data to Google Sheet
async function sync() {
  if (!navigator.onLine || pending.length === 0) return;
  await fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify(pending) });
  pending = [];
  localStorage.removeItem("attendance");
}

// Check if class already submitted today
async function checkSubmitted(cls) {
  if (teacherRole === "admin") return false;

  const res = await fetch(WEB_APP_URL + "?action=attendance"); // Need to add this in GS for admin check
  const allData = await res.json(); // returns all rows
  const today = new Date().toDateString();

  const exists = allData.some(row => {
    if (!row[0]) return false;
    const rowDate = new Date(row[0]).toDateString();
    return rowDate === today && row[3] === cls; // row[3]=class
  });

  return exists;
}
