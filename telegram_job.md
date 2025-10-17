# Send a job posting to Telegram

This repository includes a small script to send a text job posting to a Telegram chat via a bot.

Files added:
- `scripts/send_telegram_job.sh` — small bash helper that calls Telegram Bot API's sendMessage.

How it works:
1. Create a Telegram bot using @BotFather and get the bot token.
2. Get the chat ID where you want to send messages (for a channel, add the bot as an admin; for a group, use an API call or tools to discover the ID).
3. Prepare your job message in a plain text file (example in `docs/job_example.txt`).
4. Run the script locally (do not commit your bot token).

Example usage (local):

```bash
# Using positional args
./scripts/send_telegram_job.sh <BOT_TOKEN> <CHAT_ID> docs/job_example.txt

# Or via environment vars
TELEGRAM_BOT_TOKEN=12345:ABCDEF TELEGRAM_CHAT_ID=-1001234567890 ./scripts/send_telegram_job.sh docs/job_example.txt
```

Security notes:
- Never commit bot tokens or private chat IDs to git. Use environment variables or a secrets manager.
- For production workflows, use a small server or CI secrets rather than passing tokens on the command line.

If you want, I can add a tiny Node/Express webhook that posts job listings automatically when you push a new file to a folder — tell me which option you prefer (manual script vs automated webhook).
