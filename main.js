'use strict';


const roomName = "W3N7";
let BuroOfCartography = require('BuroOfCartography');
let BuroOfProduction = require('BuroOfProduction');
let BuroOfHarvest = require('BuroOfHarvest');
let BuroOfConstruction = require('BuroOfConstruction');
let BuroOfProgress = require('BuroOfProgress');
let CommitteeOfAppropriation = require('Committis');
let Commune = require('Commune');


function myCron(numberT, numberD = 0) {
  return (Game.time + numberD) / numberT == Math.round((Game.time + numberD) / numberT)
}


Creep.prototype.kill = function () {
  // create a balanced body as big as possible with the given energy
  // create creep with the created body and the given role
  return this.suicide();
};


let roleHarvester = require('role.harvester');
let roleBuilder = require('role.builder');
let roleUpgrader = require('role.upgrader');


let ConstructionBuro = new BuroOfConstruction();
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
let ProgressBuro = new BuroOfProgress('r');

module.exports.loop = function () {

  console.log('>>>>>>>>>>>>>> NEW TICK <<<<<<<<<<<<<');
  if (myCron(100)) {
    ConstructionBuro.placeImportantRoads();

  }
  if (myCron(20)) {
    committee.transferAssets(Game.spawns.Home.room.find(FIND_SOURCES));
    committee.transferAssets(Game.spawns.Home.room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return s.structureType === STRUCTURE_CONTROLLER
      }
    }));
    committee.transferAssets(Game.creeps);
    committee.transferAssets(Game.spawns);
    committee.transferAssets(Game.rooms);
  }
  if (myCron(5)) {

    //console.log('Removing Creeps:', JSON.stringify(r));
    HarvestBuro.AssignePermaHarvest();
    ConstructionBuro.AssignJobs();
    ProgressBuro.AssignJobs();
  }
  r = CreepsBuro.clearDestroyedCreeps();
  if (HarvestBuro.needMoreCreeps || ConstructionBuro.needMoreCreeps || ProgressBuro.needMoreCreeps)
    CreepsBuro.produceCreep();




  for (let creepName in Game.creeps) {
    let gameCreep = Game.creeps[creepName];
    let creep =
        Memory.communes.r.creeps[creepName];
    //commune.creeps[creepName];

    if (creep.task === 'harvest') {
      roleHarvester.run(creep);
    }
    else if (creep.task === 'build') {
      roleBuilder.run(creep);
    }
    else if (creep.task === 'progress') {
      roleUpgrader.run(creep);
    }
    //

  }
  ;
}

//}


