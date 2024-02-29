require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors"); // Alle Browser haben Cross Origin Zugriff
const port = process.env.PORT || 3000;
app.use(express.json());
const connect = require("./lib/connect");
const Note = require("./models/Note");
const User = require("./models/User");

app.get("/", async (req, res) => {
  await connect();
  const notes = await Note.find().populate("user", "name");

  if (!notes.length) {
    return res.json({ message: "note not found" });
  }

  return res.json(notes.map((note) => ({ ...note._doc, id: note._id })));
});

/**
 * create new document
 * if user exists - new document in notes collection and reference to user
 * if user !exists - new document in notes collection and reference to user and set new User in users
 */
app.post("/:user", async (req, res) => {
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

app.get("/:user", async (req, res) => {
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

app.get("/:user/:id", async (req, res) => {
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

app.post("/", async (req, res) => {
  await connect();
  const { content } = req.body; // Kommt von Curl -d "content"
  const messageFromServer = await Note.create({
    content: content,
  });

  return res.json({ message: "Added!" });
});

app.put("/:id", async (req, res) => {
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

app.delete("/:tofu", async (req, res) => {
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

app.get("/search/:text", async (req, res) => {
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

const server = app.listen(port, () =>
  console.log(`Express app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`;
