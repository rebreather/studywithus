﻿"use strict";

const User = require("../../models/User");
// const UserStorage = require("../../models/UserStorage");

const output = {
    hello: (req, res) => {
        res.render("home/index"); // ../../../appfront/studywithus/src/App
    },
    login: (req, res) => {
        res.render("home/login");
    },
    register: (req,res) => {
        res.render("home/register");
    },
    main: (req,res) => {
        res.render("home/main");
    },
    qna: (req,res) => {
        res.render("home/qna");
    },
    schedules: (req,res) => {
        res.render("home/schedules");
    }
};

const process = {
    login: async (req, res) => {
        const user = new User(req.body); // User클래스의 생성자로 들어감
        const response = await user.login();
        return res.json(response);
    },
    register: async(req, res) => {
        const user = new User(req.body); 
        const response = await user.register();
        return res.json(response);
    }
}

module.exports = { //외부로 내보내기, 꼭 쓸 것
    output,
    process
};
