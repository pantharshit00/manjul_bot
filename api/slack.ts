// No imports needed for simple slash command handling

async function getRandomTeammate(): Promise<string> {
  try {
    const rosterUrl = `https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}/export?format=csv&gid=${process.env.ROSTER_GID}`;
    const response = await fetch(rosterUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const names = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line.length > 0);

    if (names.length === 0) {
      throw new Error("No names found in roster");
    }

    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
  } catch (error) {
    console.error("Error fetching roster:", error);
    throw error;
  }
}

async function getRandomChallenge(): Promise<string> {
  try {
    const challengesUrl = `https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}/export?format=csv&gid=${process.env.CHALLENGES_GID}`;
    const response = await fetch(challengesUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const challenges = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line.length > 0);

    if (challenges.length === 0) {
      throw new Error("No challenges found");
    }

    const randomIndex = Math.floor(Math.random() * challenges.length);
    return challenges[randomIndex];
  } catch (error) {
    console.error("Error fetching challenges:", error);
    throw error;
  }
}

// Slash command handling is done directly in the handler function below

// No signature verification - simplified for development

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Get raw body as string
    let rawBody = "";
    if (typeof req.body === "string") {
      rawBody = req.body;
    } else if (req.body) {
      rawBody = JSON.stringify(req.body);
    }

    // Parse form data
    const params = new URLSearchParams(rawBody);
    const slackPayload = Object.fromEntries(params.entries());

    // Check if it's a slash command
    if (slackPayload.command === "/spin") {
      try {
        const [teammate, challenge] = await Promise.all([
          getRandomTeammate(),
          getRandomChallenge(),
        ]);

        const message = `🎯 The wheel landed on @${teammate} → Your fun task is: ${challenge}`;

        res.status(200).json({
          response_type: "in_channel",
          text: message,
        });
      } catch (error) {
        console.error("Error in /spin command:", error);
        res.status(200).json({
          response_type: "ephemeral",
          text: "Sorry, I encountered an error while spinning the wheel. Please try again!",
        });
      }
    } else {
      res.status(200).json({ text: "Unknown command" });
    }
  } catch (error) {
    console.error("Error processing Slack event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
