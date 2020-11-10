const fsextra = require('fs-extra');
var archiver = require('archiver');

const clearDirectory = (path) => {
  fsextra.emptyDirSync(path);
};

const getFilesFromDirectory = async (path) => {
  const content = [];
  await Promise.all(
    fsextra.readdirSync(path).map((file) => {
      content.push(fsextra.readFileSync(`${path}/${file}`));
    })
  );
  return content;
};

const createZipFileFromDirectory = async (path) => {
  var output = fsextra.createWriteStream('./src/files/reports.zip');
  var archive = archiver('zip', {
    gzip: true,
    zlib: { level: 9 }, // Sets the compression level.
  });
  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  await Promise.all(
    fsextra.readdirSync(path).map((file) => {
      archive.file(`${path}/${file}`, {
        name: `${file}`,
      });
    })
  );

  archive.finalize();
};

module.exports = {
  clearDirectory,
  getFilesFromDirectory,
  createZipFileFromDirectory,
};
