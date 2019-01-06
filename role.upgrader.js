let util = require('util');
let harvester = require('role.harvester');


let roleUpgrader = {

  /** @param {Creep} creep **/
  run: function (ComCreep) {
    let creep = Game.creeps[ComCreep.name];
    let AllowedToSpendEnergy = true;
    //Switching to Upgrading
    if (creep.carry.energy === creep.carryCapacity && creep.memory.upgrading === false) {
      creep.memory.upgrading = true;
    }
    //Switching to Harvesting
    else if (creep.carry.energy === 0 && creep.memory.upgrading !== false) {
      creep.memory.upgrading = false;
    }
    if (creep.memory.upgrading) {

      let target = Game.getObjectById(ComCreep.target);
      if (!target) {
        target = Memory.map['shard3'][ComCreep.target];
      }
      let targetPos = new RoomPosition(Number(target.pos.x), Number(target.pos.y), target.pos.roomName);

      ComCreep.target;
      creep.memory.task = 'upgrade';

      creep.moveTo(targetPos);
      creep.upgradeController(creep.room.controller);

    }
    else {
      creep.memory.task = 'withdraw';
      //Check if can pick up energy
      if (AllowedToSpendEnergy) {
        let target = harvester.GetClosestEnergyPickUp(creep)[0];
        if (target) {
          let r = creep.withdraw(target, RESOURCE_ENERGY);
          if (r === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
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
        creep.moveTo(source);
      }

    }

    creep.say(util.CreepTalk['progress'].task[creep.memory.task]);
  }
};

module.exports = roleUpgrader;