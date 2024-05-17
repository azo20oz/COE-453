const express = require("express");
const fetch = require("node-fetch"); // For making HTTP requests
const app = express();
const port = 3000;
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// GET endpoint to calculate BMI
app.get("/getBMI", async (req, res) => {
  try {
    const response = await fetch(
      "https://us-central1-final-project-423616.cloudfunctions.net/getBMI"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    // You can manipulate the response data here if needed
    res.send(responseData);
  } catch (error) {
    console.error("Error while fetching BMI data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// POST endpoint to calculate BMI
app.post("/calculateBMI", async (req, res) => {
  try {
    // Assuming you have weight and height data in the request body
    const { weight, height } = req.body;

    const response = await fetch(
      "https://calculatebmi-ji6zmiyasq-uc.a.run.app/calculate-bmi", // Replace with your Google Cloud Function URL
      {
        method: "POST",
        body: JSON.stringify({ weight, height }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    res.send(responseData);
  } catch (error) {
    console.error("Error while calculating BMI:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
