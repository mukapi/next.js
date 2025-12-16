/**
 * OPdiag - Formulaire Multi-step avec calcul de prix
 *
 * ATTRIBUTS REQUIS DANS WEBFLOW:
 *
 * STRUCTURE:
 * - Form:                    data-form="estimation"
 * - Steps:                   data-step="1", "2", "3"
 * - Boutons suivant:         data-action="next"
 * - Champs conditionnels:    data-conditional="elec" / "gaz"
 *
 * CHAMPS (sur les labels/wrappers des radios, ou sur les inputs):
 * - Radio Vendre/Louer:      data-field="projet"
 * - Radio Type de bien:      data-field="type-bien"
 * - Input Adresse:           data-field="adresse"
 * - Input Ville/CP:          data-field="ville-cp"
 * - Input Surface:           data-field="surface"
 * - Input Année:             data-field="annee"
 * - Radio Elec présent:      data-field="elec"
 * - Radio Elec > 15 ans:     data-field="elec-old"
 * - Radio Gaz présent:       data-field="gaz"
 * - Radio Gaz > 15 ans:      data-field="gaz-old"
 */

(function () {
  "use strict";

  // ============================================
  // CONFIGURATION - Grille tarifaire
  // ============================================

  const TARIFS = {
    appartement: {
      tranches: [45, 90, 120],
      packVente: [230, 260, 310, null],
      packLocation: [200, 240, 290, null],
      elecGazAmianteTermites: [85, 95, 100, null],
    },
    maison: {
      tranches: [80, 120, 170],
      packVente: [300, 360, 420, null],
      packLocation: [275, 330, 390, null],
      elecGazAmianteTermites: [75, 90, 100, null],
    },
    cave: {
      tousLesDiags: 140,
    },
  };

  // ============================================
  // SELECTORS (uniquement data-*)
  // ============================================

  const SELECTORS = {
    form: '[data-form="estimation"]',
    step: "[data-step]",
    nextBtn: '[data-action="next"]',
    field: (name) => `[data-field="${name}"]`,
    conditional: (name) => `[data-conditional="${name}"]`,
  };

  // ============================================
  // STATE
  // ============================================

  let currentStep = 1;
  let form = null;
  let steps = [];

  // ============================================
  // INIT
  // ============================================

  function init() {
    form = document.querySelector(SELECTORS.form);
    if (!form) {
      console.warn("OPdiag: Form not found. Add data-form='estimation' to your form.");
      return;
    }

    steps = Array.from(form.querySelectorAll(SELECTORS.step));

    showStep(1);
    setupNavigation();
    setupConditionalFields();
    setupFormSubmission();

    console.log("OPdiag: Multi-step form initialized");
  }

  // ============================================
  // STEP NAVIGATION
  // ============================================

  function showStep(stepNumber) {
    steps.forEach((step) => {
      const stepNum = step.getAttribute("data-step");
      step.style.display = stepNum === String(stepNumber) ? "flex" : "none";
    });
    currentStep = stepNumber;
  }

  function setupNavigation() {
    const nextButtons = form.querySelectorAll(SELECTORS.nextBtn);

    nextButtons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (validateStep(currentStep)) {
          showStep(currentStep + 1);
        }
      });
    });
  }

  function validateStep(stepNumber) {
    const currentStepEl = steps.find(
      (s) => s.getAttribute("data-step") === String(stepNumber)
    );
    if (!currentStepEl) return true;

    const requiredInputs = currentStepEl.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );

    let isValid = true;
    const checkedRadioGroups = new Set();

    requiredInputs.forEach((input) => {
      // Skip hidden conditional fields
      const conditionalWrapper = input.closest("[data-conditional]");
      if (conditionalWrapper && conditionalWrapper.style.display === "none") {
        return;
      }

      if (input.type === "radio") {
        // Get field name from input or parent wrapper
        let fieldName = input.getAttribute("data-field");
        if (!fieldName) {
          const wrapper = input.closest("[data-field]");
          fieldName = wrapper?.getAttribute("data-field");
        }

        if (fieldName && !checkedRadioGroups.has(fieldName)) {
          checkedRadioGroups.add(fieldName);
          const wrappers = currentStepEl.querySelectorAll(`[data-field="${fieldName}"]`);
          let anyChecked = false;
          wrappers.forEach((wrapper) => {
            const radio = wrapper.tagName === "INPUT" ? wrapper : wrapper.querySelector("input[type='radio']");
            if (radio && radio.checked) anyChecked = true;
          });

          if (!anyChecked) {
            isValid = false;
          }
        }
      } else if (!input.value.trim()) {
        isValid = false;
      }
    });

    return isValid;
  }

  // ============================================
  // CONDITIONAL FIELDS
  // ============================================

  function setupConditionalFields() {
    // Hide conditional fields initially
    form.querySelectorAll("[data-conditional]").forEach((field) => {
      field.style.display = "none";
    });

    // Elec conditional
    setupConditionalTrigger("elec", "elec");

    // Gaz conditional
    setupConditionalTrigger("gaz", "gaz");
  }

  function setupConditionalTrigger(fieldName, conditionalName) {
    const elements = form.querySelectorAll(SELECTORS.field(fieldName));
    elements.forEach((el) => {
      const input = el.tagName === "INPUT" ? el : el.querySelector("input");
      if (!input) return;

      input.addEventListener("change", function () {
        const conditional = form.querySelector(
          SELECTORS.conditional(conditionalName)
        );
        if (conditional) {
          conditional.style.display = this.value === "Oui" ? "block" : "none";
        }
      });
    });
  }

  // ============================================
  // FORM SUBMISSION & PRICE CALCULATION
  // ============================================

  function setupFormSubmission() {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = collectFormData();
      const result = calculatePrice(formData);
      displayResult(result);
    });
  }

  function getFieldValue(fieldName) {
    const el = form.querySelector(SELECTORS.field(fieldName));
    if (!el) return null;

    if (el.tagName === "INPUT") {
      if (el.type === "radio") {
        const checked = form.querySelector(`${SELECTORS.field(fieldName)}:checked`);
        return checked ? checked.value : null;
      }
      return el.value;
    }

    const input = el.querySelector("input");
    if (input) {
      if (input.type === "radio") {
        const wrappers = form.querySelectorAll(SELECTORS.field(fieldName));
        for (const wrapper of wrappers) {
          const radio = wrapper.querySelector("input[type='radio']");
          if (radio && radio.checked) {
            return radio.value;
          }
        }
        return null;
      }
      return input.value;
    }

    return null;
  }

  function collectFormData() {
    return {
      projet: getFieldValue("projet"),
      typeBien: getFieldValue("type-bien"),
      adresse: getFieldValue("adresse") || "",
      villeCP: getFieldValue("ville-cp") || "",
      surface: parseFloat(getFieldValue("surface")) || 0,
      anneeConstruction: parseInt(getFieldValue("annee")) || 2000,
      hasElec: getFieldValue("elec") === "Oui",
      elecOld: getFieldValue("elec-old") === "Oui",
      hasGaz: getFieldValue("gaz") === "Oui",
      gazOld: getFieldValue("gaz-old") === "Oui",
    };
  }

  function calculatePrice(data) {
    const result = {
      prixBase: 0,
      extras: [],
      total: 0,
      needsContact: false,
      diagnosticsInclus: [],
      diagnosticsSupp: [],
    };

    // Determine property type
    let typeKey = "appartement";
    if (data.typeBien === "Maison individuelle") {
      typeKey = "maison";
    } else if (
      data.typeBien?.toLowerCase().includes("cave") ||
      data.typeBien?.toLowerCase().includes("parking") ||
      data.typeBien?.toLowerCase().includes("autre")
    ) {
      typeKey = "cave";
    }

    // Cave/parking: fixed price
    if (typeKey === "cave") {
      result.prixBase = TARIFS.cave.tousLesDiags;
      result.diagnosticsInclus = ["ERP", "Amiante", "Termites"];
      result.total = result.prixBase;
      return result;
    }

    const tarif = TARIFS[typeKey];

    // Surface bracket
    let bracket = tarif.tranches.findIndex((t) => data.surface <= t);
    if (bracket === -1) bracket = 3;

    // Too large = contact
    if (bracket === 3) {
      result.needsContact = true;
      return result;
    }

    // Base pack price
    const isVente = data.projet === "Vendre";
    result.prixBase = isVente
      ? tarif.packVente[bracket]
      : tarif.packLocation[bracket];

    // Included diagnostics
    result.diagnosticsInclus = isVente
      ? ["DPE", "Carrez", "ERP", "Termites"]
      : ["DPE", "Boutin", "ERP"];

    // Amiante (< 1997)
    if (data.anneeConstruction < 1997) {
      result.diagnosticsSupp.push("Amiante");
      result.extras.push({
        name: "Amiante",
        price: tarif.elecGazAmianteTermites[bracket],
      });
    }

    // Plomb (< 1948)
    if (data.anneeConstruction < 1948) {
      result.diagnosticsSupp.push("Plomb");
      result.needsContact = true;
    }

    // Elec
    if (data.hasElec && data.elecOld) {
      result.diagnosticsSupp.push("Électricité");
      result.extras.push({
        name: "Électricité",
        price: tarif.elecGazAmianteTermites[bracket],
      });
    }

    // Gaz
    if (data.hasGaz && data.gazOld) {
      result.diagnosticsSupp.push("Gaz");
      result.extras.push({
        name: "Gaz",
        price: tarif.elecGazAmianteTermites[bracket],
      });
    }

    // Total
    const extrasTotal = result.extras.reduce((sum, e) => sum + e.price, 0);
    result.total = result.prixBase + extrasTotal;

    return result;
  }

  // ============================================
  // DISPLAY RESULT
  // ============================================

  function displayResult(result) {
    console.log("OPdiag Result:", result);

    // Find Webflow success div and its first child element (div or p)
    const webflowSuccess = form.parentElement.querySelector(".w-form-done");
    if (webflowSuccess) {
      const textElement = webflowSuccess.firstElementChild;
      if (textElement) {
        textElement.textContent = generateResultText(result);
      }
    }
  }

  function generateResultText(result) {
    if (result.needsContact) {
      return "Nous aurons besoin d'informations supplémentaires pour vous transmettre un devis, veuillez nous contacter.";
    }

    let text = `Votre estimation : ${result.total}€. `;
    text += `Pack inclus : ${result.diagnosticsInclus.join(", ")}.`;

    if (result.diagnosticsSupp.length > 0) {
      text += ` Diagnostics supplémentaires : ${result.diagnosticsSupp.join(", ")}.`;
    }

    return text;
  }

  // ============================================
  // RUN
  // ============================================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
