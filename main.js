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


let roleHarvester = require('role.harvester');
let roleBuilder = require('role.builder');
let roleUpgrader = require('role.upgrader');
let roleTower = require('role.tower');






module.exports.loop = function () {
    let commune = new Commune('r');
    let ConstructionBuro = new BuroOfConstruction();
let committee = new CommitteeOfAppropriation();
let map = new BuroOfCartography();
let r = map.mapRoom('W41N36');
let CreepsBuro = new BuroOfProduction(commune);
let HarvestBuro = new BuroOfHarvest('r');
let ProgressBuro = new BuroOfProgress('r');
    commune.init();
    committee.focusOnCommune('r');
    CreepsBuro.getProductionFacilities();
    /*
    const conSites = Game.rooms['W41N36'].find(FIND_CONSTRUCTION_SITES);
    for (let site in conSites){
        conSites[site].remove();
    }
    */
  console.log('>>>>>>>>>>>>>> NEW TICK <<<<<<<<<<<<<');
  r = CreepsBuro.clearDestroyedCreeps();
  if (myCron(100)) {
    ConstructionBuro.placeImportantRoads();

  }
  if (myCron(10)) {
    committee.transferAssets(Game.spawns.Home.room.find(FIND_SOURCES));
    committee.transferAssets(Game.spawns.Home.room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return s.structureType === STRUCTURE_CONTROLLER
        ||s.structureType === STRUCTURE_TOWER
        ||s.structureType === STRUCTURE_EXTENSION
        ||s.structureType === STRUCTURE_STORAGE
      }
    }));
    committee.transferAssets(Game.spawns);
    committee.transferAssets(Game.rooms);
  }
  if (myCron(1)) {
    committee.transferAssets(Game.creeps);
    //console.log('Removing Creeps:', JSON.stringify(r));
    HarvestBuro.AssignePermaHarvest();
    ConstructionBuro.AssignJobs();
    ProgressBuro.AssignJobs();
  }
  
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
  for (let roomName in Game.rooms){
      let towers = Game.rooms[roomName].find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType === STRUCTURE_TOWER;
    }
  });
  for (let tower in towers) {
    roleTower.run(towers[tower]);
  }
  }
  
}

//}


