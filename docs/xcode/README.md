Xcode WKWebView template
=======================

This is a minimal example of how to host the reflection form inside an iOS app using `WKWebView`. The provided Swift files are a starting point — create a new Xcode project and replace `ViewController.swift` with the sample below, or copy the files into your project.

Steps:

1. In Xcode, create a new iOS App (App) project, select Swift and SwiftUI or UIKit as you prefer.
2. Add `WebKit` to the project import where needed.
3. Replace the main view controller with `ViewController.swift` below or add a SwiftUI `UIViewControllerRepresentable` wrapper.
4. In `App Transport Security Settings` (Info.plist) allow the remote host if you load `http://` (recommended: use HTTPS).
5. Set signing team and provisioning profile, build and run on device.

Example `ViewController.swift` (UIKit):

```swift
import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!

    override func loadView() {
        webView = WKWebView()
        webView.navigationDelegate = self
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Replace with your hosted URL or local file
        if let url = URL(string: "https://yourdomain.example/docs/reflection_form_improved.html") {
            webView.load(URLRequest(url: url))
        }
        webView.allowsBackForwardNavigationGestures = true
    }
}
```

Notes
-----
- For offline usage, consider bundling the `www/` folder in the app bundle and load `Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www")`.
- For deeper native integration, use JavaScript message handlers (`WKScriptMessageHandler`).
