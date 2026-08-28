/************************************************************
 PROJECT HANDLING PLATEFORM
 FRONTEND JAVASCRIPT
************************************************************/


/* ==========================================================
 GOOGLE APPS SCRIPT WEB APP URL
==========================================================

अपना Apps Script /exec URL यहाँ paste करें.

Example:

https://script.google.com/macros/s/XXXXXXXXXXXX/exec

========================================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbwMUMj5IYC-v2sMF19V6L-R3pFSQlGhwZNGNQgtAZFiVQjYeJ42FOn9WCAvsO6jeq2LKA/exec";



/* ==========================================================
 GLOBAL VARIABLES
========================================================== */

let loginType = "project";

let currentUser = null;

let projects = [];

let records = [];

let links = [];

let documents = [];



/* ==========================================================
 SELECT LOGIN
========================================================== */

function selectLogin(type, button) {

    loginType = type;

    document
    .querySelectorAll(".login-type")
    .forEach(function(btn) {

        btn.classList.remove("active");

    });


    button.classList.add("active");


    const names = {

        project: "Project Login",

        upp: "UPP Login",

        family: "Family Branch Login",

        important: "Important Link Login"

    };


    document.getElementById("username").placeholder =
        names[type] + " Username";

}


/* ==========================================================
 API REQUEST
========================================================== */

async function api(action, data = {}) {

    const payload = {

        action: action,

        ...data

    };


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type":
                "text/plain;charset=utf-8"

            },

            body: JSON.stringify(payload)

        });


        const result = await response.json();

        return result;

    } catch (error) {

        console.error(error);

        showToast(
            "Server connection error. API URL check करें."
        );

        return {

            success: false,

            message: error.toString()

        };

    }

}



/* ==========================================================
 LOGIN
========================================================== */

async function login(event) {

    event.preventDefault();


    const username =
        document.getElementById("username").value.trim();


    const password =
        document.getElementById("password").value;


    const message =
        document.getElementById("loginMessage");


    message.innerText =
        "⏳ Login हो रहा है...";


    const result = await api("login", {

        type: loginType,

        username: username,

        password: password

    });


    if (result.success) {

        currentUser = result;


        sessionStorage.setItem(
            "php_user",
            JSON.stringify(result)
        );


        document
        .getElementById("loginPage")
        .classList.add("hidden");


        document
        .getElementById("app")
        .classList.remove("hidden");


        document
        .getElementById("welcomeUser")
        .innerText =
            "👤 " + result.username;


        document
        .getElementById("userRole")
        .innerText =
            result.title;


        message.innerText = "";


        loadDashboard();

        loadProjects();

        loadRecords();

        loadLinks();

        loadDocuments();

        updateReport();

    } else {

        message.innerText =
            "❌ " + result.message;

    }

}



/* ==========================================================
 AUTO LOGIN CHECK
========================================================== */

window.addEventListener("load", function() {

    const saved =
        sessionStorage.getItem("php_user");


    if (saved) {

        try {

            currentUser =
                JSON.parse(saved);


            document
            .getElementById("loginPage")
            .classList.add("hidden");


            document
            .getElementById("app")
            .classList.remove("hidden");


            document
            .getElementById("welcomeUser")
            .innerText =
                "👤 " + currentUser.username;


            document
            .getElementById("userRole")
            .innerText =
                currentUser.title;


            loadDashboard();

            loadProjects();

            loadRecords();

            loadLinks();

            loadDocuments();

        } catch (e) {

            sessionStorage.removeItem("php_user");

        }

    }

});



/* ==========================================================
 LOGOUT
========================================================== */

function logout() {

    sessionStorage.removeItem("php_user");

    currentUser = null;

    document
    .getElementById("app")
    .classList.add("hidden");


    document
    .getElementById("loginPage")
    .classList.remove("hidden");


    document
    .getElementById("username")
    .value = "";


    document
    .getElementById("password")
    .value = "";


    showToast("Successfully logged out.");

}



/* ==========================================================
 PAGE NAVIGATION
========================================================== */

function showPage(pageId) {

    document
    .querySelectorAll(".page")
    .forEach(function(page) {

        page.classList.add("hidden");

    });


    document
    .getElementById(pageId)
    .classList.remove("hidden");


    document
    .querySelectorAll(".menu")
    .forEach(function(menu) {

        menu.classList.remove("active");

    });


    const active =
        document.querySelector(
            '.menu[data-page="' + pageId + '"]'
        );


    if (active) {

        active.classList.add("active");

    }


    if (pageId === "dashboard") {

        loadDashboard();

    }


    if (pageId === "projects") {

        loadProjects();

    }


    if (pageId === "records") {

        loadRecords();

    }


    if (pageId === "links") {

        loadLinks();

    }


    if (pageId === "documents") {

        loadDocuments();

    }


    if (pageId === "reports") {

        updateReport();

    }

}



/* ==========================================================
 DASHBOARD
========================================================== */

async function loadDashboard() {

    const result =
        await api("dashboard");


    if (!result.success) return;


    document.getElementById(
        "totalProjects"
    ).innerText =
        result.projects;


    document.getElementById(
        "totalRecords"
    ).innerText =
        result.records;


    document.getElementById(
        "totalLinks"
    ).innerText =
        result.links;


    document.getElementById(
        "totalDocuments"
    ).innerText =
        result.documents;

}



/* ==========================================================
 PROJECTS
========================================================== */

async function loadProjects() {

    const result =
        await api("projects");


    if (!result.success) return;


    projects = result.data || [];


    renderProjects();

    fillProjectSelect();

}



/* ==========================================================
 RENDER PROJECTS
========================================================== */

function renderProjects(list = projects) {

    const container =
        document.getElementById("projectList");


    if (!list.length) {

        container.innerHTML =

            `<div class="data-card">

                <h3>No Projects</h3>

                <p>
                अभी कोई project available नहीं है।
                </p>

            </div>`;

        return;

    }


    container.innerHTML =
        list.map(function(project) {

        return `

        <div class="data-card">

            <h3>
                📁 ${escapeHTML(project.name)}
            </h3>

            <span class="status">
                ${escapeHTML(project.status)}
            </span>

            <p>
                <b>ID:</b>
                ${escapeHTML(project.id)}
            </p>

            <p>
                <b>Department:</b>
                ${escapeHTML(project.department)}
            </p>

            <p>
                <b>Start:</b>
                ${escapeHTML(project.startDate)}
            </p>

            <p>
                <b>End:</b>
                ${escapeHTML(project.endDate)}
            </p>

            <p>
                ${escapeHTML(project.description)}
            </p>

            <div class="card-actions">

                <button
                class="open-btn"
                onclick="viewProjectRecords('${project.id}')">

                    📝 Records

                </button>

                <button
                class="delete-btn"
                onclick="deleteProject('${project.id}')">

                    🗑 Delete

                </button>

            </div>

        </div>

        `;

    }).join("");

}



/* ==========================================================
 PROJECT SEARCH
========================================================== */

function filterProjects() {

    const q =
        document
        .getElementById("projectSearch")
        .value
        .toLowerCase();


    const filtered =
        projects.filter(function(project) {

            return (

                String(project.name)
                .toLowerCase()
                .includes(q)

                ||

                String(project.department)
                .toLowerCase()
                .includes(q)

                ||

                String(project.status)
                .toLowerCase()
                .includes(q)

            );

        });


    renderProjects(filtered);

}



/* ==========================================================
 SAVE PROJECT
========================================================== */

async function saveProject(event) {

    event.preventDefault();


    const result =
        await api("addProject", {

            name:
                document
                .getElementById("projectName")
                .value,

            department:
                document
                .getElementById("department")
                .value,

            status:
                document
                .getElementById("projectStatus")
                .value,

            startDate:
                document
                .getElementById("startDate")
                .value,

            endDate:
                document
                .getElementById("endDate")
                .value,

            description:
                document
                .getElementById("projectDescription")
                .value,

            createdBy:
                currentUser.username

        });


    if (result.success) {

        closeModal("projectModal");

        document
        .querySelector("#projectModal form")
        .reset();


        showToast(
            "✅ Project saved successfully."
        );


        loadProjects();

        loadDashboard();

    } else {

        alert(result.message);

    }

}



/* ==========================================================
 DELETE PROJECT
========================================================== */

async function deleteProject(id) {

    if (!confirm(
        "क्या आप इस project को delete करना चाहते हैं?"
    )) return;


    const result =
        await api("deleteProject", {

            id: id

        });


    if (result.success) {

        showToast(
            "Project deleted."
        );

        loadProjects();

        loadDashboard();

    } else {

        alert(result.message);

    }

}



/* ==========================================================
 PROJECT SELECT
========================================================== */

function fillProjectSelect() {

    const select =
        document.getElementById(
            "recordProject"
        );


    select.innerHTML =
        `<option value="">
            Select Project
        </option>`;


    projects.forEach(function(project) {

        select.innerHTML +=

        `<option value="${project.id}">
            ${escapeHTML(project.name)}
        </option>`;

    });

}



/* ==========================================================
 RECORDS
========================================================== */

async function loadRecords() {

    const result =
        await api("records");


    if (!result.success) return;


    records = result.data || [];


    renderRecords();

}



/* ==========================================================
 RENDER RECORDS
========================================================== */

function renderRecords(list = records) {

    const container =
        document.getElementById(
            "recordList"
        );


    if (!list.length) {

        container.innerHTML =

        `<div class="data-card">

            <h3>No Records</h3>

            <p>
            अभी कोई record available नहीं है।
            </p>

        </div>`;

        return;

    }


    container.innerHTML =
        list.map(function(record) {

        const project =
            projects.find(
                p => p.id == record.projectId
            );


        return `

        <div class="data-card">

            <h3>
                📝 ${escapeHTML(record.title)}
            </h3>

            <span class="status">
                ${escapeHTML(record.status)}
            </span>

            <p>
                📁 ${
                    project
                    ? escapeHTML(project.name)
                    : escapeHTML(record.projectId)
                }
            </p>

            <p>
                📅 ${escapeHTML(record.date)}
            </p>

            <p>
                👤 ${escapeHTML(record.person)}
            </p>

            <p>
                ${escapeHTML(record.details)}
            </p>

            <div class="card-actions">

                <button
                class="delete-btn"
                onclick="deleteRecord('${record.id}')">

                    🗑 Delete

                </button>

            </div>

        </div>

        `;

    }).join("");

}



/* ==========================================================
 RECORD SEARCH
========================================================== */

function filterRecords() {

    const q =
        document
        .getElementById("recordSearch")
        .value
        .toLowerCase();


    const filtered =
        records.filter(function(record) {

            return (

                String(record.title)
                .toLowerCase()
                .includes(q)

                ||

                String(record.details)
                .toLowerCase()
                .includes(q)

                ||

                String(record.date)
                .toLowerCase()
                .includes(q)

                ||

                String(record.person)
                .toLowerCase()
                .includes(q)

            );

        });


    renderRecords(filtered);

}



/* ==========================================================
 OPEN RECORD MODAL
========================================================== */

function openRecordModal() {

    fillProjectSelect();

    document
    .getElementById("recordDate")
    .valueAsDate = new Date();


    openModal("recordModal");

}



/* ==========================================================
 SAVE RECORD
========================================================== */

async function saveRecord(event) {

    event.preventDefault();


    const result =
        await api("addRecord", {

            projectId:
                document
                .getElementById("recordProject")
                .value,

            date:
                document
                .getElementById("recordDate")
                .value,

            title:
                document
                .getElementById("recordTitle")
                .value,

            details:
                document
                .getElementById("recordDetails")
                .value,

            person:
                document
                .getElementById("recordPerson")
                .value,

            status:
                document
                .getElementById("recordStatus")
                .value,

            createdBy:
                currentUser.username

        });


    if (result.success) {

        closeModal("recordModal");

        document
        .querySelector("#recordModal form")
        .reset();


        showToast(
            "✅ Record saved."
        );


        loadRecords();

        loadDashboard();

    } else {

        alert(result.message);

    }

}



/* ==========================================================
 DELETE RECORD
========================================================== */

async function deleteRecord(id) {

    if (!confirm(
        "क्या आप इस record को delete करना चाहते हैं?"
    )) return;


    const result =
        await api("deleteRecord", {

            id: id

        });


    if (result.success) {

        showToast(
            "Record deleted."
        );

        loadRecords();

        loadDashboard();

    } else {

        alert(result.message);

    }

}



/* ==========================================================
 VIEW PROJECT RECORDS
========================================================== */

function viewProjectRecords(id) {

    showPage("records");


    const filtered =
        records.filter(function(record) {

            return String(record.projectId)
                === String(id);

        });


    renderRecords(filtered);

}



/* ==========================================================
 LINKS
========================================================== */

async function loadLinks() {

    const result =
        await api("links");


    if (!result.success) return;


    links = result.data || [];


    renderLinks();

}



/* ==========================================================
 RENDER LINKS
========================================================== */

function renderLinks(list = links) {

    const container =
        document.getElementById(
            "linkList"
        );


    if (!list.length) {

        container.innerHTML =

        `<div class="link-card">

            <h3>No Links</h3>

            <p>
            कोई important link नहीं है।
            </p>

        </div>`;

        return;

    }


    container.innerHTML =
        list.map(function(link) {

        return `

        <div class="link-card">

            <div class="icon">
                🔗
            </div>

            <h3>
                ${escapeHTML(link.title)}
            </h3>

            <p>
                ${escapeHTML(link.category)}
            </p>

            <p>
                ${escapeHTML(link.description)}
            </p>

            <div class="card-actions">

                <a
                href="${escapeAttribute(link.url)}"
                target="_blank"
                rel="noopener"
                class="open-btn">

                    🔗 Open

                </a>

                <button
                class="delete-btn"
                onclick="deleteLink('${link.id}')">

                    🗑

                </button>

            </div>

        </div>

        `;

    }).join("");

}



/* ==========================================================
 LINK SEARCH
========================================================== */

function filterLinks() {

    const q =
        document
        .getElementById("linkSearch")
        .value
        .toLowerCase();


    const filtered =
        links.filter(function(link) {

            return (

                String(link.title)
                .toLowerCase()
                .includes(q)

                ||

                String(link.category)
                .toLowerCase()
                .includes(q)

                ||

                String(link.description)
                .toLowerCase()
                .includes(q)

            );

        });


    renderLinks(filtered);

}



/* ==========================================================
 SAVE LINK
========================================================== */

async function saveLink(event) {

    event.preventDefault();


    const result =
        await api("addLink", {

            title:
                document
                .getElementById("linkTitle")
                .value,

            category:
                document
                .getElementById("linkCategory")
                .value,

            url:
                document
                .getElementById("linkUrl")
                .value,

            description:
                document
                .getElementById("linkDescription")
                .value,

            createdBy:
                currentUser.username

        });


    if (result.success) {

        closeModal("linkModal");

        document
        .querySelector("#linkModal form")
        .reset();


        showToast(
            "✅ Link saved."
        );


        loadLinks();

        loadDashboard();

    } else {

        alert(result.message);

    }

}



/* ==========================================================
 DELETE LINK
========================================================== */

async function deleteLink(id) {

    if (!confirm(
        "क्या आप इस link को delete करना चाहते हैं?"
    )) return;


    const result =
        await api("deleteLink", {

            id: id

        });


    if (result.success) {

        showToast(
            "Link deleted."
        );

        loadLinks();

        loadDashboard();

    } else {

        alert(result.message);

    }

}



/* ==========================================================
 DOCUMENTS
========================================================== */

async function loadDocuments() {

    const result =
        await api("documents");


    if (!result.success) return;


    documents =
        result.data || [];


    renderDocuments();

}



/* ==========================================================
 RENDER DOCUMENTS
========================================================== */

function renderDocuments(list = documents) {

    const container =
        document.getElementById(
            "documentList"
        );


    if (!list.length) {

        container.innerHTML =

        `<div class="link-card">

            <h3>No Documents</h3>

            <p>
            अभी कोई document available नहीं है।
            </p>

        </div>`;

        return;

    }


    container.innerHTML =
        list.map(function(doc) {

        return `

        <div class="link-card">

            <div class="icon">
                📄
            </div>

            <h3>
                ${escapeHTML(doc.title)}
            </h3>

            <p>
                ${escapeHTML(doc.category)}
            </p>

            <p>
                ${escapeHTML(doc.description)}
            </p>

            <div class="card-actions">

                <a
                href="${escapeAttribute(doc.url)}"
                target="_blank"
                rel="noopener"
                class="open-btn">

                    📄 Open Document

                </a>

                <button
                class="delete-btn"
                onclick="deleteDocument('${doc.id}')">

                    🗑

                </button>

            </div>

        </div>

        `;

    }).join("");

}



/* ==========================================================
 DOCUMENT SEARCH
========================================================== */

function filterDocuments() {

    const q =
        document
        .getElementById("documentSearch")
        .value
        .toLowerCase();


    const filtered =
        documents.filter(function(doc) {

            return (

                String(doc.title)
                .toLowerCase()
                .includes(q)

                ||

                String(doc.category)
                .toLowerCase()
                .includes(q)

                ||

                String(doc.description)
                .toLowerCase()
                .includes(q)

            );

        });


    renderDocuments(filtered);

}



/* ==========================================================
 SAVE DOCUMENT
========================================================== */

async function saveDocument(event) {

    event.preventDefault();


    const result =
        await api("addDocument", {

            title:
                document
                .getElementById("documentTitle")
                .value,

            category:
                document
                .getElementById("documentCategory")
                .value,

            url:
                document
                .getElementById("documentUrl")
                .value,

            description:
                document
                .getElementById("documentDescription")
                .value,

            createdBy:
                currentUser.username

        });


    if (result.success) {

        closeModal("documentModal");

        document
        .querySelector("#documentModal form")
        .reset();


        showToast(
            "✅ Document saved."
        );


        loadDocuments();

        loadDashboard();

    } else {

        alert(result.message);

    }

}



/* ==========================================================
 DELETE DOCUMENT
========================================================== */

async function deleteDocument(id) {

    if (!confirm(
        "क्या आप इस document को delete करना चाहते हैं?"
    )) return;


    const result =
        await api("deleteDocument", {

            id: id

        });


    if (result.success) {

        showToast(
            "Document deleted."
        );

        loadDocuments();

        loadDashboard();

    } else {

        alert(result.message);

    }

}



/* ==========================================================
 REPORT
========================================================== */

function updateReport() {

    const container =
        document.getElementById(
            "reportContent"
        );


    container.innerHTML = `

        <div class="report-row">

            <span>
                Total Projects
            </span>

            <b>
                ${projects.length}
            </b>

        </div>


        <div class="report-row">

            <span>
                Total Records
            </span>

            <b>
                ${records.length}
            </b>

        </div>


        <div class="report-row">

            <span>
                Total Important Links
            </span>

            <b>
                ${links.length}
            </b>

        </div>


        <div class="report-row">

            <span>
                Total Documents
            </span>

            <b>
                ${documents.length}
            </b>

        </div>

    `;

}



/* ==========================================================
 MODAL
========================================================== */

function openModal(id) {

    document
    .getElementById(id)
    .classList.add("show");

}


function closeModal(id) {

    document
    .getElementById(id)
    .classList.remove("show");

}



/* ==========================================================
 TOAST
========================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.innerText =
        message;


    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 3000);

}



/* ==========================================================
 SECURITY / HTML ESCAPE
========================================================== */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}