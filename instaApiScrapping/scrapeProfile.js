import axios from "axios";
import { getInstagramAppId } from "./getAppId.js";

export async function scrapeInstagramProfile(username) {
  try {
    const appId = await getInstagramAppId();

    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-IG-App-ID": appId,
      },
      validateStatus: () => true, // we manually handle errors
    });

    // ⛔ STOP immediately on 401
    if (data.status === "fail" && data.message === "login_required") {
      console.error("401 Error: Login required. Stopping scraping.");
      return { error: "401", stop: true, status: false };
    }

    // Some IG endpoints return status_code
    if (data.status_code === 401) {
      console.error("401 Unauthorized. Stopping scraping.");
      return { error: "401", stop: true, status: false };
    }

    // Standard axios 401 catch
    if (data?.response?.status === 401) {
      console.error("401 Unauthorized. Stopping scraping.");
      return { error: "401", stop: true, status: false };
    }
    console.log("Fetched profile data", data?.data?.user, "dataaaa", data.status, data.status_code);
    const user = data?.data?.user;

    if (!user) {
      console.log("No user data found.");
      return { error: "404", stop: true, status: false };
    }

    // -------- FILTER POSTS IN LAST 24 HRS --------
    const now = Date.now();
    const DAY_24_MS = 48 * 60 * 60 * 1000;

    const recentPosts = user.edge_owner_to_timeline_media.edges
      .map((edge) => edge.node)
      .filter((node) => {
        const postTime = node.taken_at_timestamp * 1000; // IG timestamp is in seconds
        return now - postTime <= DAY_24_MS;
      })
      .map((node) => ({
        id: node.id,
        shortcode: node.shortcode,
        imageUrl: node.display_url,
        isVideo: node.is_video,
        videoUrl: node?.video_url || "",
        caption:
          node.edge_media_to_caption.edges?.[0]?.node?.text || "",
        timestamp: node.taken_at_timestamp,
      }));

    return {
      username: user.username,
      fullName: user.full_name,
      bio: user.biography,
      profilePic: user.profile_pic_url_hd,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      posts: recentPosts, // ← only last 24 hrs posts
    };
  } catch (err) {
    throw err;
  }
}


// (async () => {
//   const data = await scrapeInstagramProfile("dance.inn.bangalore");
//   fs.writeFileSync(
//     "instaApiScrapping/instaUserPostDetail.json",
//     JSON.stringify([data], null, 2)
//   );
// })();
