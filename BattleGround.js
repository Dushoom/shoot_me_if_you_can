var Kingdom = require('http');
/*
	BattleGround Area.
*/
var BattleGround = new Object();
BattleGround.isReadytoBattle = false;
BattleGround.noOfBattleArenas = 0;
BattleGround.battleArenas = {};
BattleGround.timer = null;
BattleGround.maxSoldiersPerBattleArena = 4;
BattleGround.build = Kingdom.createServer(function(request,response) {
 });
 BattleGround.build.listen(1234,function(){
 if(BattleGround.noOfBattleArenas ==0 && BattleGround.isReadytoBattle == false)
	{
		BattleGround.isReadytoBattle = true;
		createBattleArena(++BattleGround.noOfBattleArenas);
	}
 BattleGround.timer = setInterval(function(){sendPingRequests()},2000);
 console.log('BattleGround has created .....');
 });
var ether = require('websocket').server;
ether = new ether({
httpServer : BattleGround.build
});

/*
	BattleGround Area
*/
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
/*
	BattleArena Area
*/
function createBattleArena(Id)
{
	var Arena = new BattleArena();
	Arena.location = Id;
	BattleGround.battleArenas[Id]= Arena;
}

function BattleArena()
{
	this.soldiers = {};
	this.location = null
	this.soldierCount = null;
}

function arenaPositions()
{

}
/*
	BattleArena Area
*/
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
function sendPingRequests()
{
	for( var i in BattleGround.battleArenas)
	{
		for (var j in BattleGround.battleArenas[i].soldiers)
		{
			var message = JSON.stringify({'message':'ping'});
			BattleGround.battleArenas[i].soldiers[j].pingInitiatedTime = new Date().getTime();
			BattleGround.battleArenas[i].soldiers[j].bond.send(message);
		}
	}
}
function calculatePing(x,y,a,b)
{
	return ((b*a) + (y-x))/(a+1);
}
function updateBattleGroundPing()
{

}
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
/*
	Soldier
*/
function enterTheSoldier(bond)
{
	if(BattleGround.battleArenas[BattleGround.noOfBattleArenas].soldierCount <= BattleGround.maxSoldiersPerBattleArena)
	{
		console.log("Joining a Soldier");
		var sniper = new soldier(bond);
		sniper.arenaId = BattleGround.noOfBattleArenas;
		sniper.soldierId = ++BattleGround.battleArenas[BattleGround.noOfBattleArenas].soldierCount;
		BattleGround.battleArenas[BattleGround.noOfBattleArenas].soldiers[sniper.soldierId] = sniper;
		var message = JSON.stringify({'message':'JTA','AID':sniper.arenaId,'SID':sniper.soldierId});
		bond.send(message);
	}
}

function soldier(bond)
{
	this.bond = bond;
	this.soldierId = null;
	this.arenaId = null;
	this.pingInitiatedTime = null;
	this.pingReceivedTime = null;
	this.updatedPing = null;
	this.noOfPings = null;
}
/*
	Soldier
*/
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
ether.on('request',function(r){
	var bond = r.accept('echo-protocol',r.origin);
	console.log("Some one visited the BattleGround");
	//var uid = convert(this.remoteAddress,this.socket._handle.fd);
	enterTheSoldier(bond);
	bond.on('message',function(message){
		message = JSON.parse(message.utf8Data);
		message_handling(message);
	});
}
);
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
/*
	Helper Functions
*/
function convert(x,y)
{
  return x.toString()+","+y.toString();
}
/*
	Helper Functions
*/
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

/*
	message Handling
*/
function message_handling(message){
	switch(message.message)
	{
		case 'ping':
		BattleGround.battleArenas[message.AID].soldiers[message.SID].pingReceivedTime = new Date().getTime();
		console.log(BattleGround.battleArenas[message.AID].soldiers[message.SID].pingReceivedTime-BattleGround.battleArenas[message.AID].soldiers[message.SID].pingInitiatedTime);
	}

}

/*
	message Handling
*/

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////