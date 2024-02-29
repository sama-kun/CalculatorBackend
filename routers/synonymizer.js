const express = require("express");
const app = express();
const router = express.Router();
const axios = require("axios");
const puppeteer = require("puppeteer");
const fs = require("fs");
const ejs = require("ejs");
const { join, dirname } = require("path");
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
    // executablePath:
    //   ".cache/puppeteer/chrome/linux-122.0.6261.69/chrome-linux64/chrome", // Set the path to Chrome executable
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
    // executablePath:
    //   // ".cache/puppeteer/chrome/linux-122.0.6261.69/chrome-linux64/chrome", // Set the path to Chrome executable
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
    res.status(500).send(error);
  }
});

router.post("/pdfreport", async (req, res) => {
  try {
    // Читаем EJS шаблон
    const data = req.body;
    const template = fs.readFileSync(
      join(__dirname, "..", "templates", "synonym.ejs"),
      "utf-8"
    );
    const nameFile = "test.pdf";
    console.log(nameFile);

    // Данные для шаблона (можно передать данные из базы данных или других источников)

    // Рендерим EJS шаблон
    const html = ejs.render(template, data);

    // Создаем браузерное окно с помощью Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Устанавливаем контент страницы как HTML
    await page.setContent(html);

    // Генерируем PDF файл
    const pdfBuffer = await page.pdf({ format: "A4" });

    // Отправляем PDF файл клиенту
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${nameFile}"`);
    res.send(pdfBuffer);

    // Закрываем браузерное окно
    await browser.close();
  } catch (error) {
    console.error("Ошибка при генерации PDF файла:", error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;
