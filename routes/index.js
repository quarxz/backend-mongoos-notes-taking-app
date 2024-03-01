const { Router } = require("express");
const connect = require("../lib/connect");
const Note = require("../models/Note");
const User = require("../models/User");

const users = require("./users.route");

const r = Router();

/**
 * search
 */
r.get("/search/:text", async (req, res) => {
  await connect();
  const { text } = req.params;
  try {
    const notes = await Note.find({
      content: { $regex: text, $options: "i" },
    }).populate("user", "name");
    return res.status(200).json(notes.map((note) => ({ ...note._doc, id: note._id })));
  } catch (err) {
    console.error(err);
    return res.status.apply(401).json({ message: "NOte does not exists!" });
  }
});

r.use("/:user", users);

r.get("/", async (req, res) => {
  await connect();

  const users = await User.find();
  if (!users.length) {
    return res.status(404).json({ message: "Users not found" });
  }

  const notes = await Note.find().populate("user", "name");

  if (!notes.length) {
    return res.status(404).json({ message: "note not found" });
  }
  console.log(notes);
  return res.json(notes);

  // return res.status(200).json(notes.map((note) => ({ ...note._doc, id: note._id })));
});

module.exports = r;
