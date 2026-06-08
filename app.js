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

const proTicketTemplates = [
  {
    id: "SD-1604",
    title: "Executive locked out before board call",
    requester: "Nora V.",
    role: "Executive assistant",
    company: "Cobalt Finance",
    channel: "Phone",
    asset: "Okta + Microsoft 365",
    slaMinutes: 15,
    category: "Access",
    priority: "P2",
    customerNote: "The CFO is locked out after too many attempts and has a board call in 20 minutes. She changed phones last week and is getting impatient.",
    signals: ["executive impact", "deadline risk", "identity control"],
    kb: ["Executive urgency does not remove identity verification.", "Account lockouts with business deadline are usually P2.", "Document reset, MFA status, and user confirmation."],
    correctActions: ["verify_identity", "reset_password", "reset_mfa", "confirm_with_user"],
    preferredFirst: "verify_identity",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["verify_identity", "reset_password", "reset_mfa", "bypass_mfa", "ask_impact", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Identity", "SLA", "Communication"],
    outcome: "Best path: verify identity, clear the lockout, reset or re-enroll MFA if approved, confirm access, and document the urgency and controls used.",
    socialHook: "The CFO is locked out before a board call. Would you move fast or stay secure?",
  },
  {
    id: "SD-1628",
    title: "Sales team reports CRM outage",
    requester: "Marcus J.",
    role: "Sales director",
    company: "ForgeWorks",
    channel: "Teams",
    asset: "CRM web app",
    slaMinutes: 20,
    category: "Incident",
    priority: "P1",
    customerNote: "Nobody on the sales floor can load the CRM. We have quotes due today and the page keeps timing out for everyone.",
    signals: ["many users", "revenue impact", "service outage"],
    kb: ["Multiple users with revenue impact can be P1.", "Check service health before local troubleshooting.", "Escalate with scope, timestamps, and sample affected users."],
    correctActions: ["ask_impact", "check_status", "collect_logs", "escalate_network"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reset_password", "close_without_confirmation"],
    actionPool: ["ask_impact", "check_status", "collect_logs", "escalate_network", "reset_password", "remote_session", "document_resolution", "close_without_confirmation"],
    skills: ["SLA", "Escalation", "SaaS"],
    outcome: "Best path: confirm scope and business impact, check CRM service status, collect timing and sample users, then escalate with a clear outage packet.",
    socialHook: "A whole sales floor loses CRM access. This is where help desk triage gets real.",
  },
  {
    id: "SD-1652",
    title: "Shared mailbox access missing",
    requester: "Elena P.",
    role: "Clinic supervisor",
    company: "Brightline Health",
    channel: "Portal",
    asset: "Microsoft 365 shared mailbox",
    slaMinutes: 80,
    category: "Service Request",
    priority: "P3",
    customerNote: "Two new schedulers cannot see the front desk shared mailbox. Their manager says they should have the same access as the rest of the team.",
    signals: ["new users", "approval needed", "standard access"],
    kb: ["Shared mailbox changes require manager approval or onboarding ticket.", "Use the approved group, not direct one-off permissions when possible.", "Confirm mailbox appears after access propagates."],
    correctActions: ["get_manager_approval", "assign_license", "confirm_with_user", "document_resolution"],
    preferredFirst: "get_manager_approval",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["get_manager_approval", "assign_license", "verify_identity", "reset_password", "bypass_mfa", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Access", "SaaS", "Documentation"],
    outcome: "Best path: confirm approval, add users through the approved access group, wait for propagation, verify mailbox visibility, and document the change.",
    socialHook: "A shared mailbox request sounds easy until permissions and approvals matter.",
  },
  {
    id: "SD-1680",
    title: "Suspicious QR code login page",
    requester: "Dylan S.",
    role: "Warehouse coordinator",
    company: "Civic Retail",
    channel: "Chat",
    asset: "Email security",
    slaMinutes: 18,
    category: "Security",
    priority: "P2",
    customerNote: "I scanned a QR code from an email and it opened a Microsoft login page. I closed it before typing my password, but the sender looked real.",
    signals: ["possible phishing", "QR code", "no credentials entered"],
    kb: ["QR phishing should be treated as suspicious even without credential entry.", "Quarantine the message and collect headers.", "Coach the user and document whether credentials were entered."],
    correctActions: ["quarantine_email", "collect_logs", "educate_user", "document_resolution"],
    preferredFirst: "quarantine_email",
    dangerousActions: ["ignore_security", "close_without_confirmation"],
    actionPool: ["quarantine_email", "collect_logs", "reset_password", "ignore_security", "educate_user", "document_resolution", "remote_session", "close_without_confirmation"],
    skills: ["Security", "Communication", "Documentation"],
    outcome: "Best path: quarantine the email, collect headers and URL evidence, confirm no credentials were entered, coach the user, and document containment.",
    socialHook: "QR-code phishing is sneaky. The user did one thing right: they reported it.",
  },
  {
    id: "SD-1701",
    title: "VPN works on hotspot but not home Wi-Fi",
    requester: "Tanya L.",
    role: "Claims analyst",
    company: "Harbor Energy",
    channel: "Phone",
    asset: "GlobalProtect VPN",
    slaMinutes: 40,
    category: "Network",
    priority: "P3",
    customerNote: "VPN connects when I use my phone hotspot, but at home Wi-Fi it fails with a portal error. I can work for now, but I need my normal setup fixed.",
    signals: ["single user", "workaround exists", "network clue"],
    kb: ["A working hotspot suggests local network or DNS issue.", "Collect client version, error, and home network details.", "Escalate only after basic VPN checks and logs."],
    correctActions: ["ask_impact", "test_vpn", "collect_logs", "document_resolution"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["ask_impact", "test_vpn", "collect_logs", "check_status", "reboot_server", "reset_password", "document_resolution", "close_without_confirmation"],
    skills: ["Network", "Troubleshooting", "Documentation"],
    outcome: "Best path: confirm workaround and impact, test VPN settings, collect logs and error details, then document local-network evidence or escalate with facts.",
    socialHook: "VPN fails on home Wi-Fi but works on hotspot. That clue changes the whole ticket.",
  },
  {
    id: "SD-1724",
    title: "Teams audio fails before interview panel",
    requester: "Jae M.",
    role: "Recruiting lead",
    company: "Northstar Foods",
    channel: "Teams",
    asset: "Windows laptop + Teams",
    slaMinutes: 25,
    category: "Incident",
    priority: "P2",
    customerNote: "My Teams audio is not detecting my headset and I have an interview panel in 30 minutes. The headset works on my phone.",
    signals: ["deadline risk", "single device", "workaround clue"],
    kb: ["Meeting-impact audio issues can be P2 when deadline is near.", "Check Teams device settings, Windows input/output, and driver status.", "Confirm with a test call before closing."],
    correctActions: ["remote_session", "search_kb", "confirm_with_user", "document_resolution"],
    preferredFirst: "remote_session",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["remote_session", "search_kb", "collect_logs", "reset_password", "reboot_server", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Windows", "Troubleshooting", "Communication"],
    outcome: "Best path: remote in with consent, check Teams and Windows audio settings, apply the approved driver/device fix, run a test call, and document.",
    socialHook: "A headset dies before an interview panel. The fix starts with the simplest checks.",
  },
  {
    id: "SD-1756",
    title: "Badge printer jams after driver update",
    requester: "Rina F.",
    role: "Facilities coordinator",
    company: "Atlas Supply",
    channel: "Portal",
    asset: "ID badge printer",
    slaMinutes: 55,
    category: "Hardware",
    priority: "P3",
    customerNote: "The badge printer started jamming after yesterday's driver update. We can print visitor badges at the security desk, but onboarding is slower.",
    signals: ["single device", "workaround exists", "driver update clue"],
    kb: ["Check physical media path before blaming drivers.", "Use known-good driver rollback only after confirming update history.", "Confirm a successful test badge."],
    correctActions: ["ask_impact", "search_kb", "confirm_with_user", "document_resolution"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["ask_impact", "search_kb", "remote_session", "collect_logs", "reboot_server", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Hardware", "Troubleshooting", "Documentation"],
    outcome: "Best path: confirm impact and workaround, check jam/media basics, compare driver history against the KB, print a test badge, and document.",
    socialHook: "Not every printer problem is a network problem. This one has a driver clue.",
  },
  {
    id: "SD-1783",
    title: "New laptop missing encryption status",
    requester: "Caleb N.",
    role: "IT asset tech",
    company: "Cobalt Finance",
    channel: "Portal",
    asset: "Windows laptop",
    slaMinutes: 120,
    category: "Security",
    priority: "P3",
    customerNote: "A new laptop shows as not encrypted in the device dashboard. The user is remote and scheduled to receive client files this afternoon.",
    signals: ["security control", "single device", "client data risk"],
    kb: ["Device encryption gaps require evidence before closing.", "Collect device ID, last check-in, and encryption state.", "Escalate endpoint security if policy will not apply."],
    correctActions: ["collect_logs", "check_status", "escalate_network", "document_resolution"],
    preferredFirst: "collect_logs",
    dangerousActions: ["ignore_security", "close_without_confirmation"],
    actionPool: ["collect_logs", "check_status", "remote_session", "ignore_security", "escalate_network", "document_resolution", "confirm_with_user", "close_without_confirmation"],
    skills: ["Security", "Windows", "Escalation"],
    outcome: "Best path: collect device facts and dashboard status, force/check policy sync if approved, escalate endpoint security with evidence, and document risk handling.",
    socialHook: "A laptop says encryption is off before client files arrive. That is not a close-and-hope ticket.",
  },
  {
    id: "SD-1810",
    title: "Finance user needs urgent ERP role",
    requester: "Mei H.",
    role: "Controller",
    company: "ForgeWorks",
    channel: "Phone",
    asset: "ERP permissions",
    slaMinutes: 50,
    category: "Access",
    priority: "P2",
    customerNote: "A finance analyst needs invoice approval rights today because month-end close is blocked. Their manager is traveling but sent a quick Teams message approving it.",
    signals: ["approval ambiguity", "financial access", "deadline risk"],
    kb: ["Financial system access requires approved workflow or manager approval record.", "Use least-privilege role matching the task.", "Document approval source and role assigned."],
    correctActions: ["get_manager_approval", "assign_license", "confirm_with_user", "document_resolution"],
    preferredFirst: "get_manager_approval",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["get_manager_approval", "assign_license", "verify_identity", "bypass_mfa", "reset_password", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Access", "SaaS", "SLA"],
    outcome: "Best path: capture/validate approval, assign the least-privilege ERP role, confirm access works, and document the approval and entitlement.",
    socialHook: "Month-end close is blocked. Would you grant finance access from a Teams message?",
  },
  {
    id: "SD-1842",
    title: "Password reset request from personal email",
    requester: "Unknown sender",
    role: "Claims analyst",
    company: "Harbor Energy",
    channel: "Email",
    asset: "Identity provider",
    slaMinutes: 35,
    category: "Security",
    priority: "P2",
    customerNote: "Hi, I lost access to my work email and need a password reset. Please send a reset link to this Gmail address.",
    signals: ["identity risk", "personal email", "account access"],
    kb: ["Never reset credentials based only on personal email.", "Use approved identity verification path.", "Escalate suspicious reset requests if verification fails."],
    correctActions: ["verify_identity", "ask_impact", "document_resolution", "educate_user"],
    preferredFirst: "verify_identity",
    dangerousActions: ["reset_password", "bypass_mfa"],
    actionPool: ["verify_identity", "ask_impact", "reset_password", "bypass_mfa", "educate_user", "document_resolution", "close_without_confirmation", "collect_logs"],
    skills: ["Identity", "Security", "Communication"],
    outcome: "Best path: refuse shortcut reset, route through approved identity verification, document the request, and coach the user on the secure recovery path.",
    socialHook: "A password reset request comes from Gmail. Helpful and secure are not the same thing.",
  },
  {
    id: "SD-1866",
    title: "Conference room display blank",
    requester: "Alicia D.",
    role: "Office manager",
    company: "Northstar Foods",
    channel: "Walk-up",
    asset: "Conference room AV",
    slaMinutes: 30,
    category: "Hardware",
    priority: "P2",
    customerNote: "The boardroom screen is blank and leadership has a vendor presentation in 25 minutes. The laptop detects the display but nothing shows.",
    signals: ["meeting deadline", "single room", "hardware path"],
    kb: ["Meeting-room issues near executive sessions can be P2.", "Check input source, cable, adapter, and display detection.", "Confirm with the presenter's laptop before closing."],
    correctActions: ["ask_impact", "remote_session", "confirm_with_user", "document_resolution"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["ask_impact", "remote_session", "search_kb", "reboot_server", "assign_license", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Hardware", "Communication", "SLA"],
    outcome: "Best path: confirm deadline and room scope, check input/cable/adapter basics, test the presenter's laptop, confirm display output, and document.",
    socialHook: "The boardroom display dies before a vendor presentation. Time pressure changes priority.",
  },
  {
    id: "SD-1894",
    title: "User cannot access payroll after name change",
    requester: "Sofia G.",
    role: "HR generalist",
    company: "Brightline Health",
    channel: "Portal",
    asset: "Payroll + SSO",
    slaMinutes: 75,
    category: "Access",
    priority: "P3",
    customerNote: "An employee's legal name changed last week. Email works, but payroll says the account does not match. They need paystub access today.",
    signals: ["identity data mismatch", "single user", "HR system"],
    kb: ["Name changes can create app attribute mismatch.", "Validate HR source record before editing app access.", "Confirm payroll login and document attribute sync."],
    correctActions: ["verify_identity", "search_kb", "confirm_with_user", "document_resolution"],
    preferredFirst: "verify_identity",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["verify_identity", "search_kb", "assign_license", "bypass_mfa", "reset_password", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Identity", "SaaS", "Documentation"],
    outcome: "Best path: verify the request and HR source data, follow the attribute sync KB, confirm payroll access, and document the identity change handling.",
    socialHook: "A name change breaks payroll login. This is identity work, not just a password reset.",
  },
  {
    id: "SD-1912",
    title: "Branch office phones offline",
    requester: "Owen B.",
    role: "Branch manager",
    company: "Atlas Supply",
    channel: "Phone",
    asset: "VoIP phones",
    slaMinutes: 15,
    category: "Network",
    priority: "P1",
    customerNote: "Every desk phone in the branch says network unavailable. Internet is working on laptops, but customers cannot reach the front desk.",
    signals: ["many users", "customer contact", "network dependency"],
    kb: ["Voice outage affecting a branch can be P1.", "Collect scope, switch/phone symptoms, and timestamp.", "Escalate to network/voice with business impact."],
    correctActions: ["ask_impact", "check_status", "collect_logs", "escalate_network"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reset_password", "close_without_confirmation"],
    actionPool: ["ask_impact", "check_status", "collect_logs", "escalate_network", "reset_password", "reboot_server", "document_resolution", "close_without_confirmation"],
    skills: ["Network", "Escalation", "SLA"],
    outcome: "Best path: confirm branch-wide voice impact, check voice status, gather symptoms and timestamps, then escalate with customer impact clearly documented.",
    socialHook: "The internet works, but every desk phone is down. Would you call it P1?",
  },
  {
    id: "SD-1930",
    title: "Endpoint alert after browser extension install",
    requester: "Security alert",
    role: "Automated detection",
    company: "Cobalt Finance",
    channel: "Portal",
    asset: "Endpoint security",
    slaMinutes: 12,
    category: "Security",
    priority: "P1",
    customerNote: "Endpoint security flagged a browser extension install on a finance laptop. The alert says credential access behavior observed.",
    signals: ["security alert", "finance device", "credential risk"],
    kb: ["High-risk endpoint alerts require containment first.", "Collect alert ID, device, user, and timeline.", "Escalate security incidents with containment status."],
    correctActions: ["collect_logs", "quarantine_email", "escalate_network", "document_resolution"],
    preferredFirst: "collect_logs",
    dangerousActions: ["ignore_security", "close_without_confirmation"],
    actionPool: ["collect_logs", "quarantine_email", "ignore_security", "escalate_network", "remote_session", "document_resolution", "educate_user", "close_without_confirmation"],
    skills: ["Security", "Escalation", "SLA"],
    outcome: "Best path: collect alert evidence, contain the endpoint per policy, escalate to security with timeline and device facts, and document containment.",
    socialHook: "A finance laptop triggers credential-access behavior. This is where containment beats curiosity.",
  },
  {
    id: "SD-1955",
    title: "OneDrive sync stuck for legal folder",
    requester: "Imani K.",
    role: "Legal assistant",
    company: "Civic Retail",
    channel: "Chat",
    asset: "OneDrive",
    slaMinutes: 60,
    category: "Incident",
    priority: "P3",
    customerNote: "OneDrive has been stuck syncing a legal folder all morning. I can open files online, but local edits are not uploading.",
    signals: ["single user", "workaround exists", "data sync"],
    kb: ["Confirm web access before local sync repair.", "Check sync client status, path length, and storage errors.", "Confirm file sync after repair before closing."],
    correctActions: ["ask_impact", "search_kb", "confirm_with_user", "document_resolution"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["ask_impact", "search_kb", "collect_logs", "remote_session", "reboot_server", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["SaaS", "Windows", "Troubleshooting"],
    outcome: "Best path: confirm workaround and impact, inspect sync status with the KB, apply approved repair, verify upload, and document.",
    socialHook: "OneDrive sync is stuck, but web access works. That workaround changes the priority.",
  },
  {
    id: "SD-1988",
    title: "Guest Wi-Fi down for training event",
    requester: "Hector R.",
    role: "Training coordinator",
    company: "ForgeWorks",
    channel: "Teams",
    asset: "Guest Wi-Fi",
    slaMinutes: 20,
    category: "Network",
    priority: "P2",
    customerNote: "External trainees cannot join guest Wi-Fi in room 4B. Employee Wi-Fi works. The class starts in 30 minutes.",
    signals: ["external users", "event deadline", "network segmentation"],
    kb: ["Guest Wi-Fi issues can be P2 when an event is blocked.", "Check service status and scope before changing network settings.", "Escalate with SSID, room, time, and affected devices."],
    correctActions: ["ask_impact", "check_status", "test_vpn", "escalate_network"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reset_password", "close_without_confirmation"],
    actionPool: ["ask_impact", "check_status", "test_vpn", "collect_logs", "escalate_network", "reset_password", "document_resolution", "close_without_confirmation"],
    skills: ["Network", "Escalation", "Communication"],
    outcome: "Best path: confirm event impact and scope, check guest network status, test from the room, escalate with SSID/location/time facts, and communicate workaround options.",
    socialHook: "Guest Wi-Fi fails before a class. Not all network tickets are equal.",
  },
  {
    id: "SD-2014",
    title: "Manager wants departed user mailbox",
    requester: "Graham T.",
    role: "Operations manager",
    company: "Northstar Foods",
    channel: "Portal",
    asset: "Microsoft 365 mailbox",
    slaMinutes: 120,
    category: "Access",
    priority: "P3",
    customerNote: "My former team member left yesterday. I need access to their mailbox today to find customer emails.",
    signals: ["departed user", "approval required", "mailbox access"],
    kb: ["Departed-user mailbox access requires HR/legal or manager approval workflow.", "Use delegated access or eDiscovery process per policy.", "Document approval and access duration."],
    correctActions: ["get_manager_approval", "assign_license", "document_resolution", "confirm_with_user"],
    preferredFirst: "get_manager_approval",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["get_manager_approval", "assign_license", "verify_identity", "bypass_mfa", "reset_password", "document_resolution", "confirm_with_user", "close_without_confirmation"],
    skills: ["Access", "Documentation", "Security"],
    outcome: "Best path: verify the approved offboarding/mailbox workflow, grant the correct delegated access if approved, confirm access, and document duration and approval.",
    socialHook: "A manager asks for a departed user's mailbox. Helpful support still follows policy.",
  },
  {
    id: "SD-2047",
    title: "Blue screen during client presentation",
    requester: "Victor A.",
    role: "Account manager",
    company: "Harbor Energy",
    channel: "Phone",
    asset: "Windows laptop",
    slaMinutes: 20,
    category: "Incident",
    priority: "P2",
    customerNote: "My laptop blue-screened twice during a client presentation. I am on a loaner now, but I need the files and my main laptop stable before the follow-up at 2 PM.",
    signals: ["client deadline", "workaround exists", "repeat crash"],
    kb: ["Repeat crashes before customer meetings can be P2.", "Collect stop code and update history.", "Use loaner/workaround while investigating stability."],
    correctActions: ["collect_logs", "search_kb", "confirm_with_user", "document_resolution"],
    preferredFirst: "collect_logs",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["collect_logs", "search_kb", "remote_session", "reset_password", "reboot_server", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Windows", "SLA", "Troubleshooting"],
    outcome: "Best path: preserve the workaround, collect crash evidence, follow the approved rollback/repair path, confirm stability or escalate with stop codes, and document.",
    socialHook: "A laptop crashes mid-client presentation. The workaround matters as much as the fix.",
  },
  {
    id: "SD-2070",
    title: "Inventory scanner cannot sign in",
    requester: "Paula W.",
    role: "Warehouse supervisor",
    company: "Civic Retail",
    channel: "Walk-up",
    asset: "Android inventory scanner",
    slaMinutes: 45,
    category: "Hardware",
    priority: "P2",
    customerNote: "The scanner for aisle 7 cannot sign into the inventory app. Other scanners work, but this aisle handles same-day orders.",
    signals: ["one device", "operations impact", "workaround exists"],
    kb: ["Single scanner issues with operations impact are often P2.", "Check device network, app version, and assigned user.", "Confirm inventory scan succeeds before closing."],
    correctActions: ["ask_impact", "remote_session", "confirm_with_user", "document_resolution"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["ask_impact", "remote_session", "reset_password", "search_kb", "reboot_server", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Hardware", "Access", "Troubleshooting"],
    outcome: "Best path: confirm operational impact, check scanner app/network/account basics, test a successful scan, and document the device-specific fix.",
    socialHook: "One scanner is down, but same-day orders depend on it. Priority is about impact.",
  },
  {
    id: "SD-2099",
    title: "User reports impossible travel sign-in",
    requester: "Identity alert",
    role: "Automated detection",
    company: "Brightline Health",
    channel: "Portal",
    asset: "Identity provider",
    slaMinutes: 10,
    category: "Security",
    priority: "P1",
    customerNote: "Identity protection flagged a successful sign-in from another country five minutes after a local sign-in. The user is currently in clinic.",
    signals: ["identity alert", "possible compromise", "active session"],
    kb: ["Impossible travel with successful sign-in requires rapid containment.", "Verify user context, revoke sessions, and reset credentials per policy.", "Document containment and escalate security."],
    correctActions: ["verify_identity", "reset_password", "reset_mfa", "document_resolution"],
    preferredFirst: "verify_identity",
    dangerousActions: ["ignore_security", "close_without_confirmation"],
    actionPool: ["verify_identity", "reset_password", "reset_mfa", "ignore_security", "collect_logs", "document_resolution", "educate_user", "close_without_confirmation"],
    skills: ["Identity", "Security", "SLA"],
    outcome: "Best path: verify the user, contain the account by revoking/resetting per policy, re-enroll MFA if needed, escalate security, and document the timeline.",
    socialHook: "Impossible travel sign-in alert. This is the kind of ticket that needs speed and discipline.",
  },
  {
    id: "SD-2123",
    title: "License limit blocks design team",
    requester: "Marta E.",
    role: "Creative director",
    company: "Cobalt Finance",
    channel: "Portal",
    asset: "Adobe licenses",
    slaMinutes: 90,
    category: "Service Request",
    priority: "P3",
    customerNote: "Two designers cannot open Adobe apps because we hit a license limit. They need access for a campaign review tomorrow morning.",
    signals: ["license capacity", "team deadline", "approval needed"],
    kb: ["License increases require approval or reclaim from inactive users.", "Check assignment group and available seats.", "Confirm app launch after assignment."],
    correctActions: ["get_manager_approval", "assign_license", "confirm_with_user", "document_resolution"],
    preferredFirst: "get_manager_approval",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["get_manager_approval", "assign_license", "search_kb", "bypass_mfa", "reset_password", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["SaaS", "Access", "Documentation"],
    outcome: "Best path: validate approval, check seat availability or reclaim process, assign licenses through the approved group, confirm app launch, and document.",
    socialHook: "The design team hits a license limit. The answer is not just 'buy more seats.'",
  },
  {
    id: "SD-2148",
    title: "Shared drive slow for one department",
    requester: "Nikhil B.",
    role: "Engineering manager",
    company: "Atlas Supply",
    channel: "Teams",
    asset: "File share",
    slaMinutes: 35,
    category: "Network",
    priority: "P2",
    customerNote: "Engineering says the shared drive is painfully slow, but other departments seem okay. They are trying to release drawings before noon.",
    signals: ["department impact", "deadline risk", "file share"],
    kb: ["Department-specific slowness needs scope and sample paths.", "Collect timestamps, affected users, and network location.", "Escalate storage/network with evidence."],
    correctActions: ["ask_impact", "collect_logs", "check_status", "escalate_network"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["ask_impact", "collect_logs", "check_status", "escalate_network", "reboot_server", "reset_password", "document_resolution", "close_without_confirmation"],
    skills: ["Network", "Escalation", "Troubleshooting"],
    outcome: "Best path: confirm scope and deadline, collect sample users/paths/timestamps, check service status, then escalate with evidence if not a local issue.",
    socialHook: "Only engineering says the file share is slow. Scope is the clue.",
  },
  {
    id: "SD-2175",
    title: "Calendar delegate permissions wrong",
    requester: "Lana C.",
    role: "Administrative assistant",
    company: "Harbor Energy",
    channel: "Chat",
    asset: "Outlook calendar",
    slaMinutes: 70,
    category: "Service Request",
    priority: "P3",
    customerNote: "I can view the VP's calendar but cannot create meetings. I should have editor access like the previous assistant.",
    signals: ["delegated access", "approval needed", "role change"],
    kb: ["Calendar delegate permissions require owner or manager approval.", "Use the documented permission level, not broad mailbox access.", "Confirm the delegate can create a test meeting."],
    correctActions: ["get_manager_approval", "assign_license", "confirm_with_user", "document_resolution"],
    preferredFirst: "get_manager_approval",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["get_manager_approval", "assign_license", "verify_identity", "bypass_mfa", "reset_password", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Access", "SaaS", "Communication"],
    outcome: "Best path: confirm approval from the calendar owner/manager, set the right delegate permission, test meeting creation, and document.",
    socialHook: "Calendar access sounds small until you grant the wrong mailbox permission.",
  },
  {
    id: "SD-2206",
    title: "Remote employee cannot enroll device",
    requester: "Kira Y.",
    role: "New data analyst",
    company: "ForgeWorks",
    channel: "Phone",
    asset: "MDM enrollment",
    slaMinutes: 65,
    category: "Access",
    priority: "P3",
    customerNote: "My new laptop says device enrollment failed. I can log into email on the web, but company apps are blocked until enrollment works.",
    signals: ["new hire", "device enrollment", "workaround partial"],
    kb: ["MDM enrollment needs identity, license, and device compliance checks.", "Collect error code and device serial.", "Confirm compliance state before closing."],
    correctActions: ["verify_identity", "collect_logs", "confirm_with_user", "document_resolution"],
    preferredFirst: "verify_identity",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["verify_identity", "collect_logs", "assign_license", "bypass_mfa", "remote_session", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Access", "Windows", "Documentation"],
    outcome: "Best path: verify the user, collect enrollment error and device facts, correct licensing/compliance issue if approved, confirm enrollment, and document.",
    socialHook: "A new hire can use webmail but not company apps. Device enrollment is the bottleneck.",
  },
  {
    id: "SD-2231",
    title: "Payment terminal loses network",
    requester: "Omar G.",
    role: "Warehouse lead",
    company: "Civic Retail",
    channel: "Phone",
    asset: "Payment terminal",
    slaMinutes: 15,
    category: "Network",
    priority: "P1",
    customerNote: "The pickup counter payment terminal cannot connect. The line is growing and staff cannot take card payments at that station.",
    signals: ["customer-facing", "payment impact", "network device"],
    kb: ["Payment-impacting device outages can be P1.", "Check whether issue is one terminal or all terminals.", "Escalate payment/network issues with lane, device ID, and timestamp."],
    correctActions: ["ask_impact", "check_status", "collect_logs", "escalate_network"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reset_password", "close_without_confirmation"],
    actionPool: ["ask_impact", "check_status", "collect_logs", "escalate_network", "reset_password", "reboot_server", "document_resolution", "close_without_confirmation"],
    skills: ["Network", "SLA", "Escalation"],
    outcome: "Best path: confirm customer/payment impact and scope, collect terminal ID and errors, check service/network status, and escalate with urgent business context.",
    socialHook: "Card payments stop at pickup. This is how business impact sets priority.",
  },
  {
    id: "SD-2260",
    title: "User opened password-protected zip",
    requester: "Jon R.",
    role: "Accounts payable clerk",
    company: "Northstar Foods",
    channel: "Portal",
    asset: "Email security",
    slaMinutes: 15,
    category: "Security",
    priority: "P1",
    customerNote: "I opened a password-protected zip from a vendor invoice email and ran the file inside. It flashed a window and disappeared.",
    signals: ["malware risk", "attachment executed", "finance user"],
    kb: ["Executed suspicious attachments require containment.", "Collect message, attachment details, endpoint, and timeline.", "Escalate to security after containment steps."],
    correctActions: ["collect_logs", "quarantine_email", "escalate_network", "document_resolution"],
    preferredFirst: "collect_logs",
    dangerousActions: ["ignore_security", "close_without_confirmation"],
    actionPool: ["collect_logs", "quarantine_email", "ignore_security", "escalate_network", "reset_password", "educate_user", "document_resolution", "close_without_confirmation"],
    skills: ["Security", "Escalation", "Communication"],
    outcome: "Best path: contain the endpoint per policy, preserve email and attachment evidence, escalate to security with timeline, coach the user, and document.",
    socialHook: "A user ran a file from a password-protected zip. That is a high-risk security ticket.",
  },
  {
    id: "SD-2287",
    title: "Zoom room camera points at ceiling",
    requester: "Claire T.",
    role: "Office coordinator",
    company: "Brightline Health",
    channel: "Teams",
    asset: "Zoom Room",
    slaMinutes: 45,
    category: "Hardware",
    priority: "P3",
    customerNote: "The clinic conference room camera points at the ceiling after yesterday's meeting. We have a remote leadership check-in later today.",
    signals: ["room device", "meeting later", "configuration issue"],
    kb: ["Room camera issues are usually P3 unless meeting is urgent.", "Check room controller presets and camera connection.", "Confirm video framing in a test meeting."],
    correctActions: ["ask_impact", "remote_session", "confirm_with_user", "document_resolution"],
    preferredFirst: "ask_impact",
    dangerousActions: ["reboot_server", "close_without_confirmation"],
    actionPool: ["ask_impact", "remote_session", "search_kb", "reboot_server", "assign_license", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Hardware", "Troubleshooting", "Communication"],
    outcome: "Best path: confirm meeting timing, check camera presets/controller, test video framing, confirm with the requester, and document.",
    socialHook: "A conference room camera points at the ceiling. Small issue, real user experience.",
  },
  {
    id: "SD-2314",
    title: "Employee cannot access benefits portal",
    requester: "Ravi S.",
    role: "Lab technician",
    company: "Brightline Health",
    channel: "Chat",
    asset: "Benefits portal",
    slaMinutes: 90,
    category: "Access",
    priority: "P3",
    customerNote: "Open enrollment ends tomorrow and I cannot access the benefits portal. It says my account is inactive, but my company login works.",
    signals: ["deadline tomorrow", "single user", "app entitlement"],
    kb: ["Benefits portal issues near enrollment deadline require timely handling.", "Check HR eligibility feed before changing access.", "Confirm portal login and document source-system status."],
    correctActions: ["verify_identity", "search_kb", "confirm_with_user", "document_resolution"],
    preferredFirst: "verify_identity",
    dangerousActions: ["bypass_mfa", "close_without_confirmation"],
    actionPool: ["verify_identity", "search_kb", "assign_license", "reset_password", "bypass_mfa", "confirm_with_user", "document_resolution", "close_without_confirmation"],
    skills: ["Access", "SaaS", "SLA"],
    outcome: "Best path: verify the user, check HR/source eligibility against the KB, restore entitlement through the approved path, confirm login, and document.",
    socialHook: "Open enrollment ends tomorrow and the portal says inactive. Good triage protects the deadline.",
  },
];

tickets.push(...proTicketTemplates);

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

const careerGoalProfiles = {
  help_desk: {
    label: "Help Desk Analyst",
    shortLabel: "Help Desk",
    skills: ["SLA", "Documentation", "Communication", "Identity"],
    plan: "Prioritize clear triage, SLA judgment, safe identity checks, and clean ticket notes.",
    proof: "help desk readiness",
  },
  it_support: {
    label: "IT Support Specialist",
    shortLabel: "IT Support",
    skills: ["Troubleshooting", "Access", "SaaS", "Windows"],
    plan: "Prioritize practical troubleshooting, SaaS access, Windows issues, and user confirmation.",
    proof: "IT support readiness",
  },
  desktop_support: {
    label: "Desktop Support",
    shortLabel: "Desktop",
    skills: ["Hardware", "Windows", "Troubleshooting", "Communication"],
    plan: "Prioritize device intake, Windows evidence, user communication, and verified fixes.",
    proof: "desktop support readiness",
  },
  security_support: {
    label: "Security-Minded Support",
    shortLabel: "Security",
    skills: ["Security", "Identity", "Documentation", "Escalation"],
    plan: "Prioritize containment, identity safety, documentation, and escalation discipline.",
    proof: "security-minded support readiness",
  },
};

const FREE_TICKET_LIMIT = 6;

const trainingPath = [
  { day: 1, title: "Ticket Triage", focus: "Read the request, find impact, choose category.", tickets: "2 guided tickets", evidence: "Write one clean issue summary." },
  { day: 2, title: "Priority And SLA", focus: "Separate urgency from noise and set the right P-level.", tickets: "3 priority calls", evidence: "Explain one P1 vs P2 decision." },
  { day: 3, title: "Identity And MFA", focus: "Protect accounts while helping users regain access.", tickets: "2 access tickets", evidence: "Document an MFA reset safely." },
  { day: 4, title: "Password Resets", focus: "Verify identity, reset cleanly, and confirm login.", tickets: "3 access tickets", evidence: "Create a password reset script." },
  { day: 5, title: "Phishing Intake", focus: "Stay calm, contain risk, and avoid blaming the user.", tickets: "2 security tickets", evidence: "Summarize a phishing containment case." },
  { day: 6, title: "VPN Basics", focus: "Check scope, client, gateway, and error evidence.", tickets: "2 network tickets", evidence: "Build an escalation note." },
  { day: 7, title: "Week 1 Review", focus: "Retry weak tickets and improve first-action choices.", tickets: "3 mixed tickets", evidence: "Save your strongest Week 1 proof entry." },
  { day: 8, title: "Printer Queue", focus: "Troubleshoot without over-escalating.", tickets: "2 hardware tickets", evidence: "Document a verified fix." },
  { day: 9, title: "SaaS Access", focus: "Confirm approval and least-privilege role assignment.", tickets: "2 service requests", evidence: "Write an access fulfillment note." },
  { day: 10, title: "Remote Support", focus: "Get consent, observe the issue, and narrate next steps.", tickets: "2 incident tickets", evidence: "Practice a remote-session opening." },
  { day: 11, title: "Escalation Quality", focus: "Send the next team enough facts to act.", tickets: "3 escalation drills", evidence: "Write one escalation packet." },
  { day: 12, title: "Customer Tone", focus: "Be clear, calm, and specific under pressure.", tickets: "3 reply drills", evidence: "Rewrite one rushed response." },
  { day: 13, title: "Windows Crashes", focus: "Collect logs, identify clues, and avoid guesswork.", tickets: "2 Windows tickets", evidence: "Summarize a crash investigation." },
  { day: 14, title: "Week 2 Review", focus: "Raise your lowest skill and retry a missed case.", tickets: "3 mixed tickets", evidence: "Record your best interview answer." },
  { day: 15, title: "Outage Signals", focus: "Spot many-user impact and communicate status.", tickets: "2 incident tickets", evidence: "Draft an outage update." },
  { day: 16, title: "Onboarding Requests", focus: "Follow approvals, templates, and access timing.", tickets: "2 SaaS tickets", evidence: "Write a new-hire access note." },
  { day: 17, title: "Security Follow-Up", focus: "Contain, educate, document, and keep the case open.", tickets: "2 security tickets", evidence: "Write a user coaching note." },
  { day: 18, title: "Hardware Intake", focus: "Ask impact, check workarounds, and confirm test results.", tickets: "2 hardware tickets", evidence: "Build a device troubleshooting log." },
  { day: 19, title: "Knowledge Base Use", focus: "Use approved fixes before improvising.", tickets: "3 KB drills", evidence: "Summarize a KB-backed fix." },
  { day: 20, title: "SLA Pressure", focus: "Move fast while preserving safe process.", tickets: "3 speedrun tickets", evidence: "Explain how you protected quality." },
  { day: 21, title: "Week 3 Review", focus: "Collect three proof entries and compare scores.", tickets: "3 mixed tickets", evidence: "Pick your best resume bullet." },
  { day: 22, title: "Interview Stories", focus: "Turn tickets into STAR-style support stories.", tickets: "2 scored tickets", evidence: "Record one STAR answer." },
  { day: 23, title: "Ticket Documentation", focus: "Write cause, action, result, and user confirmation.", tickets: "3 documentation drills", evidence: "Polish one final resolution note." },
  { day: 24, title: "Difficult Users", focus: "Stay steady, set expectations, and avoid defensiveness.", tickets: "2 tone drills", evidence: "Rewrite a tense response." },
  { day: 25, title: "Mixed Queue Shift", focus: "Handle access, network, security, and hardware in one shift.", tickets: "4 mixed tickets", evidence: "Save two evidence entries." },
  { day: 26, title: "Escalation Interview", focus: "Explain when and why you escalated.", tickets: "2 escalation tickets", evidence: "Practice an escalation answer." },
  { day: 27, title: "Readiness Gap Day", focus: "Target your weakest skill until it improves.", tickets: "3 weak-skill tickets", evidence: "Write a before/after reflection." },
  { day: 28, title: "Mock First Shift", focus: "Run a realistic queue without guidance.", tickets: "5 speedrun tickets", evidence: "Save your top two cases." },
  { day: 29, title: "Resume Evidence", focus: "Turn scored cases into honest resume proof.", tickets: "2 review tickets", evidence: "Draft three resume bullets." },
  { day: 30, title: "Final Readiness Check", focus: "Prove consistent triage, action, and documentation.", tickets: "5 mixed tickets", evidence: "Export your final proof summary." },
];

const pathSkillMap = [
  ["SLA", "Documentation", "Communication"],
  ["SLA", "Escalation"],
  ["Identity", "Access"],
  ["Identity", "Access"],
  ["Security", "Communication"],
  ["Network", "Escalation"],
  ["Mixed"],
  ["Hardware", "Troubleshooting"],
  ["SaaS", "Access"],
  ["Communication", "Troubleshooting"],
  ["Escalation", "Network"],
  ["Communication", "Documentation"],
  ["Windows", "Troubleshooting"],
  ["Mixed"],
  ["SLA", "Escalation"],
  ["SaaS", "Access"],
  ["Security", "Documentation"],
  ["Hardware", "Troubleshooting"],
  ["Documentation", "Troubleshooting"],
  ["SLA", "Communication"],
  ["Mixed"],
  ["Communication", "Documentation"],
  ["Documentation"],
  ["Communication"],
  ["Mixed"],
  ["Escalation", "Communication"],
  ["Troubleshooting"],
  ["Mixed"],
  ["Documentation", "Communication"],
  ["Mixed"],
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
  careerGoalTitle: document.querySelector("#careerGoalTitle"),
  careerGoalCopy: document.querySelector("#careerGoalCopy"),
  careerGoalOptions: document.querySelector("#careerGoalOptions"),
  rampDayBadge: document.querySelector("#rampDayBadge"),
  todayPlan: document.querySelector("#todayPlan"),
  dashboardPrimaryBtn: document.querySelector("#dashboardPrimaryBtn"),
  evidenceCountBadge: document.querySelector("#evidenceCountBadge"),
  dashboardEvidenceList: document.querySelector("#dashboardEvidenceList"),
  dashboardInterview: document.querySelector("#dashboardInterview"),
  rampFill: document.querySelector("#rampFill"),
  rampCopy: document.querySelector("#rampCopy"),
  readinessChecklistBadge: document.querySelector("#readinessChecklistBadge"),
  readinessChecklist: document.querySelector("#readinessChecklist"),
  readinessChecklistCopy: document.querySelector("#readinessChecklistCopy"),
  pathSummaryBadge: document.querySelector("#pathSummaryBadge"),
  pathSummary: document.querySelector("#pathSummary"),
  pathGrid: document.querySelector("#pathGrid"),
  accountForm: document.querySelector("#accountForm"),
  accountEmailInput: document.querySelector("#accountEmailInput"),
  accountEmailLabel: document.querySelector("#accountEmailLabel"),
  accountSyncStatus: document.querySelector("#accountSyncStatus"),
  loginCodeInput: document.querySelector("#loginCodeInput"),
  sendLoginCodeBtn: document.querySelector("#sendLoginCodeBtn"),
  verifyLoginCodeBtn: document.querySelector("#verifyLoginCodeBtn"),
  signOutBtn: document.querySelector("#signOutBtn"),
  weeklyReportPanel: document.querySelector("#weeklyReportPanel"),
  weeklyReportBadge: document.querySelector("#weeklyReportBadge"),
  weeklyReportBody: document.querySelector("#weeklyReportBody"),
  weeklyReportStatus: document.querySelector("#weeklyReportStatus"),
  copyWeeklyReportBtn: document.querySelector("#copyWeeklyReportBtn"),
  proofExportPanel: document.querySelector("#proofExportPanel"),
  proofPackBadge: document.querySelector("#proofPackBadge"),
  proofPackBody: document.querySelector("#proofPackBody"),
  proofPackStatus: document.querySelector("#proofPackStatus"),
  copyProofPackBtn: document.querySelector("#copyProofPackBtn"),
  downloadProofPackBtn: document.querySelector("#downloadProofPackBtn"),
  interviewCoachPanel: document.querySelector("#interviewCoachPanel"),
  interviewCoachBadge: document.querySelector("#interviewCoachBadge"),
  mockInterviewQuestion: document.querySelector("#mockInterviewQuestion"),
  mockInterviewAnswer: document.querySelector("#mockInterviewAnswer"),
  scoreInterviewBtn: document.querySelector("#scoreInterviewBtn"),
  copyInterviewAnswerBtn: document.querySelector("#copyInterviewAnswerBtn"),
  mockInterviewScore: document.querySelector("#mockInterviewScore"),
  mockInterviewSummary: document.querySelector("#mockInterviewSummary"),
  mockInterviewFeedback: document.querySelector("#mockInterviewFeedback"),
  mockInterviewHistory: document.querySelector("#mockInterviewHistory"),
  mockInterviewStatus: document.querySelector("#mockInterviewStatus"),
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
let accountEmail = localStorage.getItem("ticketReadyLastEmail") || "";
let authToken = localStorage.getItem("ticketReadyAuthToken") || "";
let weeklyReportText = "";
let proofPackText = "";

const progress = loadProgress();

function sanitizeCareerGoal(value) {
  return careerGoalProfiles[value] ? value : "help_desk";
}

function getCareerGoalProfile(value) {
  return careerGoalProfiles[sanitizeCareerGoal(value)] || careerGoalProfiles.help_desk;
}

function getEmptyProgress() {
  return {
    xp: 0,
    solved: 0,
    best: 0,
    careerGoal: "help_desk",
    scores: [],
    skills: Object.fromEntries(skillNames.map((skill) => [skill, 0])),
    evidence: [],
    interviews: [],
  };
}

function normalizeProgressRecord(saved = {}) {
  const empty = getEmptyProgress();
  return {
    xp: Number(saved.xp || 0),
    solved: Number(saved.solved || 0),
    best: Number(saved.best || 0),
    careerGoal: sanitizeCareerGoal(saved.careerGoal),
    scores: Array.isArray(saved.scores) ? saved.scores.slice(-20).map((score) => Number(score || 0)) : [],
    skills: { ...empty.skills, ...(saved.skills || {}) },
    evidence: Array.isArray(saved.evidence) ? saved.evidence.slice(0, 20) : [],
    interviews: Array.isArray(saved.interviews) ? saved.interviews.slice(0, 20) : [],
  };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem("ticketReadyProgress") || "{}");
    return normalizeProgressRecord(saved);
  } catch {
    return getEmptyProgress();
  }
}

function saveProgress() {
  localStorage.setItem("ticketReadyProgress", JSON.stringify(progress));
}

function isSignedIn() {
  return Boolean(authToken && accountEmail);
}

function authHeaders(extraHeaders = {}) {
  return {
    ...extraHeaders,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
}

function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: authHeaders(options.headers || {}),
  });
}

function setAuthSession(payload) {
  authToken = payload.authToken || authToken;
  accountEmail = payload.email || accountEmail;
  if (authToken) {
    localStorage.setItem("ticketReadyAuthToken", authToken);
  }
  if (accountEmail) {
    localStorage.setItem("ticketReadyLastEmail", accountEmail);
  }
}

function mergeProgressRecords(localProgress, remoteProgress) {
  const localRecord = normalizeProgressRecord(localProgress);
  const remoteRecord = normalizeProgressRecord(remoteProgress);
  const skills = { ...localRecord.skills };
  Object.entries(remoteRecord.skills).forEach(([skill, value]) => {
    skills[skill] = Math.max(Number(skills[skill] || 0), Number(value || 0));
  });

  const evidenceMap = new Map();
  [...localRecord.evidence, ...remoteRecord.evidence].forEach((entry) => {
    const key = `${entry.ticketId}|${entry.createdAt}|${entry.score}`;
    if (!evidenceMap.has(key)) {
      evidenceMap.set(key, entry);
    }
  });

  const interviewMap = new Map();
  [...localRecord.interviews, ...remoteRecord.interviews].forEach((entry) => {
    const key = `${entry.createdAt}|${entry.score}|${entry.question}`;
    if (!interviewMap.has(key)) {
      interviewMap.set(key, entry);
    }
  });

  return {
    xp: Math.max(localRecord.xp, remoteRecord.xp),
    solved: Math.max(localRecord.solved, remoteRecord.solved),
    best: Math.max(localRecord.best, remoteRecord.best),
    careerGoal: sanitizeCareerGoal(
      localProgress?.careerGoal && localProgress.careerGoal !== "help_desk"
        ? localProgress.careerGoal
        : remoteProgress?.careerGoal || localProgress?.careerGoal
    ),
    scores: [...remoteRecord.scores, ...localRecord.scores].slice(-20),
    skills,
    evidence: Array.from(evidenceMap.values())
      .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)))
      .slice(0, 20),
    interviews: Array.from(interviewMap.values())
      .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)))
      .slice(0, 20),
  };
}

function applyProgress(nextProgress) {
  const cleanProgress = normalizeProgressRecord(nextProgress);
  progress.xp = cleanProgress.xp;
  progress.solved = cleanProgress.solved;
  progress.best = cleanProgress.best;
  progress.careerGoal = cleanProgress.careerGoal;
  progress.scores = cleanProgress.scores;
  progress.skills = cleanProgress.skills;
  progress.evidence = cleanProgress.evidence;
  progress.interviews = cleanProgress.interviews;
  saveProgress();
}

function renderAccountSync(message) {
  const email = accountEmail || localStorage.getItem("ticketReadyLastEmail") || "";
  const signedIn = Boolean(authToken && email);
  els.accountForm.classList.toggle("is-signed-in", signedIn);
  els.accountEmailLabel.textContent = email || "Guest progress";
  if (email && !els.accountEmailInput.value) {
    els.accountEmailInput.value = email;
  }
  els.accountSyncStatus.textContent = message || (signedIn ? "Signed in and syncing progress" : "Verify email to sync progress");
}

function calculateReadiness() {
  const average = progress.scores.length
    ? progress.scores.reduce((sum, score) => sum + score, 0) / progress.scores.length
    : 0;
  return Math.min(100, Math.round(average * 0.72 + Math.min(progress.solved, 20) * 1.4));
}

function getAverageScore(limit = progress.scores.length) {
  const scores = progress.scores.slice(-limit);
  if (!scores.length) {
    return 0;
  }

  return Math.round(scores.reduce((sum, score) => sum + Number(score || 0), 0) / scores.length);
}

function getPracticedSkillCount() {
  return Object.values(progress.skills).filter((value) => Number(value || 0) > 0).length;
}

function getReadinessMilestones() {
  const skillCoverage = getPracticedSkillCount();
  const recentScores = progress.scores.slice(-5);
  const recentAverage = getAverageScore(5);
  const strongEvidence = progress.evidence.filter((entry) => Number(entry.score || 0) >= 80).length;
  const interviewReps = progress.interviews.length;
  const careerGoal = getCareerGoalProfile(progress.careerGoal);

  return [
    {
      label: "Complete 3 tickets",
      detail: "Build baseline triage reps before harder cases.",
      value: `${Math.min(progress.solved, 3)}/3`,
      complete: progress.solved >= 3,
    },
    {
      label: "Score 80+ once",
      detail: "Show one job-ready resolution path.",
      value: progress.best ? `${progress.best}/100` : "0/100",
      complete: progress.best >= 80,
    },
    {
      label: "Save 3 evidence stories",
      detail: "Create proof you can reuse in interviews.",
      value: `${Math.min(progress.evidence.length, 3)}/3`,
      complete: progress.evidence.length >= 3,
    },
    {
      label: `Practice ${careerGoal.shortLabel} skills`,
      detail: `Cover ${careerGoal.skills.slice(0, 3).join(", ")} and one extra support area.`,
      value: `${Math.min(skillCoverage, 4)}/4`,
      complete: skillCoverage >= 4,
    },
    {
      label: "Average 75+ recently",
      detail: "Prove consistency across your last 5 attempts.",
      value: recentScores.length >= 5 ? `${recentAverage}/100` : `${recentScores.length}/5 reps`,
      complete: recentScores.length >= 5 && recentAverage >= 75,
    },
    {
      label: "Prepare an interview story",
      detail: "Use a strong case to explain impact, action, and documentation.",
      value: `${Math.min(strongEvidence, 1)}/1`,
      complete: strongEvidence >= 1,
    },
    {
      label: "Score a mock interview answer",
      detail: "Practice explaining a case out loud before a real interview.",
      value: `${Math.min(interviewReps, 1)}/1`,
      complete: interviewReps >= 1,
    },
  ];
}

function createTextElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

function renderCareerGoalSelector() {
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  els.careerGoalTitle.textContent = careerGoal.label;
  els.careerGoalCopy.textContent = `${careerGoal.plan} Focus skills: ${careerGoal.skills.join(", ")}.`;
  els.careerGoalOptions.replaceChildren();

  Object.entries(careerGoalProfiles).forEach(([id, profile]) => {
    const button = document.createElement("button");
    const isActive = sanitizeCareerGoal(progress.careerGoal) === id;
    button.type = "button";
    button.className = `goal-option${isActive ? " is-active" : ""}`;
    button.dataset.careerGoal = id;
    button.setAttribute("aria-pressed", String(isActive));
    button.append(createTextElement("strong", profile.label));
    button.append(createTextElement("span", profile.skills.slice(0, 3).join(" / ")));
    els.careerGoalOptions.append(button);
  });
}

function setCareerGoal(value) {
  const nextGoal = sanitizeCareerGoal(value);
  if (nextGoal === progress.careerGoal) {
    return;
  }

  progress.careerGoal = nextGoal;
  saveProgress();
  renderStats();
  renderQueue();
  els.planSummaryCopy.textContent = proActive
    ? `Your Pro outcome tools are unlocked for ${getCareerGoalProfile(progress.careerGoal).label} practice.`
    : `Practice, proof, and interview confidence for ${getCareerGoalProfile(progress.careerGoal).label}.`;
  renderAccountSync(isSignedIn() ? "Saving target role..." : "Target role saved on this device");
  if (isSignedIn()) {
    syncProgressToAccount("Saving target role...");
  }
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

function getCurrentPathDayIndex() {
  return Math.min(trainingPath.length - 1, Math.max(0, progress.solved));
}

function getCurrentPathSkills() {
  const pathSkills = pathSkillMap[getCurrentPathDayIndex()] || ["Mixed"];
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  if (pathSkills.includes("Mixed")) {
    return careerGoal.skills;
  }

  return Array.from(new Set([...pathSkills, ...careerGoal.skills.slice(0, 2)]));
}

function getTicketMatchScore(ticket, pathSkills) {
  if (pathSkills.includes("Mixed")) {
    return 1;
  }

  return pathSkills.reduce((score, skill) => {
    const skillMatch = ticket.skills.includes(skill) ? 3 : 0;
    const categoryMatch = ticket.category === skill ? 2 : 0;
    const titleMatch = ticket.title.toLowerCase().includes(skill.toLowerCase()) ? 1 : 0;
    return score + skillMatch + categoryMatch + titleMatch;
  }, 0);
}

function getAvailableTicketIndexes() {
  return tickets
    .map((ticket, index) => ({ ticket, index }))
    .filter(({ index }) => proActive || index < FREE_TICKET_LIMIT)
    .map(({ index }) => index);
}

function getQueueTicketIndexes() {
  const availableIndexes = getAvailableTicketIndexes();
  if (!proActive) {
    return availableIndexes;
  }

  const pathSkills = getCurrentPathSkills();
  const ranked = availableIndexes
    .map((index) => ({ index, score: getTicketMatchScore(tickets[index], pathSkills) }))
    .sort((first, second) => second.score - first.score || first.index - second.index);
  const recommended = ranked.filter((item) => item.score > 0).map((item) => item.index);
  const fallback = ranked.filter((item) => item.score <= 0).map((item) => item.index);

  return [...recommended, ...fallback].slice(0, 12);
}

function renderQueue() {
  els.ticketQueue.replaceChildren();
  const queueIndexes = getQueueTicketIndexes();

  queueIndexes.forEach((index) => {
    const ticket = tickets[index];
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

  if (!proActive) {
    const locked = document.createElement("div");
    locked.className = "ticket-row ticket-row--locked";
    locked.append(createTextElement("span", "Pro unlocks 28 more realistic tickets", "ticket-row__title"));
    locked.append(createTextElement("span", "VPN, phishing, Windows, SaaS, access, hardware, and escalation cases."));
    els.ticketQueue.append(locked);
  }
}

function loadTicket(index) {
  const availableIndexes = getAvailableTicketIndexes();
  if (!availableIndexes.includes(index)) {
    index = availableIndexes[0] || 0;
  }

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

function getSelectedActionLabels(actionIds) {
  return actionIds.map((actionId) => actionCatalog[actionId]?.label).filter(Boolean);
}

function buildEvidenceSummary(ticket, result) {
  const actionSummary = getSelectedActionLabels(result.selected).join(", ") || "classified the ticket and planned next steps";
  return `Handled ${ticket.id} ${ticket.category.toLowerCase()} case for ${ticket.company}. Impact: ${ticket.signals.join(", ")}. Actions: ${actionSummary}. Score: ${result.score}/100. Skills: ${ticket.skills.join(", ")}.`;
}

function buildInterviewPrompt(ticket) {
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  return `For a ${careerGoal.label} interview, tell me about ${ticket.title}. Explain the business impact, why you chose ${ticket.priority}, your first safe action, and how you documented the outcome.`;
}

function getCurrentInterviewQuestion() {
  const latestEvidence = progress.evidence[0];
  if (latestEvidence?.interviewPrompt) {
    return latestEvidence.interviewPrompt;
  }

  return buildInterviewPrompt(tickets[activeTicketIndex]);
}

function getCurrentInterviewTicketId() {
  return progress.evidence[0]?.ticketId || tickets[activeTicketIndex].id;
}

function includesAny(text, terms) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function scoreMockInterviewAnswer(answer) {
  const cleanAnswer = answer.trim();
  const wordCount = cleanAnswer ? cleanAnswer.split(/\s+/).length : 0;
  const notes = [];
  let score = 0;

  if (wordCount >= 40) {
    score += 12;
    notes.push("Enough detail to judge your process.");
  } else if (wordCount >= 20) {
    score += 6;
    notes.push("Good start, but add more detail about the situation and result.");
  } else {
    notes.push("Answer is too short. Aim for 40+ words.");
  }

  if (includesAny(cleanAnswer, ["impact", "deadline", "business", "affected", "scope", "priority", "urgent", "risk"])) {
    score += 18;
    notes.push("You explained business impact.");
  } else {
    notes.push("Add the business impact or urgency.");
  }

  if (includesAny(cleanAnswer, ["verify", "collect", "check", "confirm", "test", "reset", "quarantine", "escalate", "approve", "approval", "logs"])) {
    score += 20;
    notes.push("You described concrete support actions.");
  } else {
    notes.push("Name the specific troubleshooting or fulfillment actions.");
  }

  if (includesAny(cleanAnswer, ["identity", "mfa", "security", "policy", "approved", "least privilege", "contain", "safe"])) {
    score += 16;
    notes.push("You protected safe process.");
  } else {
    notes.push("Mention how you avoided risky shortcuts.");
  }

  if (includesAny(cleanAnswer, ["document", "notes", "note", "evidence", "timestamp", "resolution details"])) {
    score += 14;
    notes.push("You included documentation.");
  } else {
    notes.push("Add how you documented the ticket.");
  }

  if (includesAny(cleanAnswer, ["resolved", "confirmed", "result", "outcome", "follow", "user verified", "working"])) {
    score += 16;
    notes.push("You included a result or confirmation.");
  } else {
    notes.push("Close with the result and how you confirmed it.");
  }

  if (includesAny(cleanAnswer, ["explain", "communicate", "update", "coach", "expectation", "calm", "clear"])) {
    score += 10;
    notes.push("You showed communication skills.");
  } else {
    notes.push("Add how you communicated with the user.");
  }

  score = Math.min(100, Math.round(score));

  return {
    score,
    notes: notes.slice(0, 8),
    summary:
      score >= 80
        ? "Strong interview answer. It connects impact, safe action, documentation, and result."
        : score >= 55
          ? "Good structure. Add the missing pieces before using this in a real interview."
          : "Needs more structure. Use situation, impact, action, documentation, and result.",
  };
}

function buildEvidenceStory(ticket, result) {
  const actionSummary = getSelectedActionLabels(result.selected).map((label) => label.toLowerCase()).join(", ") || "no action path selected";
  return [
    `Resolved ${ticket.id}: ${ticket.title}`,
    `Score: ${result.score}/100`,
    `Business impact: ${ticket.signals.join(", ")}`,
    `Action path: ${actionSummary}.`,
    `Skills practiced: ${ticket.skills.join(", ")}.`,
    `Outcome: ${ticket.outcome}`,
  ].join("\n");
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

  const actionLabels = getSelectedActionLabels(result.selected).map((label) => label.toLowerCase());
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

  lastEvidenceText = buildEvidenceStory(ticket, result);

  els.evidenceLog.textContent = buildEvidenceSummary(ticket, result);
  els.interviewPrompt.textContent = `Interview drill: ${buildInterviewPrompt(ticket)}`;
  els.nextDrill.textContent = `Next drill: practice ${nextFocus} with two more ${ticket.skills[0].toLowerCase()} cases before moving to a harder queue.`;
}

function getWeakestSkill() {
  return Object.entries(progress.skills)
    .sort((first, second) => first[1] - second[1])
    .find(([, value]) => value < 70)?.[0] || tickets[activeTicketIndex].skills[0];
}

function renderTodayPlan() {
  const recommendedTicketIndex = getQueueTicketIndexes()[0] ?? activeTicketIndex;
  const ticket = tickets[recommendedTicketIndex];
  const weakestSkill = getWeakestSkill();
  const pathDay = trainingPath[Math.min(trainingPath.length - 1, progress.solved)];
  const nextMilestone = getReadinessMilestones().find((item) => !item.complete);
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  const plan = proActive
    ? [
        `${careerGoal.shortLabel}: ${careerGoal.plan}`,
        `${pathDay.title}: ${pathDay.focus}`,
        `${pathDay.tickets}. Score 80+ on ${ticket.id} if you can.`,
        `${pathDay.evidence} Then rehearse one answer about ${weakestSkill}.`,
        nextMilestone ? `Checklist target: ${nextMilestone.label}.` : "Checklist complete. Keep your evidence fresh.",
      ]
    : [
        `Target role: ${careerGoal.label}.`,
        `${trainingPath[0].title}: ${trainingPath[0].focus}`,
        `Try ${ticket.id} as the Day 1 preview ticket.`,
        nextMilestone ? `Preview target: ${nextMilestone.label}.` : "Your proof pack is ready for review.",
      ];

  els.todayPlan.replaceChildren();
  plan.forEach((item) => {
    els.todayPlan.append(createTextElement("li", item));
  });
}

function renderTrainingPath() {
  const completedDays = Math.min(30, progress.solved);
  const activeDay = Math.min(30, Math.max(1, progress.solved + 1));
  const careerGoal = getCareerGoalProfile(progress.careerGoal);

  els.pathSummaryBadge.textContent = proActive ? `${completedDays}/30 complete` : "Day 1 preview";
  els.pathSummary.textContent = proActive
    ? `You are training toward ${careerGoal.label}. Day ${activeDay} keeps your daily ticket set, evidence, and interview practice focused.`
    : `Free users can preview Day 1 for ${careerGoal.label}. Pro unlocks the full 30-day ramp with daily tickets, evidence prompts, and interview practice.`;
  els.pathGrid.replaceChildren();

  trainingPath.forEach((item) => {
    const isUnlocked = proActive || item.day === 1;
    const isComplete = proActive && item.day <= completedDays;
    const isCurrent = item.day === activeDay && isUnlocked;
    const card = document.createElement("article");
    card.className = [
      "path-day",
      isUnlocked ? "is-unlocked" : "is-locked",
      isComplete ? "is-complete" : "",
      isCurrent ? "is-current" : "",
    ].filter(Boolean).join(" ");

    const top = document.createElement("div");
    top.className = "path-day__top";
    top.append(createTextElement("span", `Day ${item.day}`));
    top.append(createTextElement("strong", isComplete ? "Done" : isUnlocked ? "Open" : "Locked"));

    card.append(top);
    card.append(createTextElement("h4", item.title));
    card.append(createTextElement("p", item.focus));
    card.append(createTextElement("span", item.tickets, "path-day__target"));
    if (isUnlocked) {
      card.append(createTextElement("small", item.evidence));
    }
    els.pathGrid.append(card);
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

function renderReadinessChecklist() {
  const milestones = getReadinessMilestones();
  const completed = milestones.filter((item) => item.complete).length;
  const nextMilestone = milestones.find((item) => !item.complete);

  els.readinessChecklist.replaceChildren();
  els.readinessChecklistBadge.textContent = `${completed}/${milestones.length}`;

  milestones.forEach((milestone) => {
    const item = document.createElement("div");
    item.className = `readiness-check${milestone.complete ? " is-complete" : ""}`;

    const mark = createTextElement("span", milestone.complete ? "OK" : "", "readiness-check__mark");
    const body = document.createElement("div");
    body.className = "readiness-check__body";
    body.append(createTextElement("strong", milestone.label));
    body.append(createTextElement("span", milestone.detail));

    item.append(mark, body, createTextElement("span", milestone.value, "readiness-check__value"));
    els.readinessChecklist.append(item);
  });

  if (!nextMilestone) {
    els.readinessChecklistCopy.textContent = "Proof pack complete. Keep adding recent tickets so your examples stay fresh.";
  } else if (proActive) {
    els.readinessChecklistCopy.textContent = `Next unlock: ${nextMilestone.label}. Today's shift should push that forward.`;
  } else {
    els.readinessChecklistCopy.textContent = `Free preview goal: ${nextMilestone.label}. Pro keeps the full checklist and reports moving.`;
  }
}

function getWeeklyEvidence() {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const recent = progress.evidence.filter((entry) => {
    const created = Date.parse(entry.createdAt);
    return Number.isFinite(created) && now - created <= weekMs;
  });

  return recent.length ? recent : progress.evidence.slice(0, 5);
}

function getSkillSummary() {
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  const practicedSkills = Object.entries(progress.skills).filter(([, value]) => Number(value) > 0);
  const strongSkills = practicedSkills
    .slice()
    .sort((first, second) => second[1] - first[1])
    .slice(0, 3)
    .map(([skill]) => skill);
  const weakSkills = Object.entries(progress.skills)
    .slice()
    .sort((first, second) => first[1] - second[1])
    .slice(0, 3)
    .map(([skill]) => skill);

  return {
    strongSkills: strongSkills.length ? strongSkills : careerGoal.skills.slice(0, 3),
    weakSkills,
  };
}

function getWeekRangeLabel() {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  const end = new Date();
  const options = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
}

function createReportCard(label, value, detail) {
  const card = document.createElement("article");
  card.className = "weekly-report-card";
  card.append(createTextElement("span", label, "weekly-report-card__label"));
  card.append(createTextElement("strong", value));
  card.append(createTextElement("p", detail));
  return card;
}

function getTopEvidence(limit = 5) {
  return progress.evidence
    .slice()
    .sort((first, second) => Number(second.score || 0) - Number(first.score || 0))
    .slice(0, limit);
}

function formatResumeBullet(entry, careerGoal = getCareerGoalProfile(progress.careerGoal)) {
  const title = entry.title || "service desk support case";
  const score = Number(entry.score || 0);
  return `TicketReady ${careerGoal.proof} project: resolved simulated service desk case "${title}" with a ${score}/100 score, documenting impact, safe action path, and user confirmation.`;
}

function buildProofPack() {
  const readiness = calculateReadiness();
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  const topEvidence = getTopEvidence(5);
  const { strongSkills, weakSkills } = getSkillSummary();
  const topInterview = progress.interviews.slice().sort((first, second) => Number(second.score || 0) - Number(first.score || 0))[0];
  const interviewPrompts = topEvidence
    .map((entry) => entry.interviewPrompt)
    .filter(Boolean)
    .slice(0, 3);
  const resumeBullets = topEvidence.map((entry) => formatResumeBullet(entry, careerGoal)).slice(0, 5);
  const nextFocus = weakSkills[0] || getWeakestSkill();

  return {
    careerGoal,
    topEvidence,
    resumeBullets,
    interviewPrompts,
    strongSkills,
    weakSkills,
    nextFocus,
    readiness,
    text: [
      "TicketReady Training Proof Pack",
      "Use this honestly under a resume Projects, Training, or Portfolio section.",
      "",
      `Target role: ${careerGoal.label}`,
      `Target role focus: ${careerGoal.skills.join(", ")}`,
      `Readiness: ${readiness}%`,
      `Tickets completed: ${progress.solved}`,
      `Best score: ${progress.best}/100`,
      `Mock interview reps: ${progress.interviews.length}`,
      `Best interview score: ${topInterview ? `${topInterview.score}/100` : "No interview reps yet"}`,
      `Strong skills: ${strongSkills.join(", ")}`,
      `Next focus: ${nextFocus}`,
      "",
      "Resume / Portfolio Bullets:",
      ...(resumeBullets.length ? resumeBullets.map((bullet) => `- ${bullet}`) : ["- Complete scored tickets to generate honest training bullets."]),
      "",
      "Interview Stories To Practice:",
      ...(interviewPrompts.length ? interviewPrompts.map((prompt, index) => `${index + 1}. ${prompt}`) : ["1. Complete a scored ticket to generate an interview story."]),
      "",
      "Best Mock Interview Answer:",
      topInterview ? `${topInterview.question}\nScore: ${topInterview.score}/100\n${topInterview.answer}` : "Complete a mock interview rep to add an answer here.",
      "",
      "Evidence Notes:",
      ...(topEvidence.length ? topEvidence.map((entry) => `- ${entry.ticketId || "Ticket"}: ${entry.summary || entry.title || "Saved training evidence."}`) : ["- No saved evidence yet."]),
    ].join("\n"),
  };
}

function createProofCard(label, value, detail) {
  const card = document.createElement("article");
  card.className = "proof-pack-card";
  card.append(createTextElement("span", label, "proof-pack-card__label"));
  card.append(createTextElement("strong", value));
  card.append(createTextElement("p", detail));
  return card;
}

function buildWeeklyReport() {
  const evidence = getWeeklyEvidence();
  const readiness = calculateReadiness();
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  const averageScore = evidence.length
    ? Math.round(evidence.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / evidence.length)
    : 0;
  const strongestEvidence = evidence.slice().sort((first, second) => Number(second.score || 0) - Number(first.score || 0))[0];
  const { strongSkills, weakSkills } = getSkillSummary();
  const nextFocus = weakSkills[0] || getWeakestSkill();
  const interviewPrompt =
    strongestEvidence?.interviewPrompt ||
    `Explain how you would triage ${tickets[activeTicketIndex].title}, choose priority, and document the resolution.`;

  return {
    evidence,
    careerGoal,
    readiness,
    averageScore,
    strongestEvidence,
    strongSkills,
    weakSkills,
    nextFocus,
    interviewPrompt,
    text: [
      `TicketReady Weekly Readiness Report`,
      `Week: ${getWeekRangeLabel()}`,
      `Target role: ${careerGoal.label}`,
      `Tickets completed: ${evidence.length}`,
      `Readiness: ${readiness}%`,
      `Average score: ${averageScore || "No scored tickets yet"}`,
      `Strongest evidence: ${strongestEvidence ? `${strongestEvidence.ticketId} - ${strongestEvidence.title} (${strongestEvidence.score}/100)` : "Complete a scored ticket to create evidence."}`,
      `Strong skills: ${strongSkills.join(", ")}`,
      `Next focus: ${nextFocus}`,
      `Target role plan: ${careerGoal.plan}`,
      `Interview drill: ${interviewPrompt}`,
    ].join("\n"),
  };
}

function renderWeeklyReport() {
  els.weeklyReportBody.replaceChildren();
  els.weeklyReportPanel.classList.toggle("is-pro-active", proActive);
  els.weeklyReportPanel.classList.toggle("is-locked", !proActive);

  if (!proActive) {
    weeklyReportText = "";
    els.weeklyReportBadge.textContent = "Locked";
    els.copyWeeklyReportBtn.disabled = true;
    els.weeklyReportBody.append(
      createReportCard("Weekly summary", "Pro", "Unlock the report that turns scored tickets into job-readiness proof."),
      createReportCard("Evidence", "Saved", "See your strongest cases, score trend, and reusable interview prompt."),
      createReportCard("Target role", getCareerGoalProfile(progress.careerGoal).shortLabel, "Reports adjust to your selected job path.")
    );
    els.weeklyReportStatus.textContent = "Subscribe to unlock weekly summaries built from your completed tickets.";
    return;
  }

  const report = buildWeeklyReport();
  weeklyReportText = report.text;
  els.weeklyReportBadge.textContent = report.evidence.length ? `${report.evidence.length} tickets` : "Ready";
  els.copyWeeklyReportBtn.disabled = !report.evidence.length;
  els.weeklyReportBody.append(
    createReportCard("Week", getWeekRangeLabel(), `${report.evidence.length} scored tickets. ${report.averageScore ? `${report.averageScore}/100 average` : "Start scoring tickets"} with ${report.readiness}% readiness.`),
    createReportCard("Target Role", report.careerGoal.shortLabel, report.careerGoal.plan),
    createReportCard(
      "Strongest Evidence",
      report.strongestEvidence ? `${report.strongestEvidence.ticketId}` : "None yet",
      report.strongestEvidence ? report.strongestEvidence.summary : "Complete a scored ticket to create proof."
    ),
    createReportCard("Next Focus", report.nextFocus, `Rehearse this skill, then complete two related tickets.`)
  );
  els.weeklyReportStatus.textContent = report.evidence.length
    ? "Weekly report ready to copy for job-search notes and interview prep."
    : "Finish a scored ticket to generate your first weekly report.";
}

function renderProofPack() {
  els.proofPackBody.replaceChildren();
  els.proofExportPanel.classList.toggle("is-pro-active", proActive);
  els.proofExportPanel.classList.toggle("is-locked", !proActive);

  const proofPack = buildProofPack();
  proofPackText = proActive ? proofPack.text : "";
  els.proofPackBadge.textContent = proActive ? `${proofPack.topEvidence.length} cases` : "Locked";
  els.copyProofPackBtn.disabled = !proActive || !proofPack.topEvidence.length;
  els.downloadProofPackBtn.disabled = !proActive || !proofPack.topEvidence.length;

  if (!proActive) {
    els.proofPackBody.append(
      createProofCard("Resume bullets", "Pro", "Export honest training bullets from your strongest scored tickets."),
      createProofCard("Interview prep", "Stories", "Turn simulated cases into answer prompts about impact, action, and documentation."),
      createProofCard("Target role", getCareerGoalProfile(progress.careerGoal).shortLabel, "Proof language adapts to the role you are chasing.")
    );
    els.proofPackStatus.textContent = "Subscribe to export resume/project bullets from your saved training evidence.";
    return;
  }

  els.proofPackBody.append(
    createProofCard(
      "Resume Bullets",
      proofPack.resumeBullets.length ? `${proofPack.resumeBullets.length} ready` : "Start",
      proofPack.resumeBullets[0] || "Complete a scored ticket to generate your first training bullet."
    ),
    createProofCard(
      "Interview Stories",
      proofPack.interviewPrompts.length ? `${proofPack.interviewPrompts.length} prompts` : "Start",
      proofPack.interviewPrompts[0] || "Your strongest cases become interview prompts after scoring."
    ),
    createProofCard(
      "Skill Summary",
      proofPack.strongSkills.join(", "),
      `${proofPack.careerGoal.shortLabel} focus: ${proofPack.nextFocus}. Readiness: ${proofPack.readiness}%.`
    )
  );

  els.proofPackStatus.textContent = proofPack.topEvidence.length
    ? "Proof pack ready to copy or download for resume projects, portfolio notes, and interview prep."
    : "Finish a scored ticket to generate your first proof pack.";
}

function renderMockInterviewCoach(lastResult) {
  const latestInterview = progress.interviews[0];
  const interviewCount = progress.interviews.length;
  const bestInterviewScore = progress.interviews.reduce((best, entry) => Math.max(best, Number(entry.score || 0)), 0);

  els.interviewCoachPanel.classList.toggle("is-pro-active", proActive);
  els.interviewCoachPanel.classList.toggle("is-locked", !proActive);
  els.interviewCoachBadge.textContent = proActive
    ? `${interviewCount} reps`
    : "Locked";
  els.mockInterviewQuestion.textContent = getCurrentInterviewQuestion();
  els.scoreInterviewBtn.disabled = !proActive;
  els.copyInterviewAnswerBtn.disabled = !proActive;

  if (lastResult) {
    els.mockInterviewScore.textContent = `${lastResult.score}/100`;
    els.mockInterviewSummary.textContent = lastResult.summary;
    els.mockInterviewFeedback.replaceChildren(...lastResult.notes.map((note) => createTextElement("li", note)));
  } else if (latestInterview) {
    els.mockInterviewScore.textContent = `${latestInterview.score}/100`;
    els.mockInterviewSummary.textContent = latestInterview.summary || "Latest saved interview answer.";
    els.mockInterviewFeedback.replaceChildren(...(latestInterview.notes || []).map((note) => createTextElement("li", note)));
  } else {
    els.mockInterviewScore.textContent = "0/100";
    els.mockInterviewSummary.textContent = proActive
      ? "Answer a prompt to get structure feedback."
      : "Pro unlocks scored mock interview answers.";
    els.mockInterviewFeedback.replaceChildren();
  }

  els.mockInterviewHistory.replaceChildren();
  if (!proActive) {
    const locked = document.createElement("div");
    locked.className = "interview-history__empty";
    locked.textContent = "Pro saves interview reps and adds your best answer to the proof pack.";
    els.mockInterviewHistory.append(locked);
    els.mockInterviewStatus.textContent = "Subscribe to score answers for impact, safe process, documentation, and communication.";
    return;
  }

  if (!interviewCount) {
    const empty = document.createElement("div");
    empty.className = "interview-history__empty";
    empty.textContent = "No interview reps yet. Use the prompt to practice your first answer.";
    els.mockInterviewHistory.append(empty);
    els.mockInterviewStatus.textContent = "Pro scores answers for impact, safe process, documentation, and clear communication.";
    return;
  }

  progress.interviews.slice(0, 3).forEach((entry) => {
    const item = document.createElement("div");
    item.className = "interview-history__item";
    item.append(createTextElement("strong", `${entry.score}/100 - ${entry.ticketId || "Interview rep"}`));
    item.append(createTextElement("span", entry.summary || entry.question));
    els.mockInterviewHistory.append(item);
  });

  els.mockInterviewStatus.textContent = `Best mock interview score: ${bestInterviewScore}/100. Keep refining answers before filming or applying.`;
}

function renderProDashboard() {
  const readiness = calculateReadiness();
  const rampDay = Math.min(30, Math.max(1, progress.solved + 1));
  const completedRampDays = Math.min(30, progress.solved);
  const latestEvidence = progress.evidence[0];
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  const recommendedTicketIndex = getQueueTicketIndexes()[0] ?? activeTicketIndex;
  const recommendedTicket = tickets[recommendedTicketIndex];

  els.proDashboard.classList.toggle("is-pro-active", proActive);
  els.dashboardBadge.textContent = proActive ? "Pro Active" : "Free Preview";
  els.dashboardBadge.classList.toggle("is-active", proActive);
  els.dashboardWelcome.textContent = proActive
    ? `Your ${careerGoal.shortLabel} workspace is ready. Finish today's shift, save proof, and rehearse one interview answer.`
    : `Choose a target role like ${careerGoal.label}, then unlock Pro for a weekly job-readiness routine with evidence you can reuse.`;
  els.dashboardReadiness.textContent = `${readiness}%`;
  els.rampDayBadge.textContent = `Day ${rampDay}`;
  els.rampFill.style.width = `${Math.round((completedRampDays / 30) * 100)}%`;
  els.rampCopy.textContent = `${completedRampDays} of 30 ramp days completed.`;
  els.dashboardInterview.textContent = latestEvidence
    ? latestEvidence.interviewPrompt
    : `Practice explaining why ${recommendedTicket.title} is a ${recommendedTicket.priority} and what you would do first.`;
  els.dashboardPrimaryBtn.textContent = proActive ? "Start Today's Shift" : "Unlock Pro";

  renderCareerGoalSelector();
  renderTodayPlan();
  renderEvidenceVault();
  renderReadinessChecklist();
  renderWeeklyReport();
  renderProofPack();
  renderMockInterviewCoach();
  renderTrainingPath();
}

function renderProState(email = localStorage.getItem("ticketReadyLastEmail") || "") {
  const careerGoal = getCareerGoalProfile(progress.careerGoal);
  els.proStatusBadge.textContent = proActive ? "Pro Active" : "Free";
  els.proStatusBadge.classList.toggle("is-active", proActive);
  els.subscriptionPanel.classList.toggle("is-pro-active", proActive);
  els.valueLab.classList.toggle("is-unlocked", proActive);
  els.planSummaryCopy.textContent = proActive
    ? `Your Pro outcome tools are unlocked for ${careerGoal.label} practice.`
    : `Practice, proof, and interview confidence for ${careerGoal.label}.`;

  if (email && !els.emailInput.value) {
    els.emailInput.value = email;
  }

  if (email) {
    accountEmail = email;
  }
  renderAccountSync();
  renderProDashboard();
}

function setProState(entitlement, email) {
  proActive = Boolean(entitlement?.active);
  localStorage.setItem("ticketReadyProActive", String(proActive));
  if (email) {
    accountEmail = email;
    localStorage.setItem("ticketReadyLastEmail", email);
  }
  if (!getAvailableTicketIndexes().includes(activeTicketIndex)) {
    loadTicket(getAvailableTicketIndexes()[0] || 0);
  }
  renderProState(email);
}

async function requestLoginCode(email, options = {}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("Enter a valid email to sign in.");
  }

  accountEmail = normalizedEmail;
  localStorage.setItem("ticketReadyLastEmail", normalizedEmail);
  els.accountEmailInput.value = normalizedEmail;
  els.emailInput.value = normalizedEmail;
  renderAccountSync("Sending login code...");

  const response = await fetch("/api/auth/request-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: normalizedEmail }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Could not send login code.");
  }

  els.accountForm.classList.add("is-code-sent");
  els.loginCodeInput.focus();
  const devCopy = payload.devCode ? ` Test code: ${payload.devCode}` : "";
  renderAccountSync(`Code sent. It expires in ${payload.expiresInMinutes} minutes.${devCopy}`);
  if (!options.silent) {
    els.waitlistStatus.textContent = `Check your email for the TicketReady code.${devCopy}`;
  }
  return payload;
}

async function verifyLoginCode() {
  const email = els.accountEmailInput.value.trim() || accountEmail;
  const code = els.loginCodeInput.value.trim();
  renderAccountSync("Verifying code...");

  try {
    const response = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Could not verify login code.");
    }

    setAuthSession(payload);
    els.accountForm.classList.remove("is-code-sent");
    els.loginCodeInput.value = "";
    if (payload.progress) {
      applyProgress(mergeProgressRecords(progress, payload.progress));
    }
    setProState(payload.entitlement, payload.email);
    await syncProgressToAccount("Saving verified progress...");
    renderAccountSync(payload.entitlement?.active ? "Pro account verified" : "Account verified");
    els.waitlistStatus.textContent = `Signed in as ${payload.email}.`;
  } catch (error) {
    renderAccountSync(error.message);
    els.waitlistStatus.textContent = error.message;
  }
}

async function signOut() {
  try {
    await authFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Local sign-out still matters even if the network request fails.
  }

  authToken = "";
  proActive = false;
  localStorage.removeItem("ticketReadyAuthToken");
  localStorage.setItem("ticketReadyProActive", "false");
  renderProState(accountEmail);
  renderQueue();
  renderAccountSync("Signed out. Local practice progress remains on this device.");
  els.waitlistStatus.textContent = "Signed out.";
}

async function syncProgressToAccount(statusText = "Saving progress to account...") {
  const email = accountEmail || localStorage.getItem("ticketReadyLastEmail") || "";
  if (!email || !email.includes("@") || !authToken) {
    renderAccountSync("Sign in to sync progress");
    return null;
  }

  renderAccountSync(statusText);
  try {
    const response = await authFetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, progress }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Progress sync failed.");
    }
    applyProgress(mergeProgressRecords(progress, payload.progress));
    renderStats();
    renderQueue();
    renderAccountSync("Progress synced to account");
    return payload;
  } catch (error) {
    renderAccountSync("Saved on this device");
    return null;
  }
}

async function syncAccount(email, options = {}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("Enter a valid email to sync.");
  }
  if (!authToken || (accountEmail && normalizedEmail !== accountEmail.toLowerCase())) {
    await requestLoginCode(normalizedEmail, options);
    throw new Error("Enter the login code to finish signing in.");
  }

  accountEmail = normalizedEmail;
  localStorage.setItem("ticketReadyLastEmail", normalizedEmail);
  els.emailInput.value = normalizedEmail;
  els.accountEmailInput.value = normalizedEmail;

  if (!options.silent) {
    renderAccountSync("Checking account...");
  }

  const response = await authFetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: normalizedEmail }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Account sync failed.");
  }

  if (payload.progress) {
    applyProgress(mergeProgressRecords(progress, payload.progress));
  }
  const sessionEmail = payload.profile?.email || normalizedEmail;
  setProState(payload.entitlement, sessionEmail);
  await syncProgressToAccount(options.silent ? "Syncing progress..." : "Saving merged progress...");
  renderAccountSync(payload.entitlement?.active ? "Pro account synced" : "Free account synced");
  return payload;
}

async function handleAccountSync(event) {
  event.preventDefault();
  const email = els.accountEmailInput.value.trim() || els.emailInput.value.trim();
  try {
    if (isSignedIn()) {
      await syncAccount(email);
      els.waitlistStatus.textContent = `Training account synced for ${accountEmail}.`;
      return;
    }
    await requestLoginCode(email);
  } catch (error) {
    renderAccountSync(error.message);
    els.waitlistStatus.textContent = error.message;
  }
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
    summary: buildEvidenceSummary(ticket, result),
    interviewPrompt: buildInterviewPrompt(ticket),
    createdAt: new Date().toISOString(),
  });
  progress.evidence = progress.evidence.slice(0, 20);
  saveProgress();
  syncProgressToAccount();

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
  const queueIndexes = getQueueTicketIndexes();
  const currentQueuePosition = queueIndexes.indexOf(activeTicketIndex);
  const nextQueuePosition = currentQueuePosition >= 0 ? (currentQueuePosition + 1) % queueIndexes.length : 0;
  loadTicket(queueIndexes[nextQueuePosition] || 0);
}

function chooseRandomTicket() {
  const queueIndexes = getQueueTicketIndexes();
  if (queueIndexes.length <= 1) {
    loadTicket(queueIndexes[0] || 0);
    return;
  }

  let nextIndex = activeTicketIndex;
  while (nextIndex === activeTicketIndex) {
    nextIndex = queueIndexes[Math.floor(Math.random() * queueIndexes.length)];
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

function copyWeeklyReport() {
  const fallback = weeklyReportText || "Complete a Pro ticket first to create a weekly readiness report.";

  if (!weeklyReportText) {
    els.weeklyReportStatus.textContent = fallback;
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(fallback)
      .then(() => {
        els.copyWeeklyReportBtn.textContent = "Copied";
        els.weeklyReportStatus.textContent = "Weekly report copied.";
        setTimeout(() => {
          els.copyWeeklyReportBtn.textContent = "Copy Report";
        }, 1600);
      })
      .catch(() => {
        els.weeklyReportStatus.textContent = fallback;
      });
  } else {
    els.weeklyReportStatus.textContent = fallback;
  }
}

function copyProofPack() {
  const fallback = proofPackText || "Complete a Pro ticket first to create a resume proof pack.";

  if (!proofPackText) {
    els.proofPackStatus.textContent = fallback;
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(fallback)
      .then(() => {
        els.copyProofPackBtn.textContent = "Copied";
        els.proofPackStatus.textContent = "Proof pack copied.";
        setTimeout(() => {
          els.copyProofPackBtn.textContent = "Copy Pack";
        }, 1600);
      })
      .catch(() => {
        els.proofPackStatus.textContent = fallback;
      });
  } else {
    els.proofPackStatus.textContent = fallback;
  }
}

function downloadProofPack() {
  if (!proofPackText) {
    els.proofPackStatus.textContent = "Complete a Pro ticket first to create a resume proof pack.";
    return;
  }

  const blob = new Blob([proofPackText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ticketready-proof-pack-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  els.proofPackStatus.textContent = "Proof pack downloaded.";
}

function scoreInterviewAnswer() {
  if (!proActive) {
    els.mockInterviewStatus.textContent = "Pro unlocks scored mock interview answers.";
    return;
  }

  const answer = els.mockInterviewAnswer.value.trim();
  if (!answer) {
    els.mockInterviewStatus.textContent = "Type an answer first, then score it.";
    return;
  }

  const question = getCurrentInterviewQuestion();
  const result = scoreMockInterviewAnswer(answer);
  progress.interviews.unshift({
    question,
    answer,
    score: result.score,
    summary: result.summary,
    notes: result.notes,
    ticketId: getCurrentInterviewTicketId(),
    createdAt: new Date().toISOString(),
  });
  progress.interviews = progress.interviews.slice(0, 20);
  progress.xp += Math.max(10, Math.round(result.score / 4));
  saveProgress();
  syncProgressToAccount("Saving interview practice...");
  renderStats();
  renderMockInterviewCoach(result);
}

function copyInterviewAnswer() {
  const answer = els.mockInterviewAnswer.value.trim();
  if (!answer) {
    els.mockInterviewStatus.textContent = "Type an answer first, then copy it.";
    return;
  }

  const text = [`Question: ${getCurrentInterviewQuestion()}`, "", answer].join("\n");
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        els.copyInterviewAnswerBtn.textContent = "Copied";
        els.mockInterviewStatus.textContent = "Interview answer copied.";
        setTimeout(() => {
          els.copyInterviewAnswerBtn.textContent = "Copy Answer";
        }, 1600);
      })
      .catch(() => {
        els.mockInterviewStatus.textContent = text;
      });
  } else {
    els.mockInterviewStatus.textContent = text;
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
    const response = await authFetch("/api/confirm-checkout-session", {
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
    await syncProgressToAccount("Saving progress to Pro account...");
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
  renderAccountSync("Preparing account...");

  if (!isSignedIn() || email.toLowerCase() !== accountEmail.toLowerCase()) {
    try {
      await requestLoginCode(email);
      els.waitlistStatus.textContent = "Verify your email code, then click Start Pro again.";
    } catch (error) {
      els.waitlistStatus.textContent = error.message;
    }
    return;
  }

  if (!paymentsReady) {
    els.waitlistStatus.textContent = "Email saved locally. Add Stripe keys to .env, then restart the server to enable checkout.";
    return;
  }

  els.waitlistStatus.textContent = "Opening secure Stripe Checkout...";
  try {
    const response = await authFetch("/api/create-checkout-session", {
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
    if (!isSignedIn() || email.toLowerCase() !== accountEmail.toLowerCase()) {
      await requestLoginCode(email);
      els.waitlistStatus.textContent = "Verify your email code, then check Pro status again.";
      return;
    }

    let response = await authFetch("/api/entitlements");
    let entitlement = await response.json();

    if (!entitlement.active && paymentsReady) {
      response = await authFetch("/api/sync-subscription", {
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
    await syncAccount(email, { silent: true });
    els.waitlistStatus.textContent = entitlement.active
      ? `Pro is active for ${email}.`
      : `No active Pro subscription found for ${email}. Status: ${entitlement.status}.`;
  } catch (error) {
    els.waitlistStatus.textContent = error.message;
  }
}

async function checkStoredProStatus() {
  const email = localStorage.getItem("ticketReadyLastEmail");
  if (!email || !authToken) {
    renderProState(email || "");
    return;
  }

  try {
    const response = await authFetch("/api/auth/session");
    const account = await response.json();
    if (!response.ok) {
      throw new Error(account.error || "Session expired.");
    }
    setAuthSession(account);
    if (account.progress) {
      applyProgress(mergeProgressRecords(progress, account.progress));
    }
    setProState(account.entitlement, account.email);
    await syncProgressToAccount("Syncing saved progress...");
    if (account?.entitlement?.active) {
      els.waitlistStatus.textContent = "Pro is active on this device.";
    }
  } catch {
    authToken = "";
    localStorage.removeItem("ticketReadyAuthToken");
    renderProState(email);
  }
}

async function manageBilling() {
  const email = els.emailInput.value.trim() || localStorage.getItem("ticketReadyLastEmail") || "";
  if (!email || !email.includes("@")) {
    els.waitlistStatus.textContent = "Enter the subscriber email first, then manage billing.";
    return;
  }
  if (!isSignedIn() || email.toLowerCase() !== accountEmail.toLowerCase()) {
    try {
      await requestLoginCode(email);
      els.waitlistStatus.textContent = "Verify your email code, then manage billing again.";
    } catch (error) {
      els.waitlistStatus.textContent = error.message;
    }
    return;
  }

  els.waitlistStatus.textContent = "Opening Stripe billing portal...";
  try {
    const response = await authFetch("/api/create-portal-session", {
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
  els.copyWeeklyReportBtn.addEventListener("click", copyWeeklyReport);
  els.copyProofPackBtn.addEventListener("click", copyProofPack);
  els.downloadProofPackBtn.addEventListener("click", downloadProofPack);
  els.scoreInterviewBtn.addEventListener("click", scoreInterviewAnswer);
  els.copyInterviewAnswerBtn.addEventListener("click", copyInterviewAnswer);
  els.accountForm.addEventListener("submit", handleAccountSync);
  els.verifyLoginCodeBtn.addEventListener("click", verifyLoginCode);
  els.signOutBtn.addEventListener("click", signOut);
  els.careerGoalOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-career-goal]");
    if (button) {
      setCareerGoal(button.dataset.careerGoal);
    }
  });
  els.loginCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      verifyLoginCode();
    }
  });
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
