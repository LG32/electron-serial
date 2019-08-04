'use strict'
window.$ = window.jQuery = require('../../public/js/jquery.min.js');

let SerialPort = require('serialport');
let port = null;
let portObj = null;

SerialPort.list((err, ports) => {
  for (let item of ports) {
    $('.com').append(`<option>${item.comName}</option>`)
  }
  console.log(ports);
});

function serialComm(data) {
  let COM = $('select option:selected').text();
  let BaudRate = $('#BaudRate').val();
  console.log("点击确定事件")
  console.log(COM);
  console.log(BaudRate);
  // port = new SerialPort(COM, {
  //   baudRate: parseInt(BaudRate)
  // });
  $('.receive-windows').text(`打开串口: ${COM}, 波特率: ${BaudRate}`);
  $('.receive-windows').append('<br/>=======================================<br/>');
  
  portObj = new SerialPort(COM, { baudRate: parseInt(BaudRate)});
  // port.open();
  

  portObj.on('open', function () {
    $('.receive-windows').append("端口正在开启！");
    portObj.write('main screen turn on ', function (err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });

    if (portObj.isOpen) {
      $('.receive-windows').append('端口成功连接！！！');
    } else {
      $('.receive-windows').append('端口连接失败，端口或已被占用。');
    }
  });

  //打开错误将会发出一个错误事件
  portObj.on('error', function (err) {
    console.log('Error: ', err.message);
    $('.receive-windows').append(err.message);
  });
}


//点击发送信息
$('.btn-send').click(() => {
  var sendData = $('.input-send-data').val();
  if (port != {} && port != null) {
    console.log('SendData: ${sendData}');
    port.write(sendData);
  }

  console.log("点击完成初始化");
  var id = $("#inputId").val();
  var name = $("#inputName").val();
  var remark = $("#inputRemark").val();
  console.log('设备id' + id + " 设备名称" + name + " 设备备注" + remark);
  this.inputModelId = id;
  this.inputModelName = name;
  this.inputModelRemark = remark;
  alert('设备id' + this.inputModelId +
    ' 设备名称' + this.inputModelName +
    ' 设备备注' + this.inputModelRemark);
})
// 清空信息
$('.btn-reset').click(() => {
  console.log("点击开始初始化");
  $('.input-send-data').val('');
})

var xmlHttp;

//创建ajax的核心对象creatxmlhttpRequest
function createXMLhttpRequest() {
  xmlHttp = new XMLHttpRequest();
}

function check() {
  // 发送请求
  sendRequest("http://localhost:8080/getModelInfo");
}

function sendRequest(url) {
  createXMLhttpRequest();
  xmlHttp.open("get", url, true);  //  true 就是异步NN
  //   send()里面也可以指定发送内容
  xmlHttp.send(null);   //  发送
  xmlHttp.onreadystatechange = callBack;   //回调函数

}

function callBack() {
  //当 readyState 等于 4 且状态为 200 时，表示响应已就绪：
  if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    var responseText = xmlHttp.responseText;
    console.log(responseText);
    var jsonObj = jQuery.parseJSON(responseText);
    var responseData = jsonObj.data;
    var message = '';
    for (var i = 0; i < responseData.length; i++) {
      message = message + "model_id:" + responseData[i].model_id
        + " model_date:" + responseData[i].model_date
        + " model_serial_number:" + responseData[i].serial_number + "\n";
    }
    $('.receive-windows').append(message);
  }
}