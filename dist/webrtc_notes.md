# TURN & WebRTC notes (2025 recommendations)

This document lists TURN providers, configuration notes, and cost estimates for reliable global WebRTC media in 2025. It assumes you have an unlimited budget and want a production-grade, low-latency experience.

Top managed TURN providers (enterprise-grade)

- Twilio Network Traversal (Programmable Video / STUN/TURN)
  - Pros: Global edge, easy integration with Twilio Programmable Video, managed scaling, robust NAT traversal.
  - Cons: Cost increases with relay GB; pricing example: ~$0.0015-0.04/GB depending on region and SLAs.

- Xirsys (Intel-backed)
  - Pros: Easy to set up, global POPs, usage-based billing, good developer tooling.
  - Cons: Still billed per GB relayed; plan for predictable budgets.

- Agora (TURN & RTC)
  - Pros: Global infrastructure, fine-grained QoS, built-in recording and CDN.
  - Cons: More platform lock-in if you adopt their full stack.

- LiveSwitch / Janus (self-hosted managed)
  - Pros: If you want complete control, you can rent cloud instances in regions you serve and horizontally scale.
  - Cons: Requires more ops work.

Recommendation (unlimited funds):

1. Use a managed provider like Twilio or Agora for relayed traffic to avoid operational overhead. Configure session limits and carrier-optimized regions for lowest latency.
2. Use a multi-region fallback strategy — primary TURN via Twilio, fallback via Xirsys or Agora.
3. Enable metrics & logging on relay usage to capture GB, sessions, and peak concurrency.

Capacity planning & cost estimate (very rough):

- Assume N concurrent users in relay mode with average 0.6 Mbps per participant (in one-to-many scenarios relay may double/triple this). For 1000 concurrent relayed participants, that's ~600 Mbps sustained — ~2.6 TB/hour. At $0.02/GB that is ~ $52K/hour — relay costs can be huge. Use peer-to-peer whenever possible and only relay when necessary.

Operational notes

- Use TURN only when necessary (network conditions force relay). Encourage P2P by configuring ICE trickle and gather STUN candidates first.
- Use monitoring to detect relay-heavy calls and set policies to limit session durations or request users to upgrade.
- Consider using selective forwarding (SFU) when you need multi-party calls — cheaper than full-relay for many participants.

Security

- Use short-lived credentials/tokens for TURN allocation (do not embed static credentials in clients).
- Rotate TURN credentials frequently, integrate with your auth server.

If you'd like, I can add a small sample showing how to integrate Twilio's Network Traversal and generate ephemeral TURN credentials on the server.
