Report: added rendered cloak PNGs and test results

Branch: feat/pair-programming-batch

What I added:
- images/cloak_with_logo.png
- images/cloak_with_logo_mono.png
- images/cloak_with_name.png
- images/cloak_with_name_mono.png

Commit: chore: add rendered cloak PNGs (generated)

Tests run:
- `server/hospital` tests: 4 passing (mocha)

Notes & next steps:
- The hospital seed workflow is still blocked from dispatching programmatically in this environment. `server/hospital/db.json` was already present from the generator and is in the repo.
- If you'd like the seeded `hospital.db` sqlite file produced by the CI workflow, either run the `.github/workflows/hospital-seed.yml` workflow from the Actions UI on branch `feat/pair-programming-batch` and paste the run URL here, or provide a short-lived PAT with repo+workflow scopes and I will dispatch and retrieve the artifact.
