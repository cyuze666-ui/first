const form = document.getElementById("quiz-form");

const NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const validators = {
  "student-name": (el) => {
    const value = el.value.trim();
    if (!value) return "Please enter your name.";
    if (value.length < 2) return "Name must be at least 2 characters.";
    if (value.length > 50) return "Name must be 50 characters or fewer.";
    if (!NAME_PATTERN.test(value)) {
      return "Name can only contain letters, spaces, hyphens, apostrophes and periods.";
    }
    return "";
  },

  "student-email": (el) => {
    const value = el.value.trim();
    if (!value) return "Please enter your email address.";
    if (!EMAIL_PATTERN.test(value) || el.validity.typeMismatch) {
      return "Please enter a valid email, e.g. you@example.com.";
    }
    return "";
  },

  "birth-date": (el) => {
    if (el.validity.badInput) return "Please enter a complete, valid date.";
    if (!el.value) return "Please enter your date of birth.";
    if (el.value < el.min) return "Date of birth must be after 1900-01-01.";
    if (el.value > todayISO()) return "Date of birth can't be in the future.";
    return "";
  },

  q1: () =>
    form.querySelector('input[name="q1"]:checked') ? "" : "Please choose True or False.",

  q2: () =>
    form.querySelector('input[name="q2"]:checked') ? "" : "Please choose True or False.",

  selector: (el) => (el.value ? "" : "Please select an answer."),

  "css-questions": (el) => {
    const value = el.value.trim();
    if (!value) return "Please enter your question.";
    if (value.length < 10) {
      return `Please write at least 10 characters (${value.length}/10).`;
    }
    return "";
  },
};

function fieldsFor(name) {
  return form.querySelectorAll(`[name="${name}"]`);
}

function errorElementFor(name) {
  const first = fieldsFor(name)[0];
  const describedBy =
    first.type === "radio"
      ? first.closest("fieldset").getAttribute("aria-describedby")
      : first.getAttribute("aria-describedby");
  return document.getElementById(describedBy);
}

function validate(name) {
  const fields = fieldsFor(name);
  const message = validators[name](fields[0]);
  const errorEl = errorElementFor(name);
  const invalid = Boolean(message);

  errorEl.textContent = message;

  if (fields[0].type === "radio") {
    const fieldset = fields[0].closest("fieldset");
    fieldset.classList.toggle("is-invalid", invalid);
    fields.forEach((f) => f.setAttribute("aria-invalid", String(invalid)));
  } else {
    const el = fields[0];
    el.classList.toggle("is-invalid", invalid);
    el.classList.toggle("is-valid", !invalid);
    el.setAttribute("aria-invalid", String(invalid));
  }

  return !invalid;
}

const touched = new Set();

Object.keys(validators).forEach((name) => {
  fieldsFor(name).forEach((el) => {
    if (el.type === "radio") {
      el.addEventListener("change", () => {
        touched.add(name);
        validate(name);
      });
      return;
    }

    el.addEventListener("blur", () => {
      touched.add(name);
      validate(name);
    });

    // Only re-validate while typing once the user has left the field,
    // so errors don't appear before they've finished typing.
    const liveEvent = el.tagName === "SELECT" || el.type === "date" ? "change" : "input";
    el.addEventListener(liveEvent, () => {
      if (touched.has(name)) validate(name);
    });
  });
});

form.addEventListener("submit", (event) => {
  let firstInvalid = null;

  Object.keys(validators).forEach((name) => {
    touched.add(name);
    if (!validate(name) && !firstInvalid) firstInvalid = fieldsFor(name)[0];
  });

  if (firstInvalid) {
    event.preventDefault();
    firstInvalid.focus();
  }
});
