'use strict';


const roomName = "W3N7";
let BuroOfCartography = require('BuroOfCartography');
let BuroOfProduction = require('BuroOfProduction');
let BuroOfHarvest = require('BuroOfHarvest');
let CommitteeOfAppropriation = require('Committis');
let Commune = require('Commune');


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


let roleHarvester = require('role.harvester');


let committee = new CommitteeOfAppropriation();
committee.focusOnCommune('r');
let commune = new Commune('r');
commune.init();


let map = new BuroOfCartography();
let r = map.mapRoom('W3N7');
console.log(JSON.stringify(commune.creeps));

let CreepsBuro = new BuroOfProduction(commune);
CreepsBuro.getProductionFacilities();



let HarvestBuro = new BuroOfHarvest('r');

module.exports.loop = function () {

  console.log('>>>>>>>>>>>>>> NEW TICK <<<<<<<<<<<<<');
  committee.transferAssets(Game.spawns.Home.room.find(FIND_SOURCES));
  committee.transferAssets(Game.creeps);
  committee.transferAssets(Game.spawns);
  r = CreepsBuro.clearDestroyedCreeps();
  //console.log('Removing Creeps:', JSON.stringify(r));
  HarvestBuro.AssignePermaHarvest();
  console.log('Need more Creeps',HarvestBuro.needMoreCreeps);
  if (HarvestBuro.needMoreCreeps)
    CreepsBuro.produceCreep();


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
  for (let creepName in Game.creeps) {
    let gameCreep = Game.creeps[creepName];
    let creep =
        Memory.communes.r.creeps[creepName];
    //commune.creeps[creepName];

    if (creep.task === 'harvest') {
      roleHarvester.run(creep);
    }
    //

  }
  ;
}

//}


