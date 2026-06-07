import io
import os
import sys

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("VECLIB_MAXIMUM_THREADS", "1")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")

from PIL import Image, ImageOps
try:
    from rembg import new_session, remove
except Exception:
    from rembg import remove

SESSION = None
try:
    if "new_session" in globals():
        SESSION = new_session("u2netp")
except Exception:
    SESSION = None


def main() -> int:
    data = sys.stdin.buffer.read()
    if not data:
        return 2

    img = Image.open(io.BytesIO(data))
    img = ImageOps.exif_transpose(img)

    try:
        img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    except Exception:
        img.thumbnail((1024, 1024))

    out = None
    try:
        if SESSION is not None:
            out = remove(
                img,
                session=SESSION,
                alpha_matting=True,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_structure_size=12,
            )
        else:
            out = remove(
                img,
                alpha_matting=True,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_structure_size=12,
            )
    except TypeError:
        if SESSION is not None:
            out = remove(img, session=SESSION)
        else:
            out = remove(img)

    if isinstance(out, (bytes, bytearray)):
        out_img = Image.open(io.BytesIO(out))
    else:
        out_img = out

    out_img = out_img.convert("RGBA")
    r, g, b, a = out_img.split()

    def alpha_curve(v: int) -> int:
        if v < 35:
            return 0
        if v > 240:
            return 255
        return int((v - 35) * 255 / (240 - 35))

    a2 = a.point(alpha_curve)
    out_img.putalpha(a2)

    buf = io.BytesIO()
    out_img.save(buf, format="PNG", optimize=True)
    sys.stdout.buffer.write(buf.getvalue())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
