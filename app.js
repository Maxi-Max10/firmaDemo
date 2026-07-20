const state = {
  currentView: "overview",
  signingStep: 1,
  demoDniLoaded: false,
  hasSignature: false,
  signed: false,
  requestChannel: "email",
};

const adminApp = document.querySelector("#admin-app");
const signingApp = document.querySelector("#signing-app");
const navItems = [...document.querySelectorAll(".nav-item")];
const views = [...document.querySelectorAll(".view")];
const toast = document.querySelector("#toast");

function showToast(title, message, type = "success") {
  document.querySelector("#toast-title").textContent = title;
  document.querySelector("#toast-message").textContent = message;
  toast.querySelector("span").style.background = type === "error" ? "#ffedf0" : "#e9f8f2";
  toast.querySelector("span").style.color = type === "error" ? "#df4d63" : "#179b68";
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function setView(viewName) {
  state.currentView = viewName;
  views.forEach(view => view.classList.toggle("active", view.id === `view-${viewName}`));
  navItems.forEach(item => item.classList.toggle("active", item.dataset.view === viewName));
  const current = navItems.find(item => item.dataset.view === viewName);
  document.querySelector("#current-crumb").textContent = current?.textContent.trim().replace(/\d+$/, "") || "Resumen";
  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach(item => item.addEventListener("click", () => setView(item.dataset.view)));
function closeMobileMenu() {
  document.querySelector(".sidebar").classList.remove("open");
  document.querySelector("#sidebar-overlay").classList.remove("show");
  document.body.classList.remove("nav-open");
  document.querySelector("#mobile-menu").setAttribute("aria-expanded", "false");
}

function toggleMobileMenu() {
  const willOpen = !document.querySelector(".sidebar").classList.contains("open");
  document.querySelector(".sidebar").classList.toggle("open", willOpen);
  document.querySelector("#sidebar-overlay").classList.toggle("show", willOpen);
  document.body.classList.toggle("nav-open", willOpen);
  document.querySelector("#mobile-menu").setAttribute("aria-expanded", String(willOpen));
}

document.querySelector("#mobile-menu").setAttribute("aria-expanded", "false");
document.querySelector("#mobile-menu").addEventListener("click", toggleMobileMenu);
document.querySelector("#sidebar-overlay").addEventListener("click", closeMobileMenu);

document.querySelector("#player-search")?.addEventListener("input", event => {
  const query = event.target.value.toLowerCase().trim();
  document.querySelectorAll("#players-body tr").forEach(row => {
    row.style.display = row.dataset.search.includes(query) ? "" : "none";
  });
});

document.querySelectorAll(".segmented button").forEach(button => button.addEventListener("click", () => {
  button.parentElement.querySelectorAll("button").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
}));

const requestModal = document.querySelector("#request-modal");
const requestCompose = document.querySelector("#request-compose");
const requestSuccess = document.querySelector("#request-success");
const requestSigner = document.querySelector("#request-signer");
const requestDocument = document.querySelector("#request-document");
const requestDestination = document.querySelector("#request-destination");

function selectedSigner() {
  return requestSigner.options[requestSigner.selectedIndex].dataset;
}

function selectedDocument() {
  return requestDocument.options[requestDocument.selectedIndex].dataset;
}

function signerUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("flow", "sign");
  url.searchParams.set("token", "FL-8H4K2D");
  return url.href;
}

function syncRequestPreview(resetDestination = false) {
  const signer = selectedSigner();
  const documentData = selectedDocument();
  const firstName = signer.name.split(" ")[0];
  const isEmail = state.requestChannel === "email";
  const destination = isEmail ? signer.email : signer.phone;

  if (resetDestination) requestDestination.value = destination;
  requestDestination.type = isEmail ? "email" : "tel";
  document.querySelector("#destination-label").textContent = isEmail ? "Correo de destino" : "Teléfono con WhatsApp";
  document.querySelector("#request-avatar").textContent = signer.initials;
  document.querySelector("#request-name").textContent = signer.name;
  document.querySelector("#request-contact").textContent = destination;
  document.querySelector("#email-to").textContent = isEmail ? requestDestination.value : signer.email;
  document.querySelector("#email-subject").textContent = `${firstName}, tenés un documento pendiente de firma`;
  document.querySelector("#email-first-name").textContent = firstName;
  document.querySelector("#email-document").textContent = documentData.title;
  document.querySelector("#email-document-code").textContent = `${documentData.code} · Temporada 2026`;
  document.querySelector("#whatsapp-first-name").textContent = firstName;
  document.querySelector("#whatsapp-document").textContent = documentData.title;
  document.querySelector("#sent-person").textContent = signer.name;
  document.querySelector("#sent-summary-person").textContent = signer.name;
  document.querySelector("#sent-summary-document").textContent = documentData.title;
}

function setRequestChannel(channel) {
  state.requestChannel = channel;
  document.querySelectorAll("[data-channel]").forEach(button => button.classList.toggle("active", button.dataset.channel === channel));
  const isEmail = channel === "email";
  document.querySelector("#email-preview").hidden = !isEmail;
  document.querySelector("#whatsapp-preview").hidden = isEmail;
  document.querySelector("#preview-channel-title").textContent = isEmail ? "Así recibirá el email" : "Así recibirá el WhatsApp";
  syncRequestPreview(true);
}

function openRequest() {
  requestCompose.hidden = false;
  requestSuccess.hidden = true;
  requestModal.classList.add("active");
  requestModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  syncRequestPreview(true);
  requestSigner.focus();
}

function closeRequest() {
  requestModal.classList.remove("active");
  requestModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

async function copySignerLink() {
  const value = signerUrl();
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = value;
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }
  showToast("Enlace copiado", "Ya podés pegar el acceso personal del firmante.");
}

document.querySelectorAll(".open-request").forEach(button => button.addEventListener("click", openRequest));
document.querySelectorAll("#request-close, #request-cancel, #request-backdrop, #success-close, #close-success").forEach(button => button.addEventListener("click", closeRequest));
document.querySelectorAll("[data-channel]").forEach(button => button.addEventListener("click", () => setRequestChannel(button.dataset.channel)));
requestSigner.addEventListener("change", () => syncRequestPreview(true));
requestDocument.addEventListener("change", () => syncRequestPreview(false));
requestDestination.addEventListener("input", () => {
  document.querySelector("#request-contact").textContent = requestDestination.value;
  if (state.requestChannel === "email") document.querySelector("#email-to").textContent = requestDestination.value;
});
document.querySelectorAll("#copy-sign-link, #copy-link-inline").forEach(button => button.addEventListener("click", copySignerLink));
document.querySelector("#send-request").addEventListener("click", () => {
  if (!requestDestination.value.trim()) {
    showToast("Falta el destinatario", "Ingresá un email o teléfono para enviar la solicitud.", "error");
    requestDestination.focus();
    return;
  }
  const signer = selectedSigner();
  requestCompose.hidden = true;
  requestSuccess.hidden = false;
  document.querySelector("#sent-channel").textContent = state.requestChannel === "email" ? "email" : "WhatsApp";
  if (requestSigner.value === "lucia") {
    document.querySelector("#lucia-status").textContent = "Enviada";
    document.querySelector("#lucia-doc-status").textContent = "Enviada";
    document.querySelector("#lucia-activity").textContent = "Enviada ahora";
    document.querySelector("#lucia-doc-date").textContent = "Ahora";
  }
  const activity = document.createElement("div");
  activity.className = "activity-item";
  activity.innerHTML = `<span class="avatar avatar-lilac">${signer.initials}</span><div><p><strong>${signer.name}</strong> recibió una solicitud</p><span>${signer.team} · Ahora</span></div><i class="status-dot info-dot"></i>`;
  document.querySelector("#activity-list").prepend(activity);
  requestModal.querySelector(".request-dialog").scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelector("#go-panthers")?.addEventListener("click", () => setView("teams"));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && requestModal.classList.contains("active")) closeRequest();
});

function openSigning() {
  closeRequest();
  adminApp.style.display = "none";
  signingApp.classList.add("active");
  signingApp.setAttribute("aria-hidden", "false");
  setSigningStep(state.signed ? 5 : 1);
  window.scrollTo(0, 0);
  setTimeout(() => maybeStartTour("signer"), 650);
}

function closeSigning() {
  signingApp.classList.remove("active");
  signingApp.setAttribute("aria-hidden", "true");
  adminApp.style.display = "block";
  window.scrollTo(0, 0);
}

document.querySelectorAll(".open-signing").forEach(button => button.addEventListener("click", openSigning));
document.querySelectorAll("#preview-sign-link, #open-signer-preview").forEach(button => button.addEventListener("click", openSigning));
document.querySelector("#exit-signing").addEventListener("click", closeSigning);
document.querySelector("#return-dashboard").addEventListener("click", () => { closeSigning(); setView("overview"); });

function setSigningStep(step) {
  state.signingStep = step;
  document.querySelectorAll(".sign-screen").forEach(screen => screen.classList.toggle("active", Number(screen.dataset.screen) === step));
  document.querySelectorAll(".sign-step").forEach(item => {
    const itemStep = Number(item.dataset.signStep);
    item.classList.toggle("active", itemStep === step);
    item.classList.toggle("complete", itemStep < step);
    const marker = item.querySelector(":scope > span");
    marker.textContent = itemStep < step ? "✓" : itemStep;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (step === 4) requestAnimationFrame(resizeCanvas);
}

function validateStep(step) {
  if (step === 1) {
    const dni = document.querySelector("#dni-input").value.trim();
    const privacy = document.querySelector("#privacy-check").checked;
    if (!dni || !state.demoDniLoaded || !privacy) {
      showToast("Faltan algunos datos", "Completá el DNI, cargá el documento demo y aceptá la privacidad.", "error");
      return false;
    }
  }
  if (step === 2) {
    const code = [...document.querySelectorAll("#otp-inputs input")].map(input => input.value).join("");
    if (code !== "246810") {
      showToast("Código incorrecto", "Para la demo, ingresá el código 246810.", "error");
      return false;
    }
  }
  if (step === 3 && !document.querySelector("#document-check").checked) {
    showToast("Confirmación requerida", "Marcá que leíste el documento antes de continuar.", "error");
    return false;
  }
  return true;
}

document.querySelectorAll(".next-sign").forEach(button => button.addEventListener("click", () => {
  if (validateStep(state.signingStep)) setSigningStep(Number(button.dataset.next));
}));
document.querySelectorAll(".back-button").forEach(button => button.addEventListener("click", () => setSigningStep(Number(button.dataset.back))));

const uploadZone = document.querySelector("#upload-zone");
const fileInput = document.querySelector("#dni-file");
uploadZone.addEventListener("click", event => { if (!event.target.closest("#demo-dni")) fileInput.click(); });
uploadZone.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") fileInput.click(); });
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) markDniLoaded(fileInput.files[0].name);
});

function markDniLoaded(name = "DNI_demo_Lucia.jpg") {
  state.demoDniLoaded = true;
  uploadZone.classList.add("done");
  document.querySelector("#upload-title").textContent = "Documento cargado correctamente";
  document.querySelector("#upload-caption").textContent = name;
  document.querySelector("#dni-input").value ||= "12345678Z";
}

document.querySelector("#demo-dni").addEventListener("click", event => { event.stopPropagation(); markDniLoaded(); showToast("Documento preparado", "Usamos datos ficticios para esta demostración."); });

const otpInputs = [...document.querySelectorAll("#otp-inputs input")];
otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    if (input.value && otpInputs[index + 1]) otpInputs[index + 1].focus();
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Backspace" && !input.value && otpInputs[index - 1]) otpInputs[index - 1].focus();
  });
  input.addEventListener("paste", event => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    pasted.split("").forEach((value, i) => { if (otpInputs[i]) otpInputs[i].value = value; });
    otpInputs[Math.min(pasted.length, 6) - 1].focus();
  });
});

document.querySelector("#fill-otp").addEventListener("click", () => {
  "246810".split("").forEach((value, index) => { otpInputs[index].value = value; });
  showToast("Código completado", "Ya podés verificar la identidad.");
});

const canvas = document.querySelector("#signature-canvas");
const context = canvas.getContext("2d");
let drawing = false;
let lastPoint = null;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  if (!rect.width || !rect.height) return;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.strokeStyle = "#172034";
  context.lineWidth = 2.3;
  context.lineCap = "round";
  context.lineJoin = "round";
  state.hasSignature = false;
  document.querySelector("#signature-placeholder").style.opacity = "1";
}

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener("pointerdown", event => {
  drawing = true;
  lastPoint = pointFromEvent(event);
  canvas.setPointerCapture(event.pointerId);
  document.querySelector("#signature-placeholder").style.opacity = "0";
});
canvas.addEventListener("pointermove", event => {
  if (!drawing) return;
  const point = pointFromEvent(event);
  context.beginPath();
  context.moveTo(lastPoint.x, lastPoint.y);
  context.lineTo(point.x, point.y);
  context.stroke();
  lastPoint = point;
  state.hasSignature = true;
});
canvas.addEventListener("pointerup", () => { drawing = false; lastPoint = null; });
canvas.addEventListener("pointercancel", () => { drawing = false; lastPoint = null; });
window.addEventListener("resize", () => { if (state.signingStep === 4 && !state.hasSignature) resizeCanvas(); });

document.querySelector("#clear-signature").addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  state.hasSignature = false;
  document.querySelector("#signature-placeholder").style.opacity = "1";
});

const formatDate = (date, withTime = true) => new Intl.DateTimeFormat("es-ES", {
  day: "2-digit", month: "2-digit", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
}).format(date);
document.querySelector("#signature-date").textContent = formatDate(new Date());

document.querySelector("#complete-signing").addEventListener("click", () => {
  if (!state.hasSignature) {
    showToast("Falta tu firma", "Dibujá una firma dentro del recuadro para finalizar.", "error");
    return;
  }
  state.signed = true;
  const now = new Date();
  document.querySelector("#completed-date").textContent = formatDate(now);
  document.querySelector("#signed-metric").textContent = "150";
  document.querySelector("#pending-metric").textContent = "34";
  document.querySelector("#legend-signed").textContent = "150";
  document.querySelector("#legend-pending").textContent = "26";
  document.querySelector("#donut-value").textContent = "82%";
  document.querySelector("#donut").style.background = "conic-gradient(#179b68 0 82%, #eef0f4 82% 100%)";
  [document.querySelector("#lucia-status"), document.querySelector("#lucia-doc-status")].forEach(status => {
    status.textContent = "Firmado";
    status.className = "badge signed";
  });
  document.querySelector("#lucia-activity").textContent = "Firmado ahora";
  document.querySelector("#lucia-doc-date").textContent = "Ahora";
  const activity = document.createElement("div");
  activity.className = "activity-item";
  activity.innerHTML = '<span class="avatar avatar-lilac">LM</span><div><p><strong>Lucía Martínez</strong> firmó el documento</p><span>Las Panteras · Ahora</span></div><i class="status-dot success-dot"></i>';
  document.querySelector("#activity-list").prepend(activity);
  setSigningStep(5);
});

const onboardingTour = document.querySelector("#onboarding-tour");
const tourTooltip = document.querySelector("#tour-tooltip");
const tourTitle = document.querySelector("#tour-title");
const tourCopy = document.querySelector("#tour-copy");
const tourStepLabel = document.querySelector("#tour-step-label");
const tourProgress = document.querySelector("#tour-progress");
const tourBack = document.querySelector("#tour-back");
const tourNext = document.querySelector("#tour-next");
const tourSkip = document.querySelector("#tour-skip");

const adminTourSteps = [
  {
    label: "BIENVENIDO",
    title: "Conocé FirmaLiga",
    copy: "Te mostramos las funciones principales para que puedas enviar y controlar firmas en menos de un minuto.",
  },
  {
    label: "PASO 1 DE 4",
    title: "Creá una solicitud de firma",
    copy: "Desde este botón elegís a la persona, el documento y si recibirá su enlace por email o WhatsApp.",
    target: "#open-signing-top",
    placement: "bottom",
  },
  {
    label: "PASO 2 DE 4",
    title: "Gestioná jugadores y equipos",
    copy: "Acá encontrás los datos, la verificación de identidad y el estado de firma de cada jugador.",
    target: '.nav-item[data-view="teams"]',
    placement: "right",
  },
  {
    label: "PASO 3 DE 4",
    title: "Todos los documentos, ordenados",
    copy: "Consultá solicitudes pendientes, documentos firmados y plantillas desde un mismo lugar.",
    target: '.nav-item[data-view="documents"]',
    placement: "right",
  },
  {
    label: "PASO 4 DE 4",
    title: "Seguí el avance en tiempo real",
    copy: "El panel resume quién firmó, quién tiene una solicitud pendiente y qué acciones faltan.",
    target: ".progress-panel .panel-heading",
    placement: "bottom",
  },
  {
    label: "GUÍA COMPLETADA",
    title: "¡Todo listo para empezar!",
    copy: "Creá tu primera solicitud cuando quieras. Podés volver a abrir esta guía desde el ícono de ayuda de la barra superior.",
  },
];

const signerTourSteps = [
  {
    label: "ANTES DE EMPEZAR",
    title: "Tu firma, paso a paso",
    copy: "Esta guía te acompaña para verificar tu identidad, revisar el documento y firmarlo de forma segura.",
  },
  {
    label: "PASO 1 DE 2",
    title: "Cuatro etapas claras",
    copy: "Siempre vas a saber en qué punto estás. Podés volver al paso anterior antes de confirmar la firma.",
    target: ".step-list",
    placement: "right",
  },
  {
    label: "PASO 2 DE 2",
    title: "Tus datos están protegidos",
    copy: "Completá tu identidad y cargá el documento solicitado. En esta demo no se envía ni almacena información real.",
    target: ".form-card",
    placement: "left",
  },
  {
    label: "YA PODÉS CONTINUAR",
    title: "Empecemos la firma",
    copy: "Usá los datos de demostración y seguí las indicaciones de cada pantalla hasta finalizar.",
  },
];

const tourStorageKeys = {
  admin: "firmaliga_onboarding_admin_v1",
  signer: "firmaliga_onboarding_signer_v1",
};

let activeTourSteps = [];
let activeTourScope = "admin";
let activeTourIndex = 0;
let activeTourTarget = null;
let tourOpenedMenu = false;

function hasSeenTour(scope) {
  try { return localStorage.getItem(tourStorageKeys[scope]) === "complete"; }
  catch { return false; }
}

function rememberTour(scope) {
  try { localStorage.setItem(tourStorageKeys[scope], "complete"); }
  catch { /* The tour still works when browser storage is unavailable. */ }
}

function clearTourHighlight() {
  document.querySelectorAll(".tour-highlight").forEach(element => element.classList.remove("tour-highlight"));
  document.querySelectorAll(".tour-layer").forEach(element => element.classList.remove("tour-layer"));
  activeTourTarget = null;
}

function positionTourTooltip() {
  if (!onboardingTour.classList.contains("active")) return;
  const step = activeTourSteps[activeTourIndex];
  if (!activeTourTarget || !step.target) {
    tourTooltip.classList.add("centered");
    tourTooltip.style.left = "";
    tourTooltip.style.top = "";
    return;
  }

  tourTooltip.classList.remove("centered");
  const targetRect = activeTourTarget.getBoundingClientRect();
  const tooltipRect = tourTooltip.getBoundingClientRect();
  const gap = 16;
  const pad = 12;
  const spaces = {
    top: targetRect.top,
    bottom: window.innerHeight - targetRect.bottom,
    left: targetRect.left,
    right: window.innerWidth - targetRect.right,
  };
  const required = {
    top: tooltipRect.height + gap,
    bottom: tooltipRect.height + gap,
    left: tooltipRect.width + gap,
    right: tooltipRect.width + gap,
  };
  let placement = step.placement || "bottom";
  if (spaces[placement] < required[placement]) {
    placement = Object.keys(spaces).sort((a, b) => spaces[b] - spaces[a])[0];
  }

  let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
  let top = targetRect.bottom + gap;
  if (placement === "top") top = targetRect.top - tooltipRect.height - gap;
  if (placement === "left") {
    left = targetRect.left - tooltipRect.width - gap;
    top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
  }
  if (placement === "right") {
    left = targetRect.right + gap;
    top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
  }

  left = Math.max(pad, Math.min(left, window.innerWidth - tooltipRect.width - pad));
  top = Math.max(pad, Math.min(top, window.innerHeight - tooltipRect.height - pad));
  tourTooltip.style.left = `${left}px`;
  tourTooltip.style.top = `${top}px`;
}

function renderTourProgress() {
  tourProgress.innerHTML = activeTourSteps.map((_, index) => `<i class="${index === activeTourIndex ? "active" : index < activeTourIndex ? "complete" : ""}"></i>`).join("");
}

function showTourStep(index) {
  clearTourHighlight();
  activeTourIndex = Math.max(0, Math.min(index, activeTourSteps.length - 1));
  const step = activeTourSteps[activeTourIndex];
  const isFirst = activeTourIndex === 0;
  const isLast = activeTourIndex === activeTourSteps.length - 1;

  tourStepLabel.textContent = step.label;
  tourTitle.textContent = step.title;
  tourCopy.textContent = step.copy;
  tourBack.style.display = isFirst ? "none" : "inline-flex";
  tourSkip.style.visibility = isLast ? "hidden" : "visible";
  tourNext.textContent = isFirst ? "Comenzar" : isLast ? "Finalizar" : "Siguiente";
  renderTourProgress();

  const target = step.target ? document.querySelector(step.target) : null;
  const targetInSidebar = target?.closest(".sidebar");
  if (targetInSidebar && window.innerWidth <= 790 && !document.querySelector(".sidebar").classList.contains("open")) {
    toggleMobileMenu();
    tourOpenedMenu = true;
  } else if (!targetInSidebar && tourOpenedMenu) {
    closeMobileMenu();
    tourOpenedMenu = false;
  }

  if (target) {
    activeTourTarget = target;
    target.classList.add("tour-highlight");
    const layer = target.closest(".sidebar, .topbar, .signing-header");
    if (layer) layer.classList.add("tour-layer");
    if (!targetInSidebar && !target.closest(".topbar, .signing-header")) {
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }

  tourTooltip.classList.toggle("centered", !target);
  setTimeout(positionTourTooltip, targetInSidebar ? 300 : 160);
  tourNext.focus({ preventScroll: true });
}

function endTour(markComplete = true) {
  if (markComplete) rememberTour(activeTourScope);
  clearTourHighlight();
  onboardingTour.classList.remove("active");
  onboardingTour.setAttribute("aria-hidden", "true");
  if (tourOpenedMenu) closeMobileMenu();
  tourOpenedMenu = false;
}

function startTour(scope = "admin", force = false) {
  if (!force && hasSeenTour(scope)) return;
  if (onboardingTour.classList.contains("active")) endTour(false);
  activeTourScope = scope;
  activeTourSteps = scope === "signer" ? signerTourSteps : adminTourSteps;
  if (scope === "admin") setView("overview");
  onboardingTour.classList.add("active");
  onboardingTour.setAttribute("aria-hidden", "false");
  showTourStep(0);
}

function maybeStartTour(scope) {
  if (requestModal.classList.contains("active") || onboardingTour.classList.contains("active")) return;
  startTour(scope, false);
}

tourNext.addEventListener("click", () => {
  if (activeTourIndex === activeTourSteps.length - 1) endTour(true);
  else showTourStep(activeTourIndex + 1);
});
tourBack.addEventListener("click", () => showTourStep(activeTourIndex - 1));
document.querySelectorAll("#tour-skip, #tour-close").forEach(button => button.addEventListener("click", () => endTour(true)));
document.querySelector("#restart-tour").addEventListener("click", () => startTour("admin", true));
document.querySelector("#restart-signer-tour").addEventListener("click", () => startTour("signer", true));
window.addEventListener("resize", () => {
  if (onboardingTour.classList.contains("active")) positionTourTooltip();
});

document.querySelectorAll("button").forEach(button => {
  if (button.closest("#onboarding-tour")) return;
  if (button.closest("#request-modal")) return;
  if (button.matches(".nav-item, .open-signing, .open-request, #go-panthers, #restart-tour, #restart-signer-tour, #exit-signing, #return-dashboard, .next-sign, .back-button, #demo-dni, #fill-otp, #clear-signature, #complete-signing, #mobile-menu, .segmented button")) return;
  if (!button.closest(".pdf-toolbar") && !button.closest(".profile-card")) {
    button.addEventListener("click", () => showToast("Función de demostración", "Este control se conectará con el backend en la versión productiva."));
  }
});

const initialParams = new URLSearchParams(window.location.search);
const initialView = initialParams.get("view");
if (["overview", "teams", "documents", "verification", "settings"].includes(initialView)) {
  setView(initialView);
}
if (initialParams.get("flow") === "sign") {
  openSigning();
}
if (initialParams.get("compose") === "1") {
  openRequest();
}

setTimeout(() => {
  if (initialParams.get("compose") === "1") return;
  maybeStartTour(signingApp.classList.contains("active") ? "signer" : "admin");
}, 650);
