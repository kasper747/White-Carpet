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
  run: function (creep) {

    // if creep is bringing energy to a structure but has no energy left
    if (creep.memory.task === 'transfer' && creep.carry.energy === 0) {
      // switch state

      creep.memory.task = 'collect';


    }
    // if creep is harvesting energy but is full
    else if (creep.memory.task === 'collect' && creep.carry.energy >= creep.carryCapacity / 2) {
      // switch state

      creep.memory.task = 'transfer';

    }
    else if (creep.memory.task === undefined) {

      // In case of initiation or to abort the setting before
      creep.memory.task = 'transfer';

    }


    // if creep is supposed to transfer energy to a structure
    if (creep.memory.task === 'transfer') {
      // find closest spawn, extension or tower which is not full
      let structure = roleHarvester.GetClosestEnergyDropOffArray(creep)[0];
      // if we found one
      if (structure !== undefined) {
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
        if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          // move towards it
          util.movingTo(creep, structure);
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
      /*
      try {

        if (Memory.containers === undefined){
          Memory.containers = {}
        }
        for (let roomName in Object.keys(Game.rooms)) {
          let containers = Game.rooms[roomName].find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
                //&& s.store[RESOURCE_ENERGY] > 500
          })
          for (let idx in containers){
            if (containers[idx].id in Memory.containers === false){
              Memory.containers[containers[idx].id] = 0;
            }
          }


        }

      } catch (e) {

      }
       */
      try {
        //LORRIES
        if (creep.target === undefined) {
          let lorries = _.find(FIND_MY_CREEPS, {
            filter: s => s.memory.role === 'lorry'
                && s.memory.role !== undefined
          });
          //Defininf ROOMS
          loop :{
            for (let roomName in Object.keys(Game.rooms)) {
              // CONTAINERS
              let containers = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
                    && s.store[RESOURCE_ENERGY] > 500
              });
              let freeContainer;

              for (let idx in containers) {
                freeContainer = containers[idx].id;
                for (let idx2 in lorries) {
                  if (lorries[idx2].memory.target === containers[idx]) {
                    freeContainer = undefined;
                    // next container
                    break
                  }
                }
                if (freeContainer !== undefined) {
                  creep.memory.target = freeContainer;
                  break loop
                }

              }

            }
          }

        }

      } catch (e) {

      }
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
      if (target !== undefined || target !== null) {
        // try to withdraw energy, if the target is not in range
        if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          // move towards it
          util.movingTo(creep, target);
        }
      }
      // Waiting and BackOff
      else {
        util.moveBack(creep);
      }
    }
    else {
      console.log('NO ANSWER TO THIS!');

    }

  }
};

module.exports = roleLorry;