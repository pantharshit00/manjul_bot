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
    // Debug: Log the raw request
    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers);
    console.log("Request body type:", typeof req.body);
    console.log("Request body:", req.body);

    // Handle different body formats
    let slackPayload: any = {};

    if (typeof req.body === "string") {
      // URL-encoded form data
      const params = new URLSearchParams(req.body);
      slackPayload = Object.fromEntries(params.entries());
    } else if (req.body && typeof req.body === "object") {
      // Already parsed object
      slackPayload = req.body;
    }

    console.log("Parsed payload:", slackPayload);

    // Check if it's a slash command
    console.log("Looking for command:", slackPayload.command);

    if (slackPayload.command === "/spin" || slackPayload.command === "spin") {
      try {
        const [teammate, challenge] = await Promise.all([
          getRandomTeammate(),
          getRandomChallenge(),
        ]);

        // Format the mention properly - if it starts with U, it's a user ID, otherwise treat as username
        const mention = teammate.startsWith("U")
          ? `<@${teammate}>`
          : `@${teammate}`;
        const message = `🎯 The wheel landed on ${mention} → Your fun task is: ${challenge}`;

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
      console.log("Unknown command received:", slackPayload.command);
      console.log("Full payload:", JSON.stringify(slackPayload, null, 2));
      res.status(200).json({
        text: `Unknown command: ${
          slackPayload.command || "undefined"
        }. Expected: /spin`,
      });
    }
  } catch (error) {
    console.error("Error processing Slack event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
