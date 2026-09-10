import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

// ==========================================
// SERVER-SIDE DOCX -> PDF CONVERSION
//
// docx-preview (the old client-side JS renderer) reimplements Word's
// layout engine in the browser and doesn't fully support absolute-
// positioned/floating shapes (text boxes, arrows, anchored images) —
// exactly what real-world Word docs with annotated screenshots use.
// That's what was causing labels/callouts to drift or overlap in the
// old preview.
//
// LibreOffice's layout engine renders these correctly (it's the same
// engine that opens the file identically for everyone, regardless of
// browser), so converting to PDF server-side and previewing that in
// the existing PDF <iframe> path gives pixel-accurate previews for
// every document, not just this one.
//
// Requires LibreOffice ("soffice") installed on the server running
// this code. On Debian/Ubuntu: `apt-get install libreoffice`.
// ==========================================

/**
 * Converts an office-document buffer (docx, doc, xlsx, pptx, ...) to
 * PDF bytes using headless LibreOffice.
 *
 * @param {Buffer} buffer - the raw file bytes
 * @param {string} extension - source extension including the dot, e.g. ".docx"
 * @returns {Promise<Buffer>} the resulting PDF bytes
 */
export const convertToPdf = async (buffer, extension = ".docx") => {
  if (!buffer || !buffer.length) {
    throw new Error("Empty file buffer passed to convertToPdf.");
  }

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "doc2pdf-"));
  const inputPath = path.join(workDir, `input${extension}`);

  try {
    await fs.writeFile(inputPath, buffer);

    await new Promise((resolve, reject) => {
      const proc = spawn("soffice", [
        "--headless",
        "--norestore",
        "--nolockcheck",
        "--nodefault",
        "--convert-to",
        "pdf",
        "--outdir",
        workDir,
        inputPath,
      ]);

      let stderr = "";

      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      proc.on("error", (err) => {
        // ENOENT here almost always means LibreOffice isn't installed
        // on this machine.
        reject(err);
      });

      const timeout = setTimeout(() => {
        proc.kill("SIGKILL");
        reject(new Error("soffice conversion timed out after 60s."));
      }, 60_000);

      proc.on("close", (code) => {
        clearTimeout(timeout);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`soffice exited with code ${code}: ${stderr}`));
        }
      });
    });

    const outputPath = path.join(workDir, "input.pdf");

    return await fs.readFile(outputPath);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
};
