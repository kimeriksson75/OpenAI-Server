const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("./config");
const logger = require("pino")();
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const createQuiz = async (category) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant designed to output JSON. Please output in desired language swedish.",
        },
        {
          role: "user",
          content: `Create a JSON objet with the format quiz: [{question: string, answers: [], correctAnswer: string, category: string}] named quiz provided with an array of five quiz questions with the cateogry ${category}, provided with an array of three answers which only one is correct. Reveal the correct answer separate. The level of difficult should be hard`,
        },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });
    const json = await JSON.parse(completion.choices[0].message.content);
    return json;
  } catch (error) {
    logger.error(error);
  }
  return null;
};

const summarizeQuizResult = async (summaryData) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant designed to output JSON. Please output in desired language swedish.",
        },
        {
          role: "user",
          content: `Create an hilarious summary from the quiz on the category ${
            summaryData.category
          } with the a maximum points of ${
            summaryData.maxPoints
          } that has the following result: ${summaryData.quizResults.map(
            (res) =>
              `name: ${res.name} correctAnswers: ${res.correctAnswers} averageResponseTime: ${res.averageUserResponseTime}`
          )}. Please return the summary as string named summary. Lift up the winner and be super condescending to looser. Use lots of emojis. Be poetic. Use strong swedish words!`,
        },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });
    const json = await JSON.parse(completion.choices[0].message.content);
    return json;
  } catch (error) {
    logger.error(error);
  }
  return null;
};

module.exports = {
  createQuiz,
  summarizeQuizResult,
};
