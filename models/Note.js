const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema({
  content: { type: String, required: true },
});

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

module.exports = Note;
