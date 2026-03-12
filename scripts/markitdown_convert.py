import argparse
import json
import sys
from typing import Any


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    return parser


def emit_payload(payload: dict[str, Any]) -> None:
    print(json.dumps(payload, ensure_ascii=False))


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    args = build_parser().parse_args()

    try:
        from markitdown import MarkItDown
    except Exception as exc:
        emit_payload({
            "ok": False,
            "error": f"MarkItDown is not installed. Run 'pnpm setup:markitdown' to provision the local uv environment. Detail: {exc}",
        })
        return 1

    try:
        result = MarkItDown(enable_plugins=False).convert(args.source)
        emit_payload({
            "ok": True,
            "title": getattr(result, "title", "") or "",
            "markdown": getattr(result, "text_content", "") or "",
        })
        return 0
    except Exception as exc:
        emit_payload({"ok": False, "error": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
