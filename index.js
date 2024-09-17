// code away!
const express = require("express");
const cors = require("cors");
const userDB = require("./users/userDb.js");
const postDB = require("./posts/postDb.js");
const server = express();

server.listen(4000, () =>
  console.log("========= listening on port 4000 =========")
);

//Middleware Functions

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
  userDB
    .getById(id)
    .then(user => {
      !user
        ? res.status(400).json({ message: "invalid user id" })
        : (req.user = id);

      next();
    })
    .catch(err =>
      res
        .status(500)
        .json({ error: "There was an error retrieving this user's ID." })
    );
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
    : !req.body.user_id
    ? res.status(400).json({ message: "missing required user_id field" })
    : userDB
        .getById(req.body.user_id)
        .then(user =>
          !user
            ? res.status(400).json({ message: "This user does not exist" })
            : next()
        );
};

server.use(express.json());
server.use(cors());

server.get("/", logger, (req, res) => {
  res.status(200).send("Welcome to my Users App!");
});

//Endpoints for USERS

server.get("/users", logger, (req, res) => {
  userDB
    .get()
    .then(users => res.status(200).json({ users: users }))
    .catch(err =>
      res.status(500).json({ error: "There was a problem getting the users." })
    );
});

server.get("/users/:id", logger, validateUserId, (req, res) => {
  userDB.getById(req.user).then(user => res.status(200).json({ user: user }));
});

server.post("/users", logger, validateUser, (req, res) => {
  const name = req.body;
  userDB
    .insert(name)
    .then(user => res.status(201).json({ user: user }))
    .catch(err => {
      res
        .status(500)
        .json({ error: "User could not be created at this time." });
    });
});

server.put("/users/:id", logger, validateUserId, (req, res) => {
  console.log(req.user);
  userDB
    .update(req.user, req.body)
    .then(user => res.status(200).json({ user: user }))
    .catch(err =>
      res.status(500).json({ error: "User could not be updated at this time." })
    );
});

server.delete("/users/:id", logger, validateUserId, (req, res) => {
  userDB.remove(req.user).then(() => res.status(204).end());
});

//Endpoints for POSTS

server.get("/posts", logger, (req, res) => {
  postDB
    .get()
    .then(posts => res.status(200).json({ posts: posts }))
    .catch(err =>
      res.status(500).json({ error: "Could not retrieve posts from database." })
    );
});

server.get("/posts/:id", logger, validateUserId, (req, res) => {
  postDB
    .getById(req.user)
    .then(posts => res.status(200).json({ posts: posts }))
    .catch(err =>
      res
        .status(500)
        .json({ error: "There was an error retrieving this user's posts." })
    );
});

server.post("/posts", logger, validatePost, (req, res) => {
  postDB
    .insert(req.body)
    .then(post => res.status(201).json({ post: post }))
    .catch(err =>
      res
        .status(500)
        .json({ error: "The post could not be created at this time." })
    );
});
