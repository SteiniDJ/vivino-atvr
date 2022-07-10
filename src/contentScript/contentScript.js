import debounce from "lodash/debounce";
import get from "lodash/get";
import getRating from "./api/getRating";

function initializeScript() {
  const shouldInititialize =
  window.location.search.includes("category=red") ||
  window.location.href.includes("/?text=");

  if (!shouldInititialize) {
    return;
  }

  appendRatings();

  // can't use MutationObserver unfortunately :(
  window.addEventListener("scroll", debounce(appendRatings, 1000));
}

function appendRatings() {
  const wineListItems = document.querySelectorAll(
    '.information'
  );



  wineListItems.forEach((item) => {
    if (item.parentNode.style.position === "") {
      appendRating(item);
    }
  });
}

async function appendRating(element) {
  const wineName = get(element.querySelector(".top * span"), "innerText", '');
  const wineId = get(element.querySelector(".product-number"), "innerText", '').replace('(', '').replace(')', '');
  const hasPreviousRating = document.getElementById(`wine-${wineId}`);

  if (!wineName || hasPreviousRating) {
    return;
  }

  try {
    const { score, numOfReviews, url } = await getRating({wineName, wineId});

      const priceElement = document.createElement("a");
      priceElement.className = "price";
      priceElement.id = `wine-${wineId}`;
      priceElement.href = url;
      priceElement.innerText = `${score.toFixed(1)} ⭐ (${numOfReviews.toLocaleString('de-DE')} umsagnir)`;
      priceElement.style.position = "relative";
      priceElement.style.top = 'auto';
      priceElement.style.fontSize = '16px';

      element.querySelector('.top-right').appendChild(priceElement);

  } catch (e) {
    console.error(`${wineName} is not found on Vivino`);
  }
}

window.addEventListener("load", initializeScript);
