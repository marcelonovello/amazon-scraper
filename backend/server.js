import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/scrape", async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).json({ error: "Por favor, forneça um termo de busca." });
    }

    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    try {
        const browser = await puppeteer.launch({ headless: true }); 
        const page = await browser.newPage();

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0"
        );

        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.waitForSelector("[data-asin]", { timeout: 15000 });

        // 📌 SALVA UM SCREENSHOT PARA VER O QUE ESTÁ SENDO CARREGADO
        await page.screenshot({ path: "amazon_screenshot.png", fullPage: true });

        // 📌 SALVA O HTML DA PÁGINA PARA DEPURAÇÃO
        const html = await page.content();
        fs.writeFileSync("amazon_page.html", html);

        // 📌 Extrai os produtos da Amazon
        const products = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("[data-asin]"))
                .map((item) => ({
                    title: item.querySelector(".a-section.a-spacing-none.a-spacing-top-small.s-title-instructions-style a h2 span")?.innerText.trim() || "N/A",
                    rating: item.querySelector(".a-icon-alt")?.innerText.trim() || "N/A",
                    reviews: item.querySelector(".a-size-base")?.innerText.trim() || "N/A",
                    imageUrl: item.querySelector(".s-product-image-container img")?.src || "N/A",
                }))
                .filter((p) => p.title !== "N/A");
        });

        await browser.close();
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar dados da Amazon.", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
