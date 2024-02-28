const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
);

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

module.exports = Note;
