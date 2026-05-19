# scripts/

Manually-run utilities for the World Cup bracket app.

## `backup_brackets.py`

Pulls every submitted bracket from the Firestore `brackets` collection and writes a single JSON snapshot to `scripts/backups/brackets.json`, keyed by Firestore document ID (sorted ascending). Every run is a full overwrite.

### One-time setup

1. **Generate a service account JSON.** Firebase Console → project **pw-world-cup-bracket** → Project Settings → **Service accounts** → **Generate new private key**. Save the downloaded file as `scripts/.serviceaccount.json` (gitignored). Treat this file like a password — it grants admin access to the project.

2. **Install the Python dependency** (Python 3.10+ recommended, ideally in a venv):

   ```
   pip install -r scripts/requirements.txt
   ```

3. **Tell the script where the credentials live.** Either persist the env var once:

   ```powershell
   setx GOOGLE_APPLICATION_CREDENTIALS "C:\absolute\path\to\scripts\.serviceaccount.json"
   ```

   (open a new shell after `setx`), or pass `--credentials <path>` on each run.

### Run

```
python scripts/backup_brackets.py
```

Optional flags:

- `--credentials <path>` — service account JSON path; overrides `GOOGLE_APPLICATION_CREDENTIALS`.
- `--output <path>` — output JSON path; default is `scripts/backups/brackets.json`.

The script prints `Wrote N brackets to <path>` on success.

## `buildThirdPlaceCombinations.mjs`

Regenerates `src/data/thirdPlaceCombinations.json` from the raw FIFA combinations table. Run with `node scripts/buildThirdPlaceCombinations.mjs`.
