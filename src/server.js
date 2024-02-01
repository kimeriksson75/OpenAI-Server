const http = require('http');
const logger = require('pino')();
const app = require('./app');
const { createQuiz } = require('./quiz.assistant');
const { generateRandomName } = require('./random-name.assistant');

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
        correctAnswer: 'Christopher Nolan'
      },
      {
        category: 'movies',
        question: "Which actor played the lead role in the movie 'The Shawshank Redemption'?",
        answers: [ 'Tom Hanks', 'Morgan Freeman', 'Tim Robbins' ],
        correctAnswer: 'Tim Robbins'
      },
      {
        category: 'movies',
        question: 'What is the highest-grossing animated movie of all time?',
        answers: [ 'Finding Nemo', 'Toy Story 3', 'Frozen' ],
        correctAnswer: 'Frozen'
      },
      {
        category: 'movies',
        question: 'Which movie won the Academy Award for Best Picture in 2019?',
        answers: [ 'Black Panther', 'Green Book', 'Bohemian Rhapsody' ],
        correctAnswer: 'Green Book'
      },
      {
        category: 'movies',
        question: 'Who played the role of Tony Stark in the Marvel Cinematic Universe?',
        answers: [ 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo' ],
        correctAnswer: 'Robert Downey Jr.'
      }
    ]
  }
global.io = io;

let users = [];
let usersRoom = [];
let quizInitiator = null;
let categoryInitiated = false;
io.on('connection', (socket) => {

	socket.on('join', (data) => {
		const { room, name } = data;
		socket.join(room);
		users.push(data);
		const usersInRoom = users.filter((user) => user.room === room);
		global.io.to(room).emit('newUserResponse', usersInRoom);
		logger.info(`⚡: ${name} just joined room ${room}`);
	});

	socket.on('leave', (data) => {
		const { room, name } = data;
		socket.leave(room);
		users = users.filter((user) => user.room !== room);
		const usersInRoom = users.filter((user) => user.room === room);
		global.io.to(room).emit('newUserResponse', usersInRoom);
		logger.info(`⚡: ${name} just left room ${room}`);
	});


	logger.info(`⚡: ${socket.id} user just connected!`);

	socket.on('typing', (data) => {
		const { room } = data;
		socket.broadcast.to(room).emit('typingResponse', data);
	});

	socket.on('message', async (data) => {
		const { role, type, socketID, room } = data;
		if (categoryInitiated && quizInitiator === socketID) {
			quizInitiator = null;
			categoryInitiated = false;
			await new Promise(resolve => setTimeout(() => {
				global.io.emit('messageResponse', {
					text: `Jaså ${data?.name}, du vill köra på kategorin ${data?.text}. Ha tålamod, quiz på väg!`, 
					name: "Quizmaestro", 
					id: `${Math.random()}`,
					socketID: `${Math.random()}`,
					role: "admin",
					type: "message",
				});
				resolve();
			}, 1000))
					
			const response = await createQuiz(data?.text);
			global.io.to(room).emit('newQuiz', {
					quiz: response.quiz
			});
			return;
		}
		if (role === 'admin' && type === 'initiateQuiz') {
			categoryInitiated = true;
			quizInitiator = socketID;
		}
		global.io.to(room).emit('messageResponse', data);
	});

	socket.on('newUser', (data) => {
		const { room } = data;
		users.push(data);
		console.log('newUser', [users])
		global.io.to(room).emit('newUserResponse', users);
	});

	socket.on('quizFinished', (data) => {
			const { name, result, id, room } = data;
			const text = `${name} är klar med quizzen och fick ${result.correctAnswers} poäng!`;
			global.io.to(room).emit('messageResponse', {...data, text });
	});
	
	socket.on('generateRandomName', async () => {
		const response = await generateRandomName();
		global.io.emit('generateRandomNameResponse', response);
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