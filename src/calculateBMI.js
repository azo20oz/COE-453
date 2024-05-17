const express = require("express");

const MongoClient = require("mongodb").MongoClient; // MongoDB driver

const app = express();

const mongoUrl =
  "mongodb+srv://mbiazid:3090@finalproject.danalgv.mongodb.net/?retryWrites=true&w=majority&appName=FinalProject";

// Middleware to parse JSON bodies
app.use(express.json());

app.post("/calculate-bmi", async (req, res) => {
  const { height, weight } = req.body;
  if (height && weight) {
    const bmi = weight / height ** 2;

    const client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      const db = client.db("FinalProject"); // Replace 'FinalProject' with your database name
      const collection = db.collection("BMI records"); // Replace 'BMI records' with your collection name

      const bmiData = { height, weight, bmi };
      const result = await collection.insertOne(bmiData);

      res.json({ ...bmiData, _id: result.insertedId });
    } catch (err) {
      console.error("Error saving BMI record:", err);
      res.status(500).json({ error: "Failed to save BMI record" });
    } finally {
      await client.close();
    }
  } else {
    res.status(400).json({ error: "height and weight are required" });
  }
});

app.listen(8080, () => {
  console.log("Server is up on 8080");
});
