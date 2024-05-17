const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const MongoClient = require("mongodb").MongoClient; // MongoDB driver

// Replace with your actual MongoDB connection URL
const mongoUrl =
  "mongodb+srv://abdulazizmsalbaiz:SiWwGZ5BPGpSngoT@cluster0.mhrfrs7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type BMI {
    height: Float
    weight: Float
    bmi: Float
  }

  type Query {
    hello: String
    getBMIRecords: [BMI]
  }

  type Mutation {
    calculateBMI(height: Float!, weight: Float!): BMI
    saveBMIRecord(height: Float!, weight: Float!): BMI
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return "Hello, world!";
  },
  calculateBMI: ({ height, weight }) => {
    const bmi = weight / height ** 2;
    return { height, weight, bmi };
  },
  saveBMIRecord: async ({ height, weight }) => {
    const client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      const db = client.db("FinalProject"); // Replace 'FinalProject' with your database name
      const collection = db.collection("BMI records"); // Replace 'BMI records' with your collection name

      const bmiData = { height, weight, bmi: weight / height ** 2 };
      const result = await collection.insertOne(bmiData);

      return { ...bmiData, _id: result.insertedId }; // Include the generated MongoDB ID
    } catch (err) {
      console.error("Error saving BMI record:", err);
      throw err; // Re-throw the error for proper handling by the client
    } finally {
      await client.close();
    }
  },
  getBMIRecords: async () => {
    const client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      const db = client.db("FinalProject");
      const collection = db.collection("BMI records");

      const records = await collection.find().toArray();
      return records;
    } catch (err) {
      console.error("Error fetching BMI records:", err);
      throw err; // Re-throw the error for proper handling by the client
    } finally {
      await client.close();
    }
  },
};

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// REST endpoint for BMI calculation and saving the record in MongoDB
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

// REST endpoint to get all BMI records from MongoDB
app.get("/bmi-records", async (req, res) => {
  const client = await MongoClient.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const db = client.db("FinalProject"); // Replace 'FinalProject' with your database name
    const collection = db.collection("BMI records"); // Replace 'BMI records' with your collection name

    const records = await collection.find().toArray();
    res.json(records);
  } catch (err) {
    console.error("Error fetching BMI records:", err);
    res.status(500).json({ error: "Failed to fetch BMI records" });
  } finally {
    await client.close();
  }
});

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: {
      defaultQuery: "{\n  hello\n}\n",
    },
  })
);

// Start the server
app.listen(4000, () => {
  console.log("Running a server at http://localhost:4000/");
  console.log("GraphQL endpoint available at http://localhost:4000/graphql");
  console.log("REST endpoint available at http://localhost:4000/calculate-bmi");
  console.log(
    "REST endpoint for fetching records available at http://localhost:4000/bmi-records"
  );
});
