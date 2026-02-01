const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwdtJE_kAcyXEK8bacFvB7TXtFCMLbtLuK8xDU0fEpnQc9qfUU5J1_2X-Jgf98yyC9c/exec";

let students = [];
let teacher = "";
let pending = JSON.parse(localStorage.getItem('attendance') || '[]');


fetch(WEB_APP_URL + '?action=students')
.then(r => r.json())
.then(d => {
students = d.slice(1);
student.innerHTML = students.map(s =>
`<option value='${s[0]}'>${s[3]} - ${s[1]} (Class ${s[2]})</option>`
).join('');
});


function login() {
fetch(WEB_APP_URL + '?action=teachers')
.then(r => r.json())
.then(d => {
const found = d.slice(1).find(t => t[1] === pin.value);
if (found) {
teacher = found[0];
loginDiv.style.display = 'none';
app.style.display = 'block';
} else alert('ভুল পিন');
});
}


function save() {
const s = students[student.selectedIndex];
pending.push({
studentId: s[0], name: s[1], class: s[2], roll: s[3],
status: status.value, teacher
});
localStorage.setItem('attendance', JSON.stringify(pending));
msg.innerText = '✅ অফলাইনে সংরক্ষিত';
sync();
}


function sync() {
if (!navigator.onLine || pending.length === 0) return;
fetch(WEB_APP_URL, { method:'POST', body: JSON.stringify(pending) })
.then(() => {
pending = [];
localStorage.removeItem('attendance');
msg.innerText = '☁️ শিটে পাঠানো হয়েছে';
});
}


window.addEventListener('online', sync);
