import puppeteer from "puppeteer";

export async function scrapeInstagramThroughPuppeteer(username) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
  );

  let profileData = null;

  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("web_profile_info")) {
      try {
        profileData = await response.json();
      } catch (e) {}
    }
  });

  await page.goto(`https://www.instagram.com/${username}/`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  await new Promise(r => setTimeout(r, 3000));

  await browser.close();

  if (!profileData) {
    console.log("No data captured.");
    return;
  }

  const user = profileData.data.user;

  const edges = user?.edge_owner_to_timeline_media?.edges || [];

  const NOW = Date.now() / 1000;
  const H48 = 48 * 60 * 60;

  const recentPosts = edges
    .map(edge => {
      const n = edge.node;

      return {
        id: n.id,
        shortcode: n.shortcode,
        imageUrl: n.display_url,
        isVideo: n.is_video || false,
        videoUrl: n.is_video ? n.video_url || null : null,
        caption: n?.edge_media_to_caption?.edges?.[0]?.node?.text || "",
        timestamp: n.taken_at_timestamp
      };
    })
    .filter(post => NOW - post.timestamp <= H48);

  const finalResult = {
    username: user.username,
    fullName: user.full_name,
    bio: user.biography,
    profilePic: user.profile_pic_url_hd,
    followers: user.edge_followed_by.count,
    following: user.edge_follow.count,
    posts: recentPosts
  };

  return finalResult;
}


// // Run the scraper
// scrapeInstagram("dance.inn.bangalore").then((data) => {
//   fs.writeFileSync("puppeteerScraping/instaUserPostDetail.json", JSON.stringify([data], null, 2));
//   console.log("Saved instaUserPostDetail");
// });
