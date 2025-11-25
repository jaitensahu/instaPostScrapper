import express from "express";
import fetch from "node-fetch";
import { startCronJob } from "./scrapeCron.js";
const app = express();

// http://localhost:3000/proxy?url=IMAGE_URL
app.get("/proxy", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send("Missing url");

  try {
    const response = await fetch(url, {
      headers: {
        // Required so Instagram doesn't block you
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
    });

    // Pass original content-type to browser
    res.set("Content-Type", response.headers.get("content-type"));

    // Stream content to client
    response.body.pipe(res);
  } catch (err) {
    console.log("Proxy Error:", err);
    res.status(500).send("Failed to load image");
  }
});

startCronJob();

app.listen(3000, () => console.log("running on port 3000"));
