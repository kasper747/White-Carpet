/**
 *  Source:
 *  https://github.com/KarateSnoopy/LetsPlayScreeps/blob/944ef80deecc0e2980868db88b45536e5f369cbb/src/main.ts
 *
 */

let roleHarvester = require('role.harvester');

/*
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleLorry = require('role.lorry');
let roleMiner = require('role.miner');
*/

let util = require('util');
let roleLorry = {
  // a function to run the logic for this role
  run: function (ComCreep) {
          
        let creep = Game.creeps[ComCreep.name];
    // if creep is bringing energy to a structure but has no energy left
    if ( creep.carry.energy === 0) {
      // switch state

      creep.memory.task = 'collect';


    }
    // if creep is harvesting energy but is full
    else if ( creep.carry.energy >= creep.carryCapacity / 2 
        || creep.memory.task === undefined
    ) {
      creep.memory.task = 'transfer';

    }



    // if creep is supposed to transfer energy to a structure
    if (creep.memory.task === 'transfer') {
      // find closest spawn, extension or tower which is not full
       
        
        let target ;
        if (ComCreep.targetContainer){
            target = Game.getObjectById(ComCreep.targetContainer);
            creep.memory.targetType = target ? 'permaTarget' : undefined;
        }
        
        if (!target ) {
          target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
              return [STRUCTURE_SPAWN,STRUCTURE_EXTENSION].includes(structure.structureType)
                  && structure.energy < structure.energyCapacity || (
                      structure.structureType === STRUCTURE_TOWER
                      && structure.energyCapacity - structure.energy > this.MIN_ENERGY_TOWER_REFILL
                      && structure.energy < structure.energyCapacity);
            }
          });
        }
        
        if (!target ) {
          target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
              return [STRUCTURE_SPAWN,STRUCTURE_EXTENSION].includes(structure.structureType)
                  && structure.energy < structure.energyCapacity || (
                      structure.structureType === STRUCTURE_TOWER
                      && structure.energyCapacity - structure.energy > this.MIN_ENERGY_TOWER_REFILL
                      && structure.energy < structure.energyCapacity);
            }
          });
        }
        // If no source found drop at the storage
        if (target === undefined || target === null) {
          target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
              return [STRUCTURE_STORAGE].includes(structure.structureType) 
              && structure.store.energy < structure.storeCapacity
            }
          });
        }
      // if we found one
      if (target ) {
        // try to transfer energy to the creeps nearby
        if (!Memory.NeedEnergyToProcreate) {
          let creeps = creep.pos.findInRange(FIND_CREEPS, 1, {
            filter: s => s.memory !== undefined && s.memory.role === 'upgrader'
          });
          for (let name in creeps) {
            let e_before = creep.carry.energy;
            creep.transfer(creeps[name], RESOURCE_ENERGY);
            let e_after = creep.carry.energy;
            let a = e_before - e_after;
            if (creep.carry.energy === 0) {
              break;
            }
          }
        }

        // try to transfer energy, if it is not in range
        creep.memory.target = target.id;
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          // move towards it
          creep.moveTo(target);
          creep.transfer(target, RESOURCE_ENERGY);
        }
      }
    }
    // if creep is supposed to get energy
    else if (creep.memory.task === 'collect') {
      let tomb = creep.pos.findInRange(FIND_TOMBSTONES,4, {
        filter: (structure) => {
          return structure.store[RESOURCE_ENERGY] > 10
        }
      });
      if (tomb) {
        let r = creep.withdraw(tomb, RESOURCE_ENERGY);

        if (r === ERR_NOT_IN_RANGE) {
          creep.moveTo( tomb);
          return
        }

      }


      // find closest target
      let target = null;

      if (target === null) {
        //console.log(ObjectInRoom.name,'Looking for drop off');
        target = creep.pos.findInRange(FIND_STRUCTURES, 7, {
          filter: (s) => {
            return STRUCTURE_LINK === s.structureType
                && s.energy > 0
          }
        })[0];
        if (target === undefined) target = null;
        //console.log(ObjectInRoom.name,'Got Container as drop off',target);
      }
      if (target === null) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.carryCapacity / 2
        });
      }
      if (target === null) {
        // Get from storage if needed
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (structure) => {
            return [STRUCTURE_STORAGE].includes(structure.structureType)
                && structure.store[RESOURCE_ENERGY] > 200
          }
        });
      }
      // if one was found
      if (target) {
        // try to withdraw energy, if the target is not in range
        
        if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          // move towards it
          creep.moveTo(target);
        }
      }
      // Waiting and BackOff
      else {
          console.log(creep.name, ComCreep.task,'Cant move')
        util.moveBack(creep);
      }
    }
    else {
      console.log('NO ANSWER TO THIS!');

    }

  }
};

module.exports = roleLorry;