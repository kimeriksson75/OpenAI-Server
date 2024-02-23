require("dotenv").config();
const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("./config");

const { upload } = require("./cloudinary");
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function main() {
  try {
    const prompt = process.argv[2];
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });
    if (response.data[0]) {
      const { url } = response?.data[0];
      const uploaded = await upload(url);
      const { secure_url = null } = uploaded;
      process.stdout.write(secure_url);
    }
  } catch (err) {
    throw new Error(err);
  }
}

main();
