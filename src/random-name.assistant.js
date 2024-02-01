const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("./config");
const logger = require("pino")();
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const generateRandomName = async () => {
	try {
    const completion =  await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant designed to output JSON. Please output in desired language english.",
          },
          { role: "user", content: `Create a JSON objet with the format {randomName: "random-funny-name"}. It needs to be URL secure. Please make it funny.` },
        ],
        model: "gpt-3.5-turbo-1106",
        response_format: { type: "json_object" },
		});
    const json = await JSON.parse(completion.choices[0].message.content)
    return json;

	} catch (error) {
    logger.error(error);
	}
	return null;
}

module.exports = {
    generateRandomName,
};