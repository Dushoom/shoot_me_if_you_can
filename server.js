 var httpd = require('http');
 var server = httpd.createServer(function(request,response) {
 });

 server.listen(1234,function(){
 console.log((new Date())+'Server is listening on port 1234');
 });

var ws = require('websocket').server;
wsServer = new ws({
httpServer : server
});

console.log("arena created");
var arena = new Object();
arena.width = 350;
arena.height = 350;
arena.obstacleWidth = 50;
arena.obstacleHeight = 50; 
arena.obstacles = {};
arena.maximumSoldiers = 4;
arena.battlingSoldiers = 0;
arena.maximumBullets = 5;
arena.players ={};
arena.playerPostion = new playerPostion();
arena.battlingSoldiersList = new playerPostion();
arena.playerPostion.add({x:25,y:25});
arena.playerPostion.add({x:arena.width-25,y:25})
arena.playerPostion.add({x:25,y:arena.height-25});
arena.playerPostion.add({x:arena.width-25,y:arena.height-25});
arena.bullets = {};
arena.playerRadius = 15;
arena.numberOfBullets = 0;
arena.canTheBattleBegin = false;
arena.bulletSize =5;
console.log("about to create obstacles");
createObstacles(arena);
console.log("created obstacles");
var SB ;
var Battle = setInterval(function(){startTheBattle()},500);
function startTheBattle()
{
  if(arena.battlingSoldiers == arena.maximumSoldiers)
  {
    message ={'message':'letTheBattleBegin','bulletSize':arena.bulletSize};
    sendMessageToAllBattleSoldiers(message);
    clearInterval(Battle);
    SB = setInterval(function(){updateBulletPositions()},60);
  }
}
function updateBulletPositions()
{
  {
    for (var i in arena.bullets)
    {
      
      switch(arena.bullets[i].type)
      {
        case 'right':
        console.log(arena.bullets[i]);
        if( arena.bullets[i].position_x < 345)
        {
          arena.bullets[i].previousPosition_x = arena.bullets[i].position_x;
          arena.bullets[i].position_x +=5;
        }else
        {
          soldiers[arena.bullets[i].soldier].noOfBulletsFired--;
          delete arena.bullets[i];
        }
          break;
        case 'left':
        if (arena.bullets[i].position_x > 5) 
        {
          arena.bullets[i].previousPosition_x = arena.bullets[i].position_x;
          arena.bullets[i].position_x -=5;
        }
        else
        {
          soldiers[arena.bullets[i].soldier].noOfBulletsFired--;
          delete arena.bullets[i];
        }
          break;
        case 'top':
        if(arena.bullets[i].position_y > 5) 
        {
          arena.bullets[i].previousPosition_y = arena.bullets[i].position_y;
          arena.bullets[i].position_y -=5;
        }
        else
        {
          soldiers[arena.bullets[i].soldier].noOfBulletsFired--;
          delete arena.bullets[i];
        }
          break;
        default:
        if(arena.bullets[i].position_y < 345)
        {
          arena.bullets[i].previousPosition_y = arena.bullets[i].position_y;
          arena.bullets[i].position_y +=5;
        }
        else
        {
          soldiers[arena.bullets[i].soldier].noOfBulletsFired--;
          delete arena.bullets[i];
        }
      }        
    }
  }
}
 function createObstacles(arena)
 {
    for(var i = arena.obstacleWidth ; i < arena.width ; i = i + (2*arena.obstacleWidth))
  {
    for(var j = arena.obstacleHeight; j < arena.height ; j = j + (2*arena.obstacleHeight))
    {
      arena.obstacles[convert(i,j)] = {x:i,y:j};
    }
  }
 } 
 function convert(x,y)
{
  return x.toString()+","+y.toString();
}
var soldiers = {};
var move = 25;
var clients = {};
var checkingBattleGround = {};
var soldiers = {};
var battleSoldiers = {};
wsServer.on('request', function(r){
var connection = r.accept('echo-protocol', r.origin)
console.log (r.remoteAddress +'connected to our Arena');
var id = convert(connection.remoteAddress,connection.socket._handle.fd);
clients[id] = connection;

connection.on('message', function(message) {
  var ui = convert(this.remoteAddress,this.socket._handle.fd);
  var msgString = message.utf8Data;
  console.log("message is"+":"+msgString);
  console.log("message has sent for routing");
  route(ui,msgString); 
   }
);
connection.on('close', function(reasonCode, description) {
  delete clients[id];
  console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});	
function bullet()
{
  this.position_x = null;
  this.position_y = null;
  this.previousPosition_x = null;
  this.previousPosition_y = null;
  this.type = null;
  this.soldier = null;

}
function player()
{
  this.position_x = null;
  this.position_y = null;
  this.next_position_x =null;
  this.next_position_y =null;
  this.arenaCreated = false;
  this.noOfBulletsFired = null;
  this.canHeBattle = false;
}
function route(key,message)
{
    console.log("got message for routing");
    var method = JSON.parse(message).method;
    console.log("requested method is"+" "+method);
    if(method == 'createArena')
    {
      console.log("request routed to send Arena Details");
      checkingBattleGround[key] = clients[key];
      sendArenaDetails(key);
    }
    if(method == 'play')
    {
      if((key in checkingBattleGround) && !(key in soldiers) && arena.battlingSoldiers < 4 )
        {
          console.log("request routed to join a soldier");
          soldiers[key] = new player();
          battleSoldiers[key] = checkingBattleGround[key];
          createPlayer(key);
          arena.battlingSoldiers ++;
          soldierJoined(key);
          console.log("soldier has been created , now sending the same information to ballteground checking player");
        }
    }
    if(method == 'moveRight')
    {
      if(validateRightMove(key)){
      console.log("player requseted for move");
      soldiers[key].next_position_x = soldiers[key].position_x + move;
      soldiers[key].next_position_y = soldiers[key].position_y ;
      console.log("player new postion assigned");
      sendNewPlayerPosition(key);
      console.log("Player move sent to all the players");
    }
    }
    if(method == 'moveDown')
    {
      if(validateDownMove(key)){
      console.log("player requseted for moveDown");
      soldiers[key].next_position_x = soldiers[key].position_x ;
      soldiers[key].next_position_y = soldiers[key].position_y + move;
      console.log("player new postion assigned");
      sendNewPlayerPosition(key);
      console.log("Player move sent to all the players");
    }
    }
    if(method == 'moveLeft')
    {
      if(validateLeftMove(key)){
      console.log("player requseted for moveLeft");
      soldiers[key].next_position_x = soldiers[key].position_x - move;
      soldiers[key].next_position_y = soldiers[key].position_y ;
      console.log("player new postion assigned");
      sendNewPlayerPosition(key);
      console.log("Player move sent to all the players");
    }
    }
    if(method == 'moveTop')
    {
      if(validateTopMove(key)){
      console.log("player requseted for moveTop");
      soldiers[key].next_position_x = soldiers[key].position_x;
      soldiers[key].next_position_y = soldiers[key].position_y - move;
      console.log("player new postion assigned");
      sendNewPlayerPosition(key);
      console.log("Player move sent to all the players");
    }
    }
    if(method  == 'shootRight')
    {
      if(validateRightMove(key) && (soldiers[key].noOfBulletsFired < arena.maximumBullets))
      {
        console.log("player shot right");
        soldiers[key].noOfBulletsFired ++;
        arena.numberOfBullets++;
        var B = new bullet();
        B.position_x= soldiers[key].position_x+16;
        B.position_y = soldiers[key].position_y;
        B.previousPosition_x = B.position_x;
        B.previousPosition_y = B.position_y;
        B.type = 'right';
        B.soldier = key;
        B.key = convert(key,arena.numberOfBullets);
        message = {'message':'bulletInfo','bullet':B};
        sendMessageToAllBattleSoldiers(message);
        arena.bullets[convert(key,arena.numberOfBullets)] = B;        
      }
    }
    if(method  == 'shootLeft' && (soldiers[key].noOfBulletsFired < arena.maximumBullets))
    {
      if(validateLeftMove(key))
      {
        console.log("player shot left");
        soldiers[key].noOfBulletsFired ++;
        arena.numberOfBullets++;
        var B = new bullet();
        B.position_x= soldiers[key].position_x-16;
        B.position_y = soldiers[key].position_y;
        B.previousPosition_x = B.position_x;
        B.previousPosition_y = B.position_y;
        B.type = 'left';
        B.soldier = key;
        B.key = convert(key,arena.numberOfBullets);
        message = {'message':'bulletInfo','bullet':B};
        sendMessageToAllBattleSoldiers(message);
        arena.bullets[convert(key,arena.numberOfBullets)] = B;        
      }
    }
    if(method  == 'shootTop' && (soldiers[key].noOfBulletsFired < arena.maximumBullets))
    {
      if(validateTopMove(key))
      {
        console.log("player shot Top");
        soldiers[key].noOfBulletsFired ++;
        arena.numberOfBullets++;
        var B = new bullet();
        B.position_x= soldiers[key].position_x;
        B.position_y = soldiers[key].position_y-16;
        B.previousPosition_x = B.position_x;
        B.previousPosition_y = B.position_y;
        B.type = 'top';
        B.soldier = key;
        B.key = convert(key,arena.numberOfBullets);
        message = {'message':'bulletInfo','bullet':B};
        sendMessageToAllBattleSoldiers(message);
        arena.bullets[convert(key,arena.numberOfBullets)] = B;        
      }
    }
    if(method  == 'shootDown' && (soldiers[key].noOfBulletsFired < arena.maximumBullets))
    {
      if(validateDownMove(key))
      {
        console.log("player shot Down");
        soldiers[key].noOfBulletsFired ++;
        arena.numberOfBullets++;
        var B = new bullet();
        B.position_x= soldiers[key].position_x;
        B.position_y = soldiers[key].position_y+16;
        B.previousPosition_x = B.position_x;
        B.previousPosition_y = B.position_y;
        B.type = 'down';
        B.soldier = key;
        B.key = convert(key,arena.numberOfBullets);
        message = {'message':'bulletInfo','bullet':B};
        sendMessageToAllBattleSoldiers(message);
        arena.bullets[convert(key,arena.numberOfBullets)] = B;        
      }
    }

}
function sendMessageToAllBattleSoldiers(message)
{
    for ( var i in battleSoldiers)
    {
      battleSoldiers[i].send(JSON.stringify(message));
    }
}
function validateRightMove(key)
{
  if((soldiers[key].position_y % 100 == 25) && soldiers[key].position_x != arena.width-25)
  {
    return true;
  }
  else
  {
    return false;
  }
}
function validateLeftMove(key)
{
  if((soldiers[key].position_y % 100 == 25) && soldiers[key].position_x != 25)
  {
    return true;
  }
  else {
    return false;
  }
}
function validateTopMove(key)
{
  if((soldiers[key].position_x % 100 == 25) && soldiers[key].position_y != 25)
  {
    return true;
  }
  else {
    return false;
  }
}
function validateDownMove(key)
{
  if((soldiers[key].position_x % 100 == 25) && soldiers[key].position_y != arena.height -25)
  {
    return true;
  }
  else {
    return false;
  }
}
function soldierJoined(key)
{
  for( var i in checkingBattleGround)
  {
    message = {'message':'soldierJoined','position_x':soldiers[key].position_x,'position_y':soldiers[key].position_y};
    checkingBattleGround[i].send(JSON.stringify(message));
  }
}
function sendNewPlayerPosition(key)
{
  for (var i in battleSoldiers)
  {  
    message = {'message':'playerMove','current_position_x':soldiers[key].position_x,'current_position_y':soldiers[key].position_y,'next_position_x':soldiers[key].next_position_x,'next_position_y':soldiers[key].next_position_y};
    battleSoldiers[i].send(JSON.stringify(message));  
    console.log(message);
  }
  soldiers[key].position_x = soldiers[key].next_position_x;
  soldiers[key].position_y = soldiers[key].next_position_y;
}
function sendBulletsInfoToPlayers(message)
{
  for (var i in battleSoldiers)
  {
          
      battleSoldiers[i].send(JSON.stringify(message));         
  }
}
function createPlayer(key)
{
  if (arena.battlingSoldiers < 4)
  {
    console.log("About to create player")
    var temp = arena.playerPostion.get().data;
    soldiers[key].position_x= temp.x;
    soldiers[key].position_y= temp.y;
    console.log("player created");
    arena.playerPostion.remove();
    console.log("player added to arena");
   }
  else
  {
    console.log("max player reached");
  }
}
function sendArenaDetails(key)
{
  console.log("request to send arena details");
  message = {'message':'arenaDetails','width':arena.width,'height':arena.height,'obstacleSize':arena.obstacleWidth,'obstacles':arena.obstacles};
  checkingBattleGround[key].send(JSON.stringify(message));
  if(arena.battlingSoldiers > 0 )
  {
    console.log("Sending information about already joined soldiers to the new visiting soldier")
    for (var i in soldiers)
    {
      message = {'message':'soldiesAlreadyPresentInbattleField','position_x':soldiers[i].position_x,'position_y':soldiers[i].position_y};
      checkingBattleGround[key].send(JSON.stringify(message));      
    }
  }
  console.log("Arena details sent");
}

function position(){

  this.data = null;
  this.next = null;
}
function playerPostion()
{
  this.head = null;
  this.end = null;
  this.add = function(data){

    var p = new position();
    p.data = data;
    if(this.head == null)
    {
      this.head = p;
      this.end = p;    
    }
    else 
    {
      this.end.next = p;

      this.end  = p;
    }
  }
  this.get = function()
  {
    return this.head;
  }
  this.remove = function(){
    var H = this.head;
    this.head = H.next;
    H = null;
  }
}
  
