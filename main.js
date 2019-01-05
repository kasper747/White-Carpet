'use strict';


let ex = require('BuroOfCartography');
let BuroOfCartography = ex[0];
let BuroOfProduction = ex[1];
let BuroOfHarvest = ex[2];
let CommitteeOfAppropriation = require('Committis');

function Mech(name, level, home, commune, memory, parts) {
  this.name = name;
  this.task = level;
  this.home = home;
  this.commune = commune;
  this.memory = memory;
  this.parts = parts;
}


const STRUCTURES = 'structures';
const ROOMS = 'rooms';
const CREEPS = 'creeps';
const SOURCES = 'sources';


function Commune(name) {
  this.name = name;

  this[STRUCTURES] = Memory.communes[this.name][STRUCTURES];
  this[ROOMS] = Memory.communes[this.name][ROOMS];
  this[CREEPS] = Memory.communes[this.name][CREEPS];
  this[SOURCES] = Memory.communes[this.name][SOURCES];

}

Commune.prototype.init = function () {
  // Initialis Memory
  if (!Memory.communes) Memory.communes = {};
  if (!Memory.communes[this.name]) Memory.communes[this.name] = {};
  this.memory = Memory.communes[this.name];
  for (let i in this.assetTypes) {
    console.log('Init', i, this.assetTypes[i]['idType']);
    if (!Memory.communes[this.name][i])
      Memory.communes[this.name][i] = {};
    this[i] = Memory.communes[this.name][i];
  }
};


try {

} catch (e) {
  console.log(e);
}


StructureSpawn.prototype.createCustomCreep =
    function () {
      // create a balanced body as big as possible with the given energy


      // create creep with the created body and the given role
      return this.createCreep([MOVE]);
    };
Creep.prototype.kill = function () {
  // create a balanced body as big as possible with the given energy


  // create creep with the created body and the given role
  return this.suicide();
};


let pos = new RoomPosition(12, 21, 'W3N7');

let committee = new CommitteeOfAppropriation();
committee.focusOnCommune('r');
let a = new Commune('r');
committee.transferAssets(Game.spawns.Home.room.find(FIND_SOURCES));
committee.transferAssets(Game.creeps);
a.init();
console.log(JSON.stringify(a.rooms));
console.log(JSON.stringify(a.structures));

let map = new BuroOfCartography();

let r = map.mapRoom('W3N7');

console.log(JSON.stringify(a.creeps));
console.log('mapRoom', JSON.stringify(r));



let CreepsBuro = new BuroOfProduction(a);
console.log('Production Facilities',CreepsBuro.getProductionFacilities());
console.log('CreepsBuro', CreepsBuro.comName);
r = CreepsBuro.clearDestroyedCreeps();
console.log(JSON.stringify(r));
r = CreepsBuro.produceCreep([MOVE,WORK,CARRY]);
console.log('Production',JSON.stringify(r));

//Game.spawns.Home.createCustomCreep();

module.exports.loop = function () {
  //console.log('>>>>>>>>>>>>>> NEW TICK <<<<<<<<<<<<<');

  let body_parts = [ //5 |250
    MOVE //350 //7
  ];

  /*
  for (let name = 0; name < creepsPriority.length; name += 1) {
    let CreepRole = creepsPriority[name];

    let CreepsOfType = _.filter(Game.creeps, (creep) =>
        creep.memory.role === CreepRole
        && creep.memory.home === 'W41N36'
    );


    if (true) {

    }
  }
  */
  for (let name in Game.creeps) {

    let creep = Game.creeps[name];

    /*
    if (creep.memory.MySource === undefined || creep.memory.MySource === 'undefined') {
      delete creep.memory['MySource'];
      delete creep.memory['task'];

    }*/
    if (creep.memory.role === 'harvester') {
      roleHarvester.run(creep);
    }
    //

  }
  ;
}

//}


