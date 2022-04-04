const publicKey = "pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a";

const initializeFrames = () => {
  if (theme == "dark") {
    Frames.init({
      publicKey: publicKey,
      localization: {
        cardNumberPlaceholder: "•••• •••• •••• ••••",
        expiryMonthPlaceholder: "MM",
        expiryYearPlaceholder: "YY",
        cvvPlaceholder: "•••",
      },
      style: {
        base: {
          paddingLeft: "1rem",
          border: "1px solid #323416",
          borderRadius: "5px",
          fontSize: "14px",
          fontFamily: "Arial, Helvetica, sans-serif",
          lineHeight: "16px",
          letterSpacing: "0.22px",
          color: "white",
          transition: "unset",
        },
        focus: {
          border: "1px solid #8C9E6E",
        },
        invalid: {
          border: "1px solid #D96830",
        },
        placeholder: {
          base: {
            fontSize: "5px", // Hide placeholder behind label when not floating
          },
          focus: {
            fontSize: "14px",
            fontWeight: "300",
          },
        },
      },
    });
  } else {
    Frames.init({
      publicKey: publicKey,
      localization: {
        cardNumberPlaceholder: "•••• •••• •••• ••••",
        expiryMonthPlaceholder: "MM",
        expiryYearPlaceholder: "YY",
        cvvPlaceholder: "•••",
      },
      style: {
        base: {
          paddingLeft: "1rem",
          border: "1px solid #8C9E6E",
          borderRadius: "5px",
          color: "#000",
          transition: "unset",
          fontSize: "14px",
          fontFamily: "Arial, Helvetica, sans-serif",
          lineHeight: "16px",
          letterSpacing: "0.22px",
        },
        focus: {
          border: "1px solid #323416",
        },
        invalid: {
          border: "1px solid #D96830",
        },
        placeholder: {
          base: {
            color: "#e2e2e2",
            fontSize: "5px", // Hide placeholder behind label when not floating
          },
          focus: {
            fontSize: "14px",
          },
        },
      },
    });
  }
};

initializeFrames();

var state = {
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

// When Frames is ready
Frames.addEventHandler(Frames.Events.READY, (event) => {
  pageLoader.style.display = "none";
  form.style.display = "block";
});

// When the name input is focused
nameInput.addEventListener("focus", () => {
  nameLabel.classList.add("up");
  nameInput.classList.remove("invalid");
});

// When the name input is blurred
nameInput.addEventListener("blur", (event) => {
  if (nameInput.value === "") {
    nameLabel.classList.remove("up");
  } else if (nameInput.value.length < 2) {
    nameInput.classList.add("invalid");
  } else {
    // Update the cardholder name in Frames
    Frames.cardholder.name = nameInput.value;
  }
});

// When a Frames input is focused
Frames.addEventHandler(Frames.Events.FRAME_FOCUS, (event) => {
  // Float the label up when the field is focused
  switch (event.element) {
    case "card-number":
      cardLabel.classList.add("up");
      break;
    case "expiry-date":
      dateLabel.classList.add("up");
      break;
    case "cvv":
      cvvLabel.classList.add("up");
      break;
  }
  state[event.element].isFocused = true;
});

// When a Frames input is blurred
Frames.addEventHandler(Frames.Events.FRAME_BLUR, (event) => {
  // Float the label to the center if the input is empty
  switch (event.element) {
    case "card-number":
      if (state["card-number"].isEmpty) {
        cardLabel.classList.remove("up");
      }
      break;
    case "expiry-date":
      if (state["expiry-date"].isEmpty) {
        dateLabel.classList.remove("up");
      }
      break;
    case "cvv":
      if (state["card-number"].isEmpty) {
        cvvLabel.classList.remove("up");
      }
      break;
  }

  state[event.element].isFocused = false;
});

// When the validation changes for one of the Frames inputs
Frames.addEventHandler(Frames.Events.FRAME_VALIDATION_CHANGED, (event) => {
  switch (event.element) {
    case "card-number":
      event.isEmpty && !state[event.element].isFocused
        ? cardLabel.classList.remove("up")
        : cardLabel.classList.add("up");
      break;
    case "expiry-date":
      event.isEmpty && !state[event.element].isFocused
        ? dateLabel.classList.remove("up")
        : dateLabel.classList.add("up");
      break;
    case "cvv":
      event.isEmpty && !state[event.element].isFocused
        ? cvvLabel.classList.remove("up")
        : cvvLabel.classList.add("up");
      break;
  }

  // Update the state
  state[event.element].isValid = event.isValid;
  state[event.element].isEmpty = event.isEmpty;
});

// When the validation changes for the whole Frames form
Frames.addEventHandler(Frames.Events.CARD_VALIDATION_CHANGED, (event) => {
  if (Frames.isCardValid() && nameInput.value.length > 2) {
    payButton.disabled = false;
  } else {
    payButton.disabled = true;
  }
});

// When Frames detects the payment method
Frames.addEventHandler(Frames.Events.PAYMENT_METHOD_CHANGED, (event) => {
  const pm = event.paymentMethod;

  if (!pm) {
    scheme.style.setProperty("display", "none");
  } else {
    var name = pm.toLowerCase();
    scheme.setAttribute("src", "images/card-icons/" + name + ".svg");
    scheme.setAttribute("alt", pm || "payment method");
    scheme.style.setProperty("display", "block");
  }
});

// When Frames has tokenized the card
Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, (event) => {
  console.log("Card tokenized: ", event);
  payWithToken(event.token);
});

// When the pay button is clicked
payButton.addEventListener("click", function (event) {
  if (payButton.innerHTML.includes("New")) {
    cleanState();
  } else {
    event.preventDefault();
    payButton.innerHTML = "";
    payLoader.classList.remove("hide");
    error.classList.add("hide");
    errorMessage.innerHTML = "Payment declined";
    payButton.style.pointerEvents = "none";
    inputs.style.pointerEvents = "none";
    Frames.submitCard();
    Frames.enableSubmitForm();
  }
});

// We call our back-end server to process the payment with the token
const payWithToken = (token) => {
  http(
    {
      method: "POST",
      route: "/payWithToken",
      body: { token: token },
    },
    (data) => {
      payLoader.classList.add("hide");
      console.log("API RESPONSE: ", data);
      handleResponse(data);
    }
  );
};
