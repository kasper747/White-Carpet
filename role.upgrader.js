function movingTo(creep, target) {
  creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
}

let util = require('util');
let getFromSource = false;
let harvester = require('role.harvester');

function moveBack(creep) {
  console.log(creep.name, creep.moveTo.MoveBack);
  if (creep.moveTo.MoveBack === undefined) {
    creep.moveTo.MoveBack = 0;
  }
  console.log('Now', creep.moveTo.MoveBack);
  if (creep.memory.MoveBack < 6) {
    console.log(creep.name, 'Increasing moveback by one');
    creep.memory.MoveBack = 1 + creep.memory.MoveBack;
    creep.moveTo(STRUCTURE_SPAWN, {visualizePathStyle: {stroke: '#ffffff'}});
  }

}

let roleUpgrader = {

  /** @param {Creep} creep **/
  run: function (creep) {


    //Switching to Upgrading
    if (creep.carry.energy === creep.carryCapacity && creep.memory.upgrading === false) {
      creep.memory.upgrading = true;
    }
    //Switching to Harvesting
    else if (creep.carry.energy === 0 && creep.memory.upgrading != false) {
      creep.memory.upgrading = false;
    }
    if (creep.memory.upgrading) {

      creep.memory.task = 'upgrade';

      creep.name,'Moving',util.movingTo(creep,creep.room.controller);
      creep.upgradeController(creep.room.controller);

    }
    else {
      creep.memory.task = 'withdraw';
      //Check if can pick up energy
      if (Game.spawns['Home'].room.energyAvailable > 200 &&
          Memory.NeedEnergyToProcreate === false) {
        let targets = harvester.GetClosestEnergyPickUp(creep);
        if (targets.length > 0) {
          let r = creep.withdraw(targets[0], RESOURCE_ENERGY);
          if (r === ERR_NOT_IN_RANGE) {
            util.movingTo(creep, targets[0]);
          }
        }
      }
      // Retreat to the spawn if not allow to harvest
      else {
        let source = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType === STRUCTURE_SPAWN
          }
        })[0];
        util.movingTo(creep, source);
      }

    }

    creep.say(util.CreepTalk[creep.memory.role].task[creep.memory.task]);
  }
};

module.exports = roleUpgrader;