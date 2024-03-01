require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors"); // Alle Browser haben Cross Origin Zugriff
const routes = require("./routes");

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.use("/", routes);

// default catch-all handler
app.get("*", (request, response) => {
  response.status(404).json({ message: "Route not defined" });
});

const server = app.listen(port, () => console.log(`Express app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
