# Slack Spin the Wheel Bot

A simple Slack bot that randomly selects teammates for fun tasks using data from Google Sheets.

## Features

- `/spin` command to spin the wheel
- Randomly selects a teammate from your roster
- Assigns a random fun challenge/task
- Posts results directly in Slack

## Setup

### 1. Slack App Configuration

1. Create a new Slack app at https://api.slack.com/apps
2. Add the following bot token scopes:
   - `commands`
   - `chat:write`
3. Install the app to your workspace
4. Create a `/spin` slash command with request URL: `https://your-vercel-app.vercel.app/api/slack`

### 2. Google Sheets Setup

1. Create a new Google Sheet with two tabs:

   - `Roster`: Column A contains team member names (one name per row)
   - `Challenges`: Column A contains fun tasks/challenges (one task per row)

2. **Publish the entire spreadsheet to the web:**

   - Go to `File` → `Share` → `Publish to web`
   - Choose "Entire Document" and `Comma-separated values (.csv)` format
   - Click `Publish`

3. **Get the Sheet IDs (GIDs):**

   - In your browser URL, the GID parameter shows the sheet ID
   - Example: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=123456789`
   - The number after `gid=` is your sheet ID
   - Note the GID for both Roster and Challenges tabs

4. **Important:** Make sure your Google Sheet is set to "Anyone with the link can view" for public access

### 4. Environment Variables

Set these environment variables in Vercel:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SPREADSHEET_ID=your-google-spreadsheet-id-here
ROSTER_GID=your-roster-sheet-gid
CHALLENGES_GID=your-challenges-sheet-gid
```

**How to get the values:**

1. **SPREADSHEET_ID**: This is the long string in your Google Sheets URL between `/d/` and `/edit`

   - Example URL: `https://docs.google.com/spreadsheets/d/1ABC123...XYZ789/edit`
   - SPREADSHEET_ID would be: `1ABC123...XYZ789`

2. **ROSTER_GID and CHALLENGES_GID**: These are the numbers after `gid=` in your sheet URLs
   - When you click on the Roster tab: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=123456789`
   - When you click on the Challenges tab: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=987654321`
   - ROSTER_GID = `123456789`, CHALLENGES_GID = `987654321`

### 5. Deployment

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:

   ```bash
   npm run build
   ```

3. Deploy to Vercel:

   ```bash
   npm run deploy
   ```

4. Set environment variables in Vercel dashboard
5. Update the Slack app's request URL with your Vercel deployment URL

## Usage

In Slack, type `/spin` to spin the wheel and get a random teammate with a fun task!

## Development

For local development:

```bash
npm run dev
```

Note: You'll need to set up ngrok or similar to expose your local server to Slack for testing slash commands.
