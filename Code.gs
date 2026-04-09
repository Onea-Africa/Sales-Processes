// ═══════════════════════════════════════════════════════════════════════════
//  ONEA AFRICA — CEO COMMAND CENTRE · Google Apps Script Backend
//  Deploy: Extensions → Apps Script → Deploy → New deployment
//  Type: Web App | Execute as: Me | Access: Anyone
//  Paste the deployed URL into SCRIPT_URL in OneaDashboard.jsx
// ═══════════════════════════════════════════════════════════════════════════

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    const out = {
      weekLabel:       getMetric(ss, "weekLabel"),
      revenue:         getSection(ss, ["revenue_mtd","revenue_target","revenue_ytd","revenue_arr"], ["mtd","target","ytd","arr"]),
      cash:            getSection(ss, ["cash_balance","cash_runway","cash_debtors"], ["balance","runway","debtors"]),
      subscribers:     getSection(ss, ["subs_active","subs_target","subs_pending","subs_churn"], ["active","target","pending","churn"]),
      clients:         getSection(ss, ["clients_active","clients_target","clients_new_mtd","clients_at_risk"], ["active","target","new_mtd","at_risk"]),
      kpis:            getSection(ss, ["kpis_nps","kpis_invoiceAge","kpis_utilisation","kpis_deals"], ["nps","invoiceAge","utilisation","deals"]),
      weekly:          getSheet(ss, "Weekly",   ["week","revenue","subs","cash"],          true),
      revenueBreakdown:getSheet(ss, "RevenueBreakdown", ["name","value","color"],          true),
      salesPipeline:   getSheet(ss, "SalesPipeline",    ["stage","count","value"],         true),
      team:            getSheet(ss, "Team",     ["name","role","dept","type"],             true),
      hiringPipeline:  getSheet(ss, "HiringPipeline",   ["role","priority","dept"],        true),
      compliance:      getSheetCompliance(ss),
      tenders:         getSheet(ss, "Tenders",  ["ref","desc","status","gate"],            true),
    };

    return jsonResponse(out);

  } catch(err) {
    return jsonResponse({ error: err.toString() });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Read a single key from the Metrics sheet (column A = key, column B = value)
function getMetric(ss, key) {
  const sh   = ss.getSheetByName("Metrics");
  const data = sh.getDataRange().getValues();
  for (let r of data) {
    if (String(r[0]).trim() === key) return r[1];
  }
  return null;
}

// Read multiple keys from Metrics and map to an object with renamed keys
function getSection(ss, keys, names) {
  const sh   = ss.getSheetByName("Metrics");
  const data = sh.getDataRange().getValues();
  const map  = {};
  data.forEach(r => { map[String(r[0]).trim()] = r[1]; });
  const out = {};
  keys.forEach((k, i) => { out[names[i]] = +map[k] || 0; });
  return out;
}

// Read a named sheet into array of objects, skipping empty rows
// firstRowIsHeader = true (skip row 0)
function getSheet(ss, sheetName, fields, firstRowIsHeader) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  const data = sh.getDataRange().getValues();
  const rows = firstRowIsHeader ? data.slice(1) : data;
  return rows
    .filter(r => r[0] !== "" && r[0] !== null && r[0] !== undefined)
    .map(r => {
      const obj = {};
      fields.forEach((f, i) => { obj[f] = r[i]; });
      return obj;
    });
}

// Compliance has a boolean column (D) — handle separately
function getSheetCompliance(ss) {
  const sh = ss.getSheetByName("Compliance");
  if (!sh) return [];
  return sh.getDataRange().getValues().slice(1)
    .filter(r => r[0])
    .map(r => ({
      label: r[0],
      value: r[1],
      ok:    r[2] === true || String(r[2]).toLowerCase() === "true" || r[2] === 1,
    }));
}


// ═══════════════════════════════════════════════════════════════════════════
//  ONE-TIME SETUP — Run this function once to create & populate all sheets
//  Extensions → Apps Script → Run → setupSheets
// ═══════════════════════════════════════════════════════════════════════════

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── 1. METRICS ────────────────────────────────────────────────────────────
  const metricsData = [
    ["KEY",              "VALUE",   "— Edit column B only —"],
    ["weekLabel",        "W14 · Apr 2026"],
    [""],
    ["— REVENUE —"],
    ["revenue_mtd",      48500],
    ["revenue_target",   120000],
    ["revenue_ytd",      312000],
    ["revenue_arr",      1440000],
    [""],
    ["— CASH —"],
    ["cash_balance",     22400],
    ["cash_runway",      1.8],
    ["cash_debtors",     61000],
    [""],
    ["— SUBSCRIBERS —"],
    ["subs_active",      87],
    ["subs_target",      200],
    ["subs_pending",     14],
    ["subs_churn",       3],
    [""],
    ["— CLIENTS —"],
    ["clients_active",   11],
    ["clients_target",   20],
    ["clients_new_mtd",  1],
    ["clients_at_risk",  2],
    [""],
    ["— KPIs —"],
    ["kpis_nps",         68],
    ["kpis_invoiceAge",  34],
    ["kpis_utilisation", 72],
    ["kpis_deals",       6],
  ];
  writeSheet(ss, "Metrics", metricsData, ["#D6139F","#8CC444"]);

  // ── 2. WEEKLY TREND ───────────────────────────────────────────────────────
  const weeklyData = [
    ["week", "revenue", "subs", "cash"],
    ["W10",  9800,      79,     18200],
    ["W11",  11200,     81,     19800],
    ["W12",  10500,     83,     20400],
    ["W13",  13100,     85,     21900],
    ["W14",  12400,     87,     22400],
  ];
  writeSheet(ss, "Weekly", weeklyData, ["#D6139F","#8CC444"]);

  // ── 3. REVENUE BREAKDOWN ─────────────────────────────────────────────────
  const revBreakData = [
    ["name",           "value",  "color"],
    ["Connectivity",   28400,    "#8CC444"],
    ["Digital Agency", 14200,    "#D6139F"],
    ["IT & Projects",  5900,     "#F4D350"],
  ];
  writeSheet(ss, "RevenueBreakdown", revBreakData, ["#D6139F","#8CC444"]);

  // ── 4. SALES PIPELINE ────────────────────────────────────────────────────
  const pipelineData = [
    ["stage",       "count", "value"],
    ["Prospect",    12,      84000],
    ["Qualified",   7,       61000],
    ["Proposal",    4,       38000],
    ["Negotiation", 2,       24000],
  ];
  writeSheet(ss, "SalesPipeline", pipelineData, ["#D6139F","#8CC444"]);

  // ── 5. TEAM ───────────────────────────────────────────────────────────────
  const teamData = [
    ["name",                   "role",                 "dept",              "type"],
    ["Neo",                    "CEO / MD",             "Executive",         "staff"],
    ["Joyce Keneile Kehau",    "Operations Lead",      "Operations",        "staff"],
    ["Vhahangwele Mukwevho",   "Client & Strategy Head","Client & Strategy","staff"],
    ["Christian Kimbi",        "CTO",                  "Technology",        "staff"],
    ["Patrick Muofhe",         "Senior Developer",     "Technology",        "staff"],
    ["Karabo Makwela",         "Cloud & Infrastructure","Technology",       "staff"],
    ["Khuliso Maba",           "ERP & Support",        "Support & Admin",   "staff"],
    ["Mbali Mtsweni",          "Intern",               "Creative",          "intern"],
    ["Sharlotte Motau",        "Intern",               "Creative",          "intern"],
    ["Zanele Mnisi",           "Intern",               "Digital Marketing", "intern"],
    ["Yoland Nkabinde",        "Intern",               "Comms & PR",        "intern"],
    ["Lucia Shongwe",          "Intern",               "Support",           "intern"],
    ["Keletso Monye",          "Intern",               "Support",           "intern"],
  ];
  writeSheet(ss, "Team", teamData, ["#D6139F","#8CC444"]);

  // ── 6. HIRING PIPELINE ───────────────────────────────────────────────────
  const hiringData = [
    ["role",                         "priority", "dept"],
    ["Business Development Manager", "High",     "Client & Strategy"],
    ["Creative Director",            "High",     "Creative & Content"],
    ["Digital Marketing Manager",    "Medium",   "Digital Marketing"],
    ["Head of Comms & PR",           "Medium",   "Comms & PR"],
    ["Finance Coordinator",          "High",     "Support & Admin"],
    ["Operations Manager",           "High",     "Operations"],
    ["Graphic Designer",             "Medium",   "Creative & Content"],
  ];
  writeSheet(ss, "HiringPipeline", hiringData, ["#D6139F","#8CC444"]);

  // ── 7. COMPLIANCE ────────────────────────────────────────────────────────
  const complianceData = [
    ["label",              "value",           "ok (TRUE/FALSE)"],
    ["CSD Supplier",       "MAAA0662773",     true],
    ["VAT Number",         "4550322707",      true],
    ["Company Reg",        "2016/461132/07",  true],
    ["PAYE/SDL/UIF",       "Registered",      true],
    ["CommScope Cert",     "In Progress",     false],
    ["Microsoft Partner",  "In Progress",     false],
  ];
  writeSheet(ss, "Compliance", complianceData, ["#D6139F","#8CC444"]);

  // ── 8. TENDERS ───────────────────────────────────────────────────────────
  const tenderData = [
    ["ref",            "desc",                                      "status", "gate"],
    ["CIDB/018/2526",  "Network Cabling – 9 National Offices",      "Active", "CommScope + MS Partner"],
  ];
  writeSheet(ss, "Tenders", tenderData, ["#D6139F","#8CC444"]);

  SpreadsheetApp.getUi().alert(
    "✅ Onea Africa sheets created!\n\n" +
    "Next steps:\n" +
    "1. Deploy this script (Deploy → New deployment → Web App)\n" +
    "2. Copy the Web App URL\n" +
    "3. Paste it into SCRIPT_URL in OneaDashboard.jsx\n\n" +
    "Update any cell in the sheets → dashboard refreshes within 60 seconds."
  );
}

// ── Sheet writer utility ──────────────────────────────────────────────────────
function writeSheet(ss, name, data, headerColors) {
  let sh = ss.getSheetByName(name);
  if (sh) ss.deleteSheet(sh);
  sh = ss.insertSheet(name);

  sh.getRange(1, 1, data.length, Math.max(...data.map(r => r.length)))
    .setValues(data.map(r => {
      // Pad rows to max columns
      while (r.length < 4) r.push("");
      return r;
    }));

  // Style header row
  const headerRange = sh.getRange(1, 1, 1, data[0].length);
  headerRange.setBackground(headerColors[0]);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");

  // Freeze header row
  sh.setFrozenRows(1);

  // Auto-resize columns
  sh.autoResizeColumns(1, data[0].length);

  // Alternate row shading
  for (let i = 2; i <= data.length; i++) {
    if (i % 2 === 0) {
      sh.getRange(i, 1, 1, data[0].length).setBackground("#F8FAF5");
    }
  }

  // Green accent on first column
  sh.getRange(2, 1, data.length - 1, 1).setFontColor(headerColors[1]);
  sh.getRange(2, 1, data.length - 1, 1).setFontWeight("bold");
}


// ═══════════════════════════════════════════════════════════════════════════
//  QUICK UPDATE — Call this from a button or menu to bump the week label
// ═══════════════════════════════════════════════════════════════════════════

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🟣 Onea Dashboard")
    .addItem("Setup all sheets (first run)", "setupSheets")
    .addItem("Open dashboard", "openDashboard")
    .addToUi();
}

function openDashboard() {
  // Opens a dialog — replace URL with your deployed dashboard URL
  const html = HtmlService.createHtmlOutput(
    '<p style="font-family:sans-serif">Dashboard URL not yet configured.<br><br>' +
    'After deploying OneaDashboard.jsx, paste the URL in this function.</p>'
  ).setWidth(400).setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(html, "Open Onea Dashboard");
}