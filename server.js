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
arena.maxPlayers = 4;
arena.joinedPlayers = 0;
arena.players ={};
arena.playerPostion = new playerPostion();
arena.joinedPlayersList = new playerPostion();
arena.playerPostion.add({x:25,y:25});
arena.playerPostion.add({x:arena.width-25,y:25})
arena.playerPostion.add({x:25,y:arena.height-25});
arena.playerPostion.add({x:arena.width-25,y:arena.height-25});
arena.bullets = {};
arena.playerRadius = 15;
arena.numberOfBullets = 0;
console.log("about to create obstacles");
createObstacles(arena);
console.log("created obstacles");
var SB = setInterval(function(){sendBulletsToPlayers()},100);
function sendBulletsToPlayers()
{
  if(arena.numberOfBullets != 0)
  {
    message = {'message':'bulletInfo','bullets':arena.bullets}
    sendBulletsInfoToPlayers(message);
    updateBulletPositions()    
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
          arena.bullets[i].previousPosition_x = arena.bullets[i].position_x;
          arena.bullets[i].position_x +=5;
          break;
          case 'left':
          arena.bullets[i].previousPosition_x = arena.bullets[i].position_x;
          arena.bullets[i].position_x -=5;
          break;
          case 'top':
          arena.bullets[i].previousPosition_y = arena.bullets[i].position_y;
          arena.bullets[i].position_y -=5;
          break;
          default:
          arena.bullets[i].previousPosition_y = arena.bullets[i].position_y;
          arena.bullets[i].position_y +=5;
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
var Pinfo = {};
var move = 10;
var clients = {};
wsServer.on('request', function(r){
var connection = r.accept('echo-protocol', r.origin)
console.log (r.remoteAddress +'connected to our server');
var id = convert(connection.remoteAddress,connection.socket._handle.fd);
clients[id] = connection;
Pinfo[id] = new player();
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
  this.priviousPosition_y = null;
  this.type = null;
}
function player()
{
  this.position_x = null;
  this.position_y = null;
  this.next_position_x =null;
  this.next_position_y =null;
  this.arenaCreated = false;
  this.noOfBulletsFired = null;
}
function route(key,message)
{
    console.log("got message for routing");
    var method = JSON.parse(message).method;
    console.log("requested method is"+" "+method);
    if(method == 'createArena')
    {
      console.log("request routed to send Arena Details");
      sendArenaDetails(key);
    }
    if(method == 'play')
    {
      console.log("request routed to create Player");
      createPlayer(key);
      console.log("player has been created , now sending to request to send player position");
      sendPlayerPosition(key);
      console.log("Sendin Player positionto other players")
      sendMessage(key);
      console.log("sending other player details if any")
      sendOtherPlayersInfo(key);
      console.log("other player info sent");
    }
    /*if (method == 'moveRight' || method == 'moveLeft' || method == 'moveDown' || method == 'moveTop')
    {
      switch(message)
      {
        case 'moveRight':
      }
    }*/
    if(method == 'moveRight')
    {
      if(validateRightMove(key)){
      console.log("player requseted for move");
      Pinfo[key].next_position_x = Pinfo[key].position_x + move;
      Pinfo[key].next_position_y = Pinfo[key].position_y ;
      console.log("player new postion assigned");
      sendNewPlayerPosition(key);
      console.log("Player move sent to all the players");
    }
    }
    if(method == 'moveDown')
    {
      if(validateDownMove(key)){
      console.log("player requseted for moveDown");
      Pinfo[key].next_position_x = Pinfo[key].position_x ;
      Pinfo[key].next_position_y = Pinfo[key].position_y + move;
      console.log("player new postion assigned");
      sendNewPlayerPosition(key);
      console.log("Player move sent to all the players");
    }
    }
    if(method == 'moveLeft')
    {
      if(validateLeftMove(key)){
      console.log("player requseted for moveLeft");
      Pinfo[key].next_position_x = Pinfo[key].position_x - move;
      Pinfo[key].next_position_y = Pinfo[key].position_y ;
      console.log("player new postion assigned");
      sendNewPlayerPosition(key);
      console.log("Player move sent to all the players");
    }
    }
    if(method == 'moveTop')
    {
      if(validateTopMove(key)){
      console.log("player requseted for moveTop");
      Pinfo[key].next_position_x = Pinfo[key].position_x;
      Pinfo[key].next_position_y = Pinfo[key].position_y - move;
      console.log("player new postion assigned");
      sendNewPlayerPosition(key);
      console.log("Player move sent to all the players");
    }
    }
    if(method  == 'shootRight')
    {
      if(validateRightMove(key))
      {
        console.log("player shot right");
        Pinfo[key].noOfBulletsFired ++;
        arena.numberOfBullets++;
        var B = new bullet();
        B.position_x= Pinfo[key].position_x+16;
        B.position_y = Pinfo[key].position_y;
        B.previousPosition_x = B.position_x;
        B.previousPosition_y = B.position_y;
        B.type = 'right';
        arena.bullets[convert(key,Pinfo[key].noOfBulletsFired)] = B;        
      }
    }
    if(method  == 'shootLeft')
    {
      if(validateLeftMove(key))
      {
        console.log("player shot left");
        Pinfo[key].noOfBulletsFired ++;
        arena.numberOfBullets++;
        var B = new bullet();
        B.position_x= Pinfo[key].position_x-16;
        B.position_y = Pinfo[key].position_y;
        B.previousPosition_x = B.position_x;
        B.previousPosition_y = B.position_y;
        B.type = 'left';
        arena.bullets[convert(key,Pinfo[key].noOfBulletsFired)] = B;        
      }
    }
    if(method  == 'shootTop')
    {
      if(validateTopMove(key))
      {
        console.log("player shot Top");
        Pinfo[key].noOfBulletsFired ++;
        arena.numberOfBullets++;
        var B = new bullet();
        B.position_x= Pinfo[key].position_x;
        B.position_y = Pinfo[key].position_y-16;
        B.previousPosition_x = B.position_x;
        B.previousPosition_y = B.position_y;
        B.type = 'top';
        arena.bullets[convert(key,Pinfo[key].noOfBulletsFired)] = B;        
      }
    }
    if(method  == 'shootDown')
    {
      if(validateDownMove(key))
      {
        console.log("player shot Down");
        Pinfo[key].noOfBulletsFired ++;
        arena.numberOfBullets++;
        var B = new bullet();
        B.position_x= Pinfo[key].position_x;
        B.position_y = Pinfo[key].position_y+16;
        B.previousPosition_x = B.position_x;
        B.previousPosition_y = B.position_y;
        B.type = 'down';
        arena.bullets[convert(key,Pinfo[key].noOfBulletsFired)] = B;        
      }
    }

}
function validateRightMove(key)
{
  if((Pinfo[key].position_y % 100 == 25) && Pinfo[key].position_x != arena.width-25)
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
  if((Pinfo[key].position_y % 100 == 25) && Pinfo[key].position_x != 25)
  {
    return true;
  }
  else {
    return false;
  }
}
function validateTopMove(key)
{
  if((Pinfo[key].position_x % 100 == 25) && Pinfo[key].position_y != 25)
  {
    return true;
  }
  else {
    return false;
  }
}
function validateDownMove(key)
{
  if((Pinfo[key].position_x % 100 == 25) && Pinfo[key].position_y != arena.height -25)
  {
    return true;
  }
  else {
    return false;
  }
}
function sendNewPlayerPosition(key)
{
  for (var i in clients)
  {  
    message = {'message':'playerMove','current_position_x':Pinfo[key].position_x,'current_position_y':Pinfo[key].position_y,'next_position_x':Pinfo[key].next_position_x,'next_position_y':Pinfo[key].next_position_y};
    clients[i].send(JSON.stringify(message));  
  }
  Pinfo[key].position_x = Pinfo[key].next_position_x;
  Pinfo[key].position_y = Pinfo[key].next_position_y;
}
function sendBulletsInfoToPlayers(message)
{
  for (var i in clients)
  {
          
      clients[i].send(JSON.stringify(message));         
  }
}
function sendOtherPlayersInfo(key)
{
  for (var i in clients)
  {
    if(i != key)
    {
      message = {'message':'playerJoined','position_x':Pinfo[i].position_x,'position_y':Pinfo[i].position_y};
      clients[key].send(JSON.stringify(message));
    }      
  }
}
function sendMessage(key)
{
      for (var i in clients)
      {
        if (i != key)
        {
            message = {'message':'playerJoined','position_x':Pinfo[key].position_x,'position_y':Pinfo[key].position_y};
            clients[i].send(JSON.stringify(message));
        }
      }
}
function createPlayer(key)
{
  if (arena.joinedPlayers < 4)
  {
    console.log("About to create player")
    var temp = arena.playerPostion.get().data;
    Pinfo[key].position_x= temp.x;
    Pinfo[key].position_y= temp.y;
    console.log("player created");
    arena.playerPostion.remove();
    console.log("player added to arena");
   }
  else
  {
    console.log("max player reached");
  }
}
function sendPlayerPosition(key)
{
  console.log("request came for send player position")
  message = {'message':'playerPosition','position_x':Pinfo[key].position_x,'position_y':Pinfo[key].position_y}
  clients[key].send(JSON.stringify(message));  
}
function sendArenaDetails(key)
{
    console.log("request to send arena details");
    message = {'message':'arenaDetails','width':arena.width,'height':arena.height,'obstacleSize':arena.obstacleWidth,'obstacles':arena.obstacles};
    clients[key].send(JSON.stringify(message));
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
  