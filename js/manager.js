var user = "Arkdevnoder";
var repository = "White_market";

var s = document.createElement("script"); 
s.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
document.body.appendChild(s);

var n = document.createElement("div");
n.setAttribute("noty", "true");
document.body.appendChild(n);



var styles = `
	.upper {
		z-index: 1;
	}
	.relator {
		position: relative;
	}
	[noty] {
		position: fixed;
		height: 50px;
		line-height: 50px;
		width: 350px;
		top: 15px;
		left: 0px;
		right: 0px;
		margin: auto;
		text-align: center;
		display: none;
		background: white;
		color: black;
		font-size: 14px;
		font-weight: 700;
	}
	[data-edits] {
		outline: none;
		position: relative;
		white-space: pre;
	}
	[data-breaker]{
		white-space: normal;
	}
	[data-anti-relator]{
		position: static !important;
		white-space: normal;
	}
    [data-edits]:hover {
    	box-shadow: 0px 0px 15px lightgreen;
    	border-radius: 5px;
    	position: relative;
    	cursor: text;
    }
    [data-edits]:after {
    	display: none;
    }
    [data-edits]:focus {
    	border: none;
    	box-shadow: 0px 0px 15px green;
    }
    [data-white]:hover:before, [data-white]:focus:before {
    	/*border-bottom: 9px solid lightgray !important;*/
    }
    [data-white]:hover:after, [data-white]:focus:after {
    	box-shadow: 0px 0px 10px lightgray;
    	/*background: lightgrey !important;*/
    }
	[data-edits]:hover:before, [data-edits]:focus:before {
		z-index: 9;
		content: '';
		position: absolute;
		top: calc(100%);
		height: 15px;
		width: 5px;
		left: 0px;
		right: 0px;
		margin: auto;
		display: block;
		border: 8px solid transparent;
		border-bottom: 9px solid white;
	}
    [data-edits]:hover:after, [data-edits]:focus:after {
    	z-index: 7;
    	text-align: center;
    	display: block !important;
    	color: black !important;
		content: 'ID: (' attr(data-edits) ') \\A Редактирование';
		position: absolute;
		line-height: 20px;
		font-size: 14px;
		font-weight: 500;
		border-radius: 5px;
		height: 50px;
		width: 140px;
		background: white;
		margin: auto;
		top: calc(100% + 15px);
		padding: 2.5px;
		left: 0px;
		right: 0px;
    }
    [data-edits]:focus:after {
    	content: 'ID: (' attr(data-edits) ') \\A Введите текст';
    }
`;

var url = window.location.href;
var filename = url.split('/').pop();
var hash = "";
var model = {};

if(filename == "") filename = "index.html";

var file = "dbs/"+filename;
var accessToken = "";
var clicker = true;
var free = true;

get(function(data){
	obj = JSON.parse(b64DecodeUnicode(data.content));
	hash = data.sha;
	model = obj;
	$.each(obj, function(index, value) {
		$('[data-edits="'+index+'"]').html(value);
	});
});

function handler(e){
	if(!clicker){
		if(accessToken !== ""){
			e.target.contentEditable = true;

			setTimeout(function(){
				if(!$(e.target).is(':focus')){
					$("[data-edits]").trigger("focus");
					var range = document.createRange();
					var sel = window.getSelection();
					range.setStart(e.target.childNodes[0], e.target.childNodes[0].length);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}, 1);

			e.stopPropagation();
			e.preventDefault();
		}
	} else {
		if(accessToken !== "")
		puts();
		found = "[data-edits='"+e.target.getAttribute("data-edits")+"']";
		$(found).html(e.target.innerHTML);
		$("[data-edits]").attr("contenteditable", false);
	}
}

function puts(){
	try {
	var dats = $("[data-edits]:not(.cloned [data-edits])");
	for (var i = 0; i < dats.length; i++) {
		var emt = dats[i];
		if(model.hasOwnProperty(emt.getAttribute("data-edits"))){
			delete model[emt.getAttribute("data-edits")];
		}
		//console.log(emt.getAttribute("data-edits")+" => "+emt.innerHTML);
		model[emt.getAttribute("data-edits")] = emt.innerHTML;
	}
	//console.log(JSON.stringify(model));
	if(free)
	post(JSON.stringify(model));
	} catch(e) {
		console.log("[Info] Reload of request");
	}
}

function get(func){
	var uploadURL = "https://api.github.com/repos/"+user+"/"+repository+"/contents/"+file;
	$.ajax({
		type: "GET",
		url: uploadURL,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
			//xhr.setRequestHeader("Authorization", "token "+accessToken);
		},
		data: "{}"
	})
	.done(function(data) {
		func(data);
	});
}

function b64DecodeUnicode(str) {
	return decodeURIComponent(atob(str).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
}

function post(blob, sha = ""){

	var uploadURL = "https://api.github.com/repos/"+user+"/"+repository+"/contents/"+file;
	$.ajax({
		type: "PUT",
		url: uploadURL,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
			xhr.setRequestHeader("Authorization", "token "+accessToken);
		},
		success: function(){
			$("[noty]").show();
			$("[noty]").html("Сохранено. Обновится на странице через минуту");
			setTimeout(function(){
				$("[noty]").hide();
			}, 3000);
		},
		error: function (request) {
			$("[noty]").show();
			$("[noty]").html("Идёт сохранение");
			//console.log("Идёт ожидание синхронизации страницы");
			if(request.status == 409){
				get(function(new_object){
					hash = new_object.sha;
					post(blob);
				});
			}
			if(request.status == 401){
				$("[noty]").show();
				$("[noty]").html("Сессия истекла, страница будет обновлена");
				setTimeout(function(){
					eraseCookie("token");
					window.location.reload();
				}, 3000);
			}
		},
		data: JSON.stringify({
			sha: hash,
			message: "New commiting",
			content: window.btoa(unescape(encodeURIComponent(blob)))
		})
	})
	.done(function(data) {
		hash = data.content.sha;
	});

}





























var onlongtouch; 
var timer;
var touchduration = 3000; //length of time we want the user to touch before we do something

function touchstart(e) {
    //e.preventDefault();
    if (!timer) {
        timer = setTimeout(onlongtouch, touchduration);
    }
}

function touchend() {
    //stops short touches from firing the event
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}

function activate(result){
	if(result.value !== "" && result.value !== undefined){
		setCookie("token", result.value, 7);
		$('[data-edits-disable]').each(function(){
			$(this).attr('contenteditable', true);
			$(this).attr('data-edits', $(this).attr('data-edits-disable'));
			$(this).removeAttr('data-edits-disable');
		});
		accessToken = result.value;
		var styleSheet = document.createElement("style");
		styleSheet.type = "text/css";
		styleSheet.innerText = styles;
		$(styleSheet).addClass("extra");

		document.head.appendChild(styleSheet);
		document.addEventListener("click",handler,true);
		$("[data-edits]").on({
			click: function(){
				clicker = true;
			},
			mouseenter: function () {
				clicker = false;
			},
			mouseleave: function () {
				clicker = true;
			}
		});
		$("[noty]").show();
		$("[noty]").html("Вы вошли в режим редактирования");
		free = false;
		setTimeout(function(){
			free = true;
			$("[noty]").hide();
		}, 3000);
	}
}

function setCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {   
	document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

onlongtouch = function() { 
    timer = null;
    if(accessToken !== ""){
    	Swal.fire('Вы вышли из режима редактирования');
		$('[data-edits]').each(function(){
			console.log(this);
			$(this).removeAttr('contenteditable');
			$(this).attr('data-edits-disable', $(this).attr('data-edits'));
			$(this).removeAttr('data-edits');
		});
    	clicker = true;
    	accessToken = "";
    	return true;
    }
    if(getCookie("token") == null){
		Swal.fire({
			title: 'Введите access_token',
			input: 'text',
			inputAttributes: {
				autocapitalize: 'off'
			},
			showCancelButton: true,
			confirmButtonText: 'Режим управления',
			preConfirm: (token) => {
				return token;
			}
		}).then((result) => {
			activate(result);
		});
	} else {
		var result = {
			value: getCookie("token")
		};
		activate(result);
	}
};

document.addEventListener("DOMContentLoaded", function(event) {
	window.addEventListener("mousedown", touchstart, false);
	window.addEventListener("mouseup", touchend, false);
    window.addEventListener("touchstart", touchstart, false);
    window.addEventListener("touchend", touchend, false);
});
