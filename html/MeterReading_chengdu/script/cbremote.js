// var app = {
//     apipath: apiUrl + '/api/',
// };

var now = Date.now();
function getInitApi(){
		var apiUrl = $api.getStorage('apiUrl');
		var cbapipath = $api.getStorage('cbapipath'); //外网
		var cbappServerApiIntranet = $api.getStorage('cbappServerApiIntranet'); //内网
     if(apiUrl.indexOf('192')!=-1){ //内网
			  if(cbappServerApiIntranet!=undefined && cbappServerApiIntranet!="" && cbappServerApiIntranet!=''){
					 $api.setStorage('apiRequestUrl',cbappServerApiIntranet);
				}
		 }else{
			 if(cbapipath!=undefined && cbapipath!="" && cbapipath!=''){
				  $api.setStorage('apiRequestUrl',cbapipath);
			 }
		 }
}

function fnPostPhoto(path, Parameter,FileUrlArr, contentType, isPut, callback) {
    getInitApi();
    var headers = {};
    if (contentType) {
        headers["Content-Type"] = contentType;
    }
	var fdf = {
		values: {
			Method: 'R999',
			UserName: $api.getStorage('cbOperatorName'), //"01012"
			Password: $api.getStorage('cbPassword'), // "g6OuZomFp3E="
			SerialNo: dataTime(),
			KeyCode: '', //营业
			Parameter: JSON.stringify(Parameter)
		},
		files: {
			file: FileUrlArr
		}
	}

    var options = {
        url: $api.getStorage('apiRequestUrl') + '/api/WaterMeters/Info',
        method: 'post',
        timeout: 20,
        data: {
            values: {
                Method: 'R999',
                UserName: $api.getStorage('cbOperatorName'), //"01012"
                Password: $api.getStorage('cbPassword'), // "g6OuZomFp3E="
                SerialNo: dataTime(),
                KeyCode: '', //营业
                Parameter: JSON.stringify(Parameter)
            },
            files: {
                file: FileUrlArr
            }
        }
    }
	console.log($api.getStorage('apiRequestUrl') + '/api/WaterMeters/Info')
	console.log(JSON.stringify(options.data))

    api.ajax(options, function(ret, err) {
        api.refreshHeaderLoadDone();
        callback(ret, err);
    });
};

// 动态切换请求地址
function getApiPathAddress(callback) {
	var cbapipath = $api.getStorage('cbapipath');
	var cbappServerApiIntranet = $api.getStorage('cbappServerApiIntranet');
	var addressHistory = $api.getStorage('addressHistory');
	var apiUrl = $api.getStorage('apiUrl');
	var apipath = '';
	if (addressHistory != undefined) {
		if (addressHistory.intranetObj.url != "") {
			if (apiUrl == addressHistory.intranetObj.url) { //内网
				 apipath = cbapipath;
				 apiRequestUrl = cbapipath;
				 if(cbapipath!=undefined && cbapipath!="" && cbapipath!=''){
						 $api.setStorage('apiRequestUrl',cbapipath);
				 }
				 return apipath;

			}
		}
		if (addressHistory.extranetObj.url != "") {
			if (apiUrl == addressHistory.extranetObj.url) { //外网   是否需要判断当前是否启动的那个地址？？？？？
			 apipath = cbappServerApiIntranet;
			 apiRequestUrl = cbappServerApiIntranet;
			 if(cbappServerApiIntranet!=undefined && cbappServerApiIntranet!="" && cbappServerApiIntranet!=''){
				 	 $api.setStorage('apiRequestUrl',cbappServerApiIntranet);
			}
				 return apipath;
			}
		}
	} else {
		return apipath;
	}

}


function fnGet(path, data, isDelete, callback, noHide, tag) {
	getInitApi();
	var headers = {};
	api.showProgress({
		title: '加载中',
		modal: false
	});
	if (isDelete) {
		headers["Content-Type"] = 'application/json';
	}
	// api.openWin({
	//     name: 'index',
	//     url: 'widget://index.html'
	// });
	var options = {
		url: $api.getStorage('apiRequestUrl')  + '/api/WaterMeters/Info',
		method: isDelete ? 'delete' : 'get', //传输方式
		timeout: 30, //超时时间
		dataType: 'json',
		headers: headers,
		traditional: true
	}
	if (tag) {
		options['tag'] = tag
	}
	api.ajax(options, function(ret, err) {
		if (!noHide) {
			api.hideProgress();
		}
		// api.refreshHeaderLoadDone();
		callback(ret, err);
		if (err) {
			if (err.code == 1) {
				if (url == '') {
					api.toast({
						msg: '网络请求超时',
						duration: 2000,
						location: 'bottom'
					});
					return
				}
				options.url = url + '/api/WaterMeters/Info';
				api.ajax(options, function(ret1, err1) {
					if (!noHide) {
						api.hideProgress();
					}
					// api.refreshHeaderLoadDone();
					callback(ret1, err1);
					if (err1) {
						if (err1.code == 1) {
							api.toast({
								msg: '网络请求超时',
								duration: 2000,
								location: 'bottom'
							});
						}
					}
				});
			} else {
				fnGetErrMessage(err);
			}
		}
	});
};

function fnGetErrMessage(err) {
	if (err.body) {
		if (err.body.error) {
			if (err.body.error.message == '10000') {
				api.toast({
					msg: err.body.error.details,
					duration: 2000,
					location: 'top'
				});
			} else {
				api.toast({
					msg: err.body.error.message,
					duration: 2000,
					location: 'top'
				});
			}
			if (err.body.error.message == '当前用户没有登录到系统！') {
				api.openWin({
					name: 'login',
					url: 'widget://html/login/login.html',
					slidBackEnabled: false,
					bgColor: 'widget://image/login/login_backgroud.png'
				});
			}
		} else {
			api.toast({
				msg: err.body,
				duration: 2000,
				location: 'top'
			});
		}
	} else {
		api.toast({
			msg: err.msg,
			duration: 2000,
			location: 'top'
		});
	}
}

function fnGet1(path, data, isDelete, callback, noHide, tag) {
		getInitApi();
	var headers = {};
	// api.showProgress({
	//     title: '加载中',
	//     modal: false
	// });
	if (isDelete) {
		headers["Content-Type"] = 'application/json';
	}
	// api.openWin({
	//     name: 'index',
	//     url: 'widget://index.html'
	// });
	var options = {
		url:$api.getStorage('apiRequestUrl') + '/api/WaterMeters/Info',
		method: isDelete ? 'delete' : 'get', //传输方式
		timeout: 30, //超时时间
		dataType: 'json',
		headers: headers,
		traditional: true
	}
	if (tag) {
		options['tag'] = tag
	}
	api.ajax(options, function(ret, err) {
		if (!noHide) {
			// api.hideProgress();
		}
		// api.refreshHeaderLoadDone();
		callback(ret, err);
		if (err) {
			if (err.code == 1) {
				var url = getApiPathAddress();
				if (url == '') {
					api.toast({
						msg: '网络请求超时',
						duration: 2000,
						location: 'bottom'
					});
					return
				}
				options.url = url + '/api/WaterMeters/Info';
				api.ajax(options, function(ret1, err1) {
					if (!noHide) {
						api.hideProgress();
					}
					// api.refreshHeaderLoadDone();
					callback(ret1, err1);
					if (err1) {
						if (err1.code == 1) {
							api.toast({
								msg: '网络请求超时',
								duration: 2000,
								location: 'bottom'
							});
						}
					}
				});
			} else {
				fnGetErrMessage(err);
			}
		}
	});
};

function fnPost(path, data, contentType, isPut, callback) {
		getInitApi();
	var headers = {};
	if (contentType) {
		headers["Content-Type"] = contentType;
	}
	api.showProgress({
		title: '加载中',
		modal: true
	});
	var options = {
		url:$api.getStorage('apiRequestUrl')+ '/api/WaterMeters/Info',
		method: isPut ? 'put' : 'post',
		timeout: 60,
		dataType: 'json',
		returnAll: false,
		headers: headers,
		data: data
	}
	api.ajax(options, function(ret, err) {
		api.refreshHeaderLoadDone();
		api.hideProgress();
		if (ret) {
			callback(ret, err);
		}
		if (err) {
			if (err.code == 1 || err.statusCode == 503) {
				var url = getApiPathAddress();
				if (url == '' || url == undefined) {
					api.toast({
						msg: '网络请求超时',
						duration: 2000,
						location: 'bottom'
					});
					return
				}
				api.showProgress({
					title: '加载中',
					modal: true
				});
				options.url = url + '/api/WaterMeters/Info';
				api.ajax(options, function(ret1, err1) {
						api.hideProgress();
						if(ret1){
							// api.refreshHeaderLoadDone();
							callback(ret1, err1);
						}
					if (err1) {
						if (err1.code == 1) {
							api.toast({
								msg: '网络请求超时',
								duration: 2000,
								location: 'bottom'
							});
						}
					}
				});
			} else {
				if (err) {
					api.toast({
						msg: err.body.Message,
						duration: 2000,
						location: 'top'
					});
				} else if (ret.code == 0) {
					api.toast({
						msg: ret.result,
						duration: 2000,
						location: 'top'
					});
				}
			}
		}


	});
	// var db = api.require('db');
	// db.selectSql({
	//     name: 'test',
	//     sql: 'SELECT * FROM Server'
	// }, function(ret, err) {
	//     if (ret.status) {
	//      apipath=ret.data[0].ServerIp;
	//
	//      app = {
	//          apipath:apipath,
	//      };
	//      api.ajax({
	//          url:'http://'+apipath+'/Api/'+path ,
	//          method: isPut ? 'put' : 'post',
	//          timeout: 100,
	//          dataType: 'json',
	//          returnAll: false,
	//          headers: headers,
	//          data: data
	//      }, function(ret, err) {
	//          api.refreshHeaderLoadDone();
	//         //  api.hideProgress();
	//          callback(ret, err);
	//      });
	//     } else {
	//     }
	// });

};

function fnPostt(path, data, contentType, isPut, callback) {
		getInitApi();
	var headers = {};
	if (contentType) {
		headers["Content-Type"] = contentType;
	}
	api.showProgress({
		title: '加载中',
		modal: true
	});
	var options = {
		url: $api.getStorage('apiRequestUrl') + '/api/WaterMeters/Info',
		method: isPut ? 'put' : 'post',
		timeout: 10,
		dataType: 'json',
		returnAll: false,
		headers: headers,
		data: data
	}
	//alert(JSON.stringify(options));

	api.ajax(options, function(ret, err) {
		api.refreshHeaderLoadDone();
		api.hideProgress();
		if (ret) {
			callback(ret, err);
		}
		if (err) {
			if (err.code == 1) {
				var url = getApiPathAddress();
				if (url == '') {
					api.toast({
						msg: '网络请求超时',
						duration: 2000,
						location: 'bottom'
					});
					return
				}
				options.url = url + '/api/WaterMeters/Info';
				api.ajax(options, function(ret1, err1) {
					if (!noHide) {
						api.hideProgress();
					}
					// api.refreshHeaderLoadDone();
					callback(ret1, err1);
					if (err1) {
						if (err1.code == 1) {
							api.toast({
								msg: '网络请求超时',
								duration: 2000,
								location: 'bottom'
							});
						}
					}
				});
			} else {
				if (err) {
					api.toast({
						msg: err.body.Message,
						duration: 2000,
						location: 'top'
					});
				} else if (ret.code == 0) {
					api.toast({
						msg: ret.result,
						duration: 2000,
						location: 'top'
					});
				}
			}
		}
	});
	// var db = api.require('db');
	// db.selectSql({
	//     name: 'test',
	//     sql: 'SELECT * FROM Server'
	// }, function(ret, err) {
	//     if (ret.status) {
	//      apipath=ret.data[0].ServerIp;
	//
	//      app = {
	//          apipath:apipath,
	//      };
	//      api.ajax({
	//          url:'http://'+apipath+'/Api/'+path ,
	//          method: isPut ? 'put' : 'post',
	//          timeout: 100,
	//          dataType: 'json',
	//          returnAll: false,
	//          headers: headers,
	//          data: data
	//      }, function(ret, err) {
	//          api.refreshHeaderLoadDone();
	//         //  api.hideProgress();
	//          callback(ret, err);
	//      });
	//     } else {
	//     }
	// });

};

function fnPost1(path, data, contentType, isPut, callback, noHide) {
	getInitApi();
	var headers = {};
	if (contentType) {
		headers["Content-Type"] = contentType;
	}
	console.log('请求发送')
	api.ajax({
		url: $api.getStorage('apiRequestUrl')+ '/api/WaterMeters/Info',
		method: isPut ? 'put' : 'post',
		timeout: 100,
		dataType: 'json',
		returnAll: false,
		headers: headers,
		data: data
	}, function(ret, err) {
		console.log(JSON.stringify(ret))
		console.log(JSON.stringify(err))
		api.refreshHeaderLoadDone();
		if (ret) {
			callback(ret, err);
		}
		if (err) {
			if (err.code == 1) {
				var url = getApiPathAddress();
				if (url == '') {
					api.toast({
						msg: '网络请求超时',
						duration: 2000,
						location: 'bottom'
					});
					return
				}
				api.ajax({
					url: url + '/api/WaterMeters/Info',
					method: isPut ? 'put' : 'post',
					timeout: 100,
					dataType: 'json',
					returnAll: false,
					headers: headers,
					data: data
				}, function(ret1, err1) {
					if (!noHide) {
						api.hideProgress();
					}
					// api.refreshHeaderLoadDone();
					callback(ret1, err1);
					if (err1) {
						if (err1.code == 1) {
							api.toast({
								msg: '网络请求超时',
								duration: 2000,
								location: 'bottom'
							});
						}
					}
				});
			} else {
				if (err) {
					api.toast({
						msg: err.body.Message,
						duration: 2000,
						location: 'top'
					});
				} else if (ret.code == 0) {
					api.toast({
						msg: ret.result,
						duration: 2000,
						location: 'top'
					});
				}
			}
		}
	});
};
//访问工单接口
function fnPost3(path, data, contentType, isPut, callback) {
		getInitApi();
	var headers = {};
	if (contentType) {
		headers["Content-Type"] = contentType;
	}
	api.showProgress({
		title: '加载中',
		modal: true
	});
	//headers.Authorization = "[{\"key\":\"10046\"},{\"key\":\"g6OuZomFp3E=\"}]";
	headers.Authorization = [{
		"key": $api.getStorage('cbOperatorId')
	}, {
		"key": $api.getStorage('cbPassword')
	}]
	var options = {
		url: $api.getStorage('apiRequestUrl') + path,
		method: isPut ? 'put' : 'post',
		timeout: 100,
		dataType: 'json',
		returnAll: false,
		headers: headers,
		data: data
	}
	//alert(JSON.stringify(options));
	api.ajax(options, function(ret, err) {
		api.refreshHeaderLoadDone();
		api.hideProgress();
		if (ret) {
			callback(ret, err);
		}
		if (err) {
			if (err.code == 1) {
				var url = getApiPathAddress();
				if (url == '') {
					api.toast({
						msg: '网络请求超时',
						duration: 2000,
						location: 'bottom'
					});
					return
				}
				options.url = url + path;
				api.ajax(options, function(ret1, err1) {
					if (!noHide) {
						api.hideProgress();
					}
					// api.refreshHeaderLoadDone();
					callback(ret1, err1);
					if (err1) {
						if (err1.code == 1) {
							api.toast({
								msg: '网络请求超时',
								duration: 2000,
								location: 'bottom'
							});
						}
					}
				});
			} else {
				if (err) {
					api.toast({
						msg: err.body.Message,
						duration: 2000,
						location: 'top'
					});
				} else if (ret.code == 0) {
					api.toast({
						msg: ret.result,
						duration: 2000,
						location: 'top'
					});
				}
			}
		}
	});
};

function fnPost4(Methods, data, contentType, isLogin, isPut, callback, files, isErr) {
		getInitApi();
	var headers = {};
	var body = {
		body: JSON.stringify({
			Method: Methods,
			UserName: $api.getStorage('cbOperatorName'), //"01012"
			Password: $api.getStorage('cbPassword'), // "g6OuZomFp3E="
			SerialNo: '20200426171300',
			KeyCode: '', //营业
			Parameter: JSON.stringify(data)
		}),
		files: files || {}
	};
	if (contentType) {
		headers["Content-Type"] = contentType
	}

	if (isLogin) {
		if (!$api.getStorage('loginInfo')) {
			setTimeout(function() {
				api.closeToWin({
					name: 'login'
				});
			}, 200);
			return;
		}
		headers.Authorization = $api.getStorage("bwHeaders");
	}
	api.showProgress({
		title: '加载中',
		text: '',
		modal: false
	});

	// vue 测试
	// app.apipath = 'http://' + $api.getStorage('apiUrl')+'/api/'+path;
	api.ajax({
		url: $api.getStorage('apiRequestUrl') + '/api/WaterMeters/Info', //app.apipath+path
		method: isPut ? 'put' : 'post',
		// timeout: 15,
		dataType: 'json',
		returnAll: false,
		headers: headers,
		data: body
	}, function(ret, err) {
		// api.refreshHeaderLoadDone();
		callback(ret, err);
		if (err) {
			if (err.code == 1) {
				var url = getApiPathAddress();
				if (url == '') {
					api.toast({
						msg: '网络请求超时',
						duration: 2000,
						location: 'bottom'
					});
					return
				}
				api.ajax({
					url: url + '/api/WaterMeters/Info', //app.apipath+path
					method: isPut ? 'put' : 'post',
					// timeout: 15,
					dataType: 'json',
					returnAll: false,
					headers: headers,
					data: body
				}, function(ret1, err1) {
					// api.refreshHeaderLoadDone();
					if (ret1) {
						callback(ret1, err1);
					}
					if (err1) {
						if (err1.code == 1) {
							api.toast({
								msg: '网络请求超时',
								duration: 2000,
								location: 'top'
							});
						}
					}
				});
			} else {
				if (isErr) {
					callback(false, err);
				}
				callback(ret, err);
				if (err.body) {
					if (err.body.error) {
						if (err.body.error.message == '10000') {
							api.toast({
								msg: err.body.error.details,
								duration: 2000,
								location: 'top'
							});
						} else {
							api.toast({
								msg: err.body.error.message,
								duration: 2000,
								location: 'top'
							});
						}
						if (err.body.error.message == '当前用户没有登录到系统！') {
							setTimeout(function() {
								api.closeToWin({
									name: 'login'
								});
							}, 200);
						}
					} else {
						if (isErr == false) {
							api.toast({
								msg: err.body,
								duration: 2000,
								location: 'top'
							});
						}
					}
				} else {
					if (isErr == false) {
						api.toast({
							msg: err.msg,
							duration: 2000,
							location: 'top'
						});
					}

				}
			}

		}
	});
};

function fnPostNoProcess(path, data, contentType, isPut, callback) {
		getInitApi();
	var headers = {};
	if (contentType) {
		headers["Content-Type"] = contentType;
	}
	api.ajax({
		url: $api.getStorage('apiRequestUrl') + '/api/WaterMeters/Info',
		method: isPut ? 'put' : 'post',
		timeout: 30,
		dataType: 'json',
		returnAll: false,
		headers: headers,
		data: data
	}, function(ret, err) {
		if (ret) {
			callback(ret, err);
		}
		if (err) {
			if (err.code == 1) {
				var url = getApiPathAddress();
				if (url == '') {
					api.toast({
						msg: '网络请求超时',
						duration: 2000,
						location: 'bottom'
					});
					return
				}
				api.ajax({
					url: url + '/api/WaterMeters/Info',
					method: isPut ? 'put' : 'post',
					timeout: 30,
					dataType: 'json',
					returnAll: false,
					headers: headers,
					data: data
				}, function(ret1, err1) {
					if (ret1) {
						callback(ret1, err1);
					}
					if (err1) {
						if (err1.code == 1) {
							api.toast({
								msg: '网络请求超时',
								duration: 2000,
								location: 'top'
							});
						}
					}

				});
			}
		}

	});

};

// ajax同步访问
var asynAjax = {
	get: function(path, where, page, limit, fn) {
		var obj = new XMLHttpRequest();
		var url = app.apipath + path + '?filter={"where":' + JSON.stringify(where) + ',"page":' + page + ',"limit":' +
			limit + '}';
		obj.open('GET', url, false);
		obj.onreadystatechange = function() {
			var ret, err;
			if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) {
				ret = obj.responseText;
			} else {
				err = obj.responseText;
			}
			fn.call(ret, ret);
		};
		obj.send();
	},
	post: function(path, data, fn) {
		var obj = new XMLHttpRequest();
		obj.open("POST", url, false);
		obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		obj.onreadystatechange = function() {
			var ret, err;
			if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) {
				ret = obj.responseText;
			} else {
				err = obj.responseText;
			}
			fn.call(ret, ret);
		};
		obj.send(data);
	}
}
