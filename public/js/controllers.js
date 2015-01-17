var MCCtrls = angular.module('mcCtrls', []);
//var users = [];
var player = {};
var questionsInFrontEnd;
var roomId = 0;
var headScope = {};
var mainScope = {};
MCCtrls.controller('UserInfoCtrl',
        function($scope, socketFactory) {
            headScope = $scope;
            $scope.Login = function() {
                player = {
                    id: 0,
                    roomId: 0 ,
                    name: $scope.playerName,
                    //password: "123456",
                    score:0
                    //autoLogin: true
                }
                if ('' != $scope.playerName) {
                    socketFactory.emit('Login', player.name);

                    location.href = '#lf';
                }
            }
            $scope.userInfo = player;
//            $scope.loginin = function() {
//
//            };
        }
    );
MCCtrls.controller('listCtrl',
    function($scope, socketFactory) {
        mainScope = $scope;
        //$scope.players = [];
        //$scope.pageClass="list"
        $scope.playerAnswer = function () {
            socketFactory.emit('userAnswer', {answer: $scope.userAns, user: player});
            $scope.userAns = '';
        };

        socketFactory.emit('userReady', '');

        socketFactory.on('testAddPlayers', function (data) {
            roomId = data.room;
            // if (0 == data.type) {
            // console.log('roomId'+roomId);
            // socketFactory.emit('room'+roomId);
            // }else if (1 == data.type) {
            $scope.question = '请等待别的用户,要集齐3个人测试才开始。' +
            '现在在线人数： ' + data.user //+ ' players in Room: ' + data.room;
            // console.log(data.users[0]);
            $scope.players = data.users;
            player = data.users[data.user - 1];
            // };
        });


        socketFactory.on('testBegin', function (questions) {
            questionsInFrontEnd = questions;
            $scope.question = '测试在5秒后开始！';
        });

        //socketFactory.on('prepareNextQuestion', function () {
        //    console.log('prepareNextQuestion');

            // $scope.uesrQuestions = 'Next question in 3s...';
        //});

        socketFactory.on('nextQuestion', function (data) {
            console.log('nextQuestion00000:' + data.user + '()|' + data.questionId);

            $scope.userAnswerStatus = '';
            $scope.question = questionsInFrontEnd[data.questionId].num1 +
            questionsInFrontEnd[data.questionId].operator + questionsInFrontEnd[data.questionId].num2;
            console.log('nextQuestion');
            if (0 != data.user) {
                console.log('data.user not null');
                player = data.user;
                headScope.userInfo = player;
                $scope.players[data.user.id] = data.user;
            }
        });

        //socketFactory.on('answerRight', function (questions) {
        //    $scope.userAnswerStatus = 'Correct!';
        //});

        socketFactory.on('answerWrong', function (questions) {
            $scope.userAnswerStatus = '答案错误,请重新输入!';
        });

        socketFactory.on('allFinish', function (data) {
            $scope.question = '比赛结束! 恭喜（' + data.name + '）赢得比赛';
        });
    }
);

//MCCtrls.controller('MainController',['$scope', function($scope, socketFactory) {
//
//    $scope.tagline = 'This is the login page';
//
//    $scope.userLogin = function() {
//        var userEmail = $scope.login.email;
//        var userPwd = $scope.login.password;
//        var usrInfo = {email : userEmail, pwd : userPwd};
//        socketFactory.emit('userLogin', usrInfo);
//    }
//
//}]);
/**
 * 这里接着往下写，如果控制器的数量非常多，需要分给多个开发者，可以借助于grunt来合并代码
 */
/* RankingService)
socket=io.socket();
 socket.on("new_palyer")*/