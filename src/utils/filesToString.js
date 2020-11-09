const formidable = require('formidable');
const fs = require('fs');

module.exports = async function transformFilesToStrings(req) {
  let form = formidable({ multiples: true });
  const finalArr = [];
  await form.parse(req, (err, __, files) => {
    if (files.file.name) files.file = [files.file];
    files.file.forEach((file) => {
      const dataString = fs.readFileSync(file.path);
      const data = { fileName: file.name, data: dataString.toString() };
      finalArr.push(data);
    });
    form.emit('endProcessing', finalArr);
  });
  return form;
};
