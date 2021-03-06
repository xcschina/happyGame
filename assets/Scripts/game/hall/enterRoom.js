var Constants = require('./../../config/Constants')
var TAG = 'enterRoom.js'
cc.Class({
    extends: cc.Component,

    properties: {
        m_labels:[cc.Label]
    },

    init (socketProcess) {
        console.log(TAG,'init')
        var self = this
        self.hide()
        self.m_socketProcess = socketProcess
    },

    show(){
        var self = this
        self.node.active = true
        for(var i = 0; i < self.m_labels.length; i++){
            var label = self.m_labels[i]
            if(cc.isValid(label)){
                label.string = ''
            }
        }
    },

    hide(){
        var self = this
        self.node.active = false
    },

    deleteLabel(isAll){
        isAll = isAll || false
        var self = this
        for(var i = self.m_labels.length - 1; i >= 0; i--){
            var label = self.m_labels[i]
            if(cc.isValid(label) && label.string != ''){
                label.string = ''
                if(!isAll){
                    return
                }
            }
        }
    },

    deleteButtonCallBack(event, customEventData){
        var self = this
        //这里 event 是一个 Touch Event 对象，你可以通过 event.target 取到事件的发送节点
        var node = event.target;
        var button = node.getComponent(cc.Button);
        //这里的 customEventData 参数就等于你之前设置的 "click1 user data"
        cc.log("node=", node.name, " event=", event.type, " data=", customEventData);
        self.deleteLabel(false)
    },

    retypeButtonCallBack(event, customEventData){
        var self = this
        //这里 event 是一个 Touch Event 对象，你可以通过 event.target 取到事件的发送节点
        var node = event.target;
        var button = node.getComponent(cc.Button);
        //这里的 customEventData 参数就等于你之前设置的 "click1 user data"
        cc.log("node=", node.name, " event=", event.type, " data=", customEventData);
        self.deleteLabel(true)
    },

    inputeButtonCallBack(event, customEventData){
        var self = this
        //这里 event 是一个 Touch Event 对象，你可以通过 event.target 取到事件的发送节点
        var node = event.target;
        var button = node.getComponent(cc.Button);
        //这里的 customEventData 参数就等于你之前设置的 "click1 user data"
        cc.log("node=", node.name, " event=", event.type, " data=", customEventData);
        var str = ''
        for(var i = 0; i < self.m_labels.length; i++){
            var label = self.m_labels[i]
            if(cc.isValid(label)){
                if(label.string == ''){
                    label.string = customEventData
                    str = str + label.string
                    break
                }else{
                    str = str + label.string
                }
            }
        }
        if(str.length == self.m_labels.length){
            var data = {
                roomid:str,
                userid:G.selfUserData.getUserId(),
                orgi:G.selfUserData.getUserOrgi(),
                token:G.selfUserData.getUserToken(),
            }
            G.globalSocket.sendMsg(Constants.SOCKET_EVENT_c2s.SEARCH_ROOM,data)
        }
    },
});
