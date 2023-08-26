const axios = require("axios");
const generator = require("generate-password");
const delay = require("./delay.ts");
const { random } = require("user-agents");
const { SocksProxyAgent } = require("socks-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");
const config = require("../inputs/config.ts");
const fs = require("fs");
const {
  Worker,
  workerData,
  isMainThread,
  parentPort,
} = require("worker_threads");
const { faker } = require("@faker-js/faker");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "./result.csv",
  header: [
    { id: "email", title: "Email" },
    { id: "proxy", title: "Proxy" },
    { id: "firstName", title: "firstName" },
    { id: "lastName", title: "lastName" },
  ],
  append: true,
});
const numThreads = config.numThreads;
const customDelay = config.customDelay;

function parseEmails(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const emails = [];

  lines.forEach((line) => {
    const [email, imapPass] = line.split(":");
    emails.push({ email: email.trim(), imapPass: imapPass.trim() });
  });

  return emails;
}
function parseProxies(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const proxies = [];

  lines.forEach((line) => {
    const proxy = line.trim();
    proxies.push(proxy);
  });

  return proxies;
}
const emails = parseEmails("./inputs/emails.txt");
const proxies = parseProxies("./inputs/proxies.txt");

const SITEURL = "https://app.lorescan.com/";
const SITE_KEY = "x19joXI_IeQnFJ7YnfDapSZq";
const regUrl = "https://app.lorescan.com/api/auth/createUser";

async function auth(email, proxy) {
  const headers = {
    authority: "app.lorescan.com",
    accept: "*/*",
    "accept-language":
      "en-US,en;q=0.9,uk;q=0.8,ru-RU;q=0.7,ru;q=0.6,en-GB;q=0.5",
    referer: `https://app.lorescan.com/signup?ref=${config.ref}`,
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
    httpsAgent:
      config.proxyType === "http"
        ? new HttpsProxyAgent(`http://${proxy}`)
        : new SocksProxyAgent(`socks5://${proxy}`),
  });
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const data = {
    first_name: firstName,
    last_name: lastName,
    email: email.email,
    password: "n/a",
    referral_code: config.ref,
  };
  const res = await session.post(regUrl, data);
  const resultData = [
    {
      email: email.email,
      proxy: proxy,
      firstName: firstName,
      lastName: lastName,
    },
  ];
  await csvWriter
    .writeRecords(resultData)
    .then(() => {
      console.log("CSV file has been saved.");
    })
    .catch((error) => {
      console.error(error);
    });

  console.log(res.data.status);
}

function authRecursive(emails, proxies, index = 0, numThreads = 4) {
  if (index >= emails.length) {
    return;
  }

  const worker = new Worker(__filename, {
    workerData: { email: emails[index], proxy: proxies[index] },
  });
  worker.on("message", (message) => {
    console.log(message);
  });
  worker.on("error", (error) => {
    console.error(error);
  });
  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Thread Exit ${code}`);
    }
    authRecursive(emails, proxies, index + numThreads, numThreads);
  });
}
const main = async () => {
  if (isMainThread) {
    for (let i = 0; i < numThreads; i++) {
      await delay(customDelay);
      authRecursive(emails, proxies, i, numThreads);
    }
  } else {
    await delay(customDelay);
    const { email, proxy } = workerData;
    auth(email, proxy);
  }
};
main();
