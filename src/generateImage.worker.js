const { parentPort, workerData } = require("worker_threads");
require("dotenv").config();
const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("./config");

const { upload } = require("./cloudinary");
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function main() {
  try {
    const prompt = workerData.prompt;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });
    if (response.data[0]) {
      const { url, revised_prompt } = response?.data[0];
      const uploaded = await upload(url);
      const { secure_url = null } = uploaded;
      data = {
        ...workerData,
        secure_url,
        revised_prompt,
      };

      parentPort.postMessage(data);
    }
  } catch (err) {
    console.error(err);
    parentPort.postMessage({ error: err });
  }
}

main();
