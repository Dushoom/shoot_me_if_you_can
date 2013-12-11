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
console.log("about to create obstacles");
createObstacles(arena);
console.log("created obstacles");
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

var count = 0;
var clients = {};
wsServer.on('request', function(r){
var connection = r.accept('echo-protocol', r.origin)
console.log (r.remoteAddress +'connected to our server');
var id = count++;
clients[id] = connection;
connection.on('message', function(message) {
var msgString = message.utf8Data;
console.log("message is"+":"+msgString);
console.log("message has sent for routing");
route(connection,msgString); 
  }
	);
	connection.on('close', function(reasonCode, description) {
  delete clients[id];
  console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});	


function route(connection,message)
{
    console.log("got message for routing");
    var method = JSON.parse(message).method;
    console.log("requested method is"+" "+method);
    if(method == 'createArena')
    {
      console.log("request routed to send Arena Details");
      sendArenaDetails(connection);
    }
    if(method == 'play')
    {
      console.log("request routed to create Player");
      createPlayer(connection);
      console.log("player has been created , now sending to request to send player position");
      sendPlayerPosition(connection);
      console.log("Sendin Player positionto other players")
      sendMessage(connection);
      console.log("sending other player details if any")
      sendOtherPlayersInfo(connection);
      //console.log("other player info sent");


    }

}function sendOtherPlayersInfo(connection)
{
  var node = arena.joinedPlayersList.get();
  for (var i in clients)
  {
      message = {'message':'Joined','position':node.data}
      connection.send(JSON.stringify(message));
      node = node.next;
      /*console.log(arena.players[clients[i]].data);
      message = {'message':'playerJoined','position':arena.players[clients[i]].data};
      connection.send(JSON.stringify(message));*/
  }
}
function sendMessage(connection)
{
      for (var i in clients)
      {
        if (i != connection)
        {
            message = {'message':'playerJoined','position':arena.players[connection].data};
            clients[i].send(JSON.stringify(message));
        }
      }
}
function createPlayer(connection)
{
  if (arena.joinedPlayers < 4)
  {
    console.log("About to create player")
    var player = new Object();
    console.log("player created");
    player.data = arena.playerPostion.get().data;
    arena.joinedPlayersList.add(player.data);
    console.log(arena.joinedPlayersList);
    arena.playerPostion.remove();
    arena.players[connection] = player;
    //console.log(arena.players[connection].data);
    console.log("player added to arena");
   }
  else
  {
    console.log("max player reached");
  }
}
function sendPlayerPosition(connection)
{
  console.log("request came for send player position")
  message = {'message':'playerPosition','position':arena.players[connection].data}
  connection.send(JSON.stringify(message));  
}
function sendArenaDetails(connection)
{
    console.log("request to send arena details");
    message = {'message':'arenaDetails','width':arena.width,'height':arena.height,'obstacleSize':arena.obstacleWidth,'obstacles':arena.obstacles};
    connection.send(JSON.stringify(message));
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
  