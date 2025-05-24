const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const ACCESS_TOKEN = "EAA5jlMn2HtEBO0TwNJ0cUx6RxM0IRDVzt3LEidDU7yWLU7DuNkOC28t0effVP58ZCelyFUZB8FwMFaXNGiCUwRwDZArDXMEDPvT6ZB4cJFSRXpe01Tx5g4KS1ZBXuF8ArDaT39uZBR0zDxKFGQZCSWkHM2W4PPPaqFzpgpOKZBvZBHm0SYZA84lKe7YEIYwVFcZC5neEwZDZD";
const PIXEL_ID = "700276839041805";

app.post("/webhook", async (req, res) => {
  const event = req.body;

  // Example: extract order data
  const email = event.email || event.customer?.email || "";
  const phone = event.phone || event.customer?.phone || "";
  const value = event.total_price || 0;

  // Hash user data
  const hash = (data) =>
    crypto.createHash("sha256").update(data.trim().toLowerCase()).digest("hex");

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(new Date().getTime() / 1000),
        action_source: "website",
        user_data: {
          em: [hash(email)],
          ph: [hash(phone)],
        },
        custom_data: {
          currency: "USD",
          value: parseFloat(value),
        },
      },
    ],
    access_token: ACCESS_TOKEN,
  };

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
      payload
    );
    res.status(200).send("Event sent to Facebook");
  } catch (error) {
    console.error("Error sending to Facebook:", error.message);
    res.status(500).send("Failed to send event");
  }
});

app.get("/", (req, res) => {
  res.send("Facebook Conversions API is live!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
