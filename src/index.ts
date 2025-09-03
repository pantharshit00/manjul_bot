import { App } from "@slack/bolt";

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

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

// Handle /spin slash command
app.command("/spin", async ({ command, ack, respond }) => {
  await ack();

  try {
    const [teammate, challenge] = await Promise.all([
      getRandomTeammate(),
      getRandomChallenge(),
    ]);

    const message = `🎯 The wheel landed on @${teammate} → Your fun task is: ${challenge}`;

    await respond(message);
  } catch (error) {
    console.error("Error in /spin command:", error);
    await respond(
      "Sorry, I encountered an error while spinning the wheel. Please try again!"
    );
  }
});

// Vercel serverless function export
export default app;
