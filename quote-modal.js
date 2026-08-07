/* =============================================================================
   Enquiry modal — shared across pages.

   ###########################################################################
   ##  THIS FORM DOES NOT SEND ANYTHING ANYWHERE.                           ##
   ##                                                                       ##
   ##  On submit it shows a confirmation and discards the input, which is   ##
   ##  the same behaviour as the form on contact.html. Both need a real     ##
   ##  endpoint before the site is handed to real users — search this file  ##
   ##  for SUBMIT-ENDPOINT for the one place to wire it up.                 ##
   ###########################################################################

   Why this is a standalone script rather than part of a page component:
   every page carries its own copy of the component logic, so anything written
   that way has to be duplicated into each file and re-edited in each file
   forever. This is loaded with one script tag and has a single source of truth.

   It also carries its own stylesheet rather than using Tailwind classes. The
   Tailwind build here is the Play CDN, which compiles classes at runtime after
   the DOM changes; a panel that appears and animates in the same instant is
   exactly the case where a rule can arrive too late. These styles exist before
   anything opens.

   Usage — mark any element as a trigger:

     <a href="contact.html"
        data-quote-modal
        data-quote-subject="Pharmaceutical"
        data-quote-sector="Pharmaceutical">Get A Quote</a>

   data-quote-subject  shown to the user as the enquiry context (optional)
   data-quote-sector   pre-selects the sector dropdown, must match an option
                       label exactly (optional)

   The href is left in place on purpose: without JavaScript the trigger is
   still an ordinary link to the full contact page.
   ============================================================================= */
(function () {
  "use strict";

  var SECTORS = ["Pharmaceutical", "Veterinary", "Medical Device", "Cosmetic", "Supplements", "Biocide", "Other"];

  // Matches the site's easing and duration so the panel feels like the rest of it.
  // The scrim sits above the page loading curtain (2147483000) so that a curtain
  // left showing for any reason cannot hide the dialog.
  var CSS = [
    ".gmpq-scrim{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:flex-start;justify-content:center;",
    "  padding:24px 16px;overflow-y:auto;background:rgba(17,17,17,0.55);opacity:0;",
    "  transition:opacity 220ms ease-in-out;-webkit-overflow-scrolling:touch}",
    ".gmpq-scrim.is-open{opacity:1}",
    ".gmpq-panel{position:relative;width:100%;max-width:560px;margin:auto;background:#fff;border-radius:18px;",
    "  padding:28px 24px 26px;box-sizing:border-box;box-shadow:0 32px 64px -24px rgba(17,17,17,0.45);",
    "  transform:translateY(12px);transition:transform 220ms cubic-bezier(0.4,0,0.2,1);",
    "  font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif}",
    ".gmpq-scrim.is-open .gmpq-panel{transform:translateY(0)}",
    "@media(min-width:768px){.gmpq-panel{padding:34px 34px 32px}}",
    ".gmpq-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border:0;border-radius:50%;",
    "  background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;",
    "  transition:background 180ms ease-in-out}",
    ".gmpq-close:hover{background:rgba(17,17,17,0.07)}",
    ".gmpq-close:focus-visible{outline:2px solid rgb(178,33,38);outline-offset:2px}",
    ".gmpq-close svg{width:15px;height:15px;stroke:rgb(51,51,51);stroke-width:2;fill:none;stroke-linecap:round}",
    ".gmpq-eyebrow{display:block;font-size:12px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;",
    "  color:rgb(178,33,38);font-weight:600;margin:0 0 6px}",
    ".gmpq-title{margin:0 0 6px;font-size:24px;line-height:30px;letter-spacing:-0.7px;font-weight:600;color:rgb(17,17,17)}",
    ".gmpq-intro{margin:0 0 20px;font-size:14px;line-height:21px;color:rgba(51,51,51,0.75)}",
    ".gmpq-context{display:inline-block;margin:0 0 20px;padding:6px 12px;border-radius:999px;font-size:13px;",
    "  line-height:18px;background:rgba(37,117,187,0.08);color:rgb(41,37,96);font-weight:500}",
    ".gmpq-grid{display:grid;grid-template-columns:1fr;gap:14px}",
    "@media(min-width:600px){.gmpq-grid{grid-template-columns:1fr 1fr}.gmpq-full{grid-column:1/-1}}",
    ".gmpq-field{display:flex;flex-direction:column;gap:6px;min-width:0}",
    ".gmpq-label{font-size:13px;line-height:18px;font-weight:500;color:rgb(51,51,51)}",
    ".gmpq-input,.gmpq-select,.gmpq-textarea{width:100%;box-sizing:border-box;border:1px solid rgba(51,51,51,0.22);",
    "  border-radius:10px;padding:11px 13px;font-size:15px;line-height:21px;color:rgb(17,17,17);background:#fff;",
    "  font-family:inherit;transition:border-color 180ms ease-in-out,box-shadow 180ms ease-in-out}",
    ".gmpq-textarea{min-height:104px;resize:vertical}",
    ".gmpq-input:focus,.gmpq-select:focus,.gmpq-textarea:focus{outline:none;border-color:rgb(178,33,38);",
    "  box-shadow:0 0 0 3px rgba(178,33,38,0.12)}",
    ".gmpq-input[aria-invalid='true'],.gmpq-textarea[aria-invalid='true']{border-color:rgb(178,33,38)}",
    ".gmpq-error{font-size:12px;line-height:16px;color:rgb(178,33,38);min-height:0}",
    ".gmpq-actions{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:22px}",
    ".gmpq-submit{border:0;border-radius:32px;background:rgb(45,38,93);color:#fff;font-family:inherit;font-weight:500;",
    "  font-size:15px;line-height:20px;padding:14px 26px;cursor:pointer;",
    "  transition:background 200ms ease-in-out,box-shadow 200ms ease-in-out,transform 200ms ease-in-out}",
    ".gmpq-submit:hover{background:rgb(178,33,38);transform:translateY(-2px);",
    "  box-shadow:0 16px 32px -12px rgba(178,33,38,0.45)}",
    ".gmpq-submit:focus-visible{outline:2px solid rgb(178,33,38);outline-offset:3px}",
    ".gmpq-alt{font-size:13px;line-height:18px;color:rgba(51,51,51,0.7)}",
    ".gmpq-alt a{color:rgb(45,38,93);font-weight:500}",
    ".gmpq-done{text-align:left;padding:8px 0 4px}",
    ".gmpq-done-mark{width:44px;height:44px;border-radius:50%;background:rgba(37,117,187,0.1);display:flex;",
    "  align-items:center;justify-content:center;margin:0 0 14px}",
    ".gmpq-done-mark svg{width:20px;height:20px;stroke:rgb(37,117,187);stroke-width:2.4;fill:none;",
    "  stroke-linecap:round;stroke-linejoin:round}",
    // The eyebrow and context chip set display on a class, which outranks the
    // user-agent [hidden]{display:none} — without this they stay on screen after
    // being hidden. Scoped to this component so it cannot affect the page.
    ".gmpq-panel [hidden]{display:none!important}",
    // Focus is moved here programmatically to announce the confirmation, so the
    // ring would appear without the user having tabbed anywhere.
    ".gmpq-done .gmpq-title:focus{outline:none}",
    "@media(prefers-reduced-motion:reduce){.gmpq-scrim,.gmpq-panel,.gmpq-submit{transition-duration:.01ms}}"
  ].join("\n");

  var scrim = null;      // built once, on first open
  var lastFocused = null;
  var scrollY = 0;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function injectStyles() {
    if (document.getElementById("gmpq-styles")) return;
    var st = document.createElement("style");
    st.id = "gmpq-styles";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function field(label, cls, type, name, placeholder, required) {
    var wrap = el("div", "gmpq-field" + (cls ? " " + cls : ""));
    var id = "gmpq-" + name;
    var lab = el("label", "gmpq-label", label + (required ? " *" : ""));
    lab.setAttribute("for", id);
    var input;
    if (type === "textarea") {
      input = el("textarea", "gmpq-textarea");
    } else if (type === "select") {
      input = el("select", "gmpq-select");
      SECTORS.forEach(function (s) { input.appendChild(el("option", null, s)); });
    } else {
      input = el("input", "gmpq-input");
      input.type = type;
    }
    input.id = id;
    input.name = name;
    if (placeholder) input.placeholder = placeholder;
    if (required) input.required = true;
    var err = el("span", "gmpq-error");
    err.id = id + "-error";
    input.setAttribute("aria-describedby", err.id);
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(err);
    return wrap;
  }

  function build() {
    injectStyles();
    scrim = el("div", "gmpq-scrim");
    scrim.setAttribute("hidden", "");

    var panel = el("div", "gmpq-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "gmpq-title");

    var close = el("button", "gmpq-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close enquiry form");
    close.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>';

    var body = el("div", "gmpq-body");
    body.appendChild(el("span", "gmpq-eyebrow", "Enquiry"));
    var title = el("h2", "gmpq-title", "Request a quote");
    title.id = "gmpq-title";
    body.appendChild(title);
    body.appendChild(el("p", "gmpq-intro", "Tell us what you need and a member of the team will come back to you within one business day."));
    var ctx = el("span", "gmpq-context");
    ctx.hidden = true;
    body.appendChild(ctx);

    var form = el("form", "gmpq-form");
    form.setAttribute("novalidate", "");      // we render our own messages
    var grid = el("div", "gmpq-grid");
    grid.appendChild(field("Full Name", null, "text", "name", "Jane Doe", true));
    grid.appendChild(field("Email Address", null, "email", "email", "jane@example.com", true));
    grid.appendChild(field("Company", null, "text", "company", "Company name", false));
    grid.appendChild(field("Sector", null, "select", "sector", null, false));
    grid.appendChild(field("Message", "gmpq-full", "textarea", "message", "Tell us about your product or enquiry...", true));
    form.appendChild(grid);

    var actions = el("div", "gmpq-actions");
    var submit = el("button", "gmpq-submit", "Send Enquiry");
    submit.type = "submit";
    var alt = el("span", "gmpq-alt");
    alt.innerHTML = 'Prefer the full page? <a href="contact.html">Go to Contact</a>';
    actions.appendChild(submit); actions.appendChild(alt);
    form.appendChild(actions);
    body.appendChild(form);

    var done = el("div", "gmpq-done");
    done.hidden = true;
    var mark = el("div", "gmpq-done-mark");
    mark.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
    done.appendChild(mark);
    done.appendChild(el("h2", "gmpq-title", "Thanks — your enquiry has been received."));
    done.appendChild(el("p", "gmpq-intro", "A member of our team will get back to you within one business day."));
    body.appendChild(done);

    panel.appendChild(close);
    panel.appendChild(body);
    scrim.appendChild(panel);
    document.body.appendChild(scrim);

    scrim.__parts = { panel: panel, form: form, done: done, ctx: ctx, title: title };

    close.addEventListener("click", closeModal);
    scrim.addEventListener("mousedown", function (e) { if (e.target === scrim) closeModal(); });
    form.addEventListener("submit", onSubmit);
    panel.addEventListener("keydown", trapTab);
    return scrim;
  }

  function trapTab(e) {
    if (e.key !== "Tab") return;
    var f = scrim.__parts.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var list = [];
    for (var i = 0; i < f.length; i++) if (f[i].offsetParent !== null) list.push(f[i]);
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function onKeydown(e) { if (e.key === "Escape") closeModal(); }

  function showError(input, message) {
    var err = document.getElementById(input.id + "-error");
    if (err) err.textContent = message || "";
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = scrim.__parts.form;
    var name = form.elements.name, email = form.elements.email, message = form.elements.message;
    var ok = true;
    [name, email, message].forEach(function (i) { showError(i, ""); });
    if (!name.value.trim()) { showError(name, "Please enter your name."); ok = false; }
    if (!email.value.trim()) { showError(email, "Please enter your email address."); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, "That email address does not look right."); ok = false; }
    if (!message.value.trim()) { showError(message, "Please tell us about your enquiry."); ok = false; }
    if (!ok) {
      var bad = form.querySelector("[aria-invalid='true']");
      if (bad) bad.focus();
      return;
    }

    // ---- SUBMIT-ENDPOINT -----------------------------------------------
    // Nothing is sent. The values collected below are deliberately assembled
    // and then dropped, so that wiring this up later is a single fetch() call
    // against `payload` rather than a rewrite. Until that exists the user is
    // shown a confirmation for an enquiry nobody received.
    var payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      company: form.elements.company.value.trim(),
      sector: form.elements.sector.value,
      message: message.value.trim(),
      context: scrim.__parts.ctx.hidden ? "" : scrim.__parts.ctx.textContent,
      page: location.pathname
    };
    if (window.console && console.warn) {
      console.warn("[gmp] Enquiry form is not connected to a backend — this submission was discarded.", payload);
    }
    // --------------------------------------------------------------------

    scrim.__parts.form.hidden = true;
    scrim.__parts.ctx.hidden = true;
    scrim.__parts.title.hidden = true;
    scrim.__parts.panel.querySelector(".gmpq-eyebrow").hidden = true;
    scrim.__parts.panel.querySelector(".gmpq-intro").hidden = true;
    scrim.__parts.done.hidden = false;
    // Move focus onto the confirmation so it is announced and so Tab does not
    // land back on the now-hidden form.
    var heading = scrim.__parts.done.querySelector(".gmpq-title");
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }

  function openModal(trigger) {
    if (!scrim) build();
    lastFocused = trigger || document.activeElement;

    var parts = scrim.__parts;
    // Always reopen on the form, never on a previous confirmation.
    parts.form.hidden = false;
    parts.done.hidden = true;
    parts.title.hidden = false;
    parts.panel.querySelector(".gmpq-eyebrow").hidden = false;
    parts.panel.querySelector(".gmpq-intro").hidden = false;
    parts.form.reset();
    ["name", "email", "message"].forEach(function (n) { showError(parts.form.elements[n], ""); });

    var subject = trigger && trigger.getAttribute("data-quote-subject");
    if (subject) {
      parts.ctx.textContent = "Enquiry about: " + subject;
      parts.ctx.hidden = false;
    } else {
      parts.ctx.hidden = true;
    }
    var sector = trigger && trigger.getAttribute("data-quote-sector");
    if (sector) {
      var sel = parts.form.elements.sector;
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text === sector) { sel.selectedIndex = i; break; }
      }
    }

    // Lock the page behind the scrim. Fixing the body is what stops iOS from
    // scrolling the page underneath, but it also jumps to the top, so the
    // offset is restored on close.
    scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    scrim.removeAttribute("hidden");
    // Next frame, so the opening transition has a start value to animate from.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scrim.classList.add("is-open");
        parts.form.elements.name.focus();
      });
    });
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    if (!scrim || scrim.hasAttribute("hidden")) return;
    scrim.classList.remove("is-open");
    document.removeEventListener("keydown", onKeydown);
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.overflow = "";
    window.scrollTo(0, scrollY);
    var done = function () { scrim.setAttribute("hidden", ""); };
    setTimeout(done, 240);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // Delegated, because the page components re-render and replace their nodes;
  // listeners bound to individual triggers would be dropped on the next render.
  //
  // Bound on window in the capture phase for a specific reason: each page has an
  // inline handler that shows the loading curtain on any internal <a href> click,
  // to make page-to-page moves feel continuous. That handler is also capture, and
  // being inline in <head> it registers before this deferred script, so it cannot
  // be beaten on document. Capture runs window first, so stopping propagation
  // here means the curtain never learns about the click — otherwise it slides
  // over the whole screen, above the modal, for a navigation that never happens.
  window.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest("[data-quote-modal]");
    if (!t) return;
    // Modified and middle clicks stay ordinary link behaviour, so "open in new
    // tab" still reaches the full contact page.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    openModal(t);
  }, true);

  window.gmpQuoteModal = { open: openModal, close: closeModal };
})();
