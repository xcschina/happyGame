var Constants = require('./../../config/Constants')
cc.Class({
    extends:cc.Component,

    properties:{
        maxReConnectTime:4,
        ip: {
            default: '',
            type: cc.String
        },

        port: {
            default: 0,
            type: cc.Integer
        }
    },

    init(){
        var self = this
        cc.game.addPersistRootNode(self.node)
        self.m_socket = null
        self.m_msgList = new Array()
    },

    setIp(ip){
        var self = this
        self.ip = ip
    },

    setPort(port){
        var self = this
        self.port = port
    },

    connectSocket (data) {
        var self = this;
        var opts = {
            'force new connection': true,
            'transports':['websocket', 'polling'],
            'reconnection':true,
            'reconnectionDelay':1000,
            'reconnectionDelayMax':3000,
            'timeout':2000
        }
        var url = 'http://' + self.ip + ':' + self.port
        var m_socket = io.connect(url,opts);
        G.globalLoading.setLoadingVisible(true,'正在进入房间...')
        m_socket.on('connect',function(){
            console.log('connect');
            self.m_socket = m_socket
            G.globalLoading.setLoadingVisible(false)
            var sd = {
                token:data.token,
                roomId:data.roomId,
                time:data.time,
                sign:data.sign,
            };
            self.send(Constants.SOCKET_EVENT_c2s.LOGIN,sd)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.RECONNECTING)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.RECONNECT)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.LOGIN_RESULT)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.LOGIN_FINISHED)

            self.listenMsg(Constants.SOCKET_EVENT_s2c.EXIT_RESULT)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.EXIT_NOTIFY_PUSH)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.DISSOLVE_NOTICE_PUSH)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.DISSOLVE_CANCEL_PUSH)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.GAME_OVER_PUSH)

            self.listenMsg(Constants.SOCKET_EVENT_s2c.GAME_BEGIN_PUSH)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.NEW_USER_COMES_PUSH)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.GAME_SYNC_PUSH)
            self.listenMsg(Constants.SOCKET_EVENT_s2c.USER_STATE_PUSH)
        });
        G.eventManager.listenEvent(Constants.SOCKET_EVENT_s2c.RECONNECTING,self.reconnecting,self)
        G.eventManager.listenEvent(Constants.SOCKET_EVENT_s2c.RECONNECT,self.reconnecting,self)

        G.eventManager.listenEvent(Constants.LOCALEVENT.DISPATCHER_SOCKET_MSG,self.dispatcherSocketMsg,self)
    },

    dispatcherSocketMsg(data){
        var self = this
        console.log('dispatcherSocketMsg')
        console.log(self.m_msgList)
        for(var i = 0; i < self.m_msgList.length; i++){
            var info = self.m_msgList[i]
            G.eventManager.emitEvent(info.name,info.data)
        }
        self.m_msgList = []
    },

    listenMsg(name){
        var self = this
        if(self.m_socket){
            console.log('[socket] 监听事件 : '+ name)
            self.m_socket.on(name,function(data){
                console.log('[socket] 接收到了事件 : '+ name)
                console.log(data)
                if (typeof(data) == 'number') {
                    data = [data];
                }
                if(cc.director.getScene().name == 'HallScene'){
                    if(name == Constants.SOCKET_EVENT_s2c.LOGIN_RESULT || name == Constants.SOCKET_EVENT_s2c.LOGIN_FINISHED){
                        G.eventManager.emitEvent(name,data)
                    }else{
                        var info = {
                            name:name,
                            data:data
                        }
                        self.m_msgList.push(info)
                    }
                }else{
                    G.eventManager.emitEvent(name,data)
                }
            })
        }
    },
    
    send: function (event,data) {
        var self = this
        if(!self.m_socket){
            console.log('未连接成功')
            return
        }
        if(data != null && (typeof(data) == "object")){
            data = JSON.stringify(data);
            //console.log(data);              
        }
        if(data == null){
            data = '';
        }
        self.m_socket.emit(event,data);  
    },

    close:function(){
        var self = this
        console.log('close');
        if(self.m_socket){
            self.m_socket.disconnect();
        }
        self.m_socket = null;
    },

    onDestroy(){
        var self = this
        G.eventManager.cancelEvent(Constants.SOCKET_EVENT_s2c.RECONNECTING,self.reconnecting,self)
        G.eventManager.cancelEvent(Constants.SOCKET_EVENT_s2c.RECONNECT,self.reconnecting,self)
        G.eventManager.cancelEvent(Constants.LOCALEVENT.DISPATCHER_SOCKET_MSG,self.dispatcherSocketMsg,self)
        self.unscheduleAllCallbacks()
        self.close()
    },


    /**
    ------------------------------------------------------------------------------------------ 
    */
    reconnecting:function(num){
        var self = this;
        if(num > self.maxReConnectTime){
            G.globalLoading.setLoadingVisible(false)
            self.close()
            G.msgBoxMgr.showMsgBox({
                content:'网络连接超时，请检查网络是否断开！点击确认将重新连接，取消将退出游戏！',
                sureClickEventCallBack:function(){
                    self.connectSocket()
                },
                cancelClickEventCallBack:function(){
                    cc.game.end();//退出游戏
                }
            })
        }
    },

    reconnect:function(){
        var self = this;
        G.globalLoading.setLoadingVisible(false)
    },
});