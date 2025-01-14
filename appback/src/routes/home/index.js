﻿"use strict";

const express = require("express");
const router = express.Router();
const url = require('url');

const ctr = require("./home.ctrl"); 
const passport = require('../../config/passport.js');
const db = require("../../config/db");



//localhost:5000/
router.get("/", ctr.output.hello); // home.ctrl.js 파일에 있는 hello 함수 실행

//localhost:5000/login
//router.get("/login", ctr.output.login); //home.crtl.js 파일 안에 있는 함수 사용
//router.post("/login", ctr.process.login); 

//localhost:5000/register (회원 등록)
router.get("/register", ctr.output.register);
router.post("/register", ctr.process.register);

router.get('/login', function(req,res){
    res.render('auth/login');
});
  
router.get('/logout', function(req, res) {
    req.logout();
    console.log("로그아웃");
    req.session.save(function(){
        res.redirect('/');
    })
});

router.get('/google',
    passport.authenticate('google', { scope: ['profile'] })
);
  
router.get('/google/callback',
    passport.authenticate('google'), authSuccess
);
  
function authSuccess(req, res) {
    res.redirect("/main");
}

//localhost:5000/qna (qna 메뉴)
router.get('/qna', function (req, res) {
    var sql = 'SELECT * FROM question';    
    db.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render("home/qna", {list : rows});
    });
});

//localhost:5000/write (글쓰기 페이지)
router.get("/write", ctr.output.write);
router.post("/write", ctr.process.write);

//localhost:5000/main (메인 화면)
router.get("/main", function(req,res) {
    const sql = 'SELECT * FROM `todolist` WHERE `userid` = ? ORDER BY `rank` ASC, `id` ASC;';
    var logined_userid = req.user.id;

    db.query(sql, [logined_userid], function (error, rows) {
        if (error) {
            console.log('error : ', error.message);
            return;
        } else {
            var rows_todo = [], //해야 하는 일
                rows_doing = [], //진행 중
                rows_done = []; //완료

            var todo_sign = 0,
                doing_sign = 0,
                done_sign = 0;

            //todolist 테이블의 행 만큼 for문 돌아감
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].status == 1) { //status의 상태가 1(할 일) 일때
                    rows_todo[todo_sign] = rows[i]; //그 행은 1(할 일) 목록에 적재됨
                    todo_sign++;
                    console.log("할 일 목록에 들어감");
                } else if (rows[i].status == 2) {
                    rows_doing[doing_sign] = rows[i];
                    doing_sign++;
                    console.log("진행중 목록에 들어감");
                } else if (rows[i].status == 3) {
                    rows_done[done_sign] = rows[i];
                    done_sign++;
                    console.log("완료 목록에 들어감");
                }
            }
            res.render("home/main", {
                todoList: rows_todo,
                doingList: rows_doing,
                doneList: rows_done,
                logined_user: req.user
            });
        }
    });
});

//To-Do 추가 라우터
router.route('/main/addtodo').post(function (req, res) {
    console.log('todo 추가 라우터 호출');

    var logined_userid = req.user.id;
    var paramTitle = req.body.description; //투두
    var paramWho = req.body.name; //이름(누가~.)
    var paramRank = req.body.rank; //우선순위
    var paramStatus = req.body.status; //상태

    //To-Do 추가 함수 for To-do 추가 라우터
var addTodo = function (userid,description, name, rank, status, callback) {
    console.log('todo 등록 함수 호출됨');

    var data = {
        description: description,
        name: name,
        rank: rank,
        userid: logined_userid,
        status: 1
    };

    var exec = db.query('insert into todolist set ?', data, function (err, result) {

        if (err) {
            console.log('SQL 실행 오류 발생');
            console.dir(err);
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

    addTodo(logined_userid, paramTitle, paramWho, paramRank, paramStatus,
        function (err, addedTodo) {
            if (err) {
                console.error('추가 중 오류: ' + err.stack);
                res.writeHead(200, {
                    "Content-Type": "text/html;charset=utf8"
                });
                res.write('<h1>에러발생</h1>');
                res.write("<br><a href='/main'>처음으로</a>");
                res.end();
                return;
            }
            if (addedTodo) {
                console.dir(addedTodo);
                console.log('inserted ' + addedTodo.affectedRows + ' rows');

                var insertId = addedTodo.insertId; //todolist의 id(컬럼)
                paramStatus++;

                console.log('추가한 레코드 ID: ' + insertId);
                res.redirect('/main');
                return;
            } else {
                res.writeHead(200, {
                    "Content-Type": "text/html;charset=utf8"
                });
                res.write('<h1>추가 중 오류</h1>');
                res.write("<br><a href='/src/views/home/main.ejs'>처음으로</a>");
                res.end();
                return;
            }
        });
});

//To-Do 추가 함수 for To-do 추가 라우터
// var addTodo = function (userid,description, name, rank, status, callback) {
//     console.log('todo 등록 함수 호출됨');

//     var data = {
//         description: description,
//         name: name,
//         rank: rank,
//         userid: logined_userid,
//         status: 1
//     };

//     var exec = db.query('insert into todolist set ?', data, function (err, result) {

//         if (err) {
//             console.log('SQL 실행 오류 발생');
//             console.dir(err);
//             callback(err, null);
//             return;
//         }
//         callback(null, result);
//     });
// }

//To-Do 데이터 전체삭제 라우터
router.route('/main/deleteall').get(function (req, res) {
    var logined_userid = req.user.id;
    db.query('delete from todolist where userid = ?;', [logined_userid], function (error, results) {
        if (error) {
            console.dir(error);
            return;
        } else {
            console.log("전체 삭제 됨");
            res.redirect('/main');
        }
    });
});

//To-Do status 변경 라우터
router.route('/main/changestate/').get(function (req, res) {
    var _url = req.url; //주소
    var queryData = url.parse(_url, true).query;
    var logined_userid = queryData.id;
    var status = parseInt(queryData.status) + 1;

    db.query('update todolist set status = ? where userid = ?', [status, logined_userid], function (error, results) {
        if (error) {
            console.dir(error);
        } else {
            res.redirect('/main');
        }
    });
});

//To-Do 삭제 라우터
router.route('/main/deltodo/:id').get(function (req, res) {
    var logined_userid = req.user.id;
    db.query('delete from todolist where userid = ? and status = 3', [logined_userid], function (error, results) {
        if (error) {
            console.dir(error);
        } else {
            res.redirect('/main');
        }
    });
});



//외부에서 이 파일을 사용하도록 함.
module.exports = router; //외부로 내보내기