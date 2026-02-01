const WEB_APP_URL = "PASTE_WEB_APP_URL_HERE";


let attendance = JSON.parse(localStorage.getItem("attendance") || "[]");


const form = document.getElementById("attendanceForm");
const msg = document.getElementById("msg");


form.addEventListener("submit", e => {
e.preventDefault();


const record = {
studentId: id.value,
name: name.value,
status: status.value
};


attendance.push(record);
localStorage.setItem("attendance", JSON.stringify(attendance));
msg.innerText = "✅ Saved offline";
form.reset();


sync();
});


function sync() {
if (!navigator.onLine || attendance.length === 0) return;


fetch(WEB_APP_URL, {
method: "POST",
body: JSON.stringify(attendance)
})
.then(r => r.json())
.then(() => {
localStorage.removeItem("attendance");
attendance = [];
msg.innerText = "☁️ Synced to Google Sheet";
});
}


window.addEventListener("online", sync);
