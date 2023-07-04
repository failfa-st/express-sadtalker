import process from "node:process";
import path from "node:path";
import express from "express";
import { execa } from "execa";
const app = express();
import { config } from "dotenv";

config();

const port = process.env.PORT || 3000;

app.use(express.json());

// Host local files
app.use("/uploads", express.static("results"));

// Host video player page
app.get("/files/:fileName", async (request, response) => {
  console.log(request.params);
  response.send(`<video controls src="/uploads/${request.params.fileName}"/>`);
});
const PYTHON = path.join(process.cwd(), "venv/Scripts/python.exe");

// Activate venv
await execa(path.join(process.cwd(), "venv/Scripts/activate.bat"));

/**
 * @typedef GenerateObject
 * @property {string} browser
 * @property {string} download
 * @property {string} fileName
 * @property {string} filePath
 */
/**
 *
 * @param {string} audio
 * @param {string} image
 * @param {number} [batchSize=2]
 * @returns {Promise<GenerateObject>}
 */
async function generate({ audio, image, batchSize = 2 }) {
  const args = [
    "inference.py",
    "--driven_audio",
    audio,
    "--source_image",
    image,
    "--batch_size",
    batchSize,
  ];
  //

  try {
    const result = await execa(PYTHON, args);

    console.log(result.stdout);
    console.log(result.stderr);
    const parts = result.stdout.split("\n");
    const relativePath = parts[3]
      .replace("The generated video is named:", "")
      .trim();
    const filePath = path.join(process.cwd(), relativePath);
    const fileName = relativePath.replace("./results\\", "");
    return {
      filePath,
      fileName,
      download: `http://127.0.0.1:${port}/uploads/${fileName}`,
      browser: `http://127.0.0.1:${port}/files/${fileName}`,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

app.post("/generate", async (request, response) => {
  const { audio, image, batchSize } = request.body;
  console.log(request.body);
  try {
    const result = await generate({ audio, image, batchSize });
    response.status(201).json(result);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

app.listen(port, async () => {
  await execa("venv/Scripts/activate.bat");
  console.log(`Server is running on port ${port}`);
});
