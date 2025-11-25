import cron from "node-cron";
import fs from "fs";
import path from "path";
import { scrapeInstagramProfile } from "./instaApiScrapping/scrapeProfile.js";
import { scrapeInstagramThroughPuppeteer } from "./puppeteerScraping/instaScrapePuppeteer.js";
import { frequencyEvery48Hr, INSTA_IDS } from "./constant.js";

const DATA_FILE = path.join(process.cwd(), "instaData.json");

// -----------------------------------------------------
// LOAD SAVED DATA (ALWAYS RETURN ARRAY)
// -----------------------------------------------------
function loadSavedData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log("📂 No instaData.json found. Starting fresh.");
      return [];
    }

    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      console.warn("⚠ instaData.json was not an array. Resetting.");
      return [];
    }

    console.log("📥 Loaded saved data");
    return data;
  } catch (err) {
    console.error("❌ Failed to load instaData.json:", err);
    return [];
  }
}

// -----------------------------------------------------
// SAVE DATA BACK TO FILE
// -----------------------------------------------------
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log("💾 Data successfully saved to instaData.json\n");
  } catch (err) {
    console.error("❌ Failed to save instaData.json:", err);
  }
}

// -----------------------------------------------------
// SCRAPE USER (API → Puppeteer fallback)
// -----------------------------------------------------
async function scrapeOneUser(username, savedData) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔍 Scraping user: ${username}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  let result = await scrapeInstagramProfile(username);

  // Fallback if failed
  if (!result || result.error === "401" || result.status === false) {
    console.log(`⚠ API failed. Switching to Puppeteer for: ${username}`);
    result = await scrapeInstagramThroughPuppeteer(username);

    if (!result) {
      console.log(`❌ Both API & Puppeteer failed for ${username}. Skipping user.`);
      return;
    }
  }

  // Ensure valid result
  if (!result) return;

  // -----------------------------------------------------
  // FIND USER IN SAVED ARRAY
  // -----------------------------------------------------
  let existingUser = savedData.find((u) => u.username === username);

  if (!existingUser) {
    console.log(`📌 Creating new entry for ${username}`);
    existingUser = {
      username: result.username,
      fullName: result.fullName,
      bio: result.bio,
      followers: result.followers,
      following: result.following,
      profilePic: result.profilePic,
      posts: []
    };

    savedData.push(existingUser);
  }

  // -----------------------------------------------------
  // MERGE POSTS (ADD ONLY NEW ONES)
  // -----------------------------------------------------
  const existingPosts = existingUser.posts ?? [];
  const newPosts = [];

  for (const post of result.posts) {
    const found = existingPosts.some((p) => p.id === post.id);
    if (!found) newPosts.push(post);
  }

  if (newPosts.length > 0) {
    console.log(`🆕 Found ${newPosts.length} NEW posts for ${username}`);
    existingUser.posts.push(...newPosts);
  } else {
    console.log(`✔ No new posts for ${username}`);
  }

  // -----------------------------------------------------
  // ALWAYS UPDATE PROFILE INFO
  // -----------------------------------------------------
  existingUser.fullName = result.fullName;
  existingUser.bio = result.bio;
  existingUser.followers = result.followers;
  existingUser.following = result.following;
  existingUser.profilePic = result.profilePic;

  console.log(`✅ Finished scraping ${username}`);
}

// -----------------------------------------------------
// MAIN SCRAPER FUNCTION
// -----------------------------------------------------
async function runScraper() {
  console.log(`\n🚀 Starting 48-hour scraping job...`);

  const savedData = loadSavedData();
  const processed = new Set();

  for (const username of INSTA_IDS) {
    if (processed.has(username)) continue;

    await scrapeOneUser(username, savedData);
    processed.add(username);
  }

  console.log(`\n📦 All users processed. Saving...`);
  saveData(savedData);
}

// -----------------------------------------------------
// CRON JOB STARTER
// -----------------------------------------------------
export function startCronJob() {
  cron.schedule(frequencyEvery48Hr, async () => {
    await runScraper();
  });

  // OPTIONAL: Run once on server startup
  runScraper();
}
