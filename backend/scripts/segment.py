import io
import os
import sys

from PIL import Image, ImageOps
from rembg import new_session, remove


os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("VECLIB_MAXIMUM_THREADS", "1")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")

SESSION = new_session("u2netp")


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

    out = remove(img, session=SESSION)

    if isinstance(out, (bytes, bytearray)):
        sys.stdout.buffer.write(out)
        return 0

    buf = io.BytesIO()
    out.save(buf, format="PNG")
    sys.stdout.buffer.write(buf.getvalue())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
