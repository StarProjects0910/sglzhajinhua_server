/**
 * Created by WTF on 2016/3/9.
 */

var Redis = require('ioredis');
var pomelo = require('pomelo');
var redis = new Redis();
var gameDao = require("../../dao/gameDao");
var gameLogicRemote = require("../../servers/game/remote/gameLogicRemote");
//var delayDao = require('../dao/delayDao');

module.exports = function(app) {
    return new Listenner(app);
};


var DEFAULT_INTERVAL = 3000;

var Listenner = function(app) {
    this.app = app;
    this.interval = DEFAULT_INTERVAL;
    this.timerId = null;
    //this.gameDao = require('../dao/gameDao');
    //this.gameLogicRemote = require('../game/remote/gameLogicRemote');

    redis.select(9, function(err) {
        if(err) process.exit(4);
        redis.subscribe("__keyevent@9__:expired", function() {
            console.log("--------add expired channel ok");
        });
        redis.subscribe("__keyevent@9__:del",function(){
            console.log("--------add del channel ok");
        });
    });

    // 监听从订阅频道来的消息
    redis.on("message", function(sub,key){
        //console.log('get message');
        console.log(sub,key+'del-------expiredc');
        console.log(JSON.stringify(key));
        //example key表示pomelo的一个channel名(也就是addDelay传入的channel参数)

        //获取channel之后，向该channel发送消息
        var channelService = app.get('channelService');
        var channel = channelService.getChannel(key, true);
        var param = {
            route:'onNext',
            next:'next'
        };
        channel.pushMessage(param);

        gameDao.getCurPlayer(key,function(location){
            gameDao.getLocalPlayer(key,location,function(userAndRoom,loc){
                var username = userAndRoom.split('*')[0];
                gameLogicRemote.throw(key,location,channel,username,channelService);
            });
        });

        //gameDao.getCurPlayer(rid,function(location){
        //    gameDao.setIsGameNum(rid,location,0,function(){
        //        var param = {
        //            route:'onThrow',
        //            user:username
        //        };
        //        channel.pushMessage(param);
        //
        //        //关闭定时器然后重新开启重新计时
        //        delayDao.removeDelay(rid,function(){
        //            console.log("throw:removeDelay success");
        //            delayDao.addDelay(rid,10,function(){
        //                //更改当前出牌玩家
        //                gameDao.nextCurPlayer(rid,function(){
        //                    console.log("nextCurPlayer success");
        //                    gameDao.getIsGameNum(rid,function(isGameNumArr){
        //                        var sum = 0;
        //                        var game_winner;
        //                        for(var i=1;i<6;i++){
        //                            if(isGameNumArr[i]==1){
        //                                sum = sum +isGameNumArr[i];
        //                                game_winner=i;
        //                            }
        //                        }
        //                        if(sum<=1){
        //                            //重新开始
        //                            var param = {
        //                                route:'onEnd',
        //                                winner:game_winner
        //                            };
        //                            channel.pushMessage(param);
        //                            delayDao.removeDelay(rid,function(){
        //                                console.log("throw:removeDelay success");
        //                            });
        //                            gameDao.resetData(rid,function(){
        //                                setTimeout(function(){
        //                                    gameLogicRemote.fapai(rid,channel,channelService,function(){
        //                                        console.log("gameLogic cb");
        //                                    });
        //                                },10000);
        //                            });
        //                        }
        //                    });
        //                });
        //            });
        //        });
        //
        //    });
        //});


    });
};

Listenner.name = '__Listenner__';

Listenner.prototype.start = function (cb) {
    console.log('Listenner Start');
    var self = this;

    process.nextTick(cb);
};

Listenner.prototype.afterStart = function (cb) {
    var self = this;
    console.log('start calling gate');
    //var sessionService = self.app.get('sessionService');
    //var channelService = self.app.get('channelService');
    //var channel = channelService.getChannel("20", false);

    //var param = {
    //    route:'onNext',
    //    next:'next'
    //};
    //
    //var user = channel.getMembers;
    //
    //console.log("channel member:"+user);
    //
    //channel.pushMessage(param);

    process.nextTick(cb);
};

Listenner.prototype.stop = function (force, cb) {
    console.log('Listenner World stop');
    clearInterval(this.timerId);
    process.nextTick(cb);
};