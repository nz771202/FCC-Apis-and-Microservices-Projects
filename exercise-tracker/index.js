const bodyParser = require('body-parser');
const {User, Exercise} = require('./models');

exports.create = function()
{
	const router = require('express').Router();
	router.use(bodyParser.urlencoded({extended: false}));
	router.post('/new-user', addUser);
	router.post('/add', addExercise);
	router.get('/users', getUsers);
	router.get('/log', getLog);
	return router;
}

function addUser(req, res)
{
	const name = req.body.username;
	User.findOne({name}, (err, user) => {
		if (err) {
			res.json(err);
		} else if (user) {
			res.json(user.toObject({versionKey: false}));
		} else {
			new User({name}).save((err, user) => {
				if (err) {
					res.json(err);
				} else {
					res.json(user.toObject({versionKey: false}));
				}
			});
		}
	});
}

function addExercise(req, res)
{
	if (!req.body.userId) {
		res.json({error: 'No userId given'});
		return;
	}
	User.findById(req.body.userId, (err, user) => {
		if (err) {
			res.json(err);
		} else if (!user) {
			res.json({error: 'User not found'});
		} else {
			let date = new Date(req.body.date);
			if (date == 'Invalid Date') {
				date = new Date();
			}
			req.body.date = date.toDateString();

			new Exercise(req.body).save((err, exercise) => {
				if (err) {
					res.json(err);
				} else {
					res.json(exercise);
				}
			});
		}
	});
}

function getUsers(req, res)
{
	User.find({}, '-__v', (err, data) => {
		res.json(data);
	});
}

function getLog(req, res)
{
	let from = new Date(req.query.from);
	let to = new Date(req.query.to);
	if (from == 'Invalid Date') {
		from = new Date(0);
	}
	if (to == 'Invalid Date') {
		to = new Date();
	}

	User.findById(req.query.userId, (err, user) => {
		if (err || !user) {
			res.json({error: 'Could not retrieve user'});
			return;
		}
		Exercise.find({
			userId: req.query.userId,
			date: {$gt: from.getTime(), $lt: to.getTime()}
		})
		.sort('-date')
		.limit(parseInt(req.query.limit))
		.exec((err2, exercises) => {
			if (err2 || !exercises) {
				res.json({error: 'Could not retrieve log'});
				return;
			}
			res.json({
				userId: user._id,
				username: user.name,
				from: from.toDateString(),
				to: to.toDateString(),
				count: exercises.length,
				log: exercises.map(e => ({
					description : e.description,
					duration : e.duration,
					date: e.date.toDateString()
				}))
			});
		});
	});
}
