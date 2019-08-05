'use strict'
// window.$ = window.jQuery = require('../public/js/jquery.min.js');

var urlHead = "http://localhost:8080/";
var xmlHttp;

function getModelInfoRequest() {
    // 发送Get请求
    sendRequest(urlHead + "getModelInfo");
}

function postInitModel(data, callBack){
    //发送post请求
    postRequest((urlHead + "initModel"), data, callBack);
}

//创建ajax的核心对象creatxmlhttpRequest
function createXMLhttpRequest() {
    xmlHttp = new XMLHttpRequest();
}

function sendRequest(url) {
    console.log("开始get" + url + "请求");
    createXMLhttpRequest();
    xmlHttp.open("get", url, true);  //  true 就是异步NN
    xmlHttp.send(null); 
    xmlHttp.onreadystatechange = callBack;
}

function postRequest(url, data, callBack){
    console.log("开始post" + url + "请求");
    createXMLhttpRequest();
    xmlHttp.open("post", url, true);
    xmlHttp.send(data);
    xmlHttp.onreadystatechange = callBack;
}

function getXmlHttp(){
    return xmlHttp;
}