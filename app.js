const actionCatalog = {
  verify_identity: {
    label: "Verify identity",
    detail: "Confirm the requester before changing access.",
  },
  ask_impact: {
    label: "Ask impact questions",
    detail: "Find scope, deadline, and affected users.",
  },
  search_kb: {
    label: "Search the KB",
    detail: "Use the approved fix before improvising.",
  },
  check_status: {
    label: "Check service status",
    detail: "Look for outage or maintenance signals.",
  },
  reset_password: {
    label: "Reset password",
    detail: "Use the identity provider reset process.",
  },
  reset_mfa: {
    label: "Reset MFA registration",
    detail: "Re-enroll approved MFA factors.",
  },
  assign_license: {
    label: "Assign license",
    detail: "Grant approved app access.",
  },
  get_manager_approval: {
    label: "Get approval",
    detail: "Confirm request owner or manager approval.",
  },
  collect_logs: {
    label: "Collect logs",
    detail: "Capture errors, timestamps, and device facts.",
  },
  remote_session: {
    label: "Remote session",
    detail: "View the issue with user consent.",
  },
  restart_spooler: {
    label: "Restart print spooler",
    detail: "Clear stuck print jobs safely.",
  },
  test_vpn: {
    label: "Test VPN profile",
    detail: "Confirm client, network, and auth behavior.",
  },
  escalate_network: {
    label: "Escalate to network",
    detail: "Send scope and logs to network support.",
  },
  quarantine_email: {
    label: "Quarantine message",
    detail: "Contain suspected phishing content.",
  },
  educate_user: {
    label: "Coach the user",
    detail: "Give short guidance after fixing the ticket.",
  },
  confirm_with_user: {
    label: "Confirm resolution",
    detail: "Ask the user to verify the fix.",
  },
  document_resolution: {
    label: "Document resolution",
    detail: "Record cause, action, and outcome.",
  },
  close_without_confirmation: {
    label: "Close immediately",
    detail: "Mark solved without user confirmation.",
  },
  bypass_mfa: {
    label: "Bypass MFA",
    detail: "Skip security controls to move faster.",
  },
  reboot_server: {
    label: "Reboot server",
    detail: "Restart shared infrastructure.",
  },
  ignore_security: {
    label: "Ignore alert",
    detail: "Assume the user knows what happened.",
  },
};

const tickets = [
  {
    id: "SD-1042",
    title: "Payroll app stuck in MFA loop",
    requester: "Maya R.",
    role: "Payroll coordinator",
    company: "Brightline Health",
    channel: "Chat",
    asset: "Okta + payroll app",
    slaMinutes: 28,
    category: "Access",
    priority: "P2",
    customerNote:
      "I replaced my phone this morning and now payroll keeps asking for the old authenticator. Direct deposit closes at 4 PM and I am the only person who can submit the file.",
    signals: ["deadline risk", "single user", "identity change"],
    kb: [
      "Identity must be verified before MFA changes.",
      "Payroll app access issues with same-day deadlines are P2.",
      "Always document old factor removal and new factor enrollment.",
    ],
    correctActions: ["verify_identity", "reset_mfa", "confirm_with_user", "document_resolution"],
    preferredFirst: "verify_identity",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: [
      "verify_identity",
      "ask_impact",
      "reset_password",
      "reset_mfa",
      "bypass_mfa",
      "confirm_with_user",
      "document_resolution",
      "close_without_confirmation",
    ],
    skills: ["Identity", "SLA", "Documentation"],
    outcome:
      "Best path: verify identity, remove the stale MFA factor, enroll the new phone, confirm payroll access, then document the change.",
    socialHook: "A payroll deadline, a new phone, and an MFA lockout. Would you fix it or create a security risk?",
  },
  {
    id: "SD-1187",
    title: "Remote team cannot connect to VPN",
    requester: "Andre T.",
    role: "Regional manager",
    company: "Atlas Supply",
    channel: "Phone",
    asset: "GlobalProtect VPN",
    slaMinutes: 18,
    category: "Network",
    priority: "P1",
    customerNote:
      "My whole East Coast team is getting a gateway unavailable error. We have a customer demo in 30 minutes and nobody can reach the shared drive.",
    signals: ["many users", "customer-facing deadline", "network dependency"],
    kb: [
      "Multiple users with business impact can be P1.",
      "Check VPN status and collect gateway error before escalation.",
      "Send network team scope, region, timestamp, and sample username.",
    ],
    correctActions: ["ask_impact", "check_status", "test_vpn", "escalate_network"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: [
      "ask_impact",
      "check_status",
      "test_vpn",
      "collect_logs",
      "escalate_network",
      "reboot_server",
      "reset_password",
      "close_without_confirmation",
    ],
    skills: ["Network", "Escalation", "SLA"],
    outcome:
      "Best path: confirm scope, check service status, test the VPN profile, then escalate with region, timestamps, sample users, and the gateway error.",
    socialHook: "A manager says the whole team is locked out before a customer demo. Is it P1, P2, or panic?",
  },
  {
    id: "SD-1219",
    title: "Suspicious invoice email opened",
    requester: "Leah C.",
    role: "Accounts payable",
    company: "Northstar Foods",
    channel: "Portal",
    asset: "Email security",
    slaMinutes: 22,
    category: "Security",
    priority: "P2",
    customerNote:
      "I opened an invoice attachment that looked weird and then closed it. It asked me to enable content. I did not enter my password, but I am nervous.",
    signals: ["possible phishing", "attachment opened", "no password entered"],
    kb: [
      "Do not blame the user. Contain first, then educate.",
      "Phishing reports require message headers and endpoint check.",
      "Security events stay open until containment is confirmed.",
    ],
    correctActions: ["quarantine_email", "collect_logs", "educate_user", "document_resolution"],
    preferredFirst: "quarantine_email",
    dangerousActions: ["ignore_security", "close_without_confirmation"],
    actionPool: [
      "quarantine_email",
      "collect_logs",
      "remote_session",
      "reset_password",
      "ignore_security",
      "educate_user",
      "document_resolution",
      "close_without_confirmation",
    ],
    skills: ["Security", "Communication", "Documentation"],
    outcome:
      "Best path: quarantine the message, gather headers and endpoint details, coach the user, and document containment steps.",
    socialHook: "Someone opened a suspicious invoice. The best help desk move is calm, fast, and security-first.",
  },
  {
    id: "SD-1320",
    title: "Shipping labels stopped printing",
    requester: "Omar G.",
    role: "Warehouse lead",
    company: "Civic Retail",
    channel: "Teams",
    asset: "Zebra label printer",
    slaMinutes: 35,
    category: "Hardware",
    priority: "P2",
    customerNote:
      "The label printer by bay 4 stopped printing after lunch. Orders are backing up. Other printers still work, but this station handles our rush pickups.",
    signals: ["one device", "operations slowdown", "workaround exists"],
    kb: [
      "Single-station printer issue with operational impact is usually P2.",
      "Check queue, cable, driver, and print spooler before replacement.",
      "Confirm test label prints before closing.",
    ],
    correctActions: ["remote_session", "restart_spooler", "confirm_with_user", "document_resolution"],
    preferredFirst: "remote_session",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: [
      "ask_impact",
      "remote_session",
      "restart_spooler",
      "search_kb",
      "reboot_server",
      "assign_license",
      "confirm_with_user",
      "document_resolution",
    ],
    skills: ["Hardware", "Troubleshooting", "Documentation"],
    outcome:
      "Best path: confirm impact, inspect the queue remotely, restart the spooler or clear stuck jobs, print a test label, then document.",
    socialHook: "Warehouse labels stop printing during pickup rush. Would you troubleshoot or over-escalate?",
  },
  {
    id: "SD-1435",
    title: "New hire missing CRM access",
    requester: "Priya S.",
    role: "Sales operations",
    company: "ForgeWorks",
    channel: "Portal",
    asset: "CRM license",
    slaMinutes: 90,
    category: "Service Request",
    priority: "P3",
    customerNote:
      "A new account executive started today and can log into email but not the CRM. Their manager says they need access before training tomorrow morning.",
    signals: ["new hire", "approved access needed", "work starts tomorrow"],
    kb: [
      "Access requests need manager approval or existing onboarding ticket.",
      "Use least privilege role matching the sales team template.",
      "Confirm license assignment and first login.",
    ],
    correctActions: ["get_manager_approval", "assign_license", "confirm_with_user", "document_resolution"],
    preferredFirst: "get_manager_approval",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: [
      "get_manager_approval",
      "assign_license",
      "reset_password",
      "verify_identity",
      "bypass_mfa",
      "confirm_with_user",
      "document_resolution",
      "close_without_confirmation",
    ],
    skills: ["Access", "SaaS", "Documentation"],
    outcome:
      "Best path: validate manager approval, assign the right CRM license and role, confirm login, then document entitlement details.",
    socialHook: "A new hire needs CRM access. The fast answer is not always the safe answer.",
  },
  {
    id: "SD-1511",
    title: "Laptop crashing after update",
    requester: "Ben K.",
    role: "Project analyst",
    company: "Harbor Energy",
    channel: "Walk-up",
    asset: "Windows laptop",
    slaMinutes: 45,
    category: "Incident",
    priority: "P3",
    customerNote:
      "My laptop blue-screened twice after a driver update. I can work from the loaner, but I need this device back before a client workshop next week.",
    signals: ["single device", "workaround available", "driver update clue"],
    kb: [
      "Collect stop code, update history, and device model.",
      "Use known-good driver rollback when update caused failures.",
      "Escalate hardware only after repeat crash evidence.",
    ],
    correctActions: ["collect_logs", "search_kb", "confirm_with_user", "document_resolution"],
    preferredFirst: "collect_logs",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: [
      "collect_logs",
      "search_kb",
      "remote_session",
      "reset_password",
      "reboot_server",
      "confirm_with_user",
      "document_resolution",
      "close_without_confirmation",
    ],
    skills: ["Windows", "Troubleshooting", "Documentation"],
    outcome:
      "Best path: collect crash details, match against the KB, roll back the bad driver if approved, confirm stability, then document.",
    socialHook: "A laptop crashes after a driver update. Great help desk work starts before the fix button.",
  },
];

const skillNames = [
  "Identity",
  "SLA",
  "Documentation",
  "Network",
  "Escalation",
  "Security",
  "Communication",
  "Hardware",
  "Troubleshooting",
  "Access",
  "SaaS",
  "Windows",
];

const els = {
  ticketQueue: document.querySelector("#ticketQueue"),
  ticketId: document.querySelector("#ticketId"),
  ticketTitle: document.querySelector("#ticketTitle"),
  ticketMeta: document.querySelector("#ticketMeta"),
  customerNote: document.querySelector("#customerNote"),
  signalRow: document.querySelector("#signalRow"),
  kbList: document.querySelector("#kbList"),
  actionBank: document.querySelector("#actionBank"),
  actionCount: document.querySelector("#actionCount"),
  categorySelect: document.querySelector("#categorySelect"),
  prioritySelect: document.querySelector("#prioritySelect"),
  submitTicketBtn: document.querySelector("#submitTicketBtn"),
  nextTicketBtn: document.querySelector("#nextTicketBtn"),
  randomTicketBtn: document.querySelector("#randomTicketBtn"),
  resultPanel: document.querySelector("#resultPanel"),
  scoreValue: document.querySelector("#scoreValue"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  coachList: document.querySelector("#coachList"),
  xpStat: document.querySelector("#xpStat"),
  solvedStat: document.querySelector("#solvedStat"),
  bestStat: document.querySelector("#bestStat"),
  readyStat: document.querySelector("#readyStat"),
  meterFill: document.querySelector("#meterFill"),
  readinessCopy: document.querySelector("#readinessCopy"),
  skillGrid: document.querySelector("#skillGrid"),
  clipHook: document.querySelector("#clipHook"),
  clipBeats: document.querySelector("#clipBeats"),
  copyClipBtn: document.querySelector("#copyClipBtn"),
  copyStatus: document.querySelector("#copyStatus"),
  waitlistForm: document.querySelector("#waitlistForm"),
  waitlistStatus: document.querySelector("#waitlistStatus"),
  emailInput: document.querySelector("#emailInput"),
  replyTone: document.querySelector("#replyTone"),
  slaPill: document.querySelector("#slaPill"),
  startShiftBtn: document.querySelector("#startShiftBtn"),
  creatorModeBtn: document.querySelector("#creatorModeBtn"),
  evidenceLog: document.querySelector("#evidenceLog"),
  interviewPrompt: document.querySelector("#interviewPrompt"),
  nextDrill: document.querySelector("#nextDrill"),
  copyEvidenceBtn: document.querySelector("#copyEvidenceBtn"),
  previewProBtn: document.querySelector("#previewProBtn"),
  checkProBtn: document.querySelector("#checkProBtn"),
  manageBillingBtn: document.querySelector("#manageBillingBtn"),
  proStatusBadge: document.querySelector("#proStatusBadge"),
  planSummaryCopy: document.querySelector("#planSummaryCopy"),
  subscriptionPanel: document.querySelector(".subscription-panel"),
  valueLab: document.querySelector(".value-lab"),
  proDashboard: document.querySelector("#proDashboard"),
  dashboardBadge: document.querySelector("#dashboardBadge"),
  dashboardWelcome: document.querySelector("#dashboardWelcome"),
  dashboardReadiness: document.querySelector("#dashboardReadiness"),
  rampDayBadge: document.querySelector("#rampDayBadge"),
  todayPlan: document.querySelector("#todayPlan"),
  dashboardPrimaryBtn: document.querySelector("#dashboardPrimaryBtn"),
  evidenceCountBadge: document.querySelector("#evidenceCountBadge"),
  dashboardEvidenceList: document.querySelector("#dashboardEvidenceList"),
  dashboardInterview: document.querySelector("#dashboardInterview"),
  rampFill: document.querySelector("#rampFill"),
  rampCopy: document.querySelector("#rampCopy"),
};

let activeTicketIndex = 0;
let selectedActions = new Set();
let activeTone = "professional";
let submitted = false;
let ticketStartedAt = Date.now();
let mode = "guided";
let lastEvidenceText = "";
let paymentsReady = false;
let proActive = localStorage.getItem("ticketReadyProActive") === "true";

const progress = loadProgress();

function loadProgress() {
  const emptySkills = Object.fromEntries(skillNames.map((skill) => [skill, 0]));
  try {
    const saved = JSON.parse(localStorage.getItem("ticketReadyProgress") || "{}");
    return {
      xp: Number(saved.xp || 0),
      solved: Number(saved.solved || 0),
      best: Number(saved.best || 0),
      scores: Array.isArray(saved.scores) ? saved.scores.slice(-20) : [],
      skills: { ...emptySkills, ...(saved.skills || {}) },
      evidence: Array.isArray(saved.evidence) ? saved.evidence.slice(0, 20) : [],
    };
  } catch {
    return {
      xp: 0,
      solved: 0,
      best: 0,
      scores: [],
      skills: emptySkills,
      evidence: [],
    };
  }
}

function saveProgress() {
  localStorage.setItem("ticketReadyProgress", JSON.stringify(progress));
}

function calculateReadiness() {
  const average = progress.scores.length
    ? progress.scores.reduce((sum, score) => sum + score, 0) / progress.scores.length
    : 0;
  return Math.min(100, Math.round(average * 0.72 + Math.min(progress.solved, 20) * 1.4));
}

function createTextElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

function renderStats() {
  const readiness = calculateReadiness();

  els.xpStat.textContent = progress.xp;
  els.solvedStat.textContent = progress.solved;
  els.bestStat.textContent = progress.best;
  els.readyStat.textContent = `${readiness}%`;
  els.meterFill.style.width = `${readiness}%`;
  els.readinessCopy.textContent =
    readiness >= 75
      ? "You are building strong support instincts. Keep collecting high-score cases for your resume evidence log."
      : "Resolve tickets with clean triage, safe actions, and clear documentation to raise readiness.";

  renderSkills();
  renderProDashboard();
}

function renderSkills() {
  els.skillGrid.replaceChildren();
  skillNames.slice(0, 8).forEach((skill) => {
    const value = Math.min(100, Math.round(progress.skills[skill] || 0));
    const item = document.createElement("div");
    item.className = "skill";
    item.append(createTextElement("span", skill));
    item.append(createTextElement("strong", `${value}%`));
    els.skillGrid.append(item);
  });
}

function renderQueue() {
  els.ticketQueue.replaceChildren();
  tickets.forEach((ticket, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `ticket-row${index === activeTicketIndex ? " is-active" : ""}`;
    button.addEventListener("click", () => loadTicket(index));

    const top = document.createElement("div");
    top.className = "ticket-row__top";
    top.append(createTextElement("span", ticket.id));

    const priority = createTextElement("span", ticket.priority, "priority-dot");
    priority.dataset.priority = ticket.priority;
    top.append(priority);

    button.append(top);
    button.append(createTextElement("span", ticket.title, "ticket-row__title"));
    button.append(createTextElement("span", ticket.category));
    els.ticketQueue.append(button);
  });
}

function loadTicket(index) {
  activeTicketIndex = index;
  selectedActions = new Set();
  submitted = false;
  ticketStartedAt = Date.now();

  const ticket = tickets[activeTicketIndex];
  els.ticketId.textContent = ticket.id;
  els.ticketTitle.textContent = ticket.title;
  els.customerNote.textContent = ticket.customerNote;
  els.categorySelect.value = "";
  els.prioritySelect.value = "";
  els.resultPanel.hidden = true;
  els.submitTicketBtn.disabled = false;
  els.copyStatus.textContent = "";

  renderQueue();
  renderMeta(ticket);
  renderSignals(ticket);
  renderKb(ticket);
  renderActions(ticket);
  renderCreatorClip(ticket);
  renderOutcomeLab(ticket);
  renderProDashboard();
  updateSla();
}

function renderMeta(ticket) {
  els.ticketMeta.replaceChildren();
  [
    `${ticket.requester} - ${ticket.role}`,
    ticket.company,
    ticket.channel,
    ticket.asset,
  ].forEach((item) => {
    els.ticketMeta.append(createTextElement("span", item, "meta-chip"));
  });
}

function renderSignals(ticket) {
  els.signalRow.replaceChildren();
  ticket.signals.forEach((signal) => {
    els.signalRow.append(createTextElement("span", signal, "signal-chip"));
  });
}

function renderKb(ticket) {
  els.kbList.replaceChildren();
  ticket.kb.forEach((entry) => {
    els.kbList.append(createTextElement("li", entry));
  });
}

function renderActions(ticket) {
  els.actionBank.replaceChildren();
  els.actionCount.textContent = `${selectedActions.size}/4`;

  ticket.actionPool.forEach((actionId) => {
    const action = actionCatalog[actionId];
    const button = document.createElement("button");
    const isSelected = selectedActions.has(actionId);
    const isDisabled = selectedActions.size >= 4 && !isSelected;

    button.type = "button";
    button.className = `action-button${isSelected ? " is-selected" : ""}${isDisabled ? " is-disabled" : ""}`;
    button.disabled = submitted || isDisabled;
    button.dataset.action = actionId;
    button.append(createTextElement("strong", action.label));
    button.append(createTextElement("span", action.detail));
    button.addEventListener("click", () => toggleAction(actionId));
    els.actionBank.append(button);
  });
}

function toggleAction(actionId) {
  if (submitted) {
    return;
  }

  if (selectedActions.has(actionId)) {
    selectedActions.delete(actionId);
  } else if (selectedActions.size < 4) {
    selectedActions.add(actionId);
  }

  renderActions(tickets[activeTicketIndex]);
}

function renderCreatorClip(ticket) {
  els.clipHook.textContent = ticket.socialHook;
  els.clipBeats.replaceChildren();

  [
    "Open on the ticket and read the customer note.",
    "Ask viewers to choose the category and priority.",
    "Pick one risky action, then show the safer path.",
    "Reveal the score and ask who wants the next ticket.",
  ].forEach((beat) => {
    els.clipBeats.append(createTextElement("li", beat));
  });
}

function renderOutcomeLab(ticket, result) {
  if (!result) {
    lastEvidenceText = `Practice case ${ticket.id}: ${ticket.title}. Focus areas: ${ticket.skills.join(", ")}.`;
    els.evidenceLog.textContent =
      "Complete this case to save a resume-ready proof entry with the issue, business impact, action path, and score.";
    els.interviewPrompt.textContent = `After scoring, practice explaining how you would handle: ${ticket.title}.`;
    els.nextDrill.textContent = `Target skill: ${ticket.skills[0]}. Resolve the ticket with clean triage and safe documentation.`;
    return;
  }

  const actionLabels = result.selected.map((actionId) => actionCatalog[actionId].label.toLowerCase());
  const selectedSummary = actionLabels.length ? actionLabels.join(", ") : "no action path selected";
  const weakPriority = result.notes.some((note) => note.startsWith("Priority should"));
  const weakCategory = result.notes.some((note) => note.startsWith("Category should"));
  const weakAction = result.notes.some((note) => note.startsWith("Missed step") || note.startsWith("Risky action"));
  const nextFocus = weakPriority
    ? "priority judgment under SLA pressure"
    : weakCategory
      ? "ticket classification"
      : weakAction
        ? "safe resolution sequencing"
        : `${ticket.skills[0].toLowerCase()} speed and confidence`;

  lastEvidenceText = [
    `Resolved ${ticket.id}: ${ticket.title}`,
    `Score: ${result.score}/100`,
    `Business context: ${ticket.customerNote}`,
    `Action path: ${selectedSummary}.`,
    `Skills practiced: ${ticket.skills.join(", ")}.`,
    `Outcome: ${ticket.outcome}`,
  ].join("\n");

  els.evidenceLog.textContent = `Resolved ${ticket.title} with a ${result.score}/100 score. Evidence saved around ${ticket.skills.join(", ")} using: ${selectedSummary}.`;
  els.interviewPrompt.textContent = `Interview drill: walk through this ${ticket.category.toLowerCase()} case. Explain the business impact, why it was ${ticket.priority}, your first action, and how you documented the outcome.`;
  els.nextDrill.textContent = `Next drill: practice ${nextFocus} with two more ${ticket.skills[0].toLowerCase()} cases before moving to a harder queue.`;
}

function getWeakestSkill() {
  return Object.entries(progress.skills)
    .sort((first, second) => first[1] - second[1])
    .find(([, value]) => value < 70)?.[0] || tickets[activeTicketIndex].skills[0];
}

function renderTodayPlan() {
  const ticket = tickets[activeTicketIndex];
  const weakestSkill = getWeakestSkill();
  const plan = proActive
    ? [
        `Resolve ${ticket.id} and score 80+ on category, priority, and first action.`,
        `Save one evidence entry focused on ${ticket.skills.join(", ")}.`,
        `Practice one interview answer about ${weakestSkill} under SLA pressure.`,
      ]
    : [
        `Try ${ticket.id} as a free preview ticket.`,
        "Subscribe to unlock saved evidence, interview drills, and the 30-day ramp.",
        "Return after checkout and Pro will unlock on this dashboard.",
      ];

  els.todayPlan.replaceChildren();
  plan.forEach((item) => {
    els.todayPlan.append(createTextElement("li", item));
  });
}

function renderEvidenceVault() {
  els.dashboardEvidenceList.replaceChildren();
  const evidence = progress.evidence.slice(0, 3);
  els.evidenceCountBadge.textContent = `${progress.evidence.length} saved`;

  if (!proActive) {
    const locked = document.createElement("div");
    locked.className = "evidence-empty";
    locked.textContent = "Pro saves your strongest scored tickets as resume/interview proof. Complete a ticket to preview the first entry.";
    els.dashboardEvidenceList.append(locked);
    return;
  }

  if (!evidence.length) {
    const empty = document.createElement("div");
    empty.className = "evidence-empty";
    empty.textContent = "No evidence saved yet. Finish today's shift to create your first proof entry.";
    els.dashboardEvidenceList.append(empty);
    return;
  }

  evidence.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "evidence-item";
    item.append(createTextElement("strong", `${entry.ticketId} - ${entry.score}/100`));
    item.append(createTextElement("span", entry.summary));
    els.dashboardEvidenceList.append(item);
  });
}

function renderProDashboard() {
  const readiness = calculateReadiness();
  const rampDay = Math.min(30, Math.max(1, progress.solved + 1));
  const completedRampDays = Math.min(30, progress.solved);
  const latestEvidence = progress.evidence[0];

  els.proDashboard.classList.toggle("is-pro-active", proActive);
  els.dashboardBadge.textContent = proActive ? "Pro Active" : "Free Preview";
  els.dashboardBadge.classList.toggle("is-active", proActive);
  els.dashboardWelcome.textContent = proActive
    ? "Your paid workspace is ready. Finish today's shift, save proof, and rehearse one interview answer."
    : "Unlock Pro to turn practice tickets into a weekly job-readiness routine with evidence you can reuse.";
  els.dashboardReadiness.textContent = `${readiness}%`;
  els.rampDayBadge.textContent = `Day ${rampDay}`;
  els.rampFill.style.width = `${Math.round((completedRampDays / 30) * 100)}%`;
  els.rampCopy.textContent = `${completedRampDays} of 30 ramp days completed.`;
  els.dashboardInterview.textContent = latestEvidence
    ? latestEvidence.interviewPrompt
    : `Practice explaining why ${tickets[activeTicketIndex].title} is a ${tickets[activeTicketIndex].priority} and what you would do first.`;
  els.dashboardPrimaryBtn.textContent = proActive ? "Start Today's Shift" : "Unlock Pro";

  renderTodayPlan();
  renderEvidenceVault();
}

function renderProState(email = localStorage.getItem("ticketReadyLastEmail") || "") {
  els.proStatusBadge.textContent = proActive ? "Pro Active" : "Free";
  els.proStatusBadge.classList.toggle("is-active", proActive);
  els.subscriptionPanel.classList.toggle("is-pro-active", proActive);
  els.valueLab.classList.toggle("is-unlocked", proActive);
  els.planSummaryCopy.textContent = proActive
    ? "Your Pro outcome tools are unlocked on this device."
    : "Practice, proof, and interview confidence every week.";

  if (email && !els.emailInput.value) {
    els.emailInput.value = email;
  }

  renderProDashboard();
}

function setProState(entitlement, email) {
  proActive = Boolean(entitlement?.active);
  localStorage.setItem("ticketReadyProActive", String(proActive));
  if (email) {
    localStorage.setItem("ticketReadyLastEmail", email);
  }
  renderProState(email);
}

function evaluateTicket(ticket) {
  let score = 10;
  const notes = [];
  const selected = Array.from(selectedActions);
  const correct = new Set(ticket.correctActions);
  const dangerous = new Set(ticket.dangerousActions);

  if (els.categorySelect.value === ticket.category) {
    score += 16;
    notes.push(`Category is correct: ${ticket.category}.`);
  } else {
    notes.push(`Category should be ${ticket.category}.`);
  }

  if (els.prioritySelect.value === ticket.priority) {
    score += 16;
    notes.push(`Priority is correct: ${ticket.priority}.`);
  } else {
    notes.push(`Priority should be ${ticket.priority} based on scope and urgency.`);
  }

  if (activeTone === "professional") {
    score += 10;
    notes.push("Tone is clear, calm, and professional.");
  } else if (activeTone === "too_fast") {
    score += 4;
    notes.push("Fast is good, but support replies still need context and expectations.");
  } else {
    score += 2;
    notes.push("Casual tone can feel careless when the user is stressed.");
  }

  selected.forEach((actionId, index) => {
    if (correct.has(actionId)) {
      score += 10;
    } else if (dangerous.has(actionId)) {
      score -= 15;
      notes.push(`Risky action: ${actionCatalog[actionId].label}.`);
    } else {
      score -= 5;
      notes.push(`Low-value action: ${actionCatalog[actionId].label}.`);
    }

    if (index === 0 && actionId === ticket.preferredFirst) {
      score += 6;
      notes.push(`Strong opening move: ${actionCatalog[actionId].label}.`);
    }
  });

  ticket.correctActions.forEach((actionId) => {
    if (!selectedActions.has(actionId)) {
      score -= 6;
      notes.push(`Missed step: ${actionCatalog[actionId].label}.`);
    }
  });

  if (!selected.length) {
    score -= 12;
    notes.push("A real ticket needs visible action, not just classification.");
  }

  const elapsedSeconds = Math.round((Date.now() - ticketStartedAt) / 1000);
  if (mode === "speedrun" && elapsedSeconds <= 60) {
    score += 5;
    notes.push("Speedrun bonus earned.");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    notes,
    selected,
  };
}

function submitTicket() {
  if (submitted) {
    return;
  }

  const ticket = tickets[activeTicketIndex];
  const result = evaluateTicket(ticket);
  submitted = true;
  els.submitTicketBtn.disabled = true;

  progress.xp += Math.max(5, result.score);
  progress.solved += 1;
  progress.best = Math.max(progress.best, result.score);
  progress.scores.push(result.score);
  progress.scores = progress.scores.slice(-20);
  ticket.skills.forEach((skill) => {
    const previous = progress.skills[skill] || 0;
    progress.skills[skill] = Math.min(100, previous + Math.max(4, result.score / 12));
  });
  progress.evidence.unshift({
    ticketId: ticket.id,
    title: ticket.title,
    score: result.score,
    summary: `${ticket.title}: scored ${result.score}/100 while practicing ${ticket.skills.join(", ")}.`,
    interviewPrompt: `Tell me about a ${ticket.category.toLowerCase()} ticket where you had to balance urgency and safe process. Use ${ticket.title} as your example.`,
    createdAt: new Date().toISOString(),
  });
  progress.evidence = progress.evidence.slice(0, 20);
  saveProgress();

  els.scoreValue.textContent = result.score;
  els.resultTitle.textContent = result.score >= 80 ? "Job-ready resolution" : result.score >= 55 ? "Good instincts, clean it up" : "Retry this workflow";
  els.resultSummary.textContent = ticket.outcome;
  els.coachList.replaceChildren();

  result.notes.slice(0, 6).forEach((note) => {
    els.coachList.append(createTextElement("li", note));
  });

  els.resultPanel.hidden = false;
  renderOutcomeLab(ticket, result);
  renderStats();
  renderActions(ticket);
}

function chooseNextTicket() {
  const nextIndex = (activeTicketIndex + 1) % tickets.length;
  loadTicket(nextIndex);
}

function chooseRandomTicket() {
  if (tickets.length <= 1) {
    loadTicket(0);
    return;
  }

  let nextIndex = activeTicketIndex;
  while (nextIndex === activeTicketIndex) {
    nextIndex = Math.floor(Math.random() * tickets.length);
  }
  loadTicket(nextIndex);
}

function updateSla() {
  const ticket = tickets[activeTicketIndex];
  const totalSeconds = ticket.slaMinutes * 60;
  const elapsedSeconds = Math.floor((Date.now() - ticketStartedAt) / 1000);
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  els.slaPill.textContent = `SLA ${minutes}:${seconds}`;
}

function copyCreatorScript() {
  const ticket = tickets[activeTicketIndex];
  const beats = Array.from(els.clipBeats.querySelectorAll("li")).map((li, index) => `${index + 1}. ${li.textContent}`);
  const script = [`Hook: ${ticket.socialHook}`, "", "Beats:", ...beats, "", "CTA: Follow for the next real service desk ticket."].join("\n");

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(script)
      .then(() => {
        els.copyStatus.textContent = "Clip script copied.";
      })
      .catch(() => {
        els.copyStatus.textContent = script;
      });
  } else {
    els.copyStatus.textContent = script;
  }
}

function copyEvidence() {
  const fallback = lastEvidenceText || "Complete a ticket first to create a job evidence entry.";

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(fallback)
      .then(() => {
        els.copyEvidenceBtn.textContent = "Copied";
        setTimeout(() => {
          els.copyEvidenceBtn.textContent = "Copy Evidence";
        }, 1600);
      })
      .catch(() => {
        els.evidenceLog.textContent = fallback;
      });
  } else {
    els.evidenceLog.textContent = fallback;
  }
}

async function loadPaymentConfig() {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) {
      throw new Error("Payment server unavailable");
    }
    const config = await response.json();
    paymentsReady = Boolean(config.paymentsReady);
    els.waitlistStatus.textContent = paymentsReady
      ? "Stripe test checkout is ready. Enter email to start Pro."
      : "Stripe backend is running, but .env needs STRIPE_SECRET_KEY and STRIPE_PRICE_ID.";
    if (proActive) {
      els.waitlistStatus.textContent = "Pro is active on this device.";
    }
  } catch {
    paymentsReady = false;
    els.waitlistStatus.textContent = "Static demo mode. Start the Node server to enable Stripe Checkout.";
  }
}

function showCheckoutReturnStatus() {
  const params = new URLSearchParams(window.location.search);
  const checkout = params.get("checkout");
  const sessionId = params.get("session_id");
  if (checkout === "success") {
    els.waitlistStatus.textContent = "Checkout completed. Pro unlocks after the Stripe webhook confirms the subscription.";
    confirmCheckoutSession(sessionId);
    els.proDashboard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (checkout === "cancelled") {
    els.waitlistStatus.textContent = "Checkout was cancelled. You can restart Pro whenever you are ready.";
  }
}

async function confirmCheckoutSession(sessionId) {
  if (!sessionId) {
    return;
  }

  els.waitlistStatus.textContent = "Checkout completed. Confirming Pro access...";
  try {
    const response = await fetch("/api/confirm-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const entitlement = await response.json();

    if (!response.ok) {
      throw new Error(entitlement.error || "Could not confirm checkout session.");
    }

    const email = entitlement.email || localStorage.getItem("ticketReadyLastEmail") || "";
    setProState(entitlement, email);
    els.waitlistStatus.textContent = entitlement.active
      ? "Pro is active. Your Job Evidence Lab and interview drills are unlocked."
      : `Checkout confirmed. Subscription status: ${entitlement.status}.`;
  } catch (error) {
    els.waitlistStatus.textContent = error.message;
  }
}

async function handleWaitlist(event) {
  event.preventDefault();
  const email = els.emailInput.value.trim();

  if (!email || !email.includes("@")) {
    els.waitlistStatus.textContent = "Enter a valid email for the demo waitlist.";
    return;
  }

  const saved = JSON.parse(localStorage.getItem("ticketReadyWaitlist") || "[]");
  if (!saved.includes(email)) {
    saved.push(email);
  }
  localStorage.setItem("ticketReadyWaitlist", JSON.stringify(saved));
  localStorage.setItem("ticketReadyLastEmail", email);

  if (!paymentsReady) {
    els.waitlistStatus.textContent = "Email saved locally. Add Stripe keys to .env, then restart the server to enable checkout.";
    return;
  }

  els.waitlistStatus.textContent = "Opening secure Stripe Checkout...";
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Checkout failed");
    }
    window.location.assign(payload.url);
  } catch (error) {
    els.waitlistStatus.textContent = error.message;
  }
}

async function checkProStatus() {
  const email = els.emailInput.value.trim() || localStorage.getItem("ticketReadyLastEmail") || "";
  if (!email || !email.includes("@")) {
    els.waitlistStatus.textContent = "Enter the subscriber email first, then check Pro status.";
    return;
  }

  localStorage.setItem("ticketReadyLastEmail", email);
  els.waitlistStatus.textContent = "Checking Pro status...";

  try {
    let response = await fetch(`/api/entitlements?email=${encodeURIComponent(email)}`);
    let entitlement = await response.json();

    if (!entitlement.active && paymentsReady) {
      response = await fetch("/api/sync-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      entitlement = await response.json();
    }

    if (!response.ok) {
      throw new Error(entitlement.error || "Could not check Pro status.");
    }

    setProState(entitlement, email);
    els.waitlistStatus.textContent = entitlement.active
      ? `Pro is active for ${email}.`
      : `No active Pro subscription found for ${email}. Status: ${entitlement.status}.`;
  } catch (error) {
    els.waitlistStatus.textContent = error.message;
  }
}

async function checkStoredProStatus() {
  const email = localStorage.getItem("ticketReadyLastEmail");
  if (!email || !paymentsReady) {
    renderProState(email || "");
    return;
  }

  try {
    const response = await fetch(`/api/entitlements?email=${encodeURIComponent(email)}`);
    const entitlement = await response.json();
    if (response.ok) {
      setProState(entitlement, email);
      if (entitlement.active) {
        els.waitlistStatus.textContent = "Pro is active on this device.";
      }
    }
  } catch {
    renderProState(email);
  }
}

async function manageBilling() {
  const email = els.emailInput.value.trim() || localStorage.getItem("ticketReadyLastEmail") || "";
  if (!email || !email.includes("@")) {
    els.waitlistStatus.textContent = "Enter the subscriber email first, then manage billing.";
    return;
  }

  els.waitlistStatus.textContent = "Opening Stripe billing portal...";
  try {
    const response = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Billing portal failed");
    }
    window.location.assign(payload.url);
  } catch (error) {
    els.waitlistStatus.textContent = error.message;
  }
}

function bindEvents() {
  els.submitTicketBtn.addEventListener("click", submitTicket);
  els.nextTicketBtn.addEventListener("click", chooseNextTicket);
  els.randomTicketBtn.addEventListener("click", chooseRandomTicket);
  els.copyClipBtn.addEventListener("click", copyCreatorScript);
  els.copyEvidenceBtn.addEventListener("click", copyEvidence);
  els.waitlistForm.addEventListener("submit", handleWaitlist);
  els.checkProBtn.addEventListener("click", checkProStatus);
  els.manageBillingBtn.addEventListener("click", manageBilling);

  els.startShiftBtn.addEventListener("click", () => {
    document.querySelector(".training-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.creatorModeBtn.addEventListener("click", () => {
    document.querySelector(".creator-panel").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  els.previewProBtn.addEventListener("click", () => {
    document.querySelector(".value-lab").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  els.dashboardPrimaryBtn.addEventListener("click", () => {
    if (proActive) {
      document.querySelector(".training-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    document.querySelector(".subscription-panel").scrollIntoView({ behavior: "smooth", block: "center" });
    els.emailInput.focus();
  });

  els.replyTone.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tone]");
    if (!button || submitted) {
      return;
    }
    activeTone = button.dataset.tone;
    els.replyTone.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("is-active"));
    button.classList.add("is-active");
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.mode;
      document.querySelectorAll("[data-mode]").forEach((tab) => tab.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });
}

bindEvents();
renderStats();
loadTicket(0);
renderProState();
loadPaymentConfig().then(() => {
  showCheckoutReturnStatus();
  checkStoredProStatus();
});
setInterval(updateSla, 1000);
