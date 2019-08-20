'use strict'

window.$ = window.jQuery = require('../../../public/js/jquery.min.js')

let SerialPort = require('serialport')
let portObj = null
var xmlHttp
var urlHead = 'http://192.168.199.101:8080/'
let flag = true
let u10Count = ''

SerialPort.list((err, ports) => {
  for (let item of ports) {
    $('.com').append(`<option>${item.comName}</option>`)
  }
  console.log(ports)
})

function freshPort () {
  SerialPort.list(
    (err, ports) => {
      $('#disabledSelect').children('option').remove()
      for (let item of ports) {
        $('.com').append(`<option id="option-item">${item.comName}</option>`)
      }
      console.log(ports)
    })
}

function serialComm (data) {
  let COM = $('#disabledSelect option:selected').text()

  let BaudRate = $('#BaudRate').val()

  console.log('点击确定事件')
  console.log(COM)
  console.log(BaudRate)
  $('.receive-windows').text(`打开串口: ${COM}, 波特率: ${BaudRate}`)
  $('.receive-windows').append('<br/>=======================================<br/>')

  portObj = new SerialPort(COM, {baudRate: parseInt(BaudRate)})

  portObj.on('open', function () {
    $('.receive-windows').append(`<li>端口正在开启！</li>`)

    if (portObj.isOpen) {
      $('.receive-windows').append(`<li>端口成功连接！！！正在监听数据</li>`)
      portObj.on('data', function (data) {
        console.log('data received: ' + data)
        let dataStr = data.toString()
        dataStr = dataStr.substr(0, 2);
        let ni = 'NI'

        if (dataStr === ni) {
          if (flag) {
            $('.receive-windows').append(`<li>${dataStr}</li>`)
            $('.receive-windows').append(`<li>监听到模块未初始化信号</li>`)
            alert('监听到模块未初始化信号')
            flag = false
          }
        }

        if (u10Count === dataStr) {
          $('.receive-windows').append(`<li>${u10Count}</li>`)
          $('.receive-windows').append(`<li>模块初始化成功</li>`)
          alert('模块初始化成功!')
        }
      })
    } else {
      $('.receive-windows').append(`<li>端口连接失败，端口或已被占用。</li>`)
      alert('端口连接失败，端口或已被占用。')
    }
  })

  // 打开错误将会发出一个错误事件
  portObj.on('error', function (err) {
    let error = err.message;
    console.log('Error: ', error)
    $('.receive-windows').append(`<li>${error}</li>`)
  })
}

// 开始初始化设备
function startInitSerial () {
  var head = [0xAF, 0x49, 0x35, 0xEA, 0xF0]
  var end = [0x31, 0x24, 0x63, 0xA4]
  var model_id = vue.inputModelId
  console.log(model_id)
  var middle = u16Count(model_id)
  for (var i = 0; i < middle.length / 2; i++) {
    var temp = middle[i]
    middle[i] = middle[middle.length - 1 - i]
    middle[middle.length - 1 - i] = temp
  }
  var serial_number = new Array()

  for (var i = 0; i < 13; i++) {
    if (i < 5) {
      serial_number[i] = head[i]
    }
    if (i >= 5 && i < 9) {
      serial_number[i] = middle[i - 5]
    }
    if (i >= 9) {
      serial_number[i] = end[i - 9]
    }
  }

  if (portObj != null) {
    portObj.write(serial_number, function (err) {
      if (err) {
        return console.log('Error on write: ', err.message)
      }
      console.log('message written')
    })
  } else {
    $('.receive-windows').append(`<li>请先连接串口!</li>`)
  }
}

// 字符串转byte数组
function stringToBytes (str) {
  var num = str + ''
  var arr = new Array()
  for (var i = 0; i < num.length; i++) {
    arr.push(num.charCodeAt(i))
  }
  return arr
}

function u16Count (a) {
  var c = a + ''
  console.log(c)
  var arr = new Array()
  for (var i = 0; i < 4; i++) {
    var temp
    arr[i] = parseInt(c.substring(i * 2, i * 2 + 2), 16)
    console.log(arr[i])
    u10Count = arr[i] + ''
  }
  return arr
}

function u16CountToString (num) {
  num = parseInt(num, 16) + 1
  console.log(num)
  var a = num.toString(16)
  var len = a.length
  console.log(a)
  console.log(a.length)
  for (var i = 0; i < (8 - len); i++) {
    a = '0' + a
    console.log('补0')
  }
  return a
}

// 创建ajax的核心对象creatxmlhttpRequest
function createXMLhttpRequest () {
  xmlHttp = new XMLHttpRequest()
}

function rq_finishInit (inputModelId, model_kind, model_kind_name, firmware_version, pcb_version) {
  console.log('开始新增设备')
  var data = new FormData()
  data.set('serial_number', inputModelId)
  data.set('model_kind', model_kind)
  data.set('model_kind_name', model_kind_name)
  data.set('firmware_version', firmware_version)
  data.set('pcb_version', pcb_version)
  postInitModel(data)
}

function getModelInfoRequest () {
  // 发送请求
  sendRequest(urlHead + 'getModelInfo')
}

function getModelKindRequest () {
  var url = urlHead + 'getModelKind'
  createXMLhttpRequest()
  xmlHttp.open('get', url, true)
  xmlHttp.send(null)
  xmlHttp.onreadystatechange = cb_getModelKind
}

function sendRequest (url) {
  createXMLhttpRequest()
  xmlHttp.open('get', url, true)//  true 就是异步NN
  //   send()里面也可以指定发送内容
  xmlHttp.send(null)//  发送
  xmlHttp.onreadystatechange = callBack // 回调函数
}

function postInitModel (data) {
  // 发送post请求
  postRequest((urlHead + 'initModel'), data)
}

function postRequest (url, data) {
  console.log('开始post' + url + '请求')
  createXMLhttpRequest()
  xmlHttp.open('post', url, true)
  xmlHttp.send(data)
  xmlHttp.onreadystatechange = cb_finishInit
}

function callBack () {
  // 当 readyState 等于 4 且状态为 200 时，表示响应已就绪：
  if (xmlHttp != null) {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      var responseText = xmlHttp.responseText
      console.log(responseText)
      var jsonObj = jQuery.parseJSON(responseText)
      if (jsonObj.code == 1) {
        var responseData = jsonObj.data
        var message = ''
        for (var i = 0; i < responseData.length; i++) {
          message = message + 'model_id:' + responseData[i].model_id +
            ' model_date:' + responseData[i].model_date +
            ' model_serial_number:' + responseData[i].serial_number + '\n'
        }
        var newId = u16CountToString(responseData[responseData.length - 1].serial_number)
        console.log(newId)
        vue.inputModelId = newId
        getModelKindRequest()
      } else if (jsonObj.code == 0) {
        alert('获取ModelKind数据失败')
      }
    }
  }
}

function cb_finishInit () {
  if (xmlHttp != null) {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      var responseText = xmlHttp.responseText
      console.log(responseText)
      var jsonObj = jQuery.parseJSON(responseText)
      var responseData = jsonObj.msg
      $('.receive-windows').append(`<li>responseData</li>`)
      alert('模块数据新增成功！')
      flag = true
      getModelInfoRequest()
    }
  }
}

function cb_getModelKind () {
  console.log('请求model种类数据成功')
  if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    var responseText = xmlHttp.responseText
    console.log(responseText)
    var jsonObj = jQuery.parseJSON(responseText)
    if (jsonObj.code == 1) {
      var responseData = jsonObj.data
      $('#inputName').children('option').remove()
      for (let item of responseData) {
        $('#inputName').append(`<option>${item.model_kind_name_cn}</option>`)
      }
    } else if (jsonObj.code == 0) {
      alert('获取ModelKind数据失败')
    }
  }
}
