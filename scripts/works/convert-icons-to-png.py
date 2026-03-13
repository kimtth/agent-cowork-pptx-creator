"""Batch-convert SVG icons to PNG and delete originals."""
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM
from pathlib import Path
import sys

cache_root = Path(__file__).resolve().parent.parent / 'skills' / 'iconfy-list' / 'cache'
SIZE = 256
converted = failed = 0

for col_dir in sorted(cache_root.iterdir()):
    if not col_dir.is_dir():
        continue
    for svg_file in sorted(col_dir.glob('*.svg')):
        png_file = svg_file.with_suffix('.png')
        if png_file.exists():
            svg_file.unlink(missing_ok=True)
            converted += 1
            continue
        svg_text = svg_file.read_text('utf-8').replace('currentColor', '#000000')
        tmp = svg_file.parent / f'_tmp_{svg_file.stem}.svg'
        try:
            tmp.write_text(svg_text, 'utf-8')
            drawing = svg2rlg(str(tmp))
            if drawing is None:
                failed += 1
                print(f'FAIL (None): {svg_file}')
                continue
            drawing.scale(SIZE / drawing.width, SIZE / drawing.height)
            drawing.width = SIZE
            drawing.height = SIZE
            renderPM.drawToFile(drawing, str(png_file), fmt='PNG')
            svg_file.unlink()
            converted += 1
        except Exception as e:
            failed += 1
            print(f'FAIL: {svg_file}: {e}')
        finally:
            tmp.unlink(missing_ok=True)

print(f'Done. Converted: {converted}, Failed: {failed}')
sys.exit(0 if failed == 0 else 1)
