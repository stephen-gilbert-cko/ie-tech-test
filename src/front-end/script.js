const pageLoader = document.querySelector(".loader");
const form = document.getElementById("payment-form");
const inputs = document.getElementById("inputs");
const nameInput = document.getElementById("cardholder");
const cardInput = document.querySelector(".card-number-frame");
const dateInput = document.querySelector(".expiry-date-frame");
const cvvInput = document.querySelector(".cvv-frame");
const nameLabel = document.getElementById("name-label");
const cardLabel = document.getElementById("card-label");
const dateLabel = document.getElementById("date-label");
const cvvLabel = document.getElementById("cvv-label");
const payButton = document.querySelector(".pay");
const scheme = document.getElementById("card-scheme");
const cardHint = document.querySelector(".card-hint");
const dateHint = document.querySelector(".expiry-date-hint");
const cvvHint = document.querySelector(".cvv-hint");
const payLoader = document.querySelector(".pay-loader");
const switcher = document.getElementById("theme-switch");
const outcome = document.getElementById("outcome");
const error = document.querySelector(".error");
const errorMessage = document.getElementById("error-hint");
const gpayContainer = document.getElementById("container");
const giroPayButton = document.querySelector(".giropay");
var PAYMENT_ID = "";
var theme = "";

const crossVisible =
  '<svg class="cross" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';
const crossHidden =
  '<svg class="cross hide" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';

const handleResponse = (data) => {
  payLoader.classList.add("hide");
  PAYMENT_ID = data.id;
  // Payment approved
  if (data.approved) {
    payButton.style.backgroundColor = "var(--button-background)";
    showCheckmark();
    setTimeout(() => {
      hideCheckmark();
      payButton.innerHTML = "&#10227; New Payment";

      // Colour Frames input borders to show successful payment
      nameInput.classList.add("success");
      cardInput.classList.add("success");
      dateInput.classList.add("success");
      cvvInput.classList.add("success");
      // Hide Google Pay button
      gpayContainer.classList.add("hide");
      // Hide Giropay button
      giroPayButton.classList.add("hide");

      payButton.style.pointerEvents = "auto";
    }, 1200);
  }
  // Payment declined / timeout error
  else {
    payButton.style.backgroundColor = "var(--button-background-error)";
    showCross();
    setTimeout(() => {
      hideCross();
      payButton.innerHTML = "&#10227; Retry";
      inputs.style.pointerEvents = "auto";
      payButton.style.pointerEvents = "auto";
      error.classList.remove("hide");
    }, 1200);
  }
};

const cleanState = () => {
  payButton.innerHTML = "Pay with Card";
  payButton.style.backgroundColor = "var(--button-background)";
  pageLoader.style.display = "";
  form.style.display = "none";
  initializeFrames();
  nameInput.value = "";
  nameLabel.classList.remove("up");
  cardLabel.classList.remove("up");
  dateLabel.classList.remove("up");
  cvvLabel.classList.remove("up");
  scheme.removeAttribute("src");
  scheme.removeAttribute("alt");
  state = {
    "card-number": {
      isValid: false,
      isEmpty: true,
      isFocused: false,
    },
    "expiry-date": {
      isValid: false,
      isEmpty: true,
      isFocused: false,
    },
    cvv: {
      isValid: false,
      isEmpty: true,
      isFocused: false,
    },
  };
  hideCheckmark();
  hideCross();
  inputs.style.pointerEvents = "auto";
  nameInput.classList.remove("success");
  cardInput.classList.remove("success");
  dateInput.classList.remove("success");
  cvvInput.classList.remove("success");
  error.classList.add("hide");
  errorMessage.innerHTML = "Payment declined";
  gpayContainer.classList.remove("hide");
  giroPayButton.classList.remove("hide");
};

// Giropay payment
giroPayButton.addEventListener('click', function (event) {
  console.log("testing")
  event.preventDefault();
  http({
          method: 'POST',
          route: '/payGiroPay',
          body:{}
      },
      // This function is called after the server code is executed
      (myApiResponse) => {
          console.log('Response: ', myApiResponse);
          // redirect to the GiroPay URL
          window.location.href = myApiResponse.redirectionUrl;
      }
  );
});

// Utility function to send HTTP calls to our back-end API
const http = ({ method, route, body }, callback) => {
  let requestData = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  if (method.toLocaleLowerCase() === "get") {
    delete requestData.body;
  }

  // Timeout after 10 seconds
  timeout(10000, fetch(`${window.location.origin}${route}`, requestData))
    .then((res) => res.json())
    .then((data) => callback(data))
    .catch((er) => (errorMessage.innerHTML = er));
};

// For connection timeout error handling
const timeout = (ms, promise) => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("Connection timeout"));
    }, ms);
    promise.then(resolve, reject);
  });
};

/* Themes */

// Default theme to user's system preference
theme = getComputedStyle(document.documentElement).getPropertyValue("content");

// Apply cached theme on page reload
theme = localStorage.getItem("theme");

if (theme) {
  document.body.classList.add(theme);
  if (theme == "dark") {
    switcher.checked = true;
  }
}

// Dark mode switch
document.getElementById("theme-switch").addEventListener("change", (event) => {
  themeSwitch(event);
});

const themeSwitch = (event) => {
  if (event.target.checked) {
    // Dark mode
    document.body.className = "";
    document.body.classList.add("dark");
    setTheme("dark");
    getTheme();
    cleanState();
  } else {
    // Light mode
    document.body.className = "";
    document.body.classList.add("light");
    setTheme("light");
    getTheme();
    cleanState();
  }
};

function getTheme() {
  theme = localStorage.getItem("theme");
}

function setTheme(mode) {
  localStorage.setItem("theme", mode);
}

/* Outcome animations */

const showCheckmark = () => {
  outcome.classList.add("checkmark", "draw");
};
const hideCheckmark = () => {
  outcome.classList.remove("checkmark", "draw");
};

const showCross = () => {
  outcome.class = "cross";
  outcome.innerHTML = crossVisible;
};
const hideCross = () => {
  outcome.classList.remove("cross");
  outcome.innerHTML = crossHidden;
};
