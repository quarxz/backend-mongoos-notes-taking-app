const { Router } = require("express");
const connect = require("../lib/connect");
const Note = require("../models/Note");
const User = require("../models/User");

const notes = require("./notes.route");

const r = Router({ mergeParams: true });

module.exports = r;

r.get("/", async (req, res) => {
  await connect();
  const { user } = req.params;

  const { _id: userId } = (await User.findOne({ name: user })) || {
    _id: null,
  };

  // console.log({ _id: userId });

  if (!userId) {
    return res.json({
      message: "Can´t show notes. User does not exists!",
    });
  }

  // find all notes belong to the user
  const notes = await Note.find({ user: userId }).populate("user");
  if (!notes.length) {
    return res.json({ message: "No Notes found!" });
  }
  res.json(notes);
});

/**
 * create new document
 * if user exists - new document in notes collection and reference to user
 * if user !exists - new document in notes collection and reference to user and set new User in users
 */
r.post("/", async (req, res) => {
  await connect();
  const { user } = req.params;

  if (user) {
    let { _id: userId } = (await User.findOne({ name: user })) || {
      _id: null,
    };

    if (!userId) {
      const { _id: newUserId } = (await User.create({ name: user })) || {
        _id: null,
      };
      userId = newUserId;
    }
    const { content } = req.body;

    if (userId && content) {
      const { _id } = (await Note.create({ content, user: userId })) || {
        _id: null,
      };
      res.json({ id: _id, message: "Successfully created node." });
    } else {
      res.json({
        error: "Note NOT created. Content and/or id is missing.",
      });
    }
  }
});

r.get("/:id", async (req, res) => {
  await connect();
  const { user, id } = req.params;

  const { _id: userId } = (await User.findOne({ name: user })) || {
    _id: null,
  };
  if (!userId) {
    return res.json({
      message: "Cannot show notes. User does not exists!",
    });
  }

  /**
   * - Wenn keine Note mit id vorhanden
   */
  try {
    const { _id } = (await Note.findOne({ _id: id })) || { _id: null };
    console.log(_id);
  } catch (err) {
    console.error(err);
    // return res.status.apply(500).json({ message: "Server Error" });
    return res.json({ message: "Note does not exits!" });
  }

  const note = await Note.findOne({ _id: id }).populate("user", "name");

  console.log(user, userId);
  console.log(note.user.name);

  if (user === note.user.name) {
    return res.json(note);
  } else {
    return res.json({
      message: "This Note doesn't belong to user: " + user,
    });
  }
});
