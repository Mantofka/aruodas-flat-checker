const puppeteer = require("puppeteer");
const fs = require("fs");
const { writeToFile, readOutputFile, addURLPrefix } = require("./functions");

const minPrice = 450;
const maxPrice = 600;

(async () => {
  const browser = await puppeteer.launch({ slowMo: 2000 });
  const createNewPage = async () => {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3844.0 Safari/537.36"
    );
    return page;
  };
  const page = await createNewPage();

  await page.goto(
    `https://m.aruodas.lt/butu-nuoma/kaune/puslapis/1/?change_region=1&FRoomNumMin=3&FRoomNumMax=3&FPriceMin=${minPrice}&FPriceMax=${maxPrice}`
  );

  const re = /\d+/g;

  const pagesCountString = await page.evaluate(
    () => document.querySelector(".page-select-v2 a").innerHTML
  );

  const translatedPagesCount = pagesCountString.match(re)[1];

  const getFlatsByPageNumber = (index) =>
    new Promise(async (resolve, reject) => {
      try {
        const newPage = await createNewPage();

        await newPage.goto(
          `https://m.aruodas.lt/butu-nuoma/kaune/puslapis/${index}/?change_region=1&FRoomNumMin=3&FRoomNumMax=3&FPriceMin=${minPrice}&FPriceMax=${maxPrice}`
        );

        const regexForNumbers = /\d+$/;
        const flatsHashId = await newPage.$$eval(
          ".result-item-v3",
          (elements) => {
            return elements.map((element) => {
              return {
                link: element
                  .querySelector(".object-image-link")
                  .getAttribute("href"),
                id: element.attributes.id.value,
              };
            });
          }
        );

        const flatIds = flatsHashId
          .slice(1)
          .map((flat) => flat.id.match(regexForNumbers)[0] && flat);
        resolve(flatIds);
      } catch (error) {
        console.log(error.message);
        reject(error.message);
      }
    });

  const promises = [];

  for (let i = 1; i <= translatedPagesCount; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        getFlatsByPageNumber(i).then(async (value) => {
          resolve(value);
        });
      })
    );
  }

  Promise.all(promises).then(async (values) => {
    compareFlats(values).then(() => {});
    await browser.close();
  });

  const compareFlats = (capturedFlats) =>
    new Promise((resolve, reject) => {
      try {
        const flatsWithPrefixes = addURLPrefix(capturedFlats.flat(1));
        if (fs.existsSync("flats-database.json")) {
          readOutputFile().then((values) => {
            const newFlats = [];
            flatsWithPrefixes.map(
              (flat) =>
                values.findIndex((property) => property.id === flat.id) ===
                  -1 && newFlats.push(id)
            );
            writeToFile("new-flats.json", addURLPrefix(newFlats));
            resolve(newFlats);
          });
        } else {
          writeToFile("flats-database.json", flatsWithPrefixes);
          resolve(flatsWithPrefixes);
        }
      } catch (error) {
        reject(error.message);
      }
    });
})();
