const express = require("express");
const fs = require("fs");
const { getFiles, downloadFile, previewFile } = require("./util");
const app = express();
require("dotenv").config();
app.set("views", "./views");
app.set("view engine", "pug");
app.get("/", async (req, res) => {
  const search = req.query.search;
  const path = req.query.path || process.env.FOLDER_PATH;
  const files = await getFiles(path, search);
  res.render("main", {
    files,
		path,
  });
});
app.get("/download", (req, res) => {
  const path = req.query.path;
  const file = downloadFile(path);
  res.setHeader("Content-Disposition", "attachment");
  file.pipe(res);
});
app.get("/preview", (req, res) => {
  const path = req.query.path;
  const file = previewFile(path);
  res.render("preview", {
    blob: file.blob,
  });
});
app.get("/video", function (req, res) {
  const path = req.query.path;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening at PORT: ${PORT}`));
