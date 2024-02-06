const Event = require('events');
class Quiz extends Event.EventEmitter {
	constructor(quizData) {
		super();
		this.quizData = quizData;
		this.currentQuestionIndex = 0;
		this.usersAnswered = new Set();
		this.quizAnswers = {};
		this.room = '';
	}
	getRoom() {
		return this.room;
	}
	initQuiz(room) {
		this.room = room;
		global.io.to(room).emit('newQuiz', {
				quiz: this.quizData,
		});
	}
	startQuiz(room) {
		global.io.to(room).emit('quizRound', this.currentQuestionIndex);
	}

	async onAnswer(data) {
		console.log('answer', data);
		global.io.to(this.room).emit('answerResponse', data);

		this.usersAnswered.add(data);

		// Store the answer in the quizAnswers object
		if (!this.quizAnswers[this.currentQuestionIndex]) {
			this.quizAnswers[this.currentQuestionIndex] = [];
		}
		this.quizAnswers[this.currentQuestionIndex].push(data);

		if (this.usersAnswered.size === io.sockets.adapter.rooms.get(this.room).size) {
			this.usersAnswered.clear();
			this.currentQuestionIndex++;
			await new Promise((resolve) => setTimeout(resolve, 2000));

			if (this.currentQuestionIndex < this.quizData.length) {
					global.io.to(this.room).emit('quizRound', this.currentQuestionIndex);
			} else {
					global.io.to(this.room).emit('quizFinished');
					this.summarizeQuiz();
			}
		}
	}
	summarizeQuiz() {
		const summary = this.quizData.map((question, index) => {
			const answers = this.quizAnswers[index];
			const correctAnswer = question.correct_answer;
			const correct = answers.includes(correctAnswer);
			return {
				question: question.question,
				answers,
				correctAnswer,
				correct
			};
		});
		this.emit('quizSummary', summary);
		this.terminateQuiz();

	}
	terminateQuiz() {
		this.emit('quizFinished');
	}
}

module.exports = Quiz;
