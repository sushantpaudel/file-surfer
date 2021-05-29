const fs = require("fs");
const path = require("path");
var mmm = require("mmmagic");

const getMimeType = async (filePath) => {
  var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
  const mimeType = await new Promise((resolve, reject) => {
    magic.detectFile(filePath, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
  return mimeType;
};

const getFiles = async (filePath, search) => {
  let files = fs.readdirSync(filePath);
  files = files.filter((f) => (search ? f.includes("search") : true));
  files = await Promise.all(
    files.map(async (f) => {
      const fP = path.resolve(filePath, f);
      const stat = fs.statSync(fP);
      const mimeType = await getMimeType(fP);
      const isImage = mimeType.includes("image");
      const isVideo = mimeType.includes("video");
      const isDirectory = stat.isDirectory();
      let blob;
      // if (isImage) {
      //   blob = previewFile(fP);
      // }
      return {
        filePath: fP,
        name: f,
        isImage,
        isVideo,
        isDirectory,
        blob,
      };
    })
  );
  return files;
};

const downloadFile = (filePath) => {
  const file = fs.createReadStream(filePath);
  return file;
};

const previewFile = (filePath) => {
  const file = fs.readFileSync(filePath);
  let blob = Buffer.from(file).toString("base64");
  blob = `data:image/jpg;base64, ${blob}`;
  return {
    ...file,
    blob,
  };
};

module.exports.getFiles = getFiles;
module.exports.downloadFile = downloadFile;
module.exports.previewFile = previewFile;
