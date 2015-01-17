//app.get('/', function (req, res){
//	console.log('hello world');
//	res.send('hello world');
//});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./app/routes/index');
var users = require('./app/routes/users');

var ejs = require('ejs');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// view engine setup
app.engine('.html',require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
server.listen(process.env.PORT || 5300);
// console.log('Listening on port %d', server.address().port);
//
//var server = app.listen((process.env.PORT || 5000), function() {
//    console.log('Listening on port %d', server.address().port);
//});

var numOfUsers = 0;
var roomId = 0;
var questions = [];
var questionId = 0;
var answers = [];
var users = [];
var rooms = [];

function makeAllQuestions() {

    for (var i = 0; i < 10; i++) {
        questions[i] = getRandomQuestion();
        answers[i] = calculateResult(questions[i]);
        console.log('Random Question' + (i + 1) + ': ' + questions[i].num1 + questions[i].operator + questions[i].num2);
        console.log('answer = ' + answers[i]);
    }
    //console.log('questions[0]: ' + questions[0].num1 + questions[0].operator + questions[0].num2);
    return questions;
}

function getRandomQuestion() {
    var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var operators = ['+', '-', '*'];

    var question = {
        num1: 0,
        num2: 0,
        operator: ''
    };
    question.num1 = parseInt(Math.random() * 10);
    question.num2 = parseInt(Math.random() * 10);
    question.operator = operators[parseInt(Math.random() * 3)];
    return question;
}

function calculateResult(question) {
    var result;
    switch (question.operator) {
        case '+':
            result = question.num1 + question.num2;
            break;
        case '-':
            result = question.num1 - question.num2;
            break;
        case '*':
            result = question.num1 * question.num2;
            break;
        default:
            break;
    }
    return result;
}


io.on('connection', function (socket) {
    // socket.join('room'+roomId);
    socket.on('userReady', function () {
        numOfUsers += 1;
        console.log('connected user numbers: %d', numOfUsers);
        //console.log('users add2: ' + users[0].name);
        // if(1 == numOfUsers){
        // socket.on('room'+roomId, function (data) {
        socket.join('room'+roomId);
        // });
        // }
        // socket.emit(roomId);
        // console.log('roomId: '+roomId);
        // socket.emit('testAddPlayers', {user: numOfUsers, room: roomId, users: users,type: 0});
        io.sockets.in('room'+roomId).emit('testAddPlayers', {user: numOfUsers, room: roomId, users: users,type: 1});

        // io.emit('testAddPlayers', {user: numOfUsers, room: roomId, users: users});
        // io.broadcast.emit('groupList',{users: users});
        // io.emit('groupList',{users: users});


        if (2 == numOfUsers) {
            questions = makeAllQuestions();
            // io.emit('testBegin', questions);
            io.sockets.in('room'+roomId).emit('testBegin', questions);
            questionId = 0;
            setTimeout(sendFirstQuestion(io), 5000);
            rooms.push(users);
            users = [];
            numOfUsers = 0;

            roomId++;
            console.log('testBegin');
        }

    });

    //  socket.on('disconnect', function () {
    //      console.log('user disconnect');
    // (});

    socket.on('Login', function (info) {
        var user = {id: numOfUsers,roomId: roomId ,name: info, score: 0};
        users.push(user);
        console.log('Login name: ' + info+'|'+socket.id);
        // console.log('users add: ' + users[0].name);
    });


    var tempuser = {};
    function sendFirstQuestion(io) {
        // questionId = 0;
        io.sockets.in('room'+roomId).emit('nextQuestion', {questionId: questionId, user: 0});
        console.log('sendFirstQuestion: '+tempuser.id);
    }
    function sendNextQuestion(io) {

        io.sockets.in('room'+tempuser.roomId).emit('nextQuestion', {questionId: questionId, user: tempuser});
        console.log('sendNextQuestion: '+tempuser.id+tempuser.name+'|'+tempuser.score);
    }

    var changeRoomsScore = function changeRoomsScore(user){
        var tempusers = rooms[user.roomId];
        tempusers[user.id] = user;
        rooms[user.roomId] = tempusers;
    }
    function searchBest(users){
        var bestOne = users[0];
        for (var i = 1; i < users.lengh; i++) {
            if (bestOne<users[i]) {
                bestOne = users[i];
            };
        };
        return bestOne;
    }
    socket.on('userAnswer', function (data) {
        console.log('userAnswer = ' +'('+questionId+')'+ data.answer+"|"+answers[questionId]);
        if (parseInt(answers[questionId]) == parseInt(data.answer)) {
            console.log('userAnswer correct, nextQuestion');
            tempuser = {id: data.user.id,roomId: data.user.roomId ,name: data.user.name, score: data.user.score+1};
            changeRoomsScore(tempuser);
            // socket.emit('answerRight', '');
            questionId++;
            if (10 == questionId) {

                io.sockets.in('room'+tempuser.roomId).emit('allFinish', searchBest(rooms[tempuser.roomId]));

            } else {
                // io.sockets.in('room'+tempuser2.roomId).emit('prepareNextQuestion', '');
                setTimeout(sendNextQuestion(io), 0000);
            }
        } else {
            socket.emit('answerWrong', '');
        }
    });

});

module.exports = app;
