function fnIntVue() {
    window.MeterReadVue = new Vue({
        el: '#MeterRead',
        data: {
            UserList: [], //当前抄表册所有用户数据
            UserNumber: 0, //当前用户的索引
            Memorandum: [], //备忘录
            FromPage: api.pageParam.name, //从哪个页面点击进来
            YHBH: api.pageParam.useryhbh, //用户编号
            sendUpload: $api.getStorage("sendUpload"), // 是否自动上传数据
            sendUploadPicture: $api.getStorage("sendUploadPicture"), //是否自动上传图片
            sendNext: $api.getStorage("sendNext"), //是否自动跳转到下一户
            ImgType: [], //图片类型
            ImgData: [], //图片数据
            editDegrees: true, //编辑读数
            editConsumption: false, //编辑用量
            editSJBM: false, //编辑实际表码
            editNewMeterNo: false, //编辑新表表号
            editHBRQ: false, //编辑新表起度
            editXBQD: false, //编辑新表起度
            editXBZD: false, //编辑新表止度
            showLight: false, //是否打开闪光灯
            SLLRFS: 1, //水量录入方式（正常、估抄）  非正常时需强制拍照
            AbnormalParams: { //判断异常水量的参数
                startWater: 0, //起度
                endWater: 0, //止度
                lastWaterAmounts: 0, //上次水量
                greaterThan: { //大于30,小于等于100 的量高和量低的倍数
                    highVolume: 1.5, //量高
                    lowVolume: 0.5, //量低
                },
                lessThan: { // 大于100 的
                    highVolume: 1.3, //量高
                    lowVolume: 0.7, //量低
                }
            },
            BYXZT: 1, //水表运行状态编码
            SBYXZT: "正常", //水表运行状态
            ZD: 0, //读数
            YL: 0, //用量
            SJSL: 0, //实际水量
            JBYL: 0, //旧表用量
            SJBM: 0, //实际表码
            XBBH: "", //新表表号
            HBRQ: "", //换表日期
            XBQD: 0, //新表起度
            XBZD: 0, //新表止度
            PATH: "", //表位图片
            timer: null,
            preventRepeatTouch: false, //判断是否可以提交
            LoginName: $api.getStorage('loginData').userName, //抄表员id
            LoadOrNot: 0,
            workOrderOrNot: false, //判断是否是异常抄表
            ZBBH: "", //总表表号
            CLFS: 1, //处理方式
            resultType: "", //水量正常判断
            YCPDFS: 0, //水量异常判断方式
            SFBL: 0, //上浮比例
            XFBL: 0, //下浮比例
            PhotoIndex: 0, //用于异常记录上传时，判断组装的图片数据是第几张图片
            Records: [], //图片信息组
            FileUrlArr: [], //主体路径组
            QZFS: 0 //取值方式

        },
        computed: {
            UserDetails: function() { //用户详情数据
                if (this.UserList.length == 0) {
                    return {};
                } else {
                    var details = this.clearObjectSpace(this.UserList[this.UserNumber]);
                    if (this.YHBH == undefined) {
                        this.YHBH = details.YHBH;
                    }
                    return details;
                }
            },
            NeedDegrees: function() { //是否需要录入读数
                if ((this.SLLRFS == 1 || this.SLLRFS == 3 || this.CLFS == 3 || this.BYXZT == " " || this.BYXZT == "") && this.UserDetails.CBBZ != "1") {
                    if (this.SLLRFS == 2 && this.CLFS == 3 || this.BYXZT == 10 || this.BYXZT == 9) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            },
            NeedConsumption: function() { //是否需要录入用量
                return false
            },
            NeedSJBM: function() { //是否需要录入实际表码
                return false;
            },
            NeedXBBH: function() { //是否需要录入新表表号
                if (this.CLFS == 3 && this.UserDetails.CBBZ != "1") {
                    return true;
                } else {
                    return false;
                }
            },
            NeedHBRQ: function() { //是否需要录入换表日期
                if (this.CLFS == 3 && this.UserDetails.CBBZ != "1") {
                    return true;
                } else {
                    return false;
                }
            },
            NeedXBQD: function() { //是否需要录入新表表号
                if (this.CLFS == 3 && this.UserDetails.CBBZ != "1") {
                    return true;
                } else {
                    return false;
                }
            },
            NeedXBZD: function() { //是否需要录入新表表号
                if (this.CLFS == 3 && this.UserDetails.CBBZ != "1") {
                    return true;
                } else {
                    return false;
                }
            },
            hasChanged() { //判断双向绑定的数据是否发生了改变
                if (this.PATH != this.UserDetails.PATH || this.XBBH != this.UserDetails.XBBH || this.BYXZT != this.UserDetails.BYXZT || this.SBYXZT != this.UserDetails.SBYXZT || this.ZD != this.UserDetails.ZD || this.YL != this.UserDetails.YL || this.SJBM != this.UserDetails.SJBM || this.ImgData.length != 0) {
                    return true;
                } else {
                    return false;
                }
            },
            JSYPJL: function() { //近三月平均用水量
                if (this.hasUserDetails) {
                    if (this.UserDetails.JSYYSL != null && this.UserDetails.JSYYSL != 'null' && this.UserDetails.JSYYSL != '' && this.UserDetails.JSYYSL != ' ') {
                        var JSYPJLs = this.UserDetails.JSYYSL.split("/");
                        return parseInt((parseInt(JSYPJLs[0]) + parseInt(JSYPJLs[1]) + parseInt(JSYPJLs[2])) / 3);
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            },
            hasUserDetails: function() { //是否获取到了用户详情数据
                return !this.isEmptyObject(this.UserDetails);
            },
            showActualCode: function() { //是否显示实际表码
                return false;
            },
            showDegreesAndAmount: function() { //是否显示用量
                if (this.BYXZT == 27) {
                    return false;
                } else {
                    return true;
                }
            },
            showHBRQ: function() { //是否显示换表
                if (this.CLFS == 3 && this.SLLRFS == 2) {
                    return true;
                } else {
                    return false;
                }
            },
            NeedPhotograph: function() { //是否需要强制拍照
                if (this.UserDetails.SFQZPZ == "1" || (this.SLLRFS != 1 && this.SLLRFS != "1") || (this.BYXZT != 1 && this.BYXZT != 10040 && this.BYXZT != "" && this.BYXZT != " ")) {
                    return true;
                } else {
                    return false;
                }
            },
            AbnormalStatus: function() { //用量异常判断
                // this.AbnormalParams.startWater = this.UserDetails.QD;
                // this.AbnormalParams.endWater = this.ZD;
                // this.AbnormalParams.lastWaterAmounts = this.UserDetails.SCSL;
                // var abnormal = JudgeWaterAbnormalResult(this.AbnormalParams);
                // if (abnormal == undefined) {
                //     abnormal = {
                //         text: "正常",
                //         value: 0
                //     }
                // };
                // if (this.BYXZT == 4 || this.BYXZT == 10 || this.BYXZT == 12 || this.BYXZT == 25 || this.BYXZT == 26 || this.BYXZT == 27 || abnormal.value == 0) {
                //     return {
                //         status: true,
                //         text: "正常",
                //         value: 0
                //     }
                // } else {
                //     return {
                //         status: false,
                //         text: abnormal.text,
                //         value: abnormal.value
                //     }
                // }
                return {
                    status: true,
                    text: "正常",
                    value: 0
                }
            },
            isAppendImg: function() { //已抄状态下是否追加了抄表图片
                for (var i = 0; i < this.ImgData.length; i++) {
                    if (this.ImgData[i].isAppend) {
                        return true;
                    }
                }
                return false;
            },
            hasMeterLocationImg() { //是否添加了表位图片
                for (var i = 0; i < this.ImgData.length; i++) {
                    if (this.ImgData[i].data.NotLoction != "2") {
                        return true;
                    }
                }
                return false;
            }
        },
        watch: {
            UserDetails: {
                handler: function(val, oldVal) {
                    if (this.isEmptyObject(oldVal) || val.YHBH != oldVal.YHBH) {
                        this.BYXZT = val.BYXZT;
                        this.SBYXZT = val.SBYXZT;
                        this.ZD = val.ZD;
                        this.YL = val.YL;
                        this.XBBH = val.XBBH;
                        if (this.CLFS == 3) {
                            var year = Time("year"); //获取系统的年；
                            var month = Time("month"); //获取系统月份，由于月份是从0开始计算，所以要加1
                            var day = Time("day"); //获取系统日
                            this.HBRQ = year + '-' + month + '-' + day;
                        } else {
                            this.HBRQ = val.ZHHBRQ;
                        }
                        this.XBQD = val.XBQD;
                        this.XBZD = val.XBZD;
                        this.PATH = val.PATH;
                        // if (val.BYXZT == 11) { //故障-倒装状态  止度自动录入=起度
                        //     //this.ZD = val.QD;
                        // } else if (val.BYXZT == 3 || val.BYXZT == 4 || val.BYXZT == 5) { //换表-换表状态  止度和用量自动录入=0
                        //     //this.ZD = 0;
                        //     this.YL = 0;
                        //     this.XBQD = val.XBQD;
                        //     this.XBZD = val.XBZD;
                        // } else if (val.BYXZT == 10 || val.BYXZT == 12) { //无量-多录多抄和无表状态  止度自动录入=起度，用量=0
                        //     //this.ZD = val.QD;
                        //     this.YL = 0;
                        // }
                        this.SJBM = val.SJBM;
                        //this.SLLRFS = val.SFGC == "0" ? 1 : 2;
                        if (val.SLLRFS == null || val.SLLRFS == "" || val.SLLRFS == " ") {
                            this.SLLRFS = 1;
                        } else {
                            this.SLLRFS = val.SLLRFS;
                        }
                        this.CLFS = val.CLFS;
                        this.getImgData();
                        this.resetInputActive();
                        var ret = db.executeSqlSync({
                            name: 'CBtest',
                            sql: 'UPDATE MRM_BOOKSBIG_BEAN SET XCYH="' + val.YHBH + '" WHERE userName="' + this.LoginName + '"'
                        });
                        this.getMemorandum();
                    }
                    if (val.CBBZ == '1') { //抄表标志为1时代表离线已保存本地，未重新抄表前不能进行修改
                        this.editDegrees = false;
                        this.editConsumption = false;
                        this.editSJBM = false;
                        this.editNewMeterNo = false;
                        this.editHBRQ = false;
                        this.editXBQD = false;
                        this.editXBZD = false;
                    }
                },
                deep: true,
                immediate: true
            },
            BYXZT: {
                handler: function(val, oldVal) {
                    if ((this.SLLRFS == 2 && this.UserDetails.CBBZ != "1") || (this.BYXZT == 10 && this.UserDetails.CBBZ != "1") || (this.BYXZT == 9 && this.UserDetails.CBBZ != "1")) {
                        this.resetValue();
                        this.calculateYL();
                    } else if (this.UserDetails.CBBZ != "1") {
                        this.resetValue();
                    }
                    // if (val != oldVal && val != this.UserDetails.BYXZT) {
                    //     this.resetValue();
                    // }
                    // if (val == 11) { //故障-倒装状态  止度自动录入=起度
                    //     //this.ZD = this.UserDetails.QD;
                    // } else if (val == 4) { //换表-换表状态  止度自动录入=起度  用量自动录入=0
                    //     //this.ZD = this.UserDetails.QD;
                    //     this.YL = 0;
                    // } else if (val == 10 || val == 12 || val == 25 || val == 26 || val == 27) { //无量 止度自动录入=起度，用量=0
                    //     //this.ZD = this.UserDetails.QD;
                    //     this.YL = 0;
                    // } else if (val == 3 || val == 5 || val == 20 || val == 21) { //故障 止度=起度+用量
                    //     if (this.UserDetails.CBBZ == '0') { //未抄
                    //         //this.ZD = this.UserDetails.QD;
                    //         this.YL = 0;
                    //     }
                    // } else if (val == 6 || val == 7 || val == 22 || val == 23 || val == 24) { //特殊表位 止度=起度+用量
                    //     if (this.UserDetails.CBBZ == '0') { //未抄
                    //         //this.ZD = this.UserDetails.QD;
                    //         this.YL = 0;
                    //     }
                    // }
                },
                deep: true
            }
        },
        methods: {
            back() { //返回上一个页面
                _this = this;
                var backWinName = "抄表列表";
                if (this.FromPage == "cbqueryUser") {
                    backWinName = "用户详情";
                }
                if (this.hasChanged && this.UserDetails.CBBZ != "1") {
                    vant.Dialog.confirm({
                            title: '提示',
                            message: '当前用户数据尚未保存，是否回到' + backWinName + '？',
                        })
                        .then(function() {
                            _this.clearImgData();
                            _this.closeWin();
                        })
                        .catch(function() {
                            return
                        });
                } else {
                    this.closeWin();
                }
            },
            CodeScanning() {
                var _this = this;
                var FNScanner = api.require('FNScanner');
                FNScanner.open({
                    autorotation: true
                }, function(ret, err) {
                    if (ret) {
                        if (ret.eventType == 'success') {
                            var yhbh = ret.content;
                            for (var i = 0; i < _this.UserList.length; i++) {
                                if (_this.UserList[i].YHBH == yhbh) {
                                    _this.UserNumber = i;
                                    return;
                                }
                            }
                            api.toast({
                                msg: '当前抄表册没有对应用户信息！',
                                duration: 2000,
                                location: 'bottom'
                            });
                        }
                    } else {
                        api.toast({
                            msg: 'err.msg',
                            duration: 2000,
                            location: 'bottom'
                        });
                    }
                });
            },
            closeWin() { //关闭当前页面并刷新抄表列表页面
                if (api.pageParam.name == "MeterReading_userBigList" || api.pageParam.name === 1) {
                    api.sendEvent({
                        name: 'gxShow'
                    });
                };
                api.closeWin();
            },
            clearImgData() { //清除图片数据
                for (var i = 0; i < _this.ImgData.length; i++) {
                    var path = _this.ImgData[i].path;
                    var zpmc = _this.ImgData[i].data.zpmc;
                    fs.remove({
                        path: path
                    }, function(ret, err) {});
                    var photos = db.executeSqlSync({
                        name: 'CBtest',
                        sql: 'delete from MRM_PHOTOS_BEAN where ZPMC="' + zpmc + '" AND NotLoction="2" AND userName="' + this.LoginName + '"'
                    });
                };
                _this.ImgData = [];
            },
            resetValue() { //切换状态 清空数据
                this.YL = "0";
                this.ZD = "0";
                this.SJBM = "";
                this.XBBH = "";
                if (this.CLFS == 3) {
                    var year = Time("year"); //获取系统的年；
                    var month = Time("month"); //获取系统月份，由于月份是从0开始计算，所以要加1
                    var day = Time("day"); //获取系统日
                    this.HBRQ = year + '-' + month + '-' + day;
                } else {
                    this.HBRQ = this.UserDetails.ZHHBRQ;
                }
                this.XBQD = "0";
                this.XBZD = "0";
            },
            isEmptyObject(obj) { //判断是否为空对象
                for (var key in obj) {
                    return false
                };
                return true
            },
            clearObjectSpace(obj) { //清除空格
                Object.keys(obj).forEach(function(key) {　　 // 可进行逻辑判断，或者重新赋值
                    var item = obj[key];
                    if (typeof(item) == "string") {
                        obj[key] = item.replace(/\s/g, "");
                    }
                })
                return obj;
            },
            initData() { //初始化获取用户数据
                this.getUserData();
                this.getImgType();
                this.setXuChaoUser();
            },
            getUserData() { //获取用户数据
                var ret = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'select * from MRM_DEPLOYS_BEAN where CODE in ("MRM_COMPARED_INCREASE_VALUE","MRM_COMPARED_AMOUNT","MR_SET_FLOATING_VALUE","BL_MIX_RECKONTYPE") and userName="' + this.LoginName + '"'
                });
                if (ret.status) {
                    if (ret.data.length > 0) {
                        for (var i = 0; i < ret.data.length; i++) {
                            if (ret.data[i].CODE == "MRM_COMPARED_INCREASE_VALUE") { //向上浮动值
                                this.SFBL = ret.data[i].VALUE;
                            }
                            if (ret.data[i].CODE == "MRM_COMPARED_AMOUNT") { //向下浮动值
                                this.XFBL = ret.data[i].VALUE;
                            }
                            if (ret.data[i].CODE == "MR_SET_FLOATING_VALUE") { //水量异常判断方式
                                //alert("水量异常判断方式：" + ret.data[i].VALUE);
                                this.YCPDFS = ret.data[i].VALUE;
                            }
                            if (ret.data[i].CODE == "BL_MIX_RECKONTYPE") { //水量异常判断方式
                                this.QZFS = ret.data[i].VALUE;
                            }
                        }
                    }
                }

                var loginname = this.LoginName;
                var sql = ""; //查询语句
                var userState = api.pageParam.userState;
                _this = this;
                if (this.FromPage == "MeterReading_userBigList") { //抄表列表页面点击进入
                    switch (true) {
                        case userState == "all" || userState == "Duplicate" || userState == "ContinuedCopy": //全部 和 重抄 ，续抄
                            sql = sql = `SELECT * FROM MRM_USERBIG_BEAN WHERE ZXBLX!="2" and userName='${loginname}' ORDER BY CBXH`;
                            break;
                        case userState == "NotCopied": //未抄
                            sql = `select * from MRM_USERBIG_BEAN where ZXBLX!="2" and CBBZ=0 and userName='${loginname}' ORDER BY CBXH`;
                            break;
                            // case userState == "Immeasurable": //无量
                            //     sql = `select * from MRM_USERBIG_BEAN where CBBZ=1 and YL="0" ORDER BY CBXH`;
                            //     break;
                        case userState == "SLYC": //水量异常
                            sql = `select * from MRM_USERBIG_BEAN where ZXBLX!="2" AND CBBZ = '1' AND SLZT != '0' and userName='${loginname}' ORDER BY CBXH`;
                            break;
                        default:
                            sql = `select * from MRM_USERBIG_BEAN where ZXBLX!="2" AND CBBZ = '1' AND BYXZT = ${userState} and userName='${loginname}' ORDER BY CBXH`;
                            break;
                    }
                } else if (this.FromPage == 1) { //漏抄点击进入
                    if (api.pageParam.chCode == "") {
                        sql = 'SELECT * FROM MRM_USERBIG_BEAN WHERE YHBH!=" " and ZXBLX!="2" and CBBZ="0" and userName="' + loginname + '" ORDER BY CBXH';
                    } else {
                        var louchaoCode = api.pageParam.chCode;
                        var codeList = louchaoCode.join(",");
                        sql = `SELECT * FROM MRM_USERBIG_BEAN WHERE ZXBLX!="2" AND CBBZ="0" and userName='${loginname}' ORDER BY CBXH`;
                    }
                } else if (this.FromPage == "cbqueryUser") {
                    sql = 'SELECT * FROM MRM_USERBIG_BEAN WHERE ZXBLX!="2" and userName="' + loginname + '" ORDER BY CBXH'
                }
                var ret = db.selectSqlSync({
                    name: 'CBtest',
                    sql: sql
                });
                this.UserList = ret.data;
                if (this.UserList.length == 0 || this.UserList == '') {
                    vant.Dialog.alert({
                        title: "提示",
                        message: "暂无抄表数据请前往下载"
                    }).then(() => {
                        api.closeWin({});
                    })
                }
                var UserNumber = this.UserList.findIndex(function(item) {
                    return item.YHBH == _this.YHBH;
                });
                if (UserNumber == -1) {
                    this.UserNumber = 0;
                } else {
                    this.UserNumber = UserNumber;
                }
            },
            getImgType() { //获取图片类型数据
                _this = this;
                db.selectSql({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_ONLINE_BEAN where TYPEID="GDTPLX" and userName="' + _this.LoginName + '"'
                }, function(ret, err) {
                    if (ret.status) {
                        if (ret.data.length > 0) {
                            var list = ret.data;
                            _this.ImgType = list.map(function(item) {
                                return {
                                    ID: item.ID,
                                    NAME: item.NAME
                                }
                            })
                        }
                    }
                });
            },
            setXuChaoUser() { //设置当前抄表册续抄用户
                var ret = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'UPDATE MRM_BOOKSBIG_BEAN SET XCYH="' + this.YHBH + '" WHERE userName="' + this.LoginName + '"'
                });
            },
            getMemorandum() { //获取备忘录
                var ret = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'select * from MRM_THE_MEMO_BEAN2 where YHBH="' + this.UserDetails.YHBH + '" and userName="' + this.LoginName + '"'
                });
                if (ret.status && ret.data.length > 0) {
                    this.Memorandum = ret.data.map(function(item, index) {
                        var remark = (index + 1) + "." + item.REMARK;
                        if (item.TXLX == 3) {
                            if (item.TXSJ == moment().format("YYYY-MM-DD")) {
                                return remark;
                            }
                        } else {
                            return remark;
                        }
                    });
                    this.openMemorandum();
                } else {
                    this.Memorandum = [];
                }
            },
            openMemorandum() { //提示备忘录信息
                var text = this.Memorandum.join("\n");
                vant.Dialog.alert({
                    title: "备忘录",
                    message: text
                });
            },
            openDetails() { //用户信息区域向左滑动打开用户详情页
                // api.openWin({
                //     name: 'MeterReading_information',
                //     url: './MeterReading_information.html',
                //     pageParam: this.UserDetails
                // });
            },
            turnToNextOrPrev(turnFun) {
                if (this.hasChanged && this.UserDetails.CBBZ != "1") {
                    vant.Dialog.confirm({
                            title: '提示',
                            message: '当前用户数据尚未保存，是否跳转？',
                        })
                        .then(function() {
                            _this.clearImgData();
                            turnFun();
                        })
                        .catch(function() {
                            return
                        });
                } else {
                    turnFun();
                }
            },
            previousHousehold() { //上一户
                if (this.UserNumber == 0) {
                    api.toast({
                        msg: '没有上一户了',
                        duration: 2000,
                        location: 'bottom'
                    });
                    return;
                } else {
                    this.UserNumber--;
                }
            },
            nextHousehold() { //下一户
                if (this.UserNumber == (this.UserList.length - 1)) {
                    api.toast({
                        msg: '没有下一户了',
                        duration: 2000,
                        location: 'bottom'
                    });
                    return;
                } else {
                    this.UserNumber++;
                }
            },
            viewLastMonthPhoto() { //查看上月照片
                if (api.connectionType != 'none') {
                    this.LoadOrNot = 1
                    api.showProgress({
                        title: '加载中',
                        modal: false
                    });
                    var LoadOrNotthis = this
                    var Parameter = {
                        "ClientId": api.deviceId,
                        "ClientName": api.deviceModel,
                        "OperatorId": $api.getStorage('cbOperatorId'),
                        "OperatorName": $api.getStorage('cbOperatorName'),
                        "Required": "YHBH=" + this.UserDetails.YHBH,
                        "Type": "155"
                    };
                    var body = {
                        body: JSON.stringify({
                            "UserName": $api.getStorage('cbOperatorName'),
                            "Password": $api.getStorage('cbPassword'),
                            "SerialNo": dataTime(),
                            "Method": "R999",
                            "Parameter": JSON.stringify(Parameter)
                        })
                    };
                    fnPostNoProcess('', body, 'application/json', false, function(ret, err) {
                        api.hideProgress();
                        LoadOrNotthis.LoadOrNot = 0
                        if (ret) {
                            if (ret.Status != 0) {
                                api.toast({
                                    msg: '获取上月图片失败',
                                    duration: 2000,
                                    location: 'top'
                                });
                            } else {
                                var imgData;
                                if (ret.Data == "") {
                                    imgData = [];
                                } else {
                                    imgData = JSON.parse(ret.Data);
                                };
                                if (imgData.length > 0) {
                                    var images = imgData.map((item) => {
                                        //  return $api.getStorage('cbapipath') + item.URL;  //开发环境是抄表接口地址
                                        return apiUrl + item.URL; //生产环境是云平台接口地址
                                    });
                                    api.openWin({
                                        name: 'photoBrowser_fram_New',
                                        url: './photoBrowser_fram_New.html',
                                        pageParam: {
                                            images: images,
                                            startPosition: 0
                                        },
                                        animation: {
                                            type: "fade",
                                            subType: "from_right",
                                            duration: 300
                                        }
                                    });
                                } else {
                                    api.toast({
                                        msg: '暂无图片',
                                        duration: 2000,
                                        location: 'top'
                                    });
                                }
                            }
                        } else {
                            api.toast({
                                msg: '网络连接超时',
                                duration: 2000,
                                location: 'top'
                            });

                        }
                    });
                } else {
                    vant.Toast("未连接网络,无法查看上月图片");
                }
            },
            photograph() { // 抄表拍照图片
                _this = this;
                gpsmodel.gpsstate(function(ret) {
                    if (ret.gps == true) {
                        //标志是表位图片还是抄表图片
                        var state = 0;
                        _this.getCamera("", "", state);
                    } else {
                        api.alert({
                            title: '提示',
                            msg: '无法进行拍照操作,请先打开gps',
                        });
                    }
                });
            },
            getCamera(id, name, state) { //拍照以及添加水印和经纬度
                var _this = this;
                var NotLoction = state ? 1 : 2;
                var options = {
                    type: 'camera',
                    waterMark: true,
                    from: 'cb',
                    waterMarkData: {
                        code: _this.UserDetails.YHBH,
                        picType: state == 0 ? name : ""
                    }
                }
                pGetPicture(options, function(ret, err) {
                    if (err) {
                        alert("拍照失败！请重试");
                        return false;
                    }
                    if (ret.status) {
                        // var currentImg = ret.imgList[0];
                        //alert("拍照成功，图片数：" + ret.imgList.length);
                        var item = ret.imgList[0];
                        var cbch = _this.UserDetails.CBCH;
                        var yhbh = _this.UserDetails.YHBH;
                        var zplj = item;
                        var zpmc = _this.datetime() + "_" + zplj.substr(zplj.lastIndexOf('/') + 1, zplj.lastIndexOf('.') + 3);

                        var lon = ""; //经度
                        var lat = ""; //维度
                        //alert("获取经纬度");
                        pGetLocation(function(ret, err) {
                            if (ret.status) {
                                //alert("获取成功：" + ret.lon + "," + ret.lat);
                                lon = ret.lon;
                                lat = ret.lat;
                                saveImgDetail(lon, lat)
                            } else {
                                //alert("获取失败");
                                var jwd = _this.UserDetails.JWD;
                                if (jwd != null && jwd != "null" && jwd != "" && jwd != " ") {
                                    var strs = jwd.split(",");
                                    lon = strs[0];
                                    lat = strs[1];
                                } else {
                                    lon = "";
                                    lat = "";
                                }
                                saveImgDetail(lon, lat)
                            }
                            // 拍照成功后根据定位的信息 保存图片信息
                            function saveImgDetail(lon, lat) {
                                $(".isSaveShow").css({
                                    "pointer-events": "auto"
                                });
                                var img = {
                                    path: zplj,
                                    isAppend: false,
                                    data: {
                                        cbch: cbch,
                                        yhbh: yhbh,
                                        zpmc: zpmc,
                                        zplj: zplj,
                                        id: id,
                                        name: name,
                                        lon: lon,
                                        lat: lat,
                                        time: dataTime(),
                                        NotLoction: NotLoction
                                    }
                                };
                                if (state == 0) {
                                    if (_this.UserDetails.CBBZ == "1") {
                                        img.isAppend = true;
                                    }
                                    _this.ImgData.push(img);
                                    //alert("存入图片数组");
                                    setTimeout(function() {
                                        var ele = document.getElementById('flex-vertical');
                                        ele.scrollTop = ele.clientHeight;
                                    }, 50);
                                } else {
                                    _this.PATH = zplj;
                                    _this.ImgData.push(img);
                                }
                            }
                        });
                    }
                });
            },
            insertPhotoIntoDB() { //保存时将图片添加到本地数据库中
                for (var i = 0; i < this.ImgData.length; i++) {
                    var item = this.ImgData[i];
                    var photoData = item.data;
                    var existData = db.selectSqlSync({
                        name: "CBtest",
                        sql: "SELECT * FROM MRM_PHOTOS_BEAN WHERE ZPLJ = '" + photoData.zplj + "' AND YHBH = '" + photoData.yhbh + "' and userName='" + this.LoginName + "'"
                    });
                    if (!existData.status || existData.data.length == 0) {
                        var photodata = db.executeSqlSync({
                            name: 'CBtest',
                            sql: 'INSERT INTO MRM_PHOTOS_BEAN(userName,ID,YHBH,ZPMC,ZPLJ,ZPLX,ZPLXMC,SFSC,JD,WD,CBRQ,' +
                                'NotLoction) VALUES ("' + this.LoginName + '",' +
                                '"' + $api.getStorage('cbOperatorId') + '",' +
                                '"' + photoData.yhbh + '",' +
                                '"' + photoData.zpmc + '",' +
                                '"' + photoData.zplj + '",' +
                                '"' + photoData.id + '",' +
                                '"' + photoData.name + '",' +
                                '"0",' +
                                '"' + photoData.lon + '",' +
                                '"' + photoData.lat + '",' +
                                '"' + photoData.time + '",' +
                                '"' + photoData.NotLoction + '")'
                        });
                    }
                }
            },
            getImgData() { //获取本地数据库已保存的图片
                this.ImgData = [];
                _this = this;
                db.selectSql({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_PHOTOS_BEAN WHERE YHBH ="' + _this.UserDetails.YHBH + '" AND NotLoction="2" and userName="' + _this.LoginName + '"'
                }, function(ret, err) {
                    if (ret.status) {
                        if (ret.data.length > 0) {
                            for (var i = 0; i < ret.data.length; i++) {
                                var item = ret.data[i];
                                var img = {
                                    path: item.ZPLJ,
                                    isAppend: false,
                                    data: {
                                        yhbh: item.YHBH,
                                        zpmc: item.ZPMC,
                                        zplj: item.ZPLJ,
                                        id: item.ZPLX,
                                        name: item.ZPLXMC,
                                        lon: item.JD,
                                        lat: item.WD,
                                        time: item.CBRQ,
                                        NotLoction: item.NotLoction
                                    }
                                }
                                _this.ImgData.push(img);
                            }
                        }
                    }
                });
            },
            imgPreView(path, index) { //图片预览
                var images = this.ImgData.map(function(item) {
                    return item.path;
                });
                pBrowserPicture(index, images);
            },
            deleteImg(index) { // 图片删除
                var path = this.ImgData[index].path;
                var zpmc = this.ImgData[index].data.zpmc;
                _this = this;
                gpsmodel.gpsstate(function(ret) {
                    if (ret.gps == true) {
                        if (_this.UserDetails.CBBZ != '1' || _this.ImgData[index].isAppend) {
                            api.confirm({
                                title: '提示',
                                msg: '确认删除照片',
                                buttons: ['确定', '取消']
                            }, function(ret, err) {
                                var buttonIndex = ret.buttonIndex;
                                if (buttonIndex == 1) {
                                    fs.exist({
                                        path: path
                                    }, function(ret, err) {
                                        if (ret.exist) {
                                            //文件存在
                                            fs.remove({
                                                path: path
                                            }, function(ret, err) {
                                                if (ret.status) {
                                                    var photos = db.executeSqlSync({
                                                        name: 'CBtest',
                                                        sql: 'delete from MRM_PHOTOS_BEAN where ZPMC="' + zpmc + '" AND NotLoction="2" and userName="' + _this.LoginName + '"'
                                                    });
                                                    _this.ImgData.splice(index, 1);
                                                }
                                            });
                                        } else {
                                            //文件不存在
                                            var photos = db.executeSqlSync({
                                                name: 'CBtest',
                                                sql: 'delete from MRM_PHOTOS_BEAN where ZPMC="' + zpmc + '" AND NotLoction="2" and userName="' + _this.LoginName + '"'
                                            });
                                            _this.ImgData.splice(index, 1);
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        vant.Dialog.alert({
                            title: "提示",
                            message: "无法进行抄表操作,请先打开gps"
                        }).then(() => {

                        })
                    }
                });

            },
            waterLocationImg() { //表位图片
                var _this = this;
                if ((_this.PATH == ' ' || _this.PATH == '' || _this.PATH == 'null' || _this.PATH == null || _this.PATH.length == 0) && this.UserDetails.CBBZ != "1") {
                    api.toast({
                        msg: '暂无表位图片',
                        duration: 2000,
                        location: 'top'
                    });
                    // gpsmodel.gpsstate(function(ret) {
                    //     if (ret.gps == true) {
                    //         vant.Dialog.confirm({
                    //             title: '提示',
                    //             message: '是否上传表位照片'
                    //         }).then(() => {
                    //             _this.getCamera(" ", " ", 1);
                    //         }).catch(() => {
                    //
                    //         });
                    //     } else {
                    //         vant.Dialog.alert({
                    //             title: "提示",
                    //             message: "无法进行抄表操作,请先打开gps"
                    //         }).then(() => {
                    //
                    //         })
                    //     }
                    // });
                } else {
                    if (this.PATH == ' ' || this.PATH == "") {
                        api.toast({
                            msg: '暂无表位图片',
                            duration: 2000,
                            location: 'top'
                        });
                    } else {
                        api.openWin({
                            name: 'photoBrowser_fram',
                            url: './photoBrowser_fram.html',
                            pageParam: {
                                src: _this.PATH,
                                statu: _this.UserDetails.YHBH
                            }
                        });
                    }
                }
            },
            selectMeterStates() { //选择水表状态
                _this = this;
                gpsmodel.gpsstate(function(ret) {
                    if (ret.gps == true) {
                        if (_this.UserDetails.CBBZ != '1') {
                            api.openFrame({
                                name: 'statselectr_fram',
                                url: './statselectr_fram.html',
                                rect: {
                                    x: 0,
                                    y: 0,
                                    w: 'auto',
                                    h: 'auto'
                                },
                                pageParam: {
                                    name: 'test'
                                },
                                bounces: false,
                                bgColor: 'rgba(243,243,243.1)',
                                vScrollBarEnabled: true,
                                hScrollBarEnabled: true,
                            });
                        }
                    } else {
                        vant.Dialog.alert({
                            title: "提示",
                            message: "无法进行抄表操作,请先打开gps"
                        }).then(() => {

                        })
                    }
                });
            },
            changeDegrees(noToast) { //点击读数，切换键盘输入为录入读数
                // 自抄和正常
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedDegrees) {
                        this.editDegrees = true;
                        this.editConsumption = false;
                        this.editSJBM = false;
                        this.editNewMeterNo = false;
                        this.editHBRQ = false;
                        this.editXBQD = false;
                        this.editXBZD = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入读数");
                        }
                        this.editDegrees = false;
                    }
                }
            },
            changeConsumption(noToast) { //点击用量，切换键盘输入为录入用量
                //故障：表糊、表停、倒装、表坏、其他、
                //特殊表位：堆埋、车压、水淹、闭门围挡、其他
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedConsumption) {
                        this.editConsumption = true;
                        this.editDegrees = false;
                        this.editSJBM = false;
                        this.editNewMeterNo = false;
                        this.editHBRQ = false;
                        this.editXBQD = false;
                        this.editXBZD = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入用量");
                        }
                        this.editConsumption = false;
                    }
                }
            },
            changeSJBM(noToast) { //点击实际表码，切换键盘输入为录入实际表码
                //故障：倒装
                //换表
                //无量：多录多抄、其他
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedSJBM) {
                        this.editSJBM = true;
                        this.editConsumption = false;
                        this.editDegrees = false;
                        this.editNewMeterNo = false;
                        this.editHBRQ = false;
                        this.editXBQD = false;
                        this.editXBZD = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入实际表码");
                        }
                        this.editSJBM = false;
                    }
                }
            },
            changeNewMeterNo(noToast) { //点击新表表号，切换键盘输入为新表表号
                //换表-换表
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedXBBH) {
                        this.editNewMeterNo = true;
                        this.editSJBM = false;
                        this.editConsumption = false;
                        this.editDegrees = false;
                        this.editXBQD = false;
                        this.editXBZD = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入新表表号");
                        }
                        this.editNewMeterNo = false;
                    }
                }
            },
            changeXBQD(noToast) { //点击新表起度，切换键盘输入为新表起度
                //换表-换表
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedXBBH) {
                        this.editXBQD = true;
                        this.editNewMeterNo = false;
                        this.editSJBM = false;
                        this.editConsumption = false;
                        this.editDegrees = false;
                        this.editXBZD = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入新表起度");
                        }
                        this.editXBQD = false;
                    }
                }
            },
            changeXBZD(noToast) { //点击新表止度，切换键盘输入为新表止度
                //换表-换表
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedXBBH) {
                        this.editXBZD = true;
                        this.editNewMeterNo = false;
                        this.editSJBM = false;
                        this.editConsumption = false;
                        this.editDegrees = false;
                        this.editXBQD = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入新表止度");
                        }
                        this.editXBZD = false;
                    }
                }
            },
            ScanCode() { //扫码识别水表表号
                if (this.UserDetails.CBBZ != "1") {
                    FNScanner.open({
                        rect: {
                            x: 0,
                            y: 0,
                            w: api.winWidth,
                            h: api.winHeight,
                        },
                        autorotation: true,
                        hintText: "扫码获取水表表号",
                        font: {
                            lightText: {
                                size: 13,
                            }
                        }
                    }, (ret, err) => {
                        if (ret.eventType == 'success') {
                            var content = ret.content;
                            this.XBBH = content;
                            this.editNewMeterNo = true;
                            this.editSJBM = false;
                            this.editConsumption = false;
                            this.editDegrees = false;
                        }
                    });
                }
            },
            resetInputActive() { //重置读数、实际表码、用量的输入框状态
                this.editDegrees = false; //编辑读数
                this.editConsumption = false; //编辑用量
                this.editSJBM = false; //编辑实际表码
                this.editNewMeterNo = false; //编辑新表表号
                this.editXBQD = false; //编辑新表起度
                this.editXBZD = false; //编辑新表止度
                if (this.NeedDegrees) {
                    this.editDegrees = true;
                } else if (this.NeedConsumption) {
                    this.editConsumption = true;
                } else if (this.NeedSJBM) {
                    this.editSJBM = true;
                } else if (this.NeedXBBH) {
                    this.editNewMeterNo = true;
                } else if (this.NeedXBQD) {
                    this.editXBQD = true;
                } else if (this.NeedXBZD) {
                    this.editXBZD = true;
                }
            },
            openLight() { //打开/关闭手电筒
                this.showLight = !this.showLight;
                if (this.showLight) {
                    DVTorch.open({});
                } else {
                    DVTorch.close({});
                }
            },
            applyWorkOrder() { // 发起异常记录
                var telponeNumer = this.UserDetails.YDDH;
                if (telponeNumer == "") {
                    api.toast({
                        msg: '该用户没有录入联系方式',
                        duration: 2000,
                        location: 'top'
                    });
                    return;
                }
                api.call({
                    type: 'tel_prompt',
                    number: telponeNumer
                });
            },
            contactsPhone() { //点击键盘上的更多
                // 电话拨打和短信
                var telponeNumer = this.UserDetails.YDDH;
                var userCode = this.UserDetails.YHBH;
                var loginname = this.LoginName;
                _this = this;
                api.actionSheet({
                    style: {
                        fontNormalColor: '#FF5A5A5A',
                        fontPressColor: '#FF2F81F6'
                    },
                    buttons: ['联系用户', '更新表位', '导航']
                }, function(ret, err) {
                    if (ret) {
                        var index = ret.buttonIndex;
                        if (index == 1) {
                            if (telponeNumer == "") {
                                api.toast({
                                    msg: '该用户没有录入联系方式',
                                    duration: 2000,
                                    location: 'top'
                                });
                                return;
                            }
                            api.call({
                                type: 'tel_prompt',
                                number: telponeNumer
                            });
                        }
                        if (index == 2) {
                            // 定位
                            gpsmodel.gpsstate(function(ret) {
                                if (ret.gps == true) {
                                    _this.upLoction()
                                } else {
                                    vant.Dialog.alert({
                                        title: "提示",
                                        message: "无法更新表位,请先打开gps"
                                    }).then(() => {

                                    })
                                }
                            });
                        }
                        // if (index == 3) {
                        //     // 重新抄表
                        //     gpsmodel.gpsstate(function(ret) {
                        //         if (ret.gps == true) {
                        //             vant.Dialog.confirm({
                        //                     title: '修改提示',
                        //                     message: '确认修改将清空抄表录入',
                        //                 })
                        //                 .then(function() {
                        //                     _this.reReadMeter();
                        //                 })
                        //                 .catch(function() {
                        //                     return
                        //                 });
                        //         } else {
                        //             vant.Dialog.alert({
                        //                 title: "提示",
                        //                 message: "无法修改已抄,请先打开gps"
                        //             }).then(() => {
                        //
                        //             })
                        //         }
                        //     });
                        // }
                        if (index == 3) {
                            gpsmodel.gpsstate(function(ret) {
                                if (ret.gps == true) {
                                    api.openWin({
                                        name: 'baiduMapBig',
                                        url: '../baiduMap/baiduMapBig.html',
                                        pageParam: {
                                            YHBH: _this.UserDetails.YHBH
                                        }
                                    });
                                } else {
                                    vant.Dialog.alert({
                                        title: "提示",
                                        message: "无法导航,请先打开gps"
                                    }).then(() => {

                                    })
                                }
                            });
                        }
                    }
                });
            },
            reReadMeter() { //重新抄表，清空数据
                //  清除数据
                var yhbh = this.UserDetails.YHBH;
                // var DELETEimg = db.executeSqlSync({
                //     name: 'CBtest',
                //     sql: 'DELETE FROM MRM_PHOTOS_BEAN WHERE YHBH ="' + yhbh + '" AND NotLoction="0"'
                // });
                var ret = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'delete from MRM_WORKORDER_BEAN WHERE YHBH="' + yhbh + '" and userName="' + this.LoginName + '"'
                });
                var ret = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'UPDATE MRM_USERBIG_BEAN SET CBRQ="", ZD="0", YL="0", SJSL="0", CBBZ="0",BYXZT="1", CWXX=" ",ZTSCCG="0", CBYSZJD=" ",CBYSZWD=" ",FY=" ",FYHJ=" ",SJBM="",XBBH = "",XBQD = "",XBZD = "",SBYXZT="正常",ZHHBRQ="",YLZT="",SLLRFS="",SFDY="0" WHERE YHBH="' + yhbh + '" and userName="' + this.LoginName + '"'
                });
                var ret = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'UPDATE MRM_USERBIG_BEAN SET CBRQ="", ZD="0", YL="0", SJSL="0", CBBZ="0",BYXZT="1", CWXX=" ",ZTSCCG="0", CBYSZJD=" ",CBYSZWD=" ",FY=" ",FYHJ=" ",SJBM="",XBBH = "",XBQD = "",XBZD = "",SBYXZT="正常",ZHHBRQ="",YLZT="",SLLRFS="",SFDY="0" WHERE ZXBZBBH="' + yhbh + '" and ZXBLX="2" and userName="' + this.LoginName + '"'
                });
                var retUser = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USERBIG_BEAN WHERE ZXBLX!="2" AND CBBZ="1" and userName="' + this.LoginName + '"'
                });
                var retUsers = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USERBIG_BEAN WHERE ZXBLX!="2" and userName="' + this.LoginName + '"'
                });

                var wcusers = retUsers.data.length - retUser.data.length
                var retBooks = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'UPDATE MRM_BOOKSBIG_BEAN SET YC=\'' + retUser.data.length + '\' , WC=\'' + wcusers + '\' WHERE userName="' + this.LoginName + '"'
                });
                this.UserDetails.ZD = "0";
                this.UserDetails.YL = "0";
                this.UserDetails.BYXZT = "1";
                this.UserDetails.SBYXZT = "正常";
                this.UserDetails.SJBM = "";
                this.UserDetails.XBBH = "";
                this.UserDetails.CBBZ = '0';
                this.CLFS = '';
                this.BYXZT = "1";
                this.SBYXZT = "正常";
                this.SLLRFS = "1"
                this.resetValue();
                // this.ImgData = [];
                this.resetInputActive();
            },
            upLoction() { //更新表位
                //获取当前用户信息
                _this = this;
                bMap.getLocation({
                    accuracy: '10m',
                    autoStop: true,
                    filter: 1
                }, function(ret, err) {
                    if (ret.status) {
                        var lon = ret.lon;
                        var lat = ret.lat;
                        // 更新经纬度
                        var jwd = lon + ',' + lat
                        var retdb = db.executeSqlSync({
                            name: 'CBtest',
                            sql: 'UPDATE MRM_USERBIG_BEAN SET JWD="' + jwd + '" WHERE YHBH="' + _this.UserDetails.YHBH + '" and userName="' + _this.LoginName + '"'
                        });
                        _this.LoadOrNot = 1
                        api.showProgress({
                            title: '上传中',
                            modal: false
                        });

                        _this.upLoctionAjax(lon, lat, function(ret, err) {
                            api.hideProgress();
                            _this.LoadOrNot = 0
                            if (ret) {
                                if (ret.Status == 0) {
                                    api.toast({
                                        msg: '表位上传成功',
                                        duration: 2000,
                                        location: 'top'
                                    });
                                    _this.UserDetails.DWSFSC = "1";
                                    var retdb = db.executeSqlSync({
                                        name: 'CBtest',
                                        sql: 'UPDATE MRM_USERBIG_BEAN SET DWSFSC="1" WHERE YHBH="' + _this.UserDetails.YHBH + '" and userName="' + this.LoginName + '"'
                                    });
                                } else {
                                    vant.Toast(ret.Message)
                                }
                            } else {
                                // 上传超时存储到本地
                                db.selectSql({
                                    name: 'CBtest',
                                    sql: 'SELECT * FROM MRM_METER_LOCATION_BEAN WHERE YHBH= "' + _this.UserDetails.YHBH + '" and userName="' + this.LoginName + '"'
                                }, function(ret, err) {
                                    if (ret.status) {
                                        db.executeSql({
                                            name: 'CBtest',
                                            sql: 'UPDATE MRM_METER_LOCATION_BEAN SET ID=\'' + $api.getStorage("cbOperatorId") + '\',YHBH=\'' + _this.UserDetails.YHBH + '\',JD=\'' +
                                                lon + '\',WD=\'' +
                                                lat + '\',CBSJ=\'' + dataTime() + '\' WHERE YHBH= "' + _this.UserDetails.YHBH + '" and userName="' + _this.LoginName + '"'
                                        }, function(ret, err) {
                                            if (ret.status) {
                                                vant.Toast("网络错误，已存储本地")
                                            }
                                        });
                                    } else {
                                        db.executeSql({
                                            name: 'CBtest',
                                            sql: 'INSERT INTO MRM_METER_LOCATION_BEAN(userName,ID,YHBH,JD,WD,CBSJ) VALUES ("' + _this.LoginName +
                                                '","' + $api.getStorage("cbOperatorId") +
                                                '","' + _this.UserDetails.YHBH +
                                                '","' + lon +
                                                '","' + lat +
                                                '","' + dataTime() + '")'
                                        }, function(ret, err) {
                                            if (ret.status) {
                                                vant.Toast("网络错误，已存储本地")
                                            }
                                        });

                                    }
                                });
                                // 存储到本地完成
                            }
                        })
                    } else {
                        api.toast({
                            msg: '获取定位失败，请重试',
                            duration: 2000,
                            location: 'top'
                        });
                    }
                });
            },
            upLoctionAjax(lon, lat, callback) { //上传表位信息调用接口
                //获取当前用户信息
                var telponeNumer = this.UserDetails.YHDH;
                var userCode = this.UserDetails.YHBH;
                _this = this;
                var Records = [{
                    "JD": lon,
                    "WD": lat,
                    "YHBH": userCode
                }];
                var Parameter = {
                    "ClientId": api.deviceId,
                    "ClientName": api.deviceModel,
                    "OperatorId": $api.getStorage("cbOperatorId"),
                    "OperatorName": $api.getStorage("cbOperatorName"),
                    "Required": "",
                    "Type": '221',
                    "Records": Records
                }
                var body = {
                    body: JSON.stringify({
                        "UserName": $api.getStorage("cbOperatorName"),
                        "Password": $api.getStorage("cbPassword"),
                        "SerialNo": dataTime(),
                        "Method": "R999",
                        "Parameter": JSON.stringify(Parameter)
                    })
                }
                fnPostNoProcess('', body, 'application/json', false, function(ret, err) {
                    callback(ret, err);
                });
            },
            getKeyboardNumbers(newValue, QDChange = false) {
                //判断是否需要录入换表日期，如果需要录入，就判断换表日期是否填写了。
                if (this.NeedHBRQ) {
                    if (this.HBRQ == "") {
                        api.toast({
                            msg: '请先选择换表日期',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    }
                }
                //读数
                if (this.editDegrees) {
                    if (this.ZD == 0) {
                        this.ZD = "";
                    }
                    if (this.ZD.length - 1 >= 9) {
                        api.toast({
                            msg: '输入超过限制',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    }
                    if (!QDChange) {
                        this.ZD += newValue;
                    }
                    // if (this.BYXZT == 1 || this.BYXZT == "" || this.BYXZT == 10040) {
                    //     this.YL = parseInt(this.ZD) - parseInt(this.UserDetails.QD);
                    //     // this.SJBM = this.ZD;
                    // }
                }
                //用量
                if (this.editConsumption) {
                    if (this.YL == 0) {
                        this.YL = "";
                    }
                    if (this.YL.length - 1 >= 9) {
                        api.toast({
                            msg: '输入超过限制',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    }
                    if (!QDChange) {
                        this.YL += newValue;
                    }
                    if (this.BYXZT != 11) {
                        this.ZD = parseInt(this.YL) + parseInt(this.UserDetails.QD);
                    }
                }
                //  实际表码
                if (this.editSJBM) {
                    if (this.SJBM == 0) {
                        this.SJBM = "";
                    }
                    if (this.SJBM.length - 1 >= 9) {
                        api.toast({
                            msg: '输入超过限制',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    } else {
                        if (!QDChange) {
                            this.SJBM += newValue;
                        }

                    }
                }
                // 新表表号
                if (this.editNewMeterNo) {
                    if (!QDChange) {
                        this.XBBH += newValue;
                    }
                }
                // 新表起度
                if (this.editXBQD) {
                    if (this.XBQD == 0) {
                        this.XBQD = "";
                    }
                    if (this.XBQD.length - 1 >= 9) {
                        api.toast({
                            msg: '输入超过限制',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    }
                    if (!QDChange) {
                        this.XBQD += newValue;
                    }
                }
                // 新表止度
                if (this.editXBZD) {
                    if (this.XBZD == 0) {
                        this.XBZD = "";
                    }
                    if (this.XBZD.length - 1 >= 9) {
                        api.toast({
                            msg: '输入超过限制',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    }
                    if (!QDChange) {
                        this.XBZD += newValue;
                    }
                }
                this.calculateYL();
            },
            longTapDelete() { //长按一直删除
                this.deleteNumber();
                this.timer = setInterval(() => {
                    this.deleteNumber();
                }, 100);
            },
            stopDelete() { //停止长按删除
                clearInterval(this.timer);
            },
            deleteNumber() { //删除
                _this = this;
                if (this.UserDetails.CBBZ != "1") {
                    if (this.editDegrees) { //读数
                        this.ZD = this.ZD.slice(0, this.ZD.length - 1);
                        // if (this.ZD.length == 0) {
                        //     this.YL = "";
                        //     this.SJBM = this.ZD;
                        // } else {
                        //     if (this.BYXZT == 1 || this.BYXZT == "" || this.BYXZT == 10040) { //正常和自抄
                        //         this.YL = parseInt(this.ZD) - parseInt(this.UserDetails.QD);
                        //         this.SJBM = this.ZD;
                        //     }
                        // }
                    }

                    if (this.editConsumption) { //用量
                        this.YL = this.YL.slice(0, this.YL.length - 1);
                        // if (this.YL.length == 0) {
                        //     this.YL = "";
                        //     if (this.BYXZT == 3 || this.BYXZT == 5 || this.BYXZT == 20 || this.BYXZT == 21 || this.BYXZT == 6 || this.BYXZT == 7 || this.BYXZT == 22 || this.BYXZT == 23 || this.BYXZT == 24) {
                        //         this.ZD = "";
                        //     }
                        // } else {
                        //     if (this.BYXZT == 3 || this.BYXZT == 5 || this.BYXZT == 20 || this.BYXZT == 21 || this.BYXZT == 6 || this.BYXZT == 7 || this.BYXZT == 22 || this.BYXZT == 23 || this.BYXZT == 24) {
                        //         this.ZD = parseInt(this.YL) + parseInt(this.UserDetails.QD);
                        //     }
                        // }

                    }
                    if (this.editSJBM) { //实际表码
                        this.SJBM = this.SJBM.slice(0, this.SJBM.length - 1);
                        if (this.SJBM.length == 0) {
                            this.SJBM = ""
                        }
                    }
                    if (this.editNewMeterNo) { //新表表号
                        this.XBBH = this.XBBH.slice(0, this.XBBH.length - 1);
                        if (this.XBBH.length == 0) {
                            this.XBBH = ""
                        }
                    }
                    if (this.editXBQD) { //新表表号
                        this.XBQD = this.XBQD.slice(0, this.XBQD.length - 1);
                        if (this.XBQD.length == 0) {
                            this.XBQD = ""
                        }
                    }
                    if (this.editXBZD) { //新表表号
                        this.XBZD = this.XBZD.slice(0, this.XBZD.length - 1);
                        if (this.XBZD.length == 0) {
                            this.XBZD = ""
                        }
                    }
                } else {

                }
                this.calculateYL();
            },
            setDefaultNumbers() { //设置默认数据
                // if (this.BYXZT == 10 || this.BYXZT == 12 || this.BYXZT == 25 || this.BYXZT == 26 || this.BYXZT == 17) {
                //     this.YL = 0;
                // }
                // if (this.BYXZT == 3 || this.BYXZT == 4 || this.BYXZT == 5) {
                //     this.ZD = 0;
                //     this.YL = 0;
                // }
                // // 无表和多录多抄
                // if (this.BYXZT == 10 || this.BYXZT == 12 || this.BYXZT == 25 || this.BYXZT == 26 || this.BYXZT == 11) {
                //     this.ZD = this.UserDetails.QD;
                // }
                this.ZD = 0;
                this.YL = 0;
            },
            calculateYL() {
                if (this.BYXZT == 10 || this.BYXZT == 9) {
                    //追水，止度等于起度，水量为0
                    this.ZD = this.UserDetails.QD;
                    this.YL = 0;
                    this.resultType = "正常";
                    this.SJSL = this.YL;
                    return;
                }
                var result = 0; //水量
                var zsl = 0; //周期总水量
                var sccbrq = ""; //上次抄表日期
                var zxcbrq = ""; //近三期最小周期抄表日期
                var sl = []; //周期水量
                var changeTable = false; //是否换表
                var day = 0; //周期天数
                var avgWaterVolume = 0; //周期总水量
                var waterSBLC = 0;
                if (this.UserDetails.SBLC == null || this.UserDetails.SBLC == " " || this.UserDetails.SBLC == "") {
                    waterSBLC = this.UserDetails.QD;
                } else {
                    waterSBLC = this.UserDetails.SBLC;
                }
                if (this.UserDetails.SCCBRQ != null && this.UserDetails.SCCBRQ != " " && this.UserDetails.SCCBRQ != "") {
                    sccbrq = this.UserDetails.SCCBRQ; //上一次抄表日期
                }
                if (this.UserDetails.ZXCBRQ != null && this.UserDetails.ZXCBRQ != " " && this.UserDetails.ZXCBRQ != "") {
                    zxcbrq = this.UserDetails.ZXCBRQ; //近三期最小周期抄表日期
                }
                if (this.UserDetails.JSYYSL != null && this.UserDetails.JSYYSL != " " && this.UserDetails.JSYYSL != "") {
                    sl = this.UserDetails.JSYYSL.split("/");
                }
                if (this.HBRQ != null && this.HBRQ != " " && this.HBRQ != "") {
                    if (sccbrq != "") {
                        changeTable = this.tab(this.HBRQ, sccbrq); //是否换表
                    }
                }

                for (var i = 0; i < sl.length; i++) {
                    zsl += parseInt(sl[i]);
                }
                if (zxcbrq != "" && sccbrq != "") {
                    //alert(zxcbrq);
                    //alert(sccbrq);
                    day = this.getDaysBetween(zxcbrq, sccbrq); //周期天数
                }

                //判断是否是换表
                if (this.CLFS == 3) { //换表
                    var waterSFSZJHB = true;
                    var waterSFSFB = false;
                    var waterSCCBRQ = sccbrq;
                    var newyear = Time("year"); //获取系统的年；
                    var newmonth = Time("month"); //获取系统月份，由于月份是从0开始计算，所以要加1
                    var newday = Time("day"); //获取系统日
                    var waterBCCBRQ = newyear + '-' + newmonth + '-' + newday;
                    var waterHBRQ = this.HBRQ;
                    var waterQD = "";
                    var waterZD = "";
                    var waterXBQD = "";
                    var waterXBZD = "";
                    if (this.SLLRFS == 1) { //正常
                        var waterQD = this.UserDetails.QD;
                        var waterZD = (this.ZD == "" ? 0 : this.ZD);
                        var waterXBQD = (this.XBQD == "" ? 0 : this.XBQD);
                        var waterXBZD = (this.XBZD == "" ? 0 : this.XBZD);
                    } else if (this.SLLRFS == 2) { //估抄
                        waterSFSZJHB = false;
                        if (sccbrq != "") {
                            var estimatedOptions = {
                                waterQD: this.UserDetails.QD, //起度
                                waterZD: (this.ZD == "" ? 0 : this.ZD), //止度
                                waterZSL: zsl, //周期总水量
                                waterZTS: day, //周期总天数
                                waterSCCBRQ: sccbrq, //上次抄表日期
                                waterBCCBRQ: this.HBRQ //本次抄表日期
                            }
                            this.JBYL = estimatedAlgorithm(estimatedOptions);
                            this.ZD = parseInt(this.UserDetails.QD) + parseInt(this.JBYL);

                            waterQD = this.UserDetails.QD;
                            waterZD = (this.ZD == "" ? 0 : this.ZD);
                            waterXBQD = (this.XBQD == "" ? 0 : this.XBQD);
                            waterXBZD = (this.XBZD == "" ? 0 : this.XBZD);
                        } else {
                            waterQD = 0;
                            waterZD = 0;
                            waterXBQD = (this.XBQD == "" ? 0 : this.XBQD);
                            waterXBZD = (this.XBZD == "" ? 0 : this.XBZD);
                        }

                    } else if (this.SLLRFS == 3) { //翻表
                        waterSFSFB = true;
                        waterQD = this.UserDetails.QD;
                        waterZD = (this.ZD == "" ? 0 : this.ZD);
                        waterXBQD = (this.XBQD == "" ? 0 : this.XBQD);
                        waterXBZD = (this.XBZD == "" ? 0 : this.XBZD);
                    }

                    var options = {
                            waterSFSZJHB: waterSFSZJHB, //是否是周检换表
                            waterSFSFB: waterSFSFB, //是否是翻表
                            waterSBLC: waterSBLC, //水表量程
                            waterSCCBRQ: waterSCCBRQ, //上次抄表日期
                            waterBCCBRQ: waterBCCBRQ, //本次抄表日期
                            waterHBRQ: waterHBRQ, //换表日期
                            waterQD: waterQD, //旧表起度
                            waterZD: waterZD, //旧表止度
                            waterXBQD: waterXBQD, //新表起度
                            waterXBZD: waterXBZD, //新表止度
                        }
                        //alert(JSON.stringify(options));
                    result = inTheTableAlgorithm(options);

                } else {
                    if (this.SLLRFS == 1) { //正常
                        var normalOptions = {
                            waterSFFB: false, //是否是翻表 true 表示是 false表示不是
                            waterSBLC: waterSBLC, //水表量程
                            waterQD: this.UserDetails.QD, //止度
                            waterZD: (this.ZD == "" ? 0 : this.ZD) //起度
                        }
                        result = normalAlgorithm(normalOptions);
                    } else if (this.SLLRFS == 2) { //估抄
                        var newyear = Time("year"); //获取系统的年；
                        var newmonth = Time("month"); //获取系统月份，由于月份是从0开始计算，所以要加1
                        var newday = Time("day"); //获取系统日
                        var waterBCCBRQ = newyear + '-' + newmonth + '-' + newday;
                        var estimatedOptions = {
                            waterQD: this.UserDetails.QD, //起度
                            waterZD: (this.ZD == "" ? 0 : this.ZD), //止度
                            waterZSL: zsl, //周期总水量
                            waterZTS: day, //周期总天数
                            waterSCCBRQ: sccbrq, //上次抄表日期
                            waterBCCBRQ: waterBCCBRQ //本次抄表日期
                        }
                        result = estimatedAlgorithm(estimatedOptions);
                        this.ZD = parseInt(this.UserDetails.QD) + parseInt(result);
                    } else if (this.SLLRFS == 3) { //翻表
                        var normalOptions = {
                            waterSFFB: true, //是否是翻表 true 表示是 false表示不是
                            waterSBLC: waterSBLC, //水表量程
                            waterQD: this.UserDetails.QD, //止度
                            waterZD: (this.ZD == "" ? 0 : this.ZD) //起度
                        }
                        result = normalAlgorithm(normalOptions);
                    }
                }
                //通过新表计算旧表的
                if (this.CLFS == 3 && this.SLLRFS == 2 && sccbrq == "" && this.UserDetails.JSYYSL == "0/0/0") {
                    if (this.HBRQ != "") {
                        var zsl = result; //新表的总水量。
                        var zts = getCurrentMeterReadingCycle(new Date(), this.HBRQ); //新表的周期中天数
                        var rpjsl = 0;
                        if (zts > 0) {
                            rpjsl = zsl / zts;
                        }

                        var currentCycles = getCurrentMeterReadingCycle(this.HBRQ, this.UserDetails.QYRQ); //旧表的周期天数
                        var monoy = Math.round(rpjsl * currentCycles);
                        var zd = parseInt(this.UserDetails.QD) + parseInt(monoy);
                        //alert("总水量：" + zsl + "总天数：" + zts + "日平均水量：" + rpjsl + "旧表周期天数：" + currentCycles + "旧表水量：" + monoy + "旧表止度：" + zd);
                        this.ZD = zd; //旧表zd
                        this.YL = result + monoy;
                    }
                } else {
                    this.YL = result;
                }
                this.SJSL = this.YL;

                // var ret = db.selectSqlSync({
                //     name: 'CBtest',
                //     sql: 'select * from MRM_USERBIG_BEAN where YHBH="' + this.UserDetails.YHBH + '" and SBYT="总表" and userName="' + this.LoginName + '"'
                // });
                // if (ret.status) {
                //     if (ret.data.length > 0) { //当前用户是总表
                //         var ret = db.selectSqlSync({
                //             name: 'CBtest',
                //             sql: 'select * from MRM_USERBIG_BEAN where ZBBH in (select YHBH from MRM_USERBIG_BEAN where YHBH="' + this.UserDetails.YHBH + '" and SBYT="总表" and userName="' + this.LoginName + '") and userName="' + this.LoginName + '" and CBBZ="0"'
                //         });
                //         if (ret.status) {
                //             if (ret.data.length < 1) { //当前用户是总表,且子表已经抄完
                //                 var ret = db.selectSqlSync({
                //                     name: 'CBtest',
                //                     sql: 'select YHBH,YL from MRM_USERBIG_BEAN where ZBBH in (select YHBH from MRM_USERBIG_BEAN where YHBH="' + this.UserDetails.YHBH + '" and SBYT="总表" and userName="' + this.LoginName + '") and userName="' + this.LoginName + '" and CBBZ="1"'
                //                 });
                //                 if (ret.status) {
                //                     if (ret.data.length > 0) {
                //                         var sum = 0;
                //                         for (var i = 0; i < ret.data.length; i++) {
                //                             sum += parseInt(ret.data[i].YL);
                //                         }
                //                         this.YL = parseInt(this.YL) - parseInt(sum);
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }

                // if (this.UserDetails.ZXBLX == "1") { //该用户是总表
                //     if (this.UserDetails.ZXBJSFS == "2") { //按比例计算
                //         //查询当前总表对应的虚表
                //         var retUser = db.selectSqlSync({
                //             name: 'CBtest',
                //             sql: 'select * from MRM_USERBIG_BEAN where ZXBZBBH="' + this.UserDetails.YHBH + '" and userName="' + this.LoginName + '" order by ZXBJSSX'
                //         });
                //         //alert(JSON.stringify(retUser));
                //         var zsl = Number(this.SJSL);
                //         var sysl = 0;
                //         for (var i = 0; i < retUser.data.length; i++) {
                //             var sl = 0;
                //             if (i == retUser.data.length - 1) {
                //                 sl = zsl - sysl;
                //                 //alert("最后剩余水量：" + sl);
                //             } else {
                //                 if (this.QZFS == "0") { //向下取整
                //                     sl = Math.floor(zsl * parseInt(retUser.data[i].ZXBJSZ) / 100);
                //                     //alert("总水量：" + zsl + "比例：" + parseInt(retUser.data[i].ZXBJSZ) + "向下取整：" + sl);
                //                 } else if (this.QZFS == "1") { //四舍五入
                //                     sl = Math.round(zsl * parseInt(retUser.data[i].ZXBJSZ) / 100);
                //                     //alert("总水量：" + zsl + "比例：" + parseInt(retUser.data[i].ZXBJSZ) + "四舍五入：" + sl);
                //                 } else if (this.QZFS == "2") { //向上取整
                //                     sl = Math.ceil(zsl * parseInt(retUser.data[i].ZXBJSZ) / 100);
                //                     //alert("总水量：" + zsl + "比例：" + parseInt(retUser.data[i].ZXBJSZ) + "向上取整：" + sl);
                //                 }
                //                 sysl = sysl + sl;
                //             }
                //             if (this.UserDetails.YHBH == retUser.data[i].YHBH) {
                //                 this.YL = sl;
                //             }
                //         }
                //     }
                // }

                if (this.YCPDFS == 0) { //按照产品方式计算
                    if (parseInt(this.UserDetails.SCSL) > parseInt(this.YL)) { //水量下降
                        var shun = parseInt(this.UserDetails.SCSL) * this.XFBL / 100;
                        var num = parseInt(this.UserDetails.SCSL) - shun;
                        //alert("水量浮动判断方式：" + this.YCPDFS + "上次水量：" + this.UserDetails.SCSL + "下浮比例：" + this.XFBL + "比值：" + num + "本次水量：" + this.YL);
                        if (parseInt(this.YL) > num) { //正常
                            this.resultType = "正常"
                        } else { //水量突升
                            this.resultType = "水量异常突降"
                        }
                    } else if (parseInt(this.UserDetails.SCSL) < parseInt(this.YL)) { //水量上升
                        var shun = parseInt(this.UserDetails.SCSL) * this.SFBL / 100;
                        var num = parseInt(this.UserDetails.SCSL) + shun;
                        //alert("水量浮动判断方式：" + this.YCPDFS + "上次水量：" + this.UserDetails.SCSL + "上浮比例：" + this.SFBL + "比值：" + num + "本次水量：" + this.YL);
                        if (num > parseInt(this.YL)) { //正常
                            this.resultType = "正常"
                        } else { //水量突升
                            this.resultType = "水量异常突升"
                        }
                    } else {
                        this.resultType = "正常"
                    }
                } else { //按照用水性质浮动比例来计算
                    var qskj = ""; //起始口径
                    var qsysf = ""; //起始运算符
                    var jskj = ""; //结束口径
                    var jsysf = ""; //结束运算符
                    var ret = db.selectSqlSync({
                        name: 'CBtest',
                        sql: 'select * from MRM_STATE_FLOATING where YSXZID="' + this.UserDetails.YSXZID + '" and userName="' + this.LoginName + '"'
                    });
                    if (ret.status) {
                        if (ret.data.length > 0) {
                            for (var i = 0; i < ret.data.length; i++) {
                                qskj = ret.data[i].QSKJ; //起始口径
                                qsysf = ret.data[i].QSYSF; //起始运算符
                                jskj = ret.data[i].JSKJ; //结束口径
                                jsysf = ret.data[i].JSYSF; //结束运算符
                                var sql = 'select * from MRM_USERBIG_BEAN where YHBH="' + this.UserDetails.YHBH + '" and ' + qskj + qsysf + '(KJ+0) and (KJ+0)' + jsysf + jskj + ' and userName="' + this.LoginName + '"';
                                var userdata = db.selectSqlSync({
                                    name: 'CBtest',
                                    sql: sql
                                });
                                if (userdata.status) {
                                    if (userdata.data.length > 0) {
                                        this.XFBL = ret.data[i].XFBL;
                                        this.SFBL = ret.data[i].SFBL;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (parseInt(this.UserDetails.SCSL) > parseInt(this.YL)) { //水量下降
                        var shun = parseInt(this.UserDetails.SCSL) * this.XFBL / 100;
                        var num = parseInt(this.UserDetails.SCSL) - shun;
                        var a = qskj + qsysf + this.UserDetails.KJ + jsysf + jskj + "";
                        //alert("水量浮动判断方式：" + this.YCPDFS + "口径判断范围：" + a + "上次水量：" + this.UserDetails.SCSL + "下浮比例：" + this.XFBL + "比值：" + num + "本次水量：" + this.YL);
                        if (parseInt(this.YL) > num) { //正常
                            this.resultType = "正常"
                        } else { //水量突升
                            this.resultType = "水量异常突降"
                        }
                    } else if (parseInt(this.UserDetails.SCSL) < parseInt(this.YL)) { //水量上升
                        var shun = parseInt(this.UserDetails.SCSL) * this.SFBL / 100;
                        var num = parseInt(this.UserDetails.SCSL) + shun;
                        var a = qskj + qsysf + this.UserDetails.KJ + jsysf + jskj + "";
                        //alert("水量浮动判断方式：" + this.YCPDFS + "口径判断范围：" + a + "上次水量：" + this.UserDetails.SCSL + "上浮比例：" + this.SFBL + "比值：" + num + "本次水量：" + this.YL);
                        if (num > parseInt(this.YL)) { //正常
                            this.resultType = "正常"
                        } else { //水量突升
                            this.resultType = "水量异常突升"
                        }
                    } else {
                        this.resultType = "正常"
                    }
                }
            },
            allSave() { //保存数据并上传
                // if (this.UserDetails.ZXBLX == "1") { //该用户是总表
                //     if (this.UserDetails.ZXBJSFS == "2") { //按比例计算
                //         var retUser = db.selectSqlSync({
                //             name: 'CBtest',
                //             sql: 'select * from MRM_USERBIG_BEAN where ZXBZBBH="' + this.UserDetails.YHBH + '" and userName="' + this.LoginName + '" order by ZXBJSSX'
                //         });
                //         var zblz = 0;
                //         for (var i = 0; i < retUser.data.length; i++) {
                //             zblz = zblz + parseInt(retUser.data[i].ZXBJSZ);
                //         }
                //         if (zblz != 100) { //判断总分表是否下载完。
                //             api.toast({
                //                 msg: '总分表未下载完全，不能抄表',
                //                 duration: 2000,
                //                 location: 'top'
                //             });
                //             this.preventRepeatTouch = false;
                //             return;
                //         }
                //     }
                // }

                // var sql = 'select * from MRM_USERBIG_BEAN where ZBBH in (select YHBH from MRM_USERBIG_BEAN where YHBH="' + this.UserDetails.YHBH + '" and SBYT="总表") and userName="' + this.LoginName + '" and CBBZ="0"';
                // var ret = db.selectSqlSync({
                //     name: 'CBtest',
                //     sql: sql
                // });
                // if (ret.status) {
                //     if (ret.data.length > 0) {
                //         //当前用户是主表且有未抄表的子表。
                //         //跳转到子表
                //         this.ZBBH = this.UserDetails.YHBH;
                //         var UserNumber = this.UserList.findIndex(function(item) {
                //             return item.YHBH == ret.data[0].YHBH;
                //         });
                //         _this = this;
                //         api.confirm({
                //             title: '提示',
                //             msg: '当前用户为总表，请先抄子表',
                //             buttons: ['确定', '取消']
                //         }, function(ret, err) {
                //             var index = ret.buttonIndex;
                //             if (index == 1) {
                //                 if (UserNumber == -1) {
                //                     _this.UserNumber = 0;
                //                 } else {
                //                     _this.UserNumber = UserNumber;
                //                 }
                //             }
                //         });
                //         return;
                //     }
                // }

                if (!this.preventRepeatTouch && this.UserDetails.CBBZ != "1") {
                    this.preventRepeatTouch = true;

                    if (!this.showActualCode) { //不输入实际表码：实际表码默认为度数
                        this.SJBM = this.ZD;
                    }

                    _this = this;
                    objdata = {};
                    onlinestatus = ''
                    yhbh = this.UserDetails.YHBH;
                    var yl = parseInt(this.YL);
                    var qd = this.UserDetails.QD;
                    var zd = this.ZD;
                    var qidu = Number(qd);
                    var zhidu = parseInt(zd);

                    if (this.NeedDegrees && isNaN(parseInt(this.ZD))) {
                        api.toast({
                            msg: '请填写读数',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    } else if (this.NeedDegrees && zhidu < qidu) {
                        if (this.SLLRFS != 3) {
                            api.toast({
                                msg: '水表读数少于起度',
                                duration: 2000,
                                location: 'top'
                            });
                            this.preventRepeatTouch = false;
                            return;
                        }
                    }
                    if (this.NeedConsumption && isNaN(parseInt(this.YL))) {
                        api.toast({
                            msg: '请填写用量',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    }
                    if (this.NeedSJBM && isNaN(parseInt(this.SJBM))) {
                        api.toast({
                            msg: '请填写实际表码',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    }
                    // if (this.NeedXBBH && isNaN(parseInt(this.XBBH))) {
                    //     api.toast({
                    //         msg: '请填写新表表号',
                    //         duration: 2000,
                    //         location: 'top'
                    //     });
                    //     this.preventRepeatTouch = false;
                    //     return;
                    // } else
                    if (this.NeedXBBH && isNaN(parseInt(this.XBQD))) {
                        api.toast({
                            msg: '请填写新表起度',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    } else if (this.NeedXBBH && isNaN(parseInt(this.XBZD))) {
                        api.toast({
                            msg: '请填写新表止度',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    } else if (this.NeedXBBH && parseInt(this.XBZD) < parseInt(this.XBQD)) {
                        api.toast({
                            msg: '新表止度不能少于新表起度',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    }

                    var imgs = $(".imgDiv").length;
                    if (this.ImgData.length == 0 && imgs < 1) {
                        $(".isSaveShow").css({
                            "pointer-events": "none"
                        });
                        if (this.resultType != "正常" && this.resultType != "") {
                            //alert("水量异常：" + this.resultType + "已拍照数：" + this.ImgData.length);
                            this.preventRepeatTouch = false;
                            this.photograph(); //保存时-水量异常-直接打开相机
                            return;
                        } else if (this.SBYXZT != "正常" && this.SBYXZT != "" && this.SBYXZT != " ") {
                            //alert("水表状态非正常拍照。" + this.SBYXZT + "已拍照数：" + this.ImgData.length);
                            this.preventRepeatTouch = false;
                            this.photograph(); //保存时-非正常水表状态-直接打开相机
                            return;
                        } else if (this.UserDetails.SFQZPZ == "1") {
                            //alert("用户强制拍照。" + this.UserDetails.SFQZPZ + "已拍照数：" + this.ImgData.length);
                            this.preventRepeatTouch = false;
                            this.photograph(); //保存时-满足强制拍照-直接打开相机
                            return;
                        }
                    }

                    if (this.resultType != "正常" && this.resultType != "") {
                        //弹出提示
                        api.confirm({
                            title: '提示',
                            msg: this.resultType,
                            buttons: ['继续', '重抄']
                        }, function(ret, err) {
                            var index = ret.buttonIndex;
                            if (index == 0) {
                                _this.preventRepeatTouch = false;
                                return;
                            } else if (index == 1) {
                                gpsmodel.gpsstate(function(ret) {
                                    if (ret.gps == true) {
                                        if (!_this.AbnormalStatus.status) {
                                            vant.Dialog.confirm({
                                                    title: '提示',
                                                    message: '当前用户水量' + _this.AbnormalStatus.text + ',确认保存？',
                                                })
                                                .then(function() {
                                                    _this.LoadOrNot = 1
                                                    api.showProgress({
                                                        title: '保存中',
                                                        modal: false
                                                    });
                                                    _this.saveAndUploadLocation();
                                                })
                                                .catch(function() {
                                                    _this.preventRepeatTouch = false;
                                                    return;
                                                });
                                        } else {
                                            _this.LoadOrNot = 1
                                            api.showProgress({
                                                title: '保存中',
                                                modal: false
                                            });
                                            _this.saveAndUploadLocation();
                                        }
                                    } else {
                                        vant.Toast("无法进行抄表操作,请先打开gps");
                                        _this.preventRepeatTouch = false;
                                    }
                                });
                            } else if (index == 2) {
                                _this.reReadMeter();
                                _this.preventRepeatTouch = false;
                                return;
                            }
                        });
                    } else {
                        gpsmodel.gpsstate(function(ret) {
                            if (ret.gps == true) {
                                if (!_this.AbnormalStatus.status) {
                                    vant.Dialog.confirm({
                                            title: '提示',
                                            message: '当前用户水量' + _this.AbnormalStatus.text + ',确认保存？',
                                        })
                                        .then(function() {
                                            _this.LoadOrNot = 1
                                            api.showProgress({
                                                title: '保存中',
                                                modal: false
                                            });
                                            _this.saveAndUploadLocation();
                                        })
                                        .catch(function() {
                                            _this.preventRepeatTouch = false;
                                            return;
                                        });
                                } else {
                                    _this.LoadOrNot = 1
                                    api.showProgress({
                                        title: '保存中',
                                        modal: false
                                    });
                                    _this.saveAndUploadLocation();
                                }
                            } else {
                                vant.Toast("无法进行抄表操作,请先打开gps");
                                _this.preventRepeatTouch = false;
                            }
                        });
                    }
                } else if (!this.preventRepeatTouch && this.isAppendImg) {
                    this.preventRepeatTouch = true;
                    this.appendImg();
                } else if (this.preventRepeatTouch && !(this.UserDetails.CBBZ == '1' && !this.isAppendImg)) {
                    api.toast({
                        msg: '正在保存，请勿重复点击',
                        duration: 2000,
                        location: 'top'
                    });
                }
            },
            print() { //打印
                _this = this;
                api.openWin({
                    name: 'CountPrint',
                    url: './CountPrint.html',
                    pageParam: {
                        userYHBH: _this.UserDetails.YHBH,
                    }
                });
            },
            saveAndUploadLocation() { //上传保存表位信息
                _this = this;
                var retUser = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USERBIG_BEAN WHERE YHBH=\'' + this.UserDetails.YHBH + '\' and userName="' + this.LoginName + '"'
                });
                var jwd = retUser.data[0].JWD;
                var JWDData = jwd.split(",");
                bMap.getLocation({
                    accuracy: '10m',
                    autoStop: true,
                    filter: 1
                }, function(ret, err) {
                    if (ret.status) {
                        var lon = ret.lon;
                        var lat = ret.lat;
                        if (_this.UserDetails.DWSFSC != "1") {
                            _this.saveAndUploadLocationPublic(JWDData, lon, lat);
                        } else { //表位信息已上传时保存不再更新表位信息
                            _this.saveData(lon, lat);
                        }
                    } else {
                        _this.saveData('', '');
                        // vant.Toast("获取定位失败，请重试");
                        _this.preventRepeatTouch = false;
                        return;
                    }
                });
            },
            saveAndUploadLocationPublic(JWDData, lon, lat) { //上传和保存表位信息公共方法
                _this = this;
                var meterLon = lon;
                var meterLat = lat;
                if (JWDData.length > 1) { //本地有表位信息时取本地数据
                    meterLon = JWDData[0];
                    meterLat = JWDData[1];
                }
                this.upLoctionAjax(meterLon, meterLat, function(ret, err) {
                    var resData;
                    if (ret.Data == "" || ret.Data == " " || ret.Data == undefined || ret.Data == "undefined") {
                        resData = [];
                    } else {
                        resData = JSON.parse(ret.Data);
                    }
                    if (ret && ret.Status == 0 && ((resData.length > 0 && resData.IS_SCCG == "1") || resData.length == 0)) {
                        _this.UserDetails.DWSFSC = "1";
                        var retdb = db.executeSqlSync({
                            name: 'CBtest',
                            sql: 'UPDATE MRM_USERBIG_BEAN SET DWSFSC="1" WHERE YHBH="' + _this.UserDetails.YHBH + '" and userName="' + this.LoginName + '"'
                        });
                    }
                });
                this.saveData(lon, lat);
            },
            saveData(lon, lat) { //保存用户数据到本地
                // if (this.UserDetails.ZXBLX == "1") { //该用户是总表
                //     if (this.UserDetails.ZXBJSFS == "2") { //按比例计算
                //         //查询当前总表对应的虚表
                //         var retUser = db.selectSqlSync({
                //             name: 'CBtest',
                //             sql: 'select * from MRM_USERBIG_BEAN where ZXBZBBH="' + this.UserDetails.YHBH + '" and userName="' + this.LoginName + '" order by ZXBJSSX'
                //         });
                //         //alert(JSON.stringify(retUser));
                //         var zsl = Number(this.SJSL);
                //         var sysl = 0;
                //         for (var i = 0; i < retUser.data.length; i++) {
                //             var sl = 0;
                //             if (i == retUser.data.length - 1) {
                //                 sl = zsl - sysl;
                //                 //alert("最后一位，总水量-前面的水量=" + sl);
                //             } else {
                //                 if (this.QZFS == "0") { //向下取整
                //                     sl = Math.floor(zsl * parseInt(retUser.data[i].ZXBJSZ) / 100);
                //                     //alert("总水量：" + zsl + "比例：" + retUser.data[i].ZXBJSZ + "向下取整后：" + sl);
                //                 } else if (this.QZFS == "1") { //四舍五入
                //                     sl = Math.round(zsl * parseInt(retUser.data[i].ZXBJSZ) / 100);
                //                     //alert("总水量：" + zsl + "比例：" + retUser.data[i].ZXBJSZ + "四舍五入后：" + sl);
                //                 } else if (this.QZFS == "2") { //向上取整
                //                     sl = Math.ceil(zsl * parseInt(retUser.data[i].ZXBJSZ) / 100);
                //                     //alert("总水量：" + zsl + "比例：" + retUser.data[i].ZXBJSZ + "向上取整后：" + sl);
                //                 }
                //                 sysl = sysl + sl;
                //             }
                //             if (this.UserDetails.YHBH == retUser.data[i].YHBH) {
                //                 this.YL = sl;
                //             } else {
                //                 var zd = parseInt(retUser.data[i].QD) + sl;
                //                 var sllrfs = this.SLLRFS;
                //                 var sbyxzt = this.SBYXZT == "" ? "正常" : this.SBYXZT;
                //                 var sql = 'UPDATE MRM_USERBIG_BEAN SET SLLRFS="' + sllrfs +
                //                     '",ZD="' + zd +
                //                     '",YL="' + sl +
                //                     '",SJSL="' + sl +
                //                     '",SBYXZT="' + sbyxzt +
                //                     '",CBRQ="' + dataTime() +
                //                     '",CBBZ="1",YLZT="正常" WHERE YHBH="' + retUser.data[i].YHBH + '" and userName="' + this.LoginName + '"';
                //                 var ret = db.executeSqlSync({
                //                     name: 'CBtest',
                //                     sql: sql
                //                 });
                //             }
                //         }
                //     }
                // }
                var yl = Number(this.YL);
                var qd = this.UserDetails.QD;
                var zd = Number(this.ZD);
                var sjbm = Number(this.SJBM);
                var xbbh = this.XBBH;
                var hbrq = this.HBRQ;
                var xbqd = this.XBQD;
                var xbzd = this.XBZD;
                var path = this.PATH;
                var sfgc = this.SLLRFS == 2 ? "1" : "0";
                var byxzt = this.BYXZT == "" ? 1 : this.BYXZT;
                var sbyxzt = this.SBYXZT == "" ? "正常" : this.SBYXZT;
                var slzt = this.AbnormalStatus.value;
                var clfs = this.CLFS;
                var ylzt = this.resultType;
                var sllrfs = this.SLLRFS;
                var sjsl = this.SJSL;
                var gzyy = "";
                var ret = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_METERSTATE_BEAN WHERE BH="' + byxzt + '" and userName="' + this.LoginName + '"'
                });
                if (ret.status && ret.data.length > 0) {
                    if (ret.data[0].GZYY != null && ret.data[0].GZYY != "null" && ret.data[0].GZYY != "") {
                        gzyy = ret.data[0].GZYY;
                    }
                }

                var sql = 'UPDATE MRM_USERBIG_BEAN SET SLLRFS="' + sllrfs + '", YLZT="' + ylzt + '", CLFS="' + clfs + '", ZD="' + zd + '",SFGC="' + sfgc + '",YL="' + yl + '",SJSL="' + sjsl + '",CBRQ="' + dataTime() + '",CBBZ="1",BYXZT="' + byxzt + '",CBYSZJD="' + lon + '",CBYSZWD="' + lat + '",SBYXZT="' +
                    sbyxzt + '",SJBM="' + sjbm + '",XBBH = "' + xbbh + '",ZHHBRQ = "' + hbrq + '",XBQD = "' + xbqd + '",XBZD = "' + xbzd + '",SLZT = "' + slzt + '",PATH = "' + path + '",GZYY="' + gzyy + '" WHERE YHBH="' + this.UserDetails.YHBH + '" and userName="' + this.LoginName + '"';
                var ret = db.executeSqlSync({
                    name: 'CBtest',
                    sql: sql
                });
                _this = this;
                if (ret.status = true) {
                    // 保存成功修改抄表本已抄和未抄
                    var retUser = db.selectSqlSync({
                        name: 'CBtest',
                        sql: 'SELECT * FROM MRM_USERBIG_BEAN WHERE ZXBLX!="2" AND CBBZ="1" and userName="' + this.LoginName + '"'
                    });
                    var retUsers = db.selectSqlSync({
                        name: 'CBtest',
                        sql: 'SELECT * FROM MRM_USERBIG_BEAN WHERE ZXBLX!="2" and userName="' + this.LoginName + '"'
                    });

                    var wcusers = retUsers.data.length - retUser.data.length
                    var retBooks = db.executeSqlSync({
                        name: 'CBtest',
                        sql: 'UPDATE MRM_BOOKSBIG_BEAN SET YC=\'' + retUser.data.length + '\' , WC=\'' + wcusers + '\' WHERE userName="' + this.LoginName + '"'
                    });
                    this.UserDetails.ZD = this.ZD;
                    this.UserDetails.SFGC = sfgc;
                    this.UserDetails.YL = this.YL;
                    this.UserDetails.CBRQ = dataTime();
                    this.UserDetails.CBBZ = '1';
                    this.UserDetails.BYXZT = byxzt;
                    this.UserDetails.CBYSZJD = lon;
                    this.UserDetails.CBYSZWD = lat;
                    this.UserDetails.SBYXZT = sbyxzt;
                    this.UserDetails.SJBM = this.SJBM;
                    this.UserDetails.XBBH = this.XBBH;
                    this.UserDetails.ZHHBRQ = this.HBRQ;
                    this.UserDetails.XBQD = this.XBQD;
                    this.UserDetails.XBZD = this.XBZD;
                    this.UserDetails.PATH = this.PATH;
                    this.insertPhotoIntoDB();
                    // vant.Toast("保存成功");

                    this.save();
                }
            },
            save() {
                if (api.connectionType != 'none') {
                    _this.uploaderMeterLocationImg();
                    if (this.sendUpload != "true" && this.sendUploadPicture != "true") {
                        vant.Toast("保存本地成功");
                        api.hideProgress();
                        _this.LoadOrNot = 0;
                        //保存完成判断是否是从主表跳转过来的，如果是就跳回去
                        if (_this.ZBBH == "") {
                            if (this.sendNext == "true") {
                                setTimeout(function() {
                                    _this.nextHousehold();
                                    _this.preventRepeatTouch = false;
                                }, 300);
                            } else {
                                _this.preventRepeatTouch = false;
                            }
                        } else {
                            //搜索
                            var UserNumber = this.UserList.findIndex(function(item) {
                                return item.YHBH == _this.ZBBH;
                            });
                            if (UserNumber == -1) {
                                this.UserNumber = 0;
                            } else {
                                this.UserNumber = UserNumber;
                            }
                            _this.ZBBH = "";
                            _this.preventRepeatTouch = false;
                        }
                    } else {
                        if (this.sendUpload == "true" && this.sendUploadPicture == "true") {
                            //保存后自动上传数据和图片
                            _this.uploader(0);
                        } else {
                            if (this.sendUpload == "true") {
                                // 保存后自动上传数据
                                _this.uploader(1);
                            }
                            if (this.sendUploadPicture == "true") {
                                // 保存后自动上传照片
                                _this.uploaderImg(false, true);
                            }
                        }
                    }
                } else {
                    vant.Toast("保存本地成功");
                    api.hideProgress();
                    _this.LoadOrNot = 0
                    if (this.ZBBH == "") {
                        if (this.sendNext == "true") {
                            setTimeout(function() {
                                _this.nextHousehold();
                                _this.preventRepeatTouch = false;
                            }, 300);
                        } else {
                            _this.preventRepeatTouch = false;
                        }
                    } else {
                        //搜索
                        var UserNumber = this.UserList.findIndex(function(item) {
                            return item.YHBH == _this.ZBBH;
                        });
                        if (UserNumber == -1) {
                            this.UserNumber = 0;
                        } else {
                            this.UserNumber = UserNumber;
                        }
                        _this.ZBBH = "";
                        _this.preventRepeatTouch = false;
                    }
                }
            },
            uploader(status) { //上传数据
                _this = this;
                var statusOne = status;
                var ret1 = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USERBIG_BEAN WHERE YHBH=\'' + this.UserDetails.YHBH + '\' AND CBBZ="1" and userName="' + this.LoginName + '"'
                });
                var retbooks = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_BOOKSBIG_BEAN WHERE userName="' + this.LoginName + '"'
                });
                var UsersDatalisYHBH = this.UserDetails.YHBH;
                var checkCode = retbooks.data[0].YZM;
                var cUserDetails = ret1.data[0];

                if (ret1.status) {
                    var records = [];
                    var user = {
                        "YHBH": cUserDetails.YHBH,
                        "QD": cUserDetails.QD,
                        "ZD": cUserDetails.ZD,
                        "YL": cUserDetails.SJSL,
                        "CBRQ": cUserDetails.CBRQ,
                        "BYXZT": cUserDetails.BYXZT,
                        "JD": cUserDetails.CBYSZJD,
                        "WD": cUserDetails.CBYSZWD,
                        "BZ": "",
                        "RESON": cUserDetails.GZYY
                    }
                    records.push(user);
                    var Parameter = {
                        "ClientId": api.deviceId,
                        "ClientName": api.deviceModel,
                        "OperatorId": $api.getStorage('cbOperatorId'),
                        "OperatorName": $api.getStorage('cbOperatorName'),
                        "Required": "",
                        "Type": "240",
                        "Records": records
                    };
                    var body = {
                            body: JSON.stringify({
                                "UserName": $api.getStorage('cbOperatorName'),
                                "Password": $api.getStorage('cbPassword'),
                                "SerialNo": dataTime(),
                                "Method": "R999",
                                "Parameter": JSON.stringify(Parameter)
                            })
                        }
                        //alert(body.body);
                        //console.log(body.body);
                    fnPostNoProcess('', body, 'application/json', false, function(ret, err) {
                        //alert(JSON.stringify(ret));
                        if (statusOne != 0) {
                            // 开启一个，开启了数据上传就隐藏
                            api.hideProgress();
                            _this.LoadOrNot = 0
                        }
                        if (ret) {
                            var resData;
                            if (ret.Data == "" || ret.Data == undefined || ret.Data == "undefined" || ret.Data == " ") {
                                resData = [];
                            } else {
                                resData = JSON.parse(ret.Data);
                            }
                            if (ret.Status == 0 && ((resData.length > 0 && resData.IS_SCCG == "1") || resData.length == 0)) {
                                var ret = db.executeSqlSync({
                                    name: 'CBtest',
                                    sql: 'update MRM_USERBIG_BEAN set CWXX=" ", ZTSCCG=1, XGXXSC=1, SFXG=0, SFSC=1 where YHBH="' + cUserDetails.YHBH + '" and userName="' + this.LoginName + '"'
                                });
                                if (statusOne == 0) {
                                    _this.uploaderImg(false, true)
                                } else {
                                    api.toast({
                                        msg: '数据上传成功',
                                        duration: 2000,
                                        location: 'top'
                                    });
                                    if (_this.ZBBH == "") {
                                        if (_this.sendNext == "true") {
                                            setTimeout(function() {
                                                _this.nextHousehold();
                                                _this.preventRepeatTouch = false;
                                            }, 300);
                                        } else {
                                            _this.preventRepeatTouch = false;
                                        }
                                    } else {
                                        //搜索
                                        var UserNumber = this.UserList.findIndex(function(item) {
                                            return item.YHBH == _this.ZBBH;
                                        });
                                        if (UserNumber == -1) {
                                            this.UserNumber = 0;
                                        } else {
                                            this.UserNumber = UserNumber;
                                        }
                                        _this.ZBBH = "";
                                        _this.preventRepeatTouch = false;
                                    }
                                }
                            } else {
                                if (resData.length == 0) {
                                    //alert("没有错误信息");
                                } else {
                                    for (var i = 0; i < resData.length; i++) {
                                        var ret = db.executeSqlSync({
                                            name: 'CBtest',
                                            sql: 'update MRM_USERBIG_BEAN set CWXX="' + resData[i].SCSB_MESSAGE + '" where YHBH="' + resData[i].YHBH + '" and userName="' + this.LoginName + '"'
                                        });
                                    }
                                }
                                api.hideProgress();
                                _this.LoadOrNot = 0
                                api.toast({
                                    msg: '数据上传失败，已保存本地',
                                    duration: 2000,
                                    location: 'top'
                                });
                                _this.preventRepeatTouch = false;
                            }
                        } else {
                            api.hideProgress();
                            _this.LoadOrNot = 0
                            api.toast({
                                msg: '网络连接超时,数据已保存本地',
                                duration: 2000,
                                location: 'top'
                            });
                            _this.preventRepeatTouch = false;
                        }
                    });
                }
            },
            uploaderImg(showProgress, turnToNext) { //上传抄表图片
                _this = this;
                if (showProgress) {
                    _this.LoadOrNot = 1
                    api.showProgress({
                        title: '保存图片中',
                        modal: false
                    });
                }
                var retimage = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_PHOTOS_BEAN WHERE YHBH="' + this.UserDetails.YHBH + '" and SFSC="0" AND NotLoction = "2" and userName="' + this.LoginName + '"'
                });
                if (retimage.status) {
                    if (retimage.data.length > 0) {
                        loaderdata = retimage.data;
                        loader = retimage.data.length;
                        _this.imguploader(loaderdata, loader, 0, loader, turnToNext, false);
                    } else {
                        api.hideProgress();
                        _this.LoadOrNot = 0
                        if (_this.ZBBH == "") {
                            if (_this.sendNext == "true" && turnToNext) {
                                setTimeout(function() {
                                    _this.nextHousehold();
                                    _this.preventRepeatTouch = false;
                                }, 300);
                            } else {
                                _this.preventRepeatTouch = false;
                            }
                        } else {
                            //搜索
                            var UserNumber = this.UserList.findIndex(function(item) {
                                return item.YHBH == _this.ZBBH;
                            });
                            if (UserNumber == -1) {
                                this.UserNumber = 0;
                            } else {
                                this.UserNumber = UserNumber;
                            }
                            _this.ZBBH = "";
                            _this.preventRepeatTouch = false;
                        }
                    }
                }
            },
            uploaderMeterLocationImg() { //上传表位图片
                _this = this;
                var retimage = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_PHOTOS_BEAN WHERE YHBH="' + this.UserDetails.YHBH + '" and SFSC="0" AND NotLoction = "1" and userName="' + this.LoginName + '"'
                });
                if (retimage.status) {
                    if (retimage.data.length > 0) {
                        loaderdata = retimage.data;
                        loader = retimage.data.length;
                        _this.imguploader(loaderdata, loader, 0, loader, false, true);
                    }
                }
            },
            imguploader(loaderdata, loader, n, falseNum, turnToNext, isMeterLocation) { //调用上传图片接口
                var PhotoType;
                if (loaderdata[n].NotLoction == '2') {
                    PhotoType = '5'; //重点贸易表抄表图片
                } else {
                    PhotoType = '4'; //表位图片
                }
                var photoList = loaderdata[n];
                _this = this;

                var Parameter = {
                    "ClientId": api.deviceId,
                    "ClientName": api.deviceModel,
                    "OperatorId": $api.getStorage('cbOperatorId'),
                    "OperatorName": $api.getStorage('cbOperatorName'),
                    "Yhbh": photoList.YHBH,
                    "PhotoName": photoList.ZPMC,
                    "PhotoType": PhotoType,
                    "Longitude": photoList.JD,
                    "Latitude": photoList.WD,
                    "OrderNo": "",
                    "Errtype": "",
                    "Remark": "",
                    "Type": "302",
                    "PhotoInfo": ""
                };
                var FileUrlArr = [];
                FileUrlArr.push(photoList.ZPLJ);
                //alert(JSON.stringify(Parameter));
                //alert(JSON.stringify(FileUrlArr));
                fnPostPhoto('', Parameter, FileUrlArr, 'application/json', false, function(ret, err) {
                    if (ret) {
                        if (ret.Status == 0) {
                            var ret = db.executeSqlSync({
                                name: 'CBtest',
                                sql: 'update MRM_PHOTOS_BEAN set SFSC=1 where _id="' + photoList._id + '" and userName="' + _this.LoginName + '"'
                            });
                            _this.ImgData.forEach(function(item) {
                                if (item.path == photoList.ZPLJ) {
                                    item.isAppend = false;
                                }
                            });
                            falseNum--;
                        }
                    }
                    if ((n + 1) < loader) {
                        n++;
                        _this.imguploader(loaderdata, loader, n, falseNum, turnToNext, isMeterLocation);
                    } else {
                        if (!isMeterLocation) {
                            api.hideProgress();
                            _this.LoadOrNot = 0
                            if (falseNum == 0) {
                                api.toast({
                                    msg: '上传成功',
                                    duration: 2000,
                                    location: 'top'
                                });
                                if (_this.ZBBH == "") {
                                    if (_this.sendNext == "true" && turnToNext) {
                                        setTimeout(function() {
                                            _this.nextHousehold();
                                            _this.preventRepeatTouch = false;
                                        }, 300);
                                    } else {
                                        _this.preventRepeatTouch = false;
                                    }
                                } else {
                                    //搜索
                                    var UserNumber = this.UserList.findIndex(function(item) {
                                        return item.YHBH == _this.ZBBH;
                                    });
                                    if (UserNumber == -1) {
                                        this.UserNumber = 0;
                                    } else {
                                        this.UserNumber = UserNumber;
                                    }
                                    _this.ZBBH = "";
                                    _this.preventRepeatTouch = false;
                                }
                            } else {
                                vant.Dialog.alert({
                                        title: '提示',
                                        message: '存在上传失败的图片，请到数据上传页面重新上传',
                                    })
                                    .then(function() {
                                        if (_this.ZBBH == "") {
                                            if (_this.sendNext == "true" && turnToNext) {
                                                setTimeout(function() {
                                                    _this.nextHousehold();
                                                    _this.preventRepeatTouch = false;
                                                }, 300);
                                            } else {
                                                _this.preventRepeatTouch = false;
                                            }
                                        } else {
                                            //搜索
                                            var UserNumber = this.UserList.findIndex(function(item) {
                                                return item.YHBH == _this.ZBBH;
                                            });
                                            if (UserNumber == -1) {
                                                this.UserNumber = 0;
                                            } else {
                                                this.UserNumber = UserNumber;
                                            }
                                            _this.ZBBH = "";
                                            _this.preventRepeatTouch = false;
                                        }
                                    })
                            }
                        }
                    }
                });
                // api.ajax({
                //     url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info',
                //     method: 'post',
                //     timeout: 30,
                //     data: {
                //         values: {
                //             Method: 'R999',
                //             UserName: $api.getStorage('cbOperatorName'), //"01012"
                //             Password: $api.getStorage('cbPassword'), // "g6OuZomFp3E="
                //             SerialNo: dataTime(),
                //             KeyCode: '', //营业
                //             Parameter: JSON.stringify(Parameter)
                //         },
                //         files: {
                //             file: FileUrlArr
                //         }
                //     }
                // }, function(ret, err) {
                //     //alert(JSON.stringify(ret));
                //     if (ret) {
                //         if (ret.Status == 0) {
                //             var ret = db.executeSqlSync({
                //                 name: 'CBtest',
                //                 sql: 'update MRM_PHOTOS_BEAN set SFSC=1 where _id="' + photoList._id + '" and userName="' + _this.LoginName + '"'
                //             });
                //             _this.ImgData.forEach(function(item) {
                //                 if (item.path == photoList.ZPLJ) {
                //                     item.isAppend = false;
                //                 }
                //             });
                //             falseNum--;
                //         }
                //     }
                //     if ((n + 1) < loader) {
                //         n++;
                //         _this.imguploader(loaderdata, loader, n, falseNum, turnToNext, isMeterLocation);
                //     } else {
                //         if (!isMeterLocation) {
                //             api.hideProgress();
                //             _this.LoadOrNot = 0
                //             if (falseNum == 0) {
                //                 api.toast({
                //                     msg: '上传成功',
                //                     duration: 2000,
                //                     location: 'top'
                //                 });
                //                 if (_this.ZBBH == "") {
                //                     if (_this.sendNext == "true" && turnToNext) {
                //                         setTimeout(function() {
                //                             _this.nextHousehold();
                //                             _this.preventRepeatTouch = false;
                //                         }, 300);
                //                     } else {
                //                         _this.preventRepeatTouch = false;
                //                     }
                //                 } else {
                //                     //搜索
                //                     var UserNumber = this.UserList.findIndex(function(item) {
                //                         return item.YHBH == _this.ZBBH;
                //                     });
                //                     if (UserNumber == -1) {
                //                         this.UserNumber = 0;
                //                     } else {
                //                         this.UserNumber = UserNumber;
                //                     }
                //                     _this.ZBBH = "";
                //                     _this.preventRepeatTouch = false;
                //                 }
                //             } else {
                //                 vant.Dialog.alert({
                //                         title: '提示',
                //                         message: '存在上传失败的图片，请到数据上传页面重新上传',
                //                     })
                //                     .then(function() {
                //                         if (_this.ZBBH == "") {
                //                             if (_this.sendNext == "true" && turnToNext) {
                //                                 setTimeout(function() {
                //                                     _this.nextHousehold();
                //                                     _this.preventRepeatTouch = false;
                //                                 }, 300);
                //                             } else {
                //                                 _this.preventRepeatTouch = false;
                //                             }
                //                         } else {
                //                             //搜索
                //                             var UserNumber = this.UserList.findIndex(function(item) {
                //                                 return item.YHBH == _this.ZBBH;
                //                             });
                //                             if (UserNumber == -1) {
                //                                 this.UserNumber = 0;
                //                             } else {
                //                                 this.UserNumber = UserNumber;
                //                             }
                //                             _this.ZBBH = "";
                //                             _this.preventRepeatTouch = false;
                //                         }
                //                     })
                //             }
                //         }
                //     }
                // });
            },
            uploadWorkOrder(gzyy) { //上传异常记录
                _this = this;
                if (_this.PhotoIndex < _this.ImgData.length) {
                    if (_this.ImgData[_this.PhotoIndex].data.NotLoction == 1) {
                        _this.PhotoIndex++;
                        _this.uploadWorkOrder(gzyy);
                    } else {
                        var fs = api.require('fs');
                        fs.getAttribute({
                            path: _this.ImgData[_this.PhotoIndex].path
                        }, function(ret, err) {
                            if (ret.status) {
                                var wjdx = ret.attribute.size;
                                var path = _this.ImgData[_this.PhotoIndex].path;
                                var filename = path.substring(path.lastIndexOf("/") + 1, path.length);

                                var photo = {
                                    "WJMC": filename,
                                    "PATH": _this.ImgData[_this.PhotoIndex].path,
                                    "WJDX": wjdx,
                                    "BZ": "",
                                    "TITLE": filename,
                                }
                                _this.Records.push(photo);
                                _this.FileUrlArr.push(_this.ImgData[_this.PhotoIndex].path);
                                _this.PhotoIndex++;
                                _this.uploadWorkOrder(gzyy);
                            } else {
                                var path = _this.ImgData[_this.PhotoIndex].path;
                                var filename = path.substring(path.lastIndexOf("/") + 1, path.length);

                                var photo = {
                                    "WJMC": filename,
                                    "PATH": _this.ImgData[_this.PhotoIndex].path,
                                    "WJDX": "",
                                    "BZ": "",
                                    "TITLE": filename,
                                }
                                _this.Records.push(photo);
                                _this.FileUrlArr.push(_this.ImgData[_this.PhotoIndex].path);
                                _this.PhotoIndex++;
                                _this.uploadWorkOrder(gzyy);
                            }
                        });
                    }
                } else {
                    var ret = db.selectSqlSync({
                        name: 'CBtest',
                        sql: 'select * from MRM_WORKORDER_BEAN WHERE YHBH="' + _this.UserDetails.YHBH + '" and SFSC="1" and userName="' + _this.LoginName + '"'
                    });
                    if (ret.status) {
                        if (ret.data.length > 0) {
                            _this.save();
                        } else {
                            var ret = db.executeSqlSync({
                                name: 'CBtest',
                                sql: 'delete from MRM_WORKORDER_BEAN WHERE YHBH="' + _this.UserDetails.YHBH + '" and userName="' + this.LoginName + '"'
                            });
                            var sql = "INSERT INTO MRM_WORKORDER_BEAN (userName, YHBH, YHMC, YHDZ, SBKJ, YYMS, BZ, SFSC) VALUES " +
                                "('" + _this.LoginName +
                                "', '" + _this.UserDetails.YHBH +
                                "', '" + _this.UserDetails.YHMC +
                                "', '" + _this.UserDetails.YHDZ +
                                "', '" + _this.UserDetails.KJ +
                                "', '', '" + gzyy +
                                "', '0')";
                            //console.log(sql);
                            var workOrderData = db.executeSqlSync({
                                name: 'CBtest',
                                sql: sql
                            });
                            if (workOrderData.status) {
                                //保存异常记录成功
                                var yhbh = _this.UserDetails.YHBH == null ? "" : _this.UserDetails.YHBH;
                                var yhmc = _this.UserDetails.YHMC == null ? "" : _this.UserDetails.YHMC;
                                var yhdz = _this.UserDetails.YHDZ == null ? "" : _this.UserDetails.YHDZ;
                                var sbkj = _this.UserDetails.KJ == null ? "" : _this.UserDetails.KJ;
                                var yddh = _this.UserDetails.YDDH == null ? "" : _this.UserDetails.YDDH;
                                var sbrdh = $api.getStorage('cbOperatorMoblie') == null ? "" : $api.getStorage('cbOperatorMoblie');
                                var Required = 'YHBH=' + yhbh +
                                    '&YHMC=' + yhmc +
                                    '&YHDZ=' + yhdz +
                                    '&SBKJ=' + sbkj +
                                    '&LXRDH=' + yddh +
                                    '&SBRDH=' + sbrdh +
                                    '&GZYY=' + gzyy +
                                    '&BZ=';

                                var Parameter = {
                                    "ClientId": api.deviceId,
                                    "ClientName": api.deviceModel,
                                    "OperatorId": $api.getStorage('cbOperatorId'),
                                    "OperatorName": $api.getStorage('cbOperatorName'),
                                    "Required": Required,
                                    "Type": "239",
                                    "Records": _this.Records
                                };
                                var values = {
                                    Method: 'R999',
                                    UserName: $api.getStorage('cbOperatorName'), //"01012"
                                    Password: $api.getStorage('cbPassword'), // "g6OuZomFp3E="
                                    SerialNo: dataTime(),
                                    KeyCode: '', //营业
                                    Parameter: JSON.stringify(Parameter)
                                }
                                fnPostPhoto('', Parameter, _this.FileUrlArr, 'application/json', false, function(ret, err) {
                                    if (ret) {
                                        if (ret.Status == 0) {
                                            var ret = db.executeSqlSync({
                                                name: 'CBtest',
                                                sql: 'update MRM_WORKORDER_BEAN set SFSC=1 where YHBH="' + _this.UserDetails.YHBH + '" and userName="' + _this.LoginName + '"'
                                            });
                                        }
                                    }
                                    _this.save();
                                });
                                // api.ajax({
                                //     url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info',
                                //     method: 'post',
                                //     timeout: 60,
                                //     data: {
                                //         values: {
                                //             Method: 'R999',
                                //             UserName: $api.getStorage('cbOperatorName'), //"01012"
                                //             Password: $api.getStorage('cbPassword'), // "g6OuZomFp3E="
                                //             SerialNo: dataTime(),
                                //             KeyCode: '', //营业
                                //             Parameter: JSON.stringify(Parameter)
                                //         },
                                //         files: {
                                //             file: _this.FileUrlArr
                                //         }
                                //     }
                                // }, function(ret, err) {
                                //     if (ret) {
                                //         if (ret.Status == 0) {
                                //             var ret = db.executeSqlSync({
                                //                 name: 'CBtest',
                                //                 sql: 'update MRM_WORKORDER_BEAN set SFSC=1 where YHBH="' + _this.UserDetails.YHBH + '" and userName="' + _this.LoginName + '"'
                                //             });
                                //         }
                                //     }
                                //     _this.save();
                                // });
                            } else {
                                _this.save();
                            }
                        }
                    } else {
                        _this.save();
                    }
                }
            },
            appendImg() { //已抄追加图片
                this.insertPhotoIntoDB();
                if (this.sendUploadPicture == "true" && api.connectionType != "none") {
                    this.uploaderImg(true, false);
                } else {
                    for (var i = 0; i < this.ImgData.length; i++) {
                        this.ImgData[i].isAppend = false;
                    }
                    api.toast({
                        msg: '图片保存本地成功',
                        duration: 2000,
                        location: 'top'
                    });
                    this.preventRepeatTouch = false;
                }
            },
            updateQD() {
                if (api.connectionType == "wifi" || api.connectionType == "4g" || api.connectionType == "5g") {
                    var db = api.require('db');
                    var _this = this;
                    var Parameter = {
                        ClientId: api.deviceId,
                        ClientName: api.deviceModel,
                        OperatorId: $api.getStorage('cbOperatorId'),
                        OperatorName: $api.getStorage('cbOperatorName'),
                        Required: `yhbh=${_this.UserDetails.YHBH}`,
                        Type: "133"
                    };
                    var body = {
                        body: JSON.stringify({
                            Method: 'R999',
                            UserName: $api.getStorage("cbOperatorName"), //"01012"
                            Password: $api.getStorage("cbPassword"), // "g6OuZomFp3E="
                            SerialNo: dataTime(),
                            Parameter: JSON.stringify(Parameter)
                        })
                    };
                    fnPost('', body, 'application/json', false, function(ret, err) {
                        api.hideProgress();
                        _this.LoadOrNot = 0
                        if (ret.Status == 0) {
                            var data = JSON.parse(ret.Data);
                            _this.UserDetails.QD = data[0].QD;
                            _this.UserDetails.QD = data[0].QD;
                            var QD = Number(_this.UserDetails.QD);
                            db.executeSql({
                                name: 'CBtest',
                                sql: 'UPDATE MRM_USERBIG_BEAN SET QD="' + QD + '" WHERE YHBH="' + _this.UserDetails.YHBH + '" and userName="' + _this.LoginName + '"'
                            });
                            if (_this.ZD != 0) {
                                _this.getKeyboardNumbers(_this.ZD, true);
                            }

                        }
                    });
                }
            },
            Time(type) {
                var date = new Date()
                var time = null
                switch (type) {
                    case 'year':
                        time = date.getFullYear().toString()
                        break
                    case 'month':
                        time = date.getMonth() + 1
                        time = time.toString().length === 2 ? time : ('0' + time)
                        break
                    case 'day':
                        time = date.getDate()
                        time = time.toString().length === 2 ? time : ('0' + time)
                        break
                    case 'hour':
                        time = date.getHours()
                        time = time.toString().length === 2 ? time : ('0' + time)
                        break
                    case 'minute':
                        time = date.getMinutes()
                        time = time.toString().length === 2 ? time : ('0' + time)
                        break
                    case 'second':
                        time = date.getSeconds()
                        time = time.toString().length === 2 ? time : ('0' + time)
                        break
                }
                return time
            },
            datetime() {
                var year = Time("year"); //获取系统的年；
                var month = Time("month"); //获取系统月份，由于月份是从0开始计算，所以要加1
                var day = Time("day"); //获取系统日
                var hour = Time("hour"); //获取系统时间
                var minute = Time("minute"); //分
                var second = Time("second"); //秒：
                var dayTime = year + month + day + hour + minute + second
                return dayTime;
            },
            getDaysBetween(dateString1, dateString2) {
                //计算两个日期的间隔天数
                var startDate = Date.parse(dateString1);
                var endDate = Date.parse(dateString2);
                var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000);
                return days;
            },
            tab(date1, date2) {
                //判断两个时间的大小
                var oDate1 = new Date(date1);
                var oDate2 = new Date(date2);
                if (oDate1.getTime() > oDate2.getTime()) {
                    return true;
                    console.log('第一个大');
                } else {
                    return false;
                    console.log('第二个大');
                }
            }

        },
        mounted: function() {
            this.initData();
        }
    })
}
