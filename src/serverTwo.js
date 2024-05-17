const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const mongoURI =
  "mongodb+srv://mbiazid:3090@finalproject.danalgv.mongodb.net/?retryWrites=true&w=majority&appName=FinalProject";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// BMI Schema
const bmiSchema = new mongoose.Schema({
  weight: Number,
  height: Number,
  bmi: Number,
  date: { type: Date, default: Date.now },
});

const BMI = mongoose.model("BMI", bmiSchema);

// Route to calculate BMI and store in MongoDB
app.post("/bmi", async (req, res) => {
  const { weight, height } = req.body;
  if (!weight || !height) {
    return res.status(400).send("Weight and height are required");
  }

  // Calculate BMI
  const bmi = weight / (height / 100) ** 2;

  // Create a new BMI record
  const newBMI = new BMI({
    weight,
    height,
    bmi,
  });

  try {
    const savedBMI = await newBMI.save();
    res.status(201).send(savedBMI);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
