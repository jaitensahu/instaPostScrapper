import axios from "axios";

export async function getInstagramAppId() {
  try {
    const { data: html } = await axios.get("https://www.instagram.com/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    // App ID appears like: "appId":"936619743392459"
    const match = html.match(/"appId":"(\d+)"/);

    if (match && match[1]) {
      return match[1];
    }

    console.log("Could not auto-detect App ID. Using fallback.");
    return "936619743392459"; // fallback stable value
  } catch (err) {
    console.log("Failed to fetch App ID:", err.message);
    return "936619743392459"; // fallback
  }
}
