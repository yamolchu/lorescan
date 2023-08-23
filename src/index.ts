const { RecaptchaV2Task } = require("node-capmonster");
const { CookieJar } = require("tough-cookie");
const axios = require("axios");
const generator = require("generate-password");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const jar = new CookieJar();

const delay = require("./delay.ts");

const { random } = require("user-agents");
const { SocksProxyAgent } = require("socks-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");

const genPassword = () => {
  return generator.generate({
    length: 12,
    numbers: true,
  });
};

const RecaptchaV2TaskKey = "";
const proxy = "";

const SITEURL = "https://app.lorescan.com/";
const SITE_KEY = "x19joXI_IeQnFJ7YnfDapSZq";

async function main() {
  const regUrl = "https://app.lorescan.com/signup";

  const headers = {
    authority: "app.lorescan.com",
    accept: "*/*",
    "accept-language":
      "en-US,en;q=0.9,uk;q=0.8,ru-RU;q=0.7,ru;q=0.6,en-GB;q=0.5",
    referer: `https://app.lorescan.com/signup?ref=expLOREr-offmrplb`,
    "sec-ch-ua":
      '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": random().toString(),
  };

  const session = axios.create({
    headers: headers,
    httpsAgent: new HttpsProxyAgent(`http://${proxy}`),
  });

  // const getResponse = await session.get("https://app.lorescan.com/signup");
  // const $ = cheerio.load(getResponse.data);
  // const captchaSettings = $('input[name="captcha_settings"]').val();
  // const client = new RecaptchaV2Task(RecaptchaV2TaskKey);
  // const task = client.task({
  //   websiteURL: SITEURL,
  //   websiteKey: SITE_KEY,
  // });
  // const taskId = await client.createWithTask(task);
  // const result = await client.joinTaskResult(taskId);

  // console.log("ac result", result);

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://app.lorescan.com/signup");

  await page.type('input[id="email"]', "test@test.com");

  const html = await page.content();
  // await delay(10000);
  // console.log(html);

  // await browser.close();
}

main();
