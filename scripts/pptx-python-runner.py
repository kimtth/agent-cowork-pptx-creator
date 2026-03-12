from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

SLIDE_WIDTH_IN = 13.333
SLIDE_HEIGHT_IN = 7.5


def _load_theme() -> dict[str, str]:
    raw = os.environ.get('PPTX_THEME_JSON', '{}')
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def rgb_color(value: str | None, fallback: str = '000000') -> RGBColor:
    normalized = (value or fallback).strip().lstrip('#').upper()
    if len(normalized) != 6:
        normalized = fallback
    return RGBColor.from_string(normalized)


def ensure_parent_dir(file_path: str) -> None:
    Path(file_path).expanduser().resolve().parent.mkdir(parents=True, exist_ok=True)


def apply_widescreen(prs: Presentation) -> Presentation:
    prs.slide_width = Inches(SLIDE_WIDTH_IN)
    prs.slide_height = Inches(SLIDE_HEIGHT_IN)
    return prs


def _convert_to_pptx_compatible(source: Path) -> Path:
    """Convert unsupported image formats (e.g. WebP) to PNG for python-pptx."""
    if source.suffix.lower() not in ('.webp',):
        return source
    target = source.with_suffix('.png')
    if target.exists():
        return target
    from PIL import Image
    with Image.open(source) as img:
        img.save(target, 'PNG')
    return target


def safe_image_path(value: str | None) -> str | None:
    if not value:
        return None
    candidate = Path(value).expanduser().resolve()
    if not candidate.exists():
        return None
    candidate = _convert_to_pptx_compatible(candidate)
    return str(candidate)


def safe_add_picture(shapes, image_path: str | None, left, top, width=None, height=None):
    resolved = safe_image_path(image_path)
    if not resolved:
        return None
    return shapes.add_picture(resolved, left, top, width=width, height=height)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('generated_code')
    parser.add_argument('output_path')
    parser.add_argument('--render-dir', default=None)
    return parser.parse_args()


def build_namespace(generated_path: Path, output_path: Path) -> dict[str, object]:
    theme = _load_theme()
    title = os.environ.get('PPTX_TITLE', 'Presentation')

    return {
        '__name__': '__main__',
        '__file__': str(generated_path),
        'OUTPUT_PATH': str(output_path),
        'PPTX_TITLE': title,
        'PPTX_THEME': theme,
        'SLIDE_WIDTH_IN': SLIDE_WIDTH_IN,
        'SLIDE_HEIGHT_IN': SLIDE_HEIGHT_IN,
        'Presentation': Presentation,
        'Inches': Inches,
        'Pt': Pt,
        'RGBColor': RGBColor,
        'PP_ALIGN': PP_ALIGN,
        'MSO_ANCHOR': MSO_ANCHOR,
        'MSO_AUTO_SHAPE_TYPE': MSO_AUTO_SHAPE_TYPE,
        'rgb_color': rgb_color,
        'ensure_parent_dir': ensure_parent_dir,
        'apply_widescreen': apply_widescreen,
        'safe_image_path': safe_image_path,
        'safe_add_picture': safe_add_picture,
        '_pptx_theme': theme,
        '_pptx_title': title,
    }


def run_generated_code(generated_path: Path, namespace: dict[str, object]) -> None:
    code = generated_path.read_text(encoding='utf-8')
    exec(compile(code, str(generated_path), 'exec'), namespace)


def finalize_output(output_path: Path, namespace: dict[str, object]) -> None:
    if output_path.exists():
        return

    builder = namespace.get('build_presentation')
    if callable(builder):
        builder(str(output_path), namespace.get('_pptx_theme'), namespace.get('_pptx_title'))

    if not output_path.exists():
        raise RuntimeError('Generated python-pptx code completed without creating the PPTX output file.')


def render_preview_images(output_path: Path, render_dir: Path) -> None:
    if sys.platform != 'win32':
        raise RuntimeError('Local slide preview rendering is only supported on Windows.')

    try:
        import pythoncom  # type: ignore
        import win32com.client  # type: ignore
    except ImportError as exc:
        raise RuntimeError('pywin32 is required for local PPTX preview rendering on Windows.') from exc

    render_dir.mkdir(parents=True, exist_ok=True)
    for existing in render_dir.glob('*'):
        if existing.is_file():
            existing.unlink()

    pythoncom.CoInitialize()
    powerpoint = None
    presentation = None
    try:
        powerpoint = win32com.client.DispatchEx('PowerPoint.Application')
        powerpoint.Visible = 1
        presentation = powerpoint.Presentations.Open(str(output_path), WithWindow=False, ReadOnly=True)
        presentation.Export(str(render_dir), 'PNG', 1280, 720)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError('Microsoft PowerPoint is required to render local preview images.') from exc
    finally:
        if presentation is not None:
            presentation.Close()
        if powerpoint is not None:
            powerpoint.Quit()
        pythoncom.CoUninitialize()


def _unlock_or_rename(output_path: Path) -> Path:
    """Remove existing output file. If locked, fall back to a timestamped name."""
    if not output_path.exists():
        return output_path
    try:
        output_path.unlink()
        return output_path
    except PermissionError:
        from datetime import datetime
        stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        alt = output_path.with_stem(f'{output_path.stem}-{stamp}')
        print(f'[WARNING] {output_path.name} is locked, saving as {alt.name}', file=sys.stderr)
        return alt


def main() -> int:
    args = parse_args()
    generated_path = Path(args.generated_code).resolve()
    output_path = Path(args.output_path).resolve()
    render_dir = Path(args.render_dir).resolve() if args.render_dir else None

    if not generated_path.exists():
        raise FileNotFoundError(f'Generated Python source file not found: {generated_path}')

    output_path = _unlock_or_rename(output_path)
    namespace = build_namespace(generated_path, output_path)
    run_generated_code(generated_path, namespace)
    finalize_output(output_path, namespace)
    if render_dir is not None:
        try:
            render_preview_images(output_path, render_dir)
        except Exception as exc:  # noqa: BLE001
            print(f'[WARNING] Preview rendering failed (PPTX was generated successfully): {exc}', file=sys.stderr)

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
