var nodejs_server = "http://phonegapcamera.herokuapp.com/";
/*
var nodejs_server = "http://127.0.0.1:3000/";

 */
var socket;
var _device;
var _switchSocket = false ;
function mySocket(){ 
  
	_switchSocket = true;
    socket = io.connect(nodejs_server);
  
	socket.on("mobile_action", function (data) {
	    switch (data) {
	        case "camera":
	        	capturePhoto();
	            break;   
	        case "beep":
	        	beep();
	            break;          
	        case "vibrate":
	        	vibrate();
	            break;  
	        case "acceler":
	        	acceler();
	            break;  	            
	        case "recordAudio":
	        	recordAudio();
	            break;
	        case "stopRecord":
	        	stopRecording();
	            break;
	    }
	 
	});
}    



var pictureSource;   // picture source
var destinationType; // sets the format of returned value
    
   //功用和onload相同
   document.addEventListener("deviceready", onDeviceReady, false);
 
function onDeviceReady() {
	  pictureSource=navigator.camera.PictureSourceType;
      destinationType=navigator.camera.DestinationType;
      console.log("pictureSource: "+pictureSource);
      console.log("destinationType: "+destinationType);
      _device = device;
      /*var element = document.getElementById('deviceProperties'); 
      
      element.innerHTML = 'Device Name: '     + device.name     + '<br  />' + 
                          'Device PhoneGap: ' + device.phonegap + '<br  />' + 
                          'Device Platform: ' + device.platform + '<br  />' + 
                          'Device UUID: '     + device.uuid     + '<br  />' + 
                          'Device Version: '  + device.version  + '<br  />'; 
                          
     socket.emit("device",device);   */                

}

function notification() {
	navigator.notification.alert( 
		    'You are the winner!',  // 显示信息 
		       alertDismissed,         // 警告被忽视的回调函数 
		       'Game Over',            // 标题 
		       'Done'                  // 按钮名称 
		); 
		 
 }
//提示聲音3次
function beep() { 
	navigator.notification.beep(3); 
}
//震動2秒
function vibrate() { 
	navigator.notification.vibrate(2000); 
}

var watchID = null;
function acceler() {
	//navigator.accelerometer.getCurrentAcceleration(onAccelerSucess,onAccelerError);
	var options = {frequency:1000};
	watchID = navigator.accelerometer.watchAcceleration(onAccelerSucess,onAccelerError,options);
}

function onAccelerSucess(acceleration){

	var date =  new Date(acceleration.timestamp);
	
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	var formattedTime = hours + ':' + minutes + ':' + seconds;
	
	//Math.floor 無條件捨去, 取小數後1位
	var xyz = '<p>x: ' + Math.floor(acceleration.x * 10)/10 + '</p>' +
			  '<p>y: ' + Math.floor(acceleration.y * 10)/10+ '</p>' +
			  '<p>z: ' + Math.floor(acceleration.z * 10)/10 + '</p>' +
			  '<p>timestamp: ' + formattedTime + '</p>' ;
	//alert(xyz);
	
	if(_switchSocket  && (window.location.hash == "#online_page")){
		socket.emit("acceler",xyz);
		$("#showAcceler2").html(xyz);
	}else if(!_switchSocket  && (window.location.hash != "#online_page")) {
		$("#showAcceler").html(xyz);
	}
}

function onAccelerError(){
	alert('error');
}
function stopAcceler(){
	if(watchID){
		navigator.accelerometer.clearWatch(watchID);
		watchID = null;
	}
}
//錄音10秒
var mediaRec;
var recInterval;
function recordAudio() { 
    var src = "myrecording.mp3"; 
     mediaRec = new Media(src, onSuccess, onError); 
     
    navigator.notification.beep(1); 
    // 开始录制音频 
    mediaRec.startRecord(); 
    
    // 60秒钟后停止录制 
    var recTime = 0; 
    	recInterval = setInterval(function() { 
  
    	recTime  = recTime + 1; 
    	$("#slider_sec").val(recTime).slider('refresh');
        if (recTime >= 10) { 
        	stopRecording();   
        } 
           
    }, 1000); 
} 

function stopRecording(){
    //stop record
	
    clearInterval(recInterval); 
    mediaRec.stopRecord(); 
    navigator.notification.beep(1);
} 
// 创建Media对象成功后调用的回调函数 
function onSuccess() { 
	//alert("recordAudio():Audio Success");
	//navigator.notification.beep(1);
    console.log("recordAudio():Audio Success"); 
    //socket.emit("Record","success"); 
} 


// 创建Media对象出错后调用的回调函数 
function onError(error) { 
    alert('code: '    + error.code    + '\n' + 
          'message: ' + error.message + '\n'); 
   // socket.emit("Record","error");
} 
    

//一個按鈕將調用這個函數
function capturePhoto() {
  //capture_bool = false;
   // 取得圖像(成功事件 ,失敗事件,{圖片設定});
  // getpicture(cameraSuccess,cameraError,{cameraOptions});
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 75,
        destinationType: destinationType.DATA_URL });
}
//照片是成功檢索時調用
function onPhotoDataSuccess(imageData) {
	
 // capture_bool = true;
  //取消註釋，以查看base64編碼的圖像數據
  console.log("base64: "+imageData);

  //獲取的圖像處理
  var smallImage = document.getElementById('img');
  var smallImage2 = document.getElementById('img2');
  //取消隱藏的圖像元素
 // smallImage.style.display = 'block';

  //顯示拍攝的照片
  //內聯 CSS規則是用來調整圖像的大小
  smallImage.src = "data:image/jpeg;base64," + imageData;
  smallImage2.src = "data:image/jpeg;base64," + imageData;
  //$.mobile.changePage("#offline_page");
  //上傳
  upLoad(smallImage.src);
  
}

//錯誤發生時 
function onFail(message) {
  //capture_bool = false;
  alert('Failed because: ' + message);
}
function upLoad(img){
	socket.emit("upload",{img:img});
	$("#show2").fadeIn(800);
}




