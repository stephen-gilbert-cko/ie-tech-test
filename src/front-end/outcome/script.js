const schemeIcon = document.getElementById("scheme");
const errorMessage = document.getElementById("error");
const outcome = document.getElementById("confirm-animation");
const backButton = document.querySelector(".back");
const approved = document.querySelector(".approved");
const gpayIcon = document.getElementById("gpay");
const cross =
  '<svg class="cross" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';

var theme = "";
var PAYMENT_ID = "";

// Default theme to user's system preference
theme = getComputedStyle(document.documentElement).getPropertyValue("content");

// Apply cached theme on page reload
theme = localStorage.getItem("theme");

if (theme) {
  document.body.classList.add(theme);
}

// Get payment ID from the URL
const urlParams = new URLSearchParams(window.location.search);
let payId = urlParams.get("id");
if (urlParams.get("cko-session-id")) {
  payId = urlParams.get("cko-session-id");
}

const showOutcome = () => {
  // Get payment details
  http(
    {
      method: "POST",
      route: "/getPaymentById",
      body: {
        id: payId,
      },
    },
    (data) => {
      // Confirmation details
      if (data.approved) {
        PAYMENT_ID = data.id;
        approved.innerHTML = "Order successful";
        outcome.style.backgroundColor = "var(--green)";
        outcome.classList.add("checkmark", "draw");

        if (data.source.type === "giropay") {
          gpayIcon.classList.add("hide");
        } else {
          schemeIcon.setAttribute(
            "src",
            "../images/card-icons/" + data.source.scheme.toLowerCase() + ".svg"
          );
          schemeIcon.setAttribute("alt", data.source.scheme);
          schemeIcon.style.setProperty("display", "block");
        }
      } else {
        gpayIcon.classList.add("hide");
        approved.innerHTML = "Order failed";
        outcome.style.backgroundColor = "var(--red)";
        outcome.innerHTML = cross;
        outcome.classList.add("cross", "draw");
      }
    }
  );
};

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

// Go back to payment input
backButton.onclick = function () {
  location.replace("/");
};

showOutcome();
