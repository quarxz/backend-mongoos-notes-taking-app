const { Router } = require("express");
const connect = require("../lib/connect");
const Note = require("../models/Note");

const r = Router({ mergeParams: true });

r.post("/", async (req, res) => {
  await connect();
  const { content } = req.body; // Kommt von Curl -d "content"
  const messageFromServer = await Note.create({
    content: content,
  });

  return res.json({ message: "Added!" });
});

r.put("/:id", async (req, res) => {
  await connect();
  const { id } = req.params;
  const { content } = req.body;

  const response = await Note.updateOne({ _id: id }, { content: content });
  console.log(response);

  if (response.modifiedCount === 0) {
    return res.json("Note not Modified!");
  }

  return res.json({ message: "Note is Updated!" });
});

r.delete("/:tofu", async (req, res) => {
  await connect();
  const { tofu } = req.params;

  const { acknowledged, deletedCount } = await Note.deleteOne({
    _id: tofu,
  });

  if (!acknowledged || !deletedCount) {
    res.json("Note not deleted.");
  }

  return res.json({ acknowledged, deletedCount });
});

r.get("/search/:text", async (req, res) => {
  await connect();
  const { text } = req.params;
  try {
    const results = await Note.find({
      content: { $regex: text, $options: "i" },
    });
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status.apply(500).json({ message: "Server Error" });
  }
});

module.exports = r;
