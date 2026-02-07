import chalk from "chalk";
import { BANKAI_ART } from "./bankai-art.js";

function easeInOut(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function calculateOpacity(t: number): number {
  if (t < 0.4) return easeInOut(t / 0.4);
  if (t < 0.7) return 1.0;
  return easeInOut(1 - (t - 0.7) / 0.3);
}

function renderFrame(t: number): string {
  const opacity = calculateOpacity(t);
  const lines: string[] = [];

  for (const row of BANKAI_ART) {
    let line = "";
    for (const ch of row) {
      if (ch === " " || opacity < 0.05) {
        line += " ";
        continue;
      }
      const intensity = Math.round(30 + 225 * opacity);
      line += chalk.rgb(intensity, intensity, intensity)(ch);
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

export async function showFade(): Promise<void> {
  // Non-TTY: static one-shot
  if (!process.stdout.isTTY) {
    console.log(renderStatic());
    return;
  }

  const FPS = 60;
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

    // Final frame: fully faded
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
