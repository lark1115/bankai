import chalk from "chalk";
import { BANKAI_ART } from "./bankai-art.js";

// Color theme: dark blue/purple → white → dark blue/purple
const BASE_R = 60, BASE_G = 40, BASE_B = 120;   // dark purple
const PEAK_R = 255, PEAK_G = 255, PEAK_B = 255; // white

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function renderFrame(t: number): string {
  const lines: string[] = [];
  for (const row of BANKAI_ART) {
    let line = "";
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === " ") {
        line += " ";
        continue;
      }
      // Cosine wave: brightness peaks sweep left-to-right
      const wave = Math.cos((x / 8) - t * 4) * 0.5 + 0.5; // 0..1
      const brightness = Math.pow(wave, 3); // sharpen the peak
      const r = lerp(BASE_R, PEAK_R, brightness);
      const g = lerp(BASE_G, PEAK_G, brightness);
      const b = lerp(BASE_B, PEAK_B, brightness);
      line += chalk.rgb(r, g, b)(ch);
    }
    lines.push(line);
  }
  return lines.join("\n");
}

function renderStatic(): string {
  return BANKAI_ART.map((row) =>
    [...row].map((ch) => (ch === " " ? " " : chalk.cyan(ch))).join("")
  ).join("\n");
}

export async function showShimmer(): Promise<void> {
  // Non-TTY: static one-shot
  if (!process.stdout.isTTY) {
    console.log(renderStatic());
    return;
  }

  const FPS = 30;
  const DURATION_MS = 2000;
  const FRAME_MS = Math.round(1000 / FPS);
  const totalFrames = Math.ceil(DURATION_MS / FRAME_MS);

  // Hide cursor
  process.stdout.write("\x1b[?25l");

  // Restore cursor on SIGINT
  const onSigint = () => {
    process.stdout.write("\x1b[?25h\n");
    process.exit(130);
  };
  process.on("SIGINT", onSigint);

  const artHeight = BANKAI_ART.length;

  // Print initial blank lines to reserve space
  process.stdout.write("\n".repeat(artHeight));

  try {
    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      const rendered = renderFrame(t);

      // Move cursor up to overwrite previous frame
      process.stdout.write(`\x1b[${artHeight}A`);
      process.stdout.write(rendered + "\n");

      await new Promise((resolve) => setTimeout(resolve, FRAME_MS));
    }

    // Final frame: bright static
    process.stdout.write(`\x1b[${artHeight}A`);
    process.stdout.write(renderFrame(1) + "\n");

    // Brief pause to let the final frame linger
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Erase art area so subsequent output is clean
    process.stdout.write(`\x1b[${artHeight}A`);
    for (let i = 0; i < artHeight; i++) {
      process.stdout.write("\x1b[2K\n"); // clear each line
    }
    process.stdout.write(`\x1b[${artHeight}A`); // move cursor back to top of cleared area
  } finally {
    // Show cursor
    process.stdout.write("\x1b[?25h");
    process.removeListener("SIGINT", onSigint);
  }
}
