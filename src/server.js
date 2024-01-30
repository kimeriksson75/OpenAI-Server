const http = require('http');
const logger = require('pino')();
const app = require('./app');
const { createQuiz } = require('./quiz.assistant');

const { PORT } = require('./config');
const { Server } = require("socket.io");

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }
});
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
global.io = io;

let users = [];
io.on('connection', (socket) => {
    logger.info(`⚡: ${socket.id} user just connected!`);

    socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

    socket.on('message', (data) => {
        global.io.emit('messageResponse', data);
    });

    socket.on('newUser', (data) => {
        users.push(data);
        global.io.emit('newUserResponse', users);
    });
    
    socket.on('initiateQuiz', async (data) => {
        console.log('data', {data});
        const response = await createQuiz(data?.text);
        global.io.emit('newQuiz', {
            quiz: response.quiz
        });
    });

    socket.on('quizFinished', (data) => {
        const { name, result, id } = data;
        const text = `${name} är klar med quizzen och fick ${result.correctAnswers} poäng!`;
        global.io.emit('messageResponse', {...data, text });
    });

    socket.on('disconnect', () => {
        logger.info('🔥: A user disconnected');
        users = users.filter((user) => user.socketID !== socket.id);
        global.io.emit('newUserResponse', users);
        socket.disconnect();
    });
});

httpServer.listen(PORT, () => {
    logger.info(`Server is listening on port ${PORT}`);
});