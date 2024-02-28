const express = require("express");
const app = express();
const router = express.Router();
const axios = require("axios");
const puppeteer = require("puppeteer");
require("dotenv").config();

router.get("/", async (req, res) => {
  try {
    res.send("Hello world");
  } catch (error) {
    console.log(error);
  }
});

async function synonymSearch(word) {
  const browser = await puppeteer.launch({
    executablePath:
      "../home/apps/.cache/puppeteer/chrome/linux-122.0.6261.69/chrome-linux64/chrome", // Set the path to Chrome executable
    headless: true, // Or false if you want to see the browser window
  });
  const url = process.env.TEXT_URL + word;
  const page = await browser.newPage();
  await page.goto(url);

  // Извлекаем результаты поиска
  const searchResults = await page.evaluate(() => {
    const resultList = [];
    const items = document.querySelectorAll("tbody tr a");
    items.forEach((item) => {
      // Получаем текст элемента и удаляем начальные и конечные пробелы
      const text = item.textContent.trim();
      // Проверяем, содержит ли текст только слова или пробелы
      if (!/^\d+$/.test(text)) {
        if (!(text.length === 0)) resultList.push(text);
      }
    });
    return resultList; // Возвращаем resultList из page.evaluate()
  });
  await browser.close();

  if (searchResults.length > 200) {
    return searchResults.slice(0, 200);
  } else {
    return searchResults;
  }
}

async function performSearch(word) {
  const browser = await puppeteer.launch({
    executablePath:
      "../home/apps/.cache/puppeteer/chrome/linux-122.0.6261.69/chrome-linux64/chrome", // Set the path to Chrome executable
    headless: true, // Or false if you want to see the browser window
  });
  const page = await browser.newPage();
  const url = process.env.WIPO_URL;

  await page.goto(url);
  await page.type("#searchInputBox", word);
  await page.click("#searchButton");
  await page.waitForSelector("#divHitList ul");
  const searchResults = await page.evaluate(() => {
    const resultList = [];
    const items = document.querySelectorAll("#divHitList ul li");
    items.forEach((item) => {
      const cls = item.getAttribute("cls");
      const classBadge = item.querySelector(".classBadge").innerText;
      const text = item.innerText.replace(classBadge, "").trim();
      resultList.push({ cls, text });
    });
    return resultList;
  });
  await browser.close();
  return searchResults;
}

router.get("/:word", async (req, res) => {
  try {
    const word = req.params.word;
    // Call the function to perform the search
    const wipo = await performSearch(word);
    const synonyms = await synonymSearch(word);
    // Send the search results as response
    res.json({ word, wipo, synonyms });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
