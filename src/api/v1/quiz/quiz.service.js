const { createQuiz } = require("./quiz.assistant");

const mockQuiz = {
    quiz: [
      {
        category: 'movies',
        question: "Who directed the movie 'Inception'?",
        answers: [ 'Christopher Nolan', 'Steven Spielberg', 'Quentin Tarantino' ],
        correct_answer: 'Christopher Nolan'
      },
      {
        category: 'movies',
        question: "Which actor played the lead role in the movie 'The Shawshank Redemption'?",
        answers: [ 'Tom Hanks', 'Morgan Freeman', 'Tim Robbins' ],
        correct_answer: 'Tim Robbins'
      },
      {
        category: 'movies',
        question: 'What is the highest-grossing animated movie of all time?',
        answers: [ 'Finding Nemo', 'Toy Story 3', 'Frozen' ],
        correct_answer: 'Frozen'
      },
      {
        category: 'movies',
        question: 'Which movie won the Academy Award for Best Picture in 2019?',
        answers: [ 'Black Panther', 'Green Book', 'Bohemian Rhapsody' ],
        correct_answer: 'Green Book'
      },
      {
        category: 'movies',
        question: 'Who played the role of Tony Stark in the Marvel Cinematic Universe?',
        answers: [ 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo' ],
        correct_answer: 'Robert Downey Jr.'
      }
    ]
}

const init = () => {
    
}
const create = async (params) => {
    // const { category } = params;
    // const response = await createQuiz(category);
    // console.dir(response, { depth: null });
    // return response;
    global.io.emit('quiz', {
        quiz: mockQuiz.quiz
    });
    return mockQuiz;
}

const getByCategory = async (category) => {
    const response = await createQuiz(category);
    console.dir(response, { depth: null });
    return response;
}
module.exports = {
    create,
    getByCategory
};