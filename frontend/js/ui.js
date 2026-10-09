/* ==========================================================================
   Shared UI toolkit: app shell, toasts, modals, confirm dialog, CRUD table
   ========================================================================== */
const UI = (() => {
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    students: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    courses: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    enrollments: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    attendance: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    gradcap: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'
  };
  const icon = (name, size = 18) =>
    `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  const esc = escapeHtml;
  const $ = (sel, root = document) => root.querySelector(sel);

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
  }
  function getTheme() {
    try { return localStorage.getItem("sms_theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); }
    catch (e) { return "light"; }
  }
  applyTheme(getTheme());

  /* ---------- toast ---------- */
  function toast(message, type = "success") {
    let box = $("#toasts");
    if (!box) { box = document.createElement("div"); box.id = "toasts"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `${icon(type === "error" ? "alert" : type === "info" ? "info" : "check", 18)}<span>${esc(message)}</span>`;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3200);
  }

  /* ---------- modal ---------- */
  function openModal({ title, body, footer = "", size = "", onClose }) {
    const prevFocus = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <div class="modal ${size}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-head"><h3>${esc(title)}</h3><button type="button" class="icon-btn" data-close aria-label="Close">${icon("close")}</button></div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ""}
      </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => overlay.classList.add("show"));

    const close = () => {
      document.removeEventListener("keydown", onKey);
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 180);
      if (!$(".overlay.show:not(:last-child)")) document.body.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (onClose) onClose();
    };
    const onKey = e => {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
      if (e.key === "Tab") {
        const f = [...overlay.querySelectorAll("button, input, select, textarea, a[href]")].filter(x => !x.disabled && x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    overlay.addEventListener("mousedown", e => { if (e.target === overlay) close(); });
    overlay.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
    setTimeout(() => {
      const first = overlay.querySelector("input:not([type=hidden]), select, textarea");
      (first || overlay.querySelector("button")).focus();
    }, 60);
    return { el: overlay, close };
  }

  function confirmDialog({ title = "Are you sure?", message, confirmText = "Delete", danger = true }) {
    return new Promise(resolve => {
      let done = false;
      const finish = v => { if (!done) { done = true; resolve(v); } };
      const m = openModal({
        title, size: "sm",
        body: `<div class="confirm"><div class="confirm-ico ${danger ? "danger" : ""}">${icon(danger ? "alert" : "info", 22)}</div><p>${message}</p></div>`,
        footer: `<button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" id="confirmOk">${esc(confirmText)}</button>`,
        onClose: () => finish(false)
      });
      m.el.querySelector("#confirmOk").addEventListener("click", () => { finish(true); m.close(); });
      m.el.querySelector("#confirmOk").focus();
    });
  }

  /* ---------- app shell ---------- */
  const NAV = [
    ["dashboard", "Dashboard", "index.html", null],
    ["students", "Students", "students.html", () => getStudents().length],
    ["courses", "Courses", "courses.html", () => getCourses().length],
    ["enrollments", "Enrollments", "enrollments.html", () => getEnrollments().length],
    ["attendance", "Attendance", "attendance.html", () => getAttendance().length]
  ];

  function refreshCounts() {
    NAV.forEach(([key, , , count]) => {
      const el = $(`[data-count="${key}"]`);
      if (el && count) el.textContent = count();
    });
  }

  function mountShell(active, title, subtitle) {
    const content = document.getElementById("content");
    const shell = document.createElement("div");
    shell.className = "app";
    shell.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="index.html"><span class="brand-mark">${icon("gradcap", 20)}</span><span><b>EduTrack</b><small>Student Management</small></span></a>
        <nav aria-label="Main">
          <span class="nav-label">Menu</span>
          ${NAV.map(([key, label, href, count]) => `
            <a href="${href}" class="nav-item ${key === active ? "active" : ""}" ${key === active ? 'aria-current="page"' : ""}>
              ${icon(key)}<span>${label}</span>${count ? `<em class="nav-count" data-count="${key}">${count()}</em>` : ""}
            </a>`).join("")}
        </nav>
        <div class="sidebar-foot"><span class="dot"></span> Data stored in this browser</div>
      </aside>
      <div class="scrim" id="scrim"></div>
      <div class="main-col">
        <header class="topbar">
          <button type="button" class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu">${icon("menu", 22)}</button>
          <div class="topbar-title"><h1>${esc(title)}</h1><p>${esc(subtitle || "")}</p></div>
          <div class="topbar-actions">
            <span class="today-chip">${new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
            <button type="button" class="icon-btn" id="themeBtn" aria-label="Toggle dark mode" title="Toggle theme"></button>
            <span class="avatar" title="Administrator">AD</span>
          </div>
        </header>
        <main class="page" id="page"></main>
      </div>`;
    const page = shell.querySelector("#page");
    while (content.firstChild) page.appendChild(content.firstChild);
    content.replaceWith(shell);

    const sidebar = $("#sidebar"), scrim = $("#scrim");
    const setMenu = open => { sidebar.classList.toggle("open", open); scrim.classList.toggle("show", open); };
    $("#menuBtn").addEventListener("click", () => setMenu(!sidebar.classList.contains("open")));
    scrim.addEventListener("click", () => setMenu(false));

    const themeBtn = $("#themeBtn");
    const paint = () => { themeBtn.innerHTML = icon(document.documentElement.getAttribute("data-theme") === "dark" ? "sun" : "moon", 20); };
    paint();
    themeBtn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("sms_theme", next); } catch (e) { /* ignore */ }
      paint();
    });
  }

  /* ---------- helpers ---------- */
  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }
  const AVATAR_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444"];
  function avatar(name, id) {
    return `<span class="mini-avatar" style="background:${AVATAR_COLORS[(Number(id) || 0) % AVATAR_COLORS.length]}">${esc(initials(name))}</span>`;
  }
  function badge(text, tone) {
    return `<span class="badge badge-${tone}">${esc(text)}</span>`;
  }
  function downloadFile(filename, text, mime = "text/csv;charset=utf-8") {
    const blob = new Blob(["﻿" + text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }
  function toCSV(rows) {
    return rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  }

  /* ---------- form builder ---------- */
  function fieldHtml(f, value) {
    const id = `f_${f.name}`;
    const req = f.required ? " required" : "";
    const attrs = [`id="${id}"`, `name="${f.name}"`, f.placeholder ? `placeholder="${esc(f.placeholder)}"` : "", f.min != null ? `min="${f.min}"` : "", f.max != null ? `max="${f.max}"` : "", f.maxlength ? `maxlength="${f.maxlength}"` : "", f.list ? `list="${id}_list"` : ""].filter(Boolean).join(" ");
    let control;
    if (f.type === "select") {
      const opts = (typeof f.options === "function" ? f.options() : f.options) || [];
      control = `<select ${attrs}${req}>${f.placeholder ? `<option value="">${esc(f.placeholder)}</option>` : ""}${opts.map(o => `<option value="${esc(o.value)}" ${String(o.value) === String(value) ? "selected" : ""}>${esc(o.label)}</option>`).join("")}</select>`;
    } else if (f.type === "textarea") {
      control = `<textarea ${attrs} rows="3"${req}>${esc(value ?? "")}</textarea>`;
    } else {
      control = `<input type="${f.type || "text"}" ${attrs} value="${esc(value ?? "")}"${req} autocomplete="off">`;
      if (f.list) control += `<datalist id="${id}_list">${(typeof f.list === "function" ? f.list() : f.list).map(v => `<option value="${esc(v)}">`).join("")}</datalist>`;
    }
    return `<div class="field ${f.full ? "full" : ""}"><label for="${id}">${esc(f.label)}${f.required ? ' <i class="req">*</i>' : ""}</label>${control}<small class="err" data-err="${f.name}"></small>${f.hint ? `<small class="hint">${esc(f.hint)}</small>` : ""}</div>`;
  }

  function readForm(form, fields) {
    const out = {};
    fields.forEach(f => {
      const el = form.elements[f.name];
      let v = el ? el.value : "";
      v = typeof v === "string" ? v.trim() : v;
      if (f.type === "number" && v !== "") v = Number(v);
      out[f.name] = v;
    });
    return out;
  }

  function showErrors(form, errors) {
    form.querySelectorAll("[data-err]").forEach(e => { e.textContent = ""; });
    form.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
    let first = null;
    Object.entries(errors).forEach(([name, msg]) => {
      const holder = form.querySelector(`[data-err="${name}"]`);
      if (holder) holder.textContent = msg;
      const input = form.elements[name];
      if (input) { input.classList.add("invalid"); first = first || input; }
    });
    if (first) first.focus();
  }

  /* ---------- generic CRUD page ---------- */
  function createCrud(cfg) {
    const root = document.getElementById(cfg.mount);
    const state = { q: "", sort: { key: cfg.defaultSort.key, dir: cfg.defaultSort.dir || "asc" }, page: 1, pageSize: 8, filters: {} };
    const filters = cfg.filters || [];

    root.innerHTML = `
      <div class="panel">
        <div class="toolbar">
          <div class="search">${icon("search", 17)}<input type="search" id="${cfg.mount}_q" placeholder="${esc(cfg.searchPlaceholder || "Search…")}" aria-label="Search"></div>
          <div class="filters" id="${cfg.mount}_filters"></div>
          <div class="toolbar-spacer"></div>
          <div class="toolbar-actions">
            ${(cfg.toolbarButtons || []).map((b, i) => `<button type="button" class="btn" data-tb="${i}">${icon(b.icon || "list", 16)}<span>${esc(b.label)}</span></button>`).join("")}
            <button type="button" class="btn" id="${cfg.mount}_csv">${icon("download", 16)}<span>Export CSV</span></button>
            <button type="button" class="btn btn-primary" id="${cfg.mount}_add">${icon("plus", 16)}<span>${esc(cfg.addLabel)}</span></button>
          </div>
        </div>
        <div class="table-wrap"><table class="data">
          <thead><tr>${cfg.columns.map(c => `<th ${c.sortable === false ? "" : `class="sortable" data-sort="${c.key}"`} ${c.width ? `style="width:${c.width}"` : ""}>${esc(c.label)}${c.sortable === false ? "" : '<span class="sort-ind"></span>'}</th>`).join("")}<th class="actions-col">Actions</th></tr></thead>
          <tbody></tbody>
        </table></div>
        <div class="table-foot"><span class="range"></span><div class="pager"></div></div>
      </div>`;

    const tbody = $("tbody", root), rangeEl = $(".range", root), pager = $(".pager", root);
    const qInput = $(`#${cfg.mount}_q`, root), filterBox = $(`#${cfg.mount}_filters`, root);

    function buildFilters() {
      filterBox.innerHTML = filters.map(f => {
        if (f.type === "date") return `<label class="filter"><span>${esc(f.label)}</span><input type="date" data-filter="${f.id}" value="${esc(state.filters[f.id] || "")}"></label>`;
        const opts = typeof f.options === "function" ? f.options() : f.options;
        return `<label class="filter"><span class="sr-only">${esc(f.label)}</span><select data-filter="${f.id}"><option value="">${esc(f.label)}: All</option>${opts.map(o => `<option value="${esc(o.value)}" ${String(state.filters[f.id]) === String(o.value) ? "selected" : ""}>${esc(o.label)}</option>`).join("")}</select></label>`;
      }).join("") + (filters.length ? `<button type="button" class="btn btn-ghost" data-clear hidden>Clear</button>` : "");
    }

    function getView() {
      const q = state.q.trim().toLowerCase();
      let rows = cfg.getAll();
      if (q) rows = rows.filter(r => cfg.searchText(r).toLowerCase().includes(q));
      filters.forEach(f => {
        const v = state.filters[f.id];
        if (v) rows = rows.filter(r => f.match(r, v));
      });
      const col = cfg.columns.find(c => c.key === state.sort.key);
      const val = r => (col && col.sortValue ? col.sortValue(r) : r[state.sort.key]);
      const dir = state.sort.dir === "asc" ? 1 : -1;
      rows = rows.slice().sort((a, b) => {
        const x = val(a), y = val(b);
        if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
        return String(x ?? "").localeCompare(String(y ?? ""), undefined, { numeric: true, sensitivity: "base" }) * dir;
      });
      return rows;
    }

    function render() {
      if (filters.some(f => typeof f.options === "function")) {
        const active = document.activeElement;
        if (!active || !active.matches || !active.matches("[data-filter]")) buildFilters();
      }
      const all = cfg.getAll();
      const rows = getView();
      const pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
      if (state.page > pages) state.page = pages;
      const start = (state.page - 1) * state.pageSize;
      const slice = rows.slice(start, start + state.pageSize);

      const clear = $("[data-clear]", root);
      if (clear) clear.hidden = !Object.values(state.filters).some(Boolean);

      root.querySelectorAll("th.sortable").forEach(th => {
        const on = th.dataset.sort === state.sort.key;
        th.classList.toggle("sorted", on);
        th.setAttribute("aria-sort", on ? (state.sort.dir === "asc" ? "ascending" : "descending") : "none");
        $(".sort-ind", th).textContent = on ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
      });

      if (!slice.length) {
        const filtered = all.length > 0;
        tbody.innerHTML = `<tr class="empty-row"><td colspan="${cfg.columns.length + 1}"><div class="empty">${icon("inbox", 36)}<h4>${filtered ? "No matching records" : esc(cfg.emptyTitle || "Nothing here yet")}</h4><p>${filtered ? "Try a different search or clear the filters." : esc(cfg.emptyText || "Add your first record to get started.")}</p>${filtered ? "" : `<button type="button" class="btn btn-primary" data-empty-add>${icon("plus", 16)}<span>${esc(cfg.addLabel)}</span></button>`}</div></td></tr>`;
      } else {
        tbody.innerHTML = slice.map(r => {
          const id = r[cfg.idField];
          return `<tr data-id="${id}">${cfg.columns.map(c => `<td data-label="${esc(c.label)}">${c.render ? c.render(r) : esc(r[c.key])}</td>`).join("")}
            <td class="actions-col"><div class="row-actions">
              <button type="button" class="icon-btn" data-edit="${id}" title="Edit" aria-label="Edit">${icon("edit", 16)}</button>
              <button type="button" class="icon-btn danger" data-del="${id}" title="Delete" aria-label="Delete">${icon("trash", 16)}</button>
            </div></td></tr>`;
        }).join("");
      }

      rangeEl.textContent = rows.length
        ? `Showing ${start + 1}–${start + slice.length} of ${rows.length}${rows.length !== all.length ? ` (filtered from ${all.length})` : ""}`
        : "0 records";
      pager.innerHTML = pages > 1 ? `
        <button type="button" class="btn btn-sm" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>Prev</button>
        ${pageList(state.page, pages).map(p => p === "…" ? `<span class="gap">…</span>` : `<button type="button" class="btn btn-sm ${p === state.page ? "btn-primary" : ""}" data-page="${p}">${p}</button>`).join("")}
        <button type="button" class="btn btn-sm" data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""}>Next</button>` : "";
      refreshCounts();
      if (cfg.onRender) cfg.onRender();
    }

    function pageList(cur, total) {
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
      const set = new Set([1, total, cur, cur - 1, cur + 1]);
      const list = [...set].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
      const out = [];
      list.forEach((p, i) => { if (i && p - list[i - 1] > 1) out.push("…"); out.push(p); });
      return out;
    }

    function openForm(existing) {
      const editing = !!existing;
      const fields = typeof cfg.fields === "function" ? cfg.fields(existing) : cfg.fields;
      const m = openModal({
        title: editing ? cfg.editTitle : cfg.addTitle,
        body: `<form id="crudForm" novalidate><div class="form-grid">${fields.map(f => fieldHtml(f, existing ? existing[f.name] : (typeof f.default === "function" ? f.default() : f.default))).join("")}</div></form>`,
        footer: `<button type="button" class="btn" data-close>Cancel</button><button type="submit" form="crudForm" class="btn btn-primary">${editing ? "Save changes" : esc(cfg.addLabel)}</button>`
      });
      const form = $("#crudForm", m.el);
      if (cfg.onFormOpen) cfg.onFormOpen(form, existing);
      form.querySelectorAll("input, select, textarea").forEach(el => el.addEventListener("input", () => {
        el.classList.remove("invalid");
        const h = form.querySelector(`[data-err="${el.name}"]`); if (h) h.textContent = "";
      }));
      form.addEventListener("submit", e => {
        e.preventDefault();
        const values = readForm(form, fields);
        const errors = {};
        fields.forEach(f => {
          const v = values[f.name];
          if (f.required && (v === "" || v == null)) errors[f.name] = `${f.label} is required.`;
          else if (f.type === "number" && v !== "" && (Number.isNaN(v) || (f.min != null && v < f.min) || (f.max != null && v > f.max))) errors[f.name] = `Enter a number${f.min != null ? ` from ${f.min}` : ""}${f.max != null ? ` to ${f.max}` : ""}.`;
        });
        if (!Object.keys(errors).length && cfg.validate) Object.assign(errors, cfg.validate(values, existing) || {});
        if (Object.keys(errors).length) { showErrors(form, errors); return; }

        const all = cfg.getAll();
        if (editing) {
          const i = all.findIndex(r => r[cfg.idField] === existing[cfg.idField]);
          if (i !== -1) all[i] = { ...all[i], ...values, updated_at: today() };
        } else {
          all.push({ [cfg.idField]: nextId(all, cfg.idField), ...values, created_at: today() });
        }
        if (cfg.saveAll(all) === false) return;
        m.close();
        toast(editing ? `${cfg.noun} updated.` : `${cfg.noun} added.`);
        render();
      });
    }

    async function remove(id) {
      const row = cfg.getAll().find(r => r[cfg.idField] === id);
      if (!row) return;
      const ok = await confirmDialog({ title: `Delete ${cfg.noun.toLowerCase()}?`, message: cfg.deleteMessage(row) });
      if (!ok) return;
      if (cfg.deleteRow) cfg.deleteRow(row);
      else cfg.saveAll(cfg.getAll().filter(r => r[cfg.idField] !== id));
      toast(`${cfg.noun} deleted.`);
      render();
    }

    function exportCsv() {
      const rows = getView();
      if (!rows.length) { toast("Nothing to export.", "info"); return; }
      const cols = cfg.csv;
      downloadFile(`${cfg.csvName}-${today()}.csv`, toCSV([cols.map(c => c.label), ...rows.map(r => cols.map(c => c.value(r)))]));
      toast(`Exported ${rows.length} record${rows.length === 1 ? "" : "s"}.`);
    }

    /* events */
    let t;
    qInput.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.q = qInput.value; state.page = 1; render(); }, 120); });
    root.addEventListener("click", e => {
      const el = e.target.closest("button, th.sortable");
      if (!el) return;
      if (el.matches("th.sortable")) {
        const k = el.dataset.sort;
        state.sort = { key: k, dir: state.sort.key === k && state.sort.dir === "asc" ? "desc" : "asc" };
        render();
      } else if (el.dataset.edit) openForm(cfg.getAll().find(r => r[cfg.idField] === Number(el.dataset.edit)));
      else if (el.dataset.del) remove(Number(el.dataset.del));
      else if (el.dataset.page) { state.page = Number(el.dataset.page); render(); }
      else if (el.id === `${cfg.mount}_add` || el.hasAttribute("data-empty-add")) openForm(null);
      else if (el.id === `${cfg.mount}_csv`) exportCsv();
      else if (el.hasAttribute("data-clear")) { state.filters = {}; state.page = 1; buildFilters(); render(); }
      else if (el.dataset.tb != null) cfg.toolbarButtons[Number(el.dataset.tb)].onClick(render);
    });
    root.addEventListener("change", e => {
      const f = e.target.closest("[data-filter]");
      if (f) { state.filters[f.dataset.filter] = f.value; state.page = 1; render(); }
    });

    buildFilters();
    render();

    /* deep links like students.html?new=1 */
    if (new URLSearchParams(location.search).get("new") === "1") openForm(null);
    return { render, openForm };
  }

  return { icon, toast, openModal, confirmDialog, mountShell, createCrud, refreshCounts, esc, avatar, badge, fieldHtml, readForm, showErrors, downloadFile, toCSV };
})();
