const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json()); // Parse JSON body

// Endpoint to process text-to-speech
app.post("/generate-audio", async (req, res) => {
  const { prompt } = req.body; // Get the prompt from the request body

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const headers = {
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9,de;q=0.8",
    Connection: "keep-alive",
    "Content-Type": "application/json",
    Origin: "https://cloudtts.com",
    Referer: "https://cloudtts.com/u/index.html",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  };

  const jsonData = {
    rate: 1,
    volume: 1,
    text: prompt,
    voice: "en-US-AvaMultilingualNeural",
    with_speechmarks: true,
    recording: false,
  };

  try {
    // Call the cloudtts API to get the audio
    const response = await axios.post("https://cloudtts.com/api/get_audio", jsonData, { headers });

    const audioValue = response.data?.data?.audio;

    if (!audioValue) {
      return res.status(500).json({ error: "Failed to generate audio" });
    }

    // Decode base64 audio
    const audioData = Buffer.from(audioValue, "base64");
    const filePath = path.join(__dirname, "output_audio.mp3");

    // Save the audio file
    fs.writeFileSync(filePath, audioData);

    // Respond with the file
    res.sendFile(filePath, () => {
      // Optionally delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error generating audio:", error.message);
    res.status(500).json({ error: "An error occurred while processing the request" });
  }
});

// Server configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
