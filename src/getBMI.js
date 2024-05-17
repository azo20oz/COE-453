const functions = require("@google-cloud/functions-framework");
const { MongoClient, ServerApiVersion } = require("mongodb");

functions.http("getBMI", async (req, res) => {
  const mongoUrl =
    "mongodb+srv://mbiazid:3090@finalproject.danalgv.mongodb.net/?retryWrites=true&w=majority&appName=FinalProject";
  const client = new MongoClient(mongoUrl, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const db = client.db("FinalProject"); // Replace 'FinalProject' with your database name
    const collection = db.collection("BMI records"); // Replace 'BMI records' with your collection name

    const records = await collection.find().toArray();
    res.status(200).json(records);
  } catch (error) {
    console.error("Error retrieving BMI records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});
