const http = require('http');
const logger = require('pino')();
const app = require('./app');
const { createQuiz } = require('./quiz.assistant');
const { generateRandomName } = require('./random-name.assistant');
const Quiz = require('./quiz');
const { PORT } = require('./config');
const { Server } = require("socket.io");

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
	},
	connectionStateRecovery: {
		// the backup duration of the sessions and the packets
		maxDisconnectionDuration: 2 * 60 * 1000,
		// whether to skip middlewares upon successful recovery
		skipMiddlewares: true,
	  },	
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

const initQuiz = async (category, socket, room) => { 
	const response = await createQuiz(category);
	const currentQuiz = new Quiz(response.quiz, socket);
	currentQuiz.initQuiz(room);
	quizzes.push(currentQuiz);
	
	await new Promise(resolve => setTimeout(() => resolve(), 1000))
	
	currentQuiz.startQuiz(room);
	currentQuiz.on('quizSummary', (summary) => {
		console.log('quizSummary has been emitted', { summary });
		
	});
	currentQuiz.on('quizFinished', () => {
		console.log('quizFinished has been emitted');
		quizzes = quizzes.filter((quiz) => quiz !== currentQuiz);
		delete currentQuiz;
	});
};


let users = [];
let quizInitiator = null;
let quizzes = [];
let categoryInitiated = false;

io.on('connection', (socket) => {
	logger.info(`⚡: ${socket.id} user just connected!`);

	if (socket.recovered) {
		// socket.emit('recovered', socket);
	} else {
	// new or unrecoverable session
	}
	socket.on('join', (data) => {
		const { room, name, socketID } = data;
		const rejoiningUser = users.find((user) => user.socketID === socketID);
		if (!rejoiningUser) {
			users.push(data);
		}
		socket.join(room);
		const usersInRoom = users.filter((user) => user.room === room);
		global.io.to(room).emit('newUserResponse', usersInRoom);
		logger.info(`⚡: ${name} just joined room ${room}`);
	});

	socket.on('reconnect', (data) => {
		logger.info('🔥: A user reconnected');
	});

	socket.on('disconnect', (data) => {
		logger.info('🔥: A user disconnected');
		const { room, name, socketID } = data;
		users = users.filter((user) =>  user.socketID !== socketID);	
		const usersInRoom = users.filter((user) => user.room === room);
		socket.leave(room);
		global.io.to(room).emit('newUserResponse', usersInRoom);
		socket.disconnect();
	});

	socket.on('leave', (data) => {
		const { room, name, socketID } = data;
		logger.info(`🔥: ${name} just left room ${room}`);
		users = users.filter((user) => user.socketID !== socketID);	
		const usersInRoom = users.filter((user) => user.room === room);
		global.io.to(room).emit('newUserResponse', usersInRoom);
		socket.leave(room);
		socket.disconnect();
	});

	socket.on('typing', (data) => {
		const { room } = data;
		socket.broadcast.to(room).emit('typingResponse', data.message);
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
					
			
			initQuiz(data?.text, socket, room);
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
		global.io.to(room).emit('newUserResponse', users);
	});

	socket.on('answer', (data) => {
		const { room } = data;
		const currentQuiz = quizzes.find((quiz) => quiz.getRoom() === room);
		currentQuiz?.onAnswer(data);
	});

	socket.on('quizFinished', (data) => {
		const { name, result, id, room } = data;
		const responseEndPhrase = {
			0: 'Mina kondoleanser! 😢😢😢',
			1: 'Det måste vara uppkopplingen som strular! 🤔🤔🤔',
			2: 'Peppar Peppar! 🌶️🌶️🌶️',
			3: 'Lövley! 🍀🍀🍀',
			4: 'Fantastiskt! 🌟🌟🌟',
			5: 'I brist på bättre ord: PERFEKT! 🤩🤩🤩'
		};
			const text = `${name} är klar med quizzen med en genomsnittlig svarstid på ${Math.round(result.averageUserResponseTime * 10) / 10}s och skrapade ihop ${result.correctAnswers} ${result.correctAnswers === 1 ? 'rätt' : 'rätta'} svar. ${responseEndPhrase[result.correctAnswers]}`;
			global.io.to(room).emit('messageResponse', {...data, text });
	});
	
	socket.on('generateRandomName', async () => {
		const response = await generateRandomName();
		global.io.emit('generateRandomNameResponse', response);
	});

	
});

httpServer.listen(PORT, () => {
    logger.info(`Server is listening on port ${PORT}`);
});