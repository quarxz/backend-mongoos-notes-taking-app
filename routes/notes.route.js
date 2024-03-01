const { Router } = require("express");
const connect = require("../lib/connect");
const Note = require("../models/Note");
const User = require("../models/User");

const r = Router({ mergeParams: true });

r.post("/", async (req, res) => {
  await connect();
  const { content } = req.body; // Kommt von Curl -d "content"
  const messageFromServer = await Note.create({
    content: content,
  });

  return res.status(200).json({ message: "Added!" });
});

/**
 * Delete specific User Note /Falk/idxyz
 * /:users kommt mit der index.js, /:id kommt aus der users.route.js
 */
//code for vegan DELETE
r.delete("/", async (request, response) => {
  await connect();
  const { user, id } = request.params;

  const { _id: userId } = (await User.findOne({ name: user })) || { _id: null };

  if (!userId) {
    return res.status(404).json({ message: "Could not find user." });
  }

  const { _id: noteId, user: userOfNote } = (await Note.findOne({
    _id: id,
  }).populate("user", "name")) || { _id: null, user: null }; // replacement object

  if (!noteId || userOfNote.name != user) {
    return res.status(401).json({
      message: "That note either does not exist or belong to that user.",
    });
  }

  await Note.deleteOne({ _id: id });

  res.status(200).json({ message: "Note was deleted successfully." });
});

r.put("/", async (req, res) => {
  await connect();
  const { id, user } = req.params;
  const { content } = req.body;

  const { _id: userId } = (await User.findOne({ name: user })) || { _id: null };

  if (!userId) {
    return res.status(404).json({ message: "Could not find user." });
  }

  const { _id: noteId, user: userOfNote } = (await Note.findOne({
    _id: id,
  }).populate("user", "name")) || { _id: null, user: null };

  if (!noteId || userOfNote.name != user) {
    return res.status(401).json({
      message: "That note either does not exist or belong to that user.",
    });
  }

  const { _id } = await Note.findByIdAndUpdate(id, { content });

  if (!_id) {
    return res.status(404).json({ message: "Note not found" });
  }

  return res.status(200).json({ message: "Successfully edited the note." });
});

module.exports = r;
