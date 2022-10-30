const fs = require("fs");

// Reads output data - flats-database.json to be exact.
const readOutputFile = () =>
  new Promise((resolve, reject) => {
    const flats = [];
    try {
      fs.readFile("flats-database.json", "utf-8", async (err, data) => {
        await JSON.parse(data).map((flat) => {
          flats.push(flat);
        });
        resolve(flats);
      });
    } catch (error) {
      reject(error.message);
    }
  });

// Writes given data to the given filePath

const writeToFile = (filePath, data) => {
  try {
    fs.writeFile(filePath, JSON.stringify(data), (err, file) => {
      if (err) throw err;
    });
  } catch (error) {
    return error.message;
  }
};

// Adds prefix of www.aruodas.lt to the beginning of the links.

const addURLPrefix = (flats) => {
  return flats.map((flat) => ({ ...flat, link: `www.aruodas.lt${flat.link}` }));
};

module.exports = {
  readOutputFile,
  writeToFile,
  addURLPrefix,
};
