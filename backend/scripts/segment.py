import sys

from rembg import remove


def main() -> int:
    data = sys.stdin.buffer.read()
    if not data:
        return 2
    out = remove(data)
    sys.stdout.buffer.write(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

