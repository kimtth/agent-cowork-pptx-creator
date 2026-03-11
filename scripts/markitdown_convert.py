import argparse
import json
import sys


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    args = parser.parse_args()

    try:
        from markitdown import MarkItDown
    except Exception as exc:
        print(json.dumps({
            "ok": False,
            "error": f"MarkItDown is not installed. Run 'pnpm setup:markitdown' to provision the local uv environment. Detail: {exc}",
        }))
        return 1

    try:
        md = MarkItDown(enable_plugins=False)
        result = md.convert(args.source)
        markdown = getattr(result, "text_content", "") or ""
        title = getattr(result, "title", "") or ""
        print(json.dumps({"ok": True, "title": title, "markdown": markdown}, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
