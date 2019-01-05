'use strict';



const roomName = "W3N7";let ex = require('BuroOfCartography');
let BuroOfCartography = ex[0];
let BuroOfProduction = require('BuroOfProduction');
let BuroOfHarvest = ex[1];
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



let committee = new CommitteeOfAppropriation();
committee.focusOnCommune('r');
let a = new Commune('r');
a.init();

committee.transferAssets(Game.spawns.Home.room.find(FIND_SOURCES));
committee.transferAssets(Game.creeps);
committee.transferAssets(Game.spawns);
let map = new BuroOfCartography();
let r = map.mapRoom('W3N7');
console.log(JSON.stringify(a.creeps));

let CreepsBuro = new BuroOfProduction(a);
CreepsBuro.getProductionFacilities()
r = CreepsBuro.clearDestroyedCreeps();
r = CreepsBuro.produceCreep([MOVE, WORK, CARRY]);
console.log('Production', JSON.stringify(r));


let HarvestBuro = new BuroOfHarvest('r');

module.exports.loop = function () {

  //console.log('>>>>>>>>>>>>>> NEW TICK <<<<<<<<<<<<<');
  HarvestBuro.AssignePermaHarvest();
  CreepsBuro.produceCreep([MOVE, WORK, CARRY]);
  


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


