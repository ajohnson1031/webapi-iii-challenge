// code away!
const express = require("express");
const cors = require("cors");
const userDB = require("./users/userDb.js");
const postDB = require("./posts/postDb.js");
const server = express();

server.listen(4000, () =>
  console.log("========= listening on port 4000 =========")
);

const logger = (req, res, next) => {
  console.log(
    `REQUEST: { method: ${req.method}, url: ${
      req.url
    }, timestamp: ${new Date().toISOString()} `
  );
  next();
};

const validateUserId = (req, res, next) => {
  const { id } = req.params;
  !id ? res.status(400).json({ message: "invalid user id" }) : (req.user = id);

  next();
};

const validateUser = (req, res, next) => {
  !req.body
    ? res.status(400).json({ message: "missing user data" })
    : !req.body.name
    ? res.status(400).json({ message: "missing required name field" })
    : next();
};

const validatePost = (req, res, next) => {
  !req.body
    ? res.status(400).json({ message: "missing post data" })
    : !req.body.text
    ? res.status(400).json({ message: "missing required text field" })
    : next();
};

server.use(express.json());
server.use(cors());

server.get("/", logger, (req, res) => {
  res.status(200).send("Welcome to my Users App!");
});
