# GHCR Setup and CI image push

This project optionally pushes a Docker image to GitHub Container Registry (GHCR) from the `docker-build` workflow. There are two supported modes:

- Manual push via GitHub Actions UI: dispatch the workflow and set the `push` input to `true`.
- Automatic push on `master` when a repository secret `GHCR_PAT` is present.

Recommended steps to enable automatic pushes:

1. Create a Personal Access Token (PAT) with the following scopes:
   - repo (if you want the token to be usable for repo-level package operations)
   - packages: write

2. In the repository settings, go to **Secrets and variables → Actions** and add a secret named `GHCR_PAT` with the token value.

3. On merge to `master` the workflow will build and push the image to `ghcr.io/<owner>/<repo>:latest`.

If you prefer not to store a PAT, use the workflow dispatch `push=true` input to push images manually from the Actions UI.

Security notes:
- Keep PATs scoped narrowly and rotate them periodically.
- Prefer the manual `push` workflow if you want human approval before image publication.
