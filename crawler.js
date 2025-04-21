const puppeteer = require("puppeteer");

async function getHeadlines() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const url = "https://news.naver.com/";
    await page.goto(url, { waitUntil: "domcontentloaded" });

    try {
        const headlines = await page.$$eval(".cjs_nf_list._item_list a", elements =>
            elements.map(el => ({
                title: el.querySelector(".cn_title") ? el.querySelector(".cn_title").innerText.trim() : el.innerText.trim(),
                link: el.href
            })).filter(item => item.title.length > 0)
        );

        await browser.close();

        if (headlines.length > 0) {
            return headlines;
        } else {
            console.log("속보 항목이 존재하지 않음");
            return [];
        }
    } catch (error) {
        console.error("크롤링 실패:", error);
        await browser.close();
        return []; 
    }
}

module.exports = getHeadlines;