YouTube Setup and Embedding Best Practices

This document covers embedding YouTube videos in the project docs, basic monetization notes, and content policy reminders.

Embedding recommendations
- Use privacy-enhanced embeds (youtube-nocookie.com) to reduce cross-site tracking.
- Provide a consent/preview step before loading an iframe to avoid loading third-party content automatically.
- Include descriptive alt text and a link to the video on YouTube for accessibility.

Monetization and donations
- If you plan to use YouTube monetization (ads, Super Thanks, memberships), ensure your channel meets YouTube's eligibility requirements and complies with their policies.
- Consider linking to other supported donation channels (Buy Me a Coffee, Cash App) from your video's description rather than relying solely on YouTube monetization.

Policy and firearms-related content
- YouTube restricts content that shows wrongdoing or unsafe handling of weapons. For firearm-related videos, keep content safety-first and non-actionable where possible.
- If your channel contains demonstrations or safety training, ensure it follows local laws and YouTube's community guidelines.

Technical notes
- Use the `docs/assets/youtube-embed.js` helper to add a consent-based, privacy-enhanced embed in docs pages. Example usage in HTML:

```html
<div id="yt-demo"></div>
<script src="/docs/assets/youtube-embed.js"></script>
<script>createYouTubeEmbed('yt-demo','VIDEO_ID');</script>
```
