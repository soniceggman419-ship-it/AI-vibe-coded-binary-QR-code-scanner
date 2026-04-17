const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(express.json({ limit: "1mb" }));

// serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// upload binary
app.post("/upload", (req, res) => {
  try {
    const { bytes, filename } = req.body;

    if (!Array.isArray(bytes)) {
      return res.status(400).send("Invalid data");
    }

    const buffer = Buffer.from(bytes);

    if (buffer.length > 3000) {
      return res.status(400).send("Exceeds QR max size");
    }

    let safeName = "file.bin";
    if (filename) {
      safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    }

    const filePath = path.join(UPLOAD_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      file: safeName,
      size: buffer.length
    });

  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// download
app.get("/download/:file", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }

  res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});