const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwdtJE_kAcyXEK8bacFvB7TXtFCMLbtLuK8xDU0fEpnQc9qfUU5J1_2X-Jgf98yyC9c/exec";
let students = [];
let teacher = "";
let pending = JSON.parse(localStorage.getItem('attendance') || '[]');


// Load students
fetch(WEB_APP_URL + '?action=students')
.then(r => r.json())
.then(d => {
students = d.slice(1);
const classes = [...new Set(students.map(s => s[2]))];
classSelect.innerHTML = '<option value="">ক্লাস নির্বাচন</option>' +
classes.map(c => `<option>${c}</option>`).join('');
});


function login() {
fetch(WEB_APP_URL + '?action=teachers')
.then(r => r.json())
.then(d => {
const found = d.slice(1).find(t => String(t[1]).trim() === pin.value.trim());
if (found) {
teacher = found[0];
login.style.display = 'none';
app.style.display = 'block';
} else alert('ভুল পিন');
});
}


function loadClass() {
const cls = classSelect.value;
const table = document.getElementById('studentTable');
table.innerHTML = `<tr><th>রোল</th><th>নাম</th><th>Present</th><th>Late</th></tr>`;


students.filter(s => s[2] === cls).forEach(s => {
table.innerHTML += `
<tr>
<td>${s[3]}</td>
<td>${s[1]}</td>
<td><input type="checkbox" name="p_${s[0]}"></td>
<td><input type="checkbox" name="l_${s[0]}"></td>
</tr>`;
});
}


attendanceForm.addEventListener('submit', e => {
e.preventDefault();
const cls = classSelect.value;


students.filter(s => s[2] === cls).forEach(s => {
let status = 'Absent';
if (attendanceForm[`p_${s[0]}`]?.checked) status = 'Present';
if (attendanceForm[`l_${s[0]}`]?.checked) status = 'Late';


pending.push({
studentId: s[0],
name: s[1],
class: s[2],
roll: s[3],
status,
teacher
});
});


localStorage.setItem('attendance', JSON.stringify(pending));
msg.innerText = '✅ হাজিরা সংরক্ষিত (অফলাইন)';
sync();
});


function sync() {
if (!navigator.onLine || pending.length === 0) return;
fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify(pending) })
.then(() => {
pending = [];
localStorage.removeItem('attendance');
msg.innerText = '☁️ শিটে পাঠানো হয়েছে';
});
}


window.addEventListener('online', sync);
