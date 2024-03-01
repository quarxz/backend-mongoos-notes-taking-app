const { Router } = require("express");
const connect = require("../lib/connect");
const Note = require("../models/Note");
const User = require("../models/User");

const notes = require("./notes.route");

const r = Router({ mergeParams: true });
r.use("/:id", notes);

/**
 * get /:user
 */
r.get("/", async (req, res) => {
  await connect();
  const { user } = req.params;

  const { _id: userId } = (await User.findOne({ name: user })) || {
    _id: null,
  };

  if (!userId) {
    return res.status(401).json({
      message: "Could not show notes. User does not exists!",
    });
  }

  // find all notes belong to the user
  const notes = await Note.find({ user: userId }).populate("user", "name");
  if (!notes.length) {
    return res.status(404).json({ message: "No Notes found!" });
  }

  res.status(200).json(notes.map((note) => ({ ...note._doc, id: note._id, name: note.user.name })));
});

/**
 * Get specific Note from User
 * /:user/:id
 */
r.get("/:id", async (req, res) => {
  await connect();
  const { user, id } = req.params;

  const { _id: userId } = (await User.findOne({ name: user })) || {
    _id: null,
  };
  if (!userId) {
    return res.status(404).json({
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
    return res.status(404).json({ message: "Note does not exits!" });
  }

  const {
    _id: noteId,
    user: userOfNote,
    content,
  } = (await Note.findOne({ _id: id }).populate("user", "name")) || { _id: null, user: null };

  console.log(noteId);
  console.log(userOfNote.name);
  console.log(user);

  if (!noteId || userOfNote.name != user) {
    return res
      .status(401)
      .json({ message: "That note either does not exist or belong to that user." });
  }

  return res.status(200).json({ _id: noteId, content, user: userOfNote });
});

/**
 * create new document
 * if user exists - new document in notes collection and reference to user
 * if user !exists - new document in notes collection and reference to user and set new User in users
 *
 * /:user
 */
r.post("/", async (req, res) => {
  await connect();
  const { user } = req.params;

  /**
   * check if user exsits
   */
  if (user) {
    let { _id: userId } = (await User.findOne({ name: user })) || {
      _id: null,
    };

    /**
     * create new user if it doesn´t already exits
     */
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
      return res.status(200).json({ id: _id, message: "Successfully created node." });
    } else {
      return res.status(400).json({
        error: "Note NOT created. Content and/or id is missing.",
      });
    }
  }

  res.status(400).json({ message: "Couldn't create new note. User is missing." });
});

module.exports = r;
