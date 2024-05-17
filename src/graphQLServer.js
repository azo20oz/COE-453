const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const fetch = require("node-fetch"); // For making HTTP requests
const { buildSchema } = require("graphql");

const app = express();
const port = 8080;

// Construct a schema using GraphQL schema language
const schema = buildSchema(`
  type Query {
    getBMI: String
    calculateBMI(weight: Float!, height: Float!): String
  }
`);

// Define resolvers
const root = {
  getBMI: async () => {
    try {
      const response = await fetch(
        "https://us-central1-final-project-423616.cloudfunctions.net/getBMI"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      return JSON.stringify(responseData);
    } catch (error) {
      console.error("Error while fetching BMI data:", error);
      throw new Error("Internal Server Error");
    }
  },
  calculateBMI: async ({ weight, height }) => {
    try {
      const response = await fetch(
        "https://calculatebmi-ji6zmiyasq-uc.a.run.app/calculate-bmi",
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
      return JSON.stringify(responseData);
    } catch (error) {
      console.error("Error while calculating BMI:", error);
      throw new Error("Internal Server Error");
    }
  },
};

// Set up GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Enable GraphiQL for easy testing
  })
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
