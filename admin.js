// ================= ADMIN LOGIN =================
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123"
};

const loginModal = document.getElementById("loginModal");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
        loginModal.classList.remove("active");
        adminDashboard.style.display = "block";
        loadDashboard();
    } else {
        alert("❌ Invalid login");
    }
});

logoutBtn.addEventListener("click", function () {
    adminDashboard.style.display = "none";
    loginModal.classList.add("active");
    loginForm.reset();
});

// ================= NAVIGATION =================
const sidebarLinks = document.querySelectorAll(".admin-sidebar a");
const sections = document.querySelectorAll(".admin-section");

sidebarLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();

        sidebarLinks.forEach(l => l.classList.remove("active"));
        this.classList.add("active");

        const id = this.getAttribute("href").substring(1);

        sections.forEach(sec => sec.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    });
});

// ================= API CALL =================
async function getAllLeads() {
    try {
        const res = await fetch("https://yume-vixr.onrender.com/api/leads");
        return await res.json();
    } catch (err) {
        console.error("Error fetching leads:", err);
        return [];
    }
}

// ================= DASHBOARD =================
async function loadDashboard() {
    const leads = await getAllLeads();

    document.getElementById("totalLeads").textContent = leads.length;

    const today = new Date().toDateString();
    const todayLeads = leads.filter(l => new Date(l.timestamp).toDateString() === today);
    document.getElementById("todayLeads").textContent = todayLeads.length;

    const newLeads = leads.filter(l => !l.status || l.status === "new");
    document.getElementById("priorityLeads").textContent = newLeads.length;

    loadLeadsTable(leads);
}

// ================= TABLE =================
async function loadLeadsTable(leads = null) {
    const tableBody = document.getElementById("leadsTableBody");
    const allLeads = leads || await getAllLeads();

    if (allLeads.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">No Leads Found</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = allLeads.map(lead => `
        <tr>
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td>${lead.company || "-"}</td>
            <td>${getServiceName(lead.service)}</td>
            <td>${formatDate(lead.timestamp)}</td>
            <td><span class="status new">NEW</span></td>
            <td>-</td>
        </tr>
    `).join("");
}

// ================= SEARCH =================
document.getElementById("searchLeads").addEventListener("input", filterLeads);
document.getElementById("filterService").addEventListener("change", filterLeads);

async function filterLeads() {
    const search = document.getElementById("searchLeads").value.toLowerCase();
    const service = document.getElementById("filterService").value;

    const leads = await getAllLeads();

    const filtered = leads.filter(l => {
        return (
            l.name.toLowerCase().includes(search) ||
            l.email.toLowerCase().includes(search)
        ) && (!service || l.service === service);
    });

    loadLeadsTable(filtered);
}

// ================= UTIL =================
function formatDate(date) {
    return new Date(date).toLocaleString();
}

function getServiceName(service) {
    const map = {
        ai: "AI & ML",
        mobile: "Mobile",
        cloud: "Cloud",
        cyber: "Cybersecurity",
        data: "Big Data",
        rpa: "RPA"
    };
    return map[service] || service;
}

// ================= EXPORT =================
document.getElementById("exportJSON").addEventListener("click", async () => {
    const leads = await getAllLeads();
    downloadFile(JSON.stringify(leads, null, 2), "leads.json");
});

document.getElementById("exportCSV").addEventListener("click", async () => {
    const leads = await getAllLeads();

    const csv = [
        ["Name", "Email", "Phone", "Company", "Service", "Date"],
        ...leads.map(l => [
            l.name,
            l.email,
            l.phone,
            l.company,
            l.service,
            formatDate(l.timestamp)
        ])
    ].map(r => r.join(",")).join("\n");

    downloadFile(csv, "leads.csv");
});

function downloadFile(data, fileName) {
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
    console.log("Admin Panel Ready");
});