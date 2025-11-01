## GitHub Pages deployment

This project ships static site assets under the `docs/` folder. The repository includes a GitHub Actions workflow (`.github/workflows/pages.yml`) which will publish the contents of `docs/` to the `gh-pages` branch and enable GitHub Pages.

How it works

- On push to `master` or `gh-pages`, or when the workflow is manually dispatched, the workflow will:
  - checkout the repo
  - run an optional `npm run build` if present
  - publish the `./docs` folder to the `gh-pages` branch using `peaceiris/actions-gh-pages`

Verify the site

1. After a successful run, go to the repository Settings → Pages and confirm the source is set to the `gh-pages` branch and `/ (root)`.
2. The GitHub Pages URL will be listed there (usually `https://<owner>.github.io/<repo>`). Allow a few minutes for DNS/propagation.
3. Open the deployed page and navigate to `/reflection_form_improved.html` to see the form.

Custom domain (CNAME)

To use a custom domain:

1. Create a file `CNAME` in the `docs/` folder (plain text with your domain, e.g. `example.com`) or add it to the root of the `gh-pages` branch.
2. Configure your domain's DNS: add an A record pointing to GitHub Pages' IPs or a CNAME to `username.github.io`. Use GitHub's documentation for current IPs.
3. Verify the Pages settings in the repo Settings → Pages and add the custom domain there.

Local testing

To preview locally before pushing:

```bash
# serve the docs directory with a simple static server (requires npm install -g http-server)
http-server docs -p 8080
# or with Python 3
python3 -m http.server --directory docs 8080
```

The form will be available at `http://localhost:8080/reflection_form_improved.html`.
