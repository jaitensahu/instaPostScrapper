# Insta Post Scrapper

A Node.js-based tool that scrapes public Instagram posts using two methods — **API-based scraping** and **Puppeteer browser automation**.  
The project also supports **automated cron scheduling** to scrape data at fixed intervals.

---

## 🚀 Features

- Scrape Instagram post details from public profiles  
- Two scraping engines:
  - **API-based scraping**
  - **Puppeteer-based scraping** (headless browser)
- Automatic data saving to JSON file
- Cron job support to run scraping every 24 hours
- Modular folder structure for easy scaling

---

## 📂 Project Structure

```
instaPostScrapper/
│
├── instaApiScrapping/         # API based scraping logic
├── puppeteerScraping/         # Puppeteer script for scraping
├── scrapeCron.js              # Cron scheduler script
├── index.js                   # Main entry point
├── constant.js                # Project constants & Instagram IDs
├── instaData.json             # Auto-generated scraped output
├── .env                       # Environment variables
├── package.json
└── index.html                 # Optional UI viewer
```

---

## 🛠️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/jaitensahu/instaPostScrapper.git
cd instaPostScrapper
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add environment file  
Create a `.env` file:

```
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password
```

(Only required if your scraping method needs login.)

### 4. Configure scraping targets  
Update `constant.js`:

```js
export const INSTA_IDS = ["profile1", "profile2", "profile3"];
```

---

## ▶️ Running the Scraper

### Run manually
```bash
node index.js
```

### Output  
Scraped data will be saved inside:

```
instaData.json
```

---

## ⏱️ Cron Job (Automated Scraping)

The project includes a cron script:

```bash
node scrapeCron.js
```

It uses **node-cron** to run the scraper at the interval defined in `constant.js`:

```js
export const frequencyEvery48Hr = "0 */48 * * *";  
```

You can adjust to any frequency.

---

## 📌 Use Cases

- Collect public Instagram posts for analysis  
- Automate content discovery  
- Monitor profiles regularly  
- Build learning projects for scraping & automation  

---

## ⚠️ Disclaimer

Instagram scraping may violate Instagram’s Terms of Service.  
This project is **strictly for learning and personal research only**.

Use responsibly.

---

## 🤝 Contributing

Pull requests are welcome!  
You can improve:

- selectors  
- error handling  
- scraping performance  
- multi-profile scheduling  
- UI rendering  

---

## 🧑‍💻 Author

**Jaiten Sahu**  
GitHub: https://github.com/jaitensahu

---

## 📜 License

You may add your preferred license (MIT recommended).

---
