const { app } = require("@azure/functions");
const JSZip = require("jszip");

/**
 * HTTP-triggered Azure Function that merges two ZIP files into a single ZIP.
 *
 * Expected request body (JSON):
 *   {
 *     "acquiredZipBase64": "<base64-encoded ZIP bytes>",
 *     "scidZipBase64":     "<base64-encoded ZIP bytes>",
 *     "outputFileName":    "output.zip"          // optional, defaults to "merged.zip"
 *   }
 *
 * Response body: the merged ZIP file as binary (application/zip).
 */
app.http("MergeZips", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    context.log("MergeZips function triggered.");

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      context.log.error("Failed to parse request body:", parseError.message);
      return {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid request body. Expected JSON with acquiredZipBase64 and scidZipBase64.",
        }),
      };
    }

    const { acquiredZipBase64, scidZipBase64, outputFileName = "merged.zip" } = body;

    if (!acquiredZipBase64 || !scidZipBase64) {
      return {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Both 'acquiredZipBase64' and 'scidZipBase64' are required.",
        }),
      };
    }

    try {
      // Decode the incoming ZIP files from base64
      const acquiredBuffer = Buffer.from(acquiredZipBase64, "base64");
      const scidBuffer = Buffer.from(scidZipBase64, "base64");

      // Load both ZIPs
      const [acquiredZip, scidZip] = await Promise.all([
        JSZip.loadAsync(acquiredBuffer),
        JSZip.loadAsync(scidBuffer),
      ]);

      context.log(
        `Loaded ZIPs – acquired entries: ${Object.keys(acquiredZip.files).length}, SCID entries: ${Object.keys(scidZip.files).length}`
      );

      // Create the output ZIP and copy all entries from both source ZIPs
      const mergedZip = new JSZip();

      await copyZipEntries(acquiredZip, mergedZip, context);
      await copyZipEntries(scidZip, mergedZip, context);

      // Generate the merged ZIP as a Node.js Buffer
      const mergedBuffer = await mergedZip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      context.log(
        `Merge complete. Output size: ${mergedBuffer.length} bytes. Filename: ${outputFileName}`
      );

      return {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${outputFileName}"`,
          "Content-Length": String(mergedBuffer.length),
        },
        body: mergedBuffer,
      };
    } catch (err) {
      context.log.error("Error merging ZIPs:", err.message, err.stack);
      return {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Failed to merge ZIP files.",
          detail: err.message,
        }),
      };
    }
  },
});

/**
 * Copies all file entries from a source JSZip into a destination JSZip.
 * Directories are skipped (they are re-created implicitly by file paths).
 *
 * @param {JSZip} source
 * @param {JSZip} destination
 * @param {object} context  Azure Functions execution context (for logging)
 */
async function copyZipEntries(source, destination, context) {
  const copyPromises = [];

  source.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const promise = zipEntry
        .async("nodebuffer")
        .then((content) => {
          destination.file(relativePath, content, {
            date: zipEntry.date,
            comment: zipEntry.comment,
          });
          context.log(`  Copied entry: ${relativePath}`);
        })
        .catch((err) => {
          context.log.warn(`  Failed to copy entry '${relativePath}': ${err.message}`);
        });
      copyPromises.push(promise);
    }
  });

  await Promise.all(copyPromises);
}
