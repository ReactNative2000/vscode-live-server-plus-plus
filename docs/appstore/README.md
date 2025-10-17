App Store submission checklist
=============================

This checklist helps prepare the iOS app for App Store submission.

1. Apple Developer Program membership (organization or individual).
2. Create an App ID in the Apple Developer portal.
3. Create provisioning profiles and set up an App Store Connect app.
4. Prepare app icons (1024x1024 for App Store) and at least one set of screenshots for required device sizes.
5. Create a privacy policy (see `PRIVACY.md`) and include a URL in App Store Connect.
6. Ensure your app complies with App Store guidelines (no inappropriate content, correct use of APIs).
7. Build and test on device. Archive in Xcode and upload via Organizer or Transporter.
8. Set up TestFlight testing and invite testers.
9. Submit for review and respond to any App Review feedback.

Required icon sizes (high level):
- App Store: 1024x1024 PNG
- iOS app icon set: multiple sizes (see Xcode Asset catalog)

Required screenshots (examples):
- iPhone 6.5" (1242 x 2688)
- iPhone 5.5" (1242 x 2208)

Notes
-----
- If your app is a simple web wrapper, make sure remote content loaded over HTTPS and the app handles offline gracefully (bundle `www/` if needed).
- Use TestFlight for beta distribution before submitting.
