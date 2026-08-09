#!/usr/bin/env python3
"""Build a cinemagraph-style loop: static cloud scene + animated bird silhouettes."""

import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
BASE_IN = ROOT / "base.png"
BASE_UP = ROOT / "base-4k.png"
OUT = ROOT / "loop.mp4"
BIRDS_DIR = ROOT / "birds"

W, H = 2160, 3840
FPS = 30
DURATION = 10


def upscale_base() -> None:
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(BASE_IN),
            "-vf", f"scale={W}:{H}:flags=lanczos",
            str(BASE_UP),
        ],
        check=True,
        capture_output=True,
    )


def bird_sprite(size: float, wing: str) -> Image.Image:
    w, h = int(52 * size), int(22 * size)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    alpha = int(170 + 40 * size)
    fill = (8, 8, 12, alpha)
    if wing == "v":
        d.polygon([(2, h // 2), (w // 2, 4), (w - 2, h // 2)], fill=fill)
        d.polygon([(2, h // 2), (w // 2, h - 4), (w - 2, h // 2)], fill=fill)
    else:
        d.ellipse([(4, h // 2 - 3), (w - 4, h // 2 + 3)], fill=fill)
        d.polygon([(w // 3, h // 2 - 2), (w // 2, 2), (2 * w // 3, h // 2 - 2)], fill=fill)
    return img


def make_birds() -> list[dict]:
    BIRDS_DIR.mkdir(exist_ok=True)
    specs = [
        {"size": 1.1, "wing": "v", "y": 0.42, "speed": 118, "delay": 0.0, "bob": 14},
        {"size": 0.85, "wing": "v", "y": 0.48, "speed": 102, "delay": 1.2, "bob": 10},
        {"size": 0.7, "wing": "flat", "y": 0.44, "speed": 95, "delay": 2.4, "bob": 8},
        {"size": 1.25, "wing": "v", "y": 0.52, "speed": 128, "delay": 0.6, "bob": 16},
        {"size": 0.6, "wing": "flat", "y": 0.46, "speed": 88, "delay": 3.1, "bob": 6},
        {"size": 0.95, "wing": "v", "y": 0.50, "speed": 110, "delay": 1.8, "bob": 12},
        {"size": 0.75, "wing": "v", "y": 0.54, "speed": 100, "delay": 4.0, "bob": 9},
        {"size": 1.0, "wing": "flat", "y": 0.40, "speed": 115, "delay": 2.0, "bob": 11},
        {"size": 0.55, "wing": "v", "y": 0.56, "speed": 82, "delay": 5.2, "bob": 7},
        {"size": 0.8, "wing": "v", "y": 0.47, "speed": 105, "delay": 6.5, "bob": 10},
    ]
    birds = []
    for i, spec in enumerate(specs):
        path = BIRDS_DIR / f"bird{i}.png"
        bird_sprite(spec["size"], spec["wing"]).save(path)
        birds.append({**spec, "path": path})
    return birds


def overlay_expr(bird: dict, index: int) -> tuple[str, str]:
    y0 = int(H * bird["y"])
    speed = bird["speed"]
    delay = bird["delay"]
    bob = bird["bob"]
    # Enter from right, fly left; loop by wrapping time
    x = f"mod((t-{delay})*{speed}, {W + 260})"
    x = f"{W}+130-{x}"
    y = f"{y0}+{bob}*sin(2*PI*(t-{delay})/2.3)"
    return x, y


def build_video(birds: list[dict]) -> None:
    inputs = ["-loop", "1", "-i", str(BASE_UP)]
    for b in birds:
        inputs += ["-i", str(b["path"])]

    parts = []
    prev = "[0:v]"
    for i, bird in enumerate(birds):
        x, y = overlay_expr(bird, i)
        out = f"[v{i}]"
        parts.append(
            f"{prev}[{i + 1}:v]overlay=x='{x}':y='{y}':format=auto{out}"
        )
        prev = out

    # Very subtle cloud shimmer — barely perceptible, adds life without Ken Burns
    parts.append(
        f"{prev}eq=brightness='0.02*sin(2*PI*t/8)':saturation=1.02[vout]"
    )
    filter_complex = ";".join(parts)

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-t", str(DURATION),
        "-r", str(FPS),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "16",
        "-preset", "slow",
        "-movflags", "+faststart",
        str(OUT),
    ]
    subprocess.run(cmd, check=True)


def export_proof_frames() -> None:
    for t in (0, 3, 6, 9):
        subprocess.run(
            [
                "ffmpeg", "-y", "-ss", str(t), "-i", str(OUT),
                "-frames:v", "1", "-q:v", "2",
                str(ROOT / f"proof-{t}s.jpg"),
            ],
            check=True,
            capture_output=True,
        )


def main() -> None:
    print("Upscaling base to 4K vertical...")
    upscale_base()
    print("Creating bird sprites...")
    birds = make_birds()
    print(f"Compositing {len(birds)} birds over {DURATION}s...")
    build_video(birds)
    export_proof_frames()
    print(f"Done: {OUT}")


if __name__ == "__main__":
    main()
