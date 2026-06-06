import io
import sys

from PIL import Image, ImageOps
from rembg import remove


def main() -> int:
    data = sys.stdin.buffer.read()
    if not data:
        return 2

    img = Image.open(io.BytesIO(data))
    img = ImageOps.exif_transpose(img)

    out = remove(img)

    if isinstance(out, (bytes, bytearray)):
        sys.stdout.buffer.write(out)
        return 0

    buf = io.BytesIO()
    out.save(buf, format="PNG")
    sys.stdout.buffer.write(buf.getvalue())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
