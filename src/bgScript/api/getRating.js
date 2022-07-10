import cheerio from "cheerio";
import { axios } from "./axios";

const extractRating = (html, wineId) => {
  const $ = cheerio.load(html);

  let wines = [];
  $(".card").each((index, el) => {
    const name = $(el)
      .find(".wine-card__name .link-color-alt-grey")
      .text()
      .trim();
    const score = $(el)
      .find(".average__number")
      .text()
      .trim()
      .replace(",", ".");
    const numOfReviews = $(el)
      .find(".average__stars .text-micro")
      .text()
      .trim();
    const href = $(el).find("a").attr("href");
    const url = `https://www.vivino.com` + href;

    if (!numOfReviews) {
      return;
    }

    const wine = {
      name,
      score: parseFloat(score),
      numOfReviews: parseFloat(numOfReviews),
      url,
      id: wineId,
    };

    chrome.storage.local.set({
      [wineId]: wine,
    });

    wines.push(wine);
  });

  return wines[0];
};

const getFromLocal = (wineId) =>
  new Promise((resolve, reject) => {
    chrome.storage.local.get([wineId], (items) => {
      const data = Object.values(items)[0];
      // Check if data is older then a week
      if (data) {
        const weekUnix = 604800000;
        const monthUnix = weekUnix * 4;
        const weekAgoUnix = Date.now() - monthUnix;
        if (weekAgoUnix > data.date) resolve(undefined);
      }
      resolve(data);
    });
  });

export default async function getRating(query) {
  let data = await getFromLocal(query.wineId);

  if (data) {
    // we have data! No need to extract or scrape

    return data;
  }
  if (!data) {
    data = await axios.get(
      `/search/wines?q=${encodeURIComponent(query.wineName)}`
    );
  }

  return extractRating(data.data, query.wineId);
}
