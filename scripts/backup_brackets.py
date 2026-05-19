"""Pull every submitted bracket from Firestore and write a single local JSON snapshot.

Usage:
    python scripts/backup_brackets.py
    python scripts/backup_brackets.py --credentials path/to/serviceaccount.json
    python scripts/backup_brackets.py --output path/to/brackets.json

Auth: requires a Firebase Admin service account JSON. Provide it via either
the --credentials flag or the GOOGLE_APPLICATION_CREDENTIALS env var.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = REPO_ROOT / "scripts" / "backups" / "brackets.json"
COLLECTION = "brackets"


def _normalize(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _normalize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalize(v) for v in value]
    return value


def _resolve_credentials(cli_path: str | None) -> Path:
    if cli_path:
        path = Path(cli_path).expanduser().resolve()
    else:
        env_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if not env_path:
            sys.exit(
                "No credentials found. Pass --credentials <path> or set "
                "GOOGLE_APPLICATION_CREDENTIALS to a Firebase service account JSON. "
                "See scripts/README.md for how to generate one."
            )
        path = Path(env_path).expanduser().resolve()
    if not path.is_file():
        sys.exit(f"Credentials file not found: {path}")
    return path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--credentials",
        help="Path to Firebase service account JSON. Falls back to GOOGLE_APPLICATION_CREDENTIALS.",
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT),
        help=f"Output JSON path (default: {DEFAULT_OUTPUT}).",
    )
    args = parser.parse_args()

    cred_path = _resolve_credentials(args.credentials)
    output_path = Path(args.output).expanduser().resolve()

    firebase_admin.initialize_app(credentials.Certificate(str(cred_path)))
    db = firestore.client()

    query = db.collection(COLLECTION).where(
        filter=FieldFilter("status", "==", "submitted")
    )

    records: dict[str, Any] = {}
    for doc in query.stream():
        records[doc.id] = _normalize(doc.to_dict())

    sorted_records = dict(sorted(records.items()))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(sorted_records, f, indent=2, ensure_ascii=False, sort_keys=False)

    print(f"Wrote {len(sorted_records)} brackets to {output_path}")


if __name__ == "__main__":
    main()
