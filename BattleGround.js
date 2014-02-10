var Kingdom = require('http');
/*
	BattleGround Area.
*/
var BattleGround = new Object();
BattleGround.isReadytoBattle = false;
BattleGround.noOfBattleArenas = 0;
BattleGround.battleArenas = {};
BattleGround.timer = null;
BattleGround.ping = null;
BattleGround.maximumArenas = 4;
BattleGround.maxSoldiersPerBattleArena = 4;
BattleGround.build = Kingdom.createServer(function(request,response) {
 });
 BattleGround.build.listen(1234,function(){
 if(BattleGround.noOfBattleArenas ==0 && BattleGround.isReadytoBattle == false)
	{
		BattleGround.isReadytoBattle = true;
		createBattleArena(++BattleGround.noOfBattleArenas);
	}
 BattleGround.timer = setInterval(function(){sendPingRequests()},1000);
 BattleGround.ping = setInterval(function(){updateBattleGroundPing()},1000);
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
	arenaPositions(Arena.soldierPositions);
}

function BattleArena()
{
	this.soldiers = {};
	this.location = null;
	this.soldierCount = null;
	this.soldierPositions = new data_structure_linked_list();
}

function arenaPositions(soldierPositions)
{
	for(i = 0 ; i < BattleGround.maxSoldiersPerBattleArena; i++)
	{
		var position = new Object();
		position.next = null;
		position.value =BattleGround.maxSoldiersPerBattleArena -i;
		soldierPositions.push(position);
	}
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

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
/*
	Soldier
*/
function enterTheSoldier(bond)
{

	switch(BattleGround.battleArenas[BattleGround.noOfBattleArenas].soldierCount)
	{
		case BattleGround.maxSoldiersPerBattleArena:
		createBattleArena(++BattleGround.noOfBattleArenas);
		break;
	}
		var arena = BattleGround.battleArenas[BattleGround.noOfBattleArenas];
		console.log("Joining a Soldier");
		var sniper = new soldier(bond);
		sniper.arenaId = BattleGround.noOfBattleArenas;
		++arena.soldierCount;
		sniper.soldierId = arena.soldierPositions.pop().value;
		console.log(sniper.soldierId);
		arena.soldiers[sniper.soldierId] = sniper;
		var message = JSON.stringify({'message':'JTA','AID':sniper.arenaId,'SID':sniper.soldierId});
		bond.send(message);
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

function calculatePing(x,y,a,b)
{
	return ((b*a) + (y-x))/(a+1);
}
function updateBattleGroundPing()
{
	for(var i in BattleGround.battleArenas)
	{
		for(var j in BattleGround.battleArenas[i].soldiers)
		{
			var soldier = BattleGround.battleArenas[i].soldiers[j];
			console.log(soldier.soldierId+":"+soldier.updatedPing);
		}
	}
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
		var soldier = BattleGround.battleArenas[message.AID].soldiers[message.SID]
		soldier.pingReceivedTime = new Date().getTime();
		soldier.updatedPing = soldier.pingReceivedTime - soldier.pingInitiatedTime;
		soldier.bond.send(JSON.stringify({'message':'lag','value':soldier.updatedPing});
	}

}

/*
	message Handling
*/

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

/*
	Data_Structures
*/
function data_structure_linked_list()
{
	this.head = null;
	this.push = function (position)
	{
		switch(this.head)
		{
			case null:
			this.head = position;
			break;
			default:
			position.next = this.head;
			this.head = position;
		}
	}
	this.pop = function ()
	{
		var position = null;
		switch(this.head)
		{
			case null:
			break;
			default:
			position = this.head;
			this.head = this.head.next;
		}
		return position;
	}
}
/*
	Data_Structures
*/