const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const SessionMySqlDbStore = require('express-mysql-session')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const env = process.env.NODE_ENV || 'development-local';
const cors = require('cors');
const config = require('./config/config.json');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(cors({
	origin: config.deploy[env].frontendHost,
	credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.use(session({
	name: 'session_id',
	store: new SessionMySqlDbStore({
		host: config.deploy[env].host,
		port: 3306,
		user: config.deploy[env].username,
		password: config.deploy[env].password,
		database: config.deploy[env].database
	}),
	resave: false,
	saveUninitialized: false,
	secret: 'g^/{42sB.1+2&!æ`wt43',
	cookie: {
		maxAge: 1000 * 60 * 60, //one hour
		sameSite: 'none',
		secure: true,
		httpOnly: false
	}
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
