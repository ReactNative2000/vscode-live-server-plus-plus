# App Store submission checklist

This checklist helps you prepare the packaged iOS app for App Store Connect and the review process.

Before you build

1. Join the Apple Developer Program and create App Store Connect access for your account.
2. Choose a unique bundle identifier (reverse DNS) like `com.yourorg.reflection`.
3. Ensure your app has a clear privacy policy URL and contact email.

In Xcode / build

1. Set the bundle identifier and the Team (signing) in the Xcode project.
2. Update the app version and build number.
3. Provide proper launcher icons and app screenshots (iPhone sizes, portrait/landscape as needed).
4. If your app uses camera/mic (WebRTC), include NSCameraUsageDescription and NSMicrophoneUsageDescription in `Info.plist`.

App Store Connect

1. Create a new app record (App Store Connect → My Apps → +) and enter the bundle id.
2. Fill required metadata: name, subtitle, description, keywords, support URL, marketing URL, and privacy policy URL.
3. Upload screenshots for required device sizes.
4. Upload the build from Xcode's Organizer or using Transporter.
5. Answer the App Review questions (data collection, encryption, content rating).
6. Submit for review and monitor TestFlight for pre-release testing.

Common problems

- Missing usage descriptions for camera/mic will cause rejections for WebRTC features. Add `NSCameraUsageDescription` and `NSMicrophoneUsageDescription` with user-facing text.
- If your app is a WebView wrapper, ensure it meets App Store guidelines (it should provide real native value, not just a thin wrapper over a website).
- For apps that rely on external servers, ensure CORS and secure HTTPS endpoints are used.
