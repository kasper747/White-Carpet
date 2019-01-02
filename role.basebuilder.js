//require('util');


var util = require('util');


function moveBack(creep) {
  //console.log(creep.name, creep.memory.MoveBack);
  if (creep.memory.MoveBack === undefined) {
    creep.memory['MoveBack'] = 0;
  }
  //console.log('Now', creep.memory['MoveBack']);
  if (creep.memory['MoveBack'] < 100) {
    console.log(creep.name, 'Increasing moveback by one');
    creep.memory['MoveBack'] = 1 + creep.memory['MoveBack'];
    var targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_SPAWN
      }
    });
    util.movingTo(creep, targets[0]);
  }
}

function SuchingSwitch(creep) {
  //INIT
  if (Memory.Sources === undefined) {
    Memory.Sources = [];
    for (var i in [0, 0]) {
      Memory.Sources.push({'busy': false});
    }
  }

  if (Memory.Sources[creep.memory.MySource].Busy) {
    Memory.Sources[creep.memory.MySource].Busy = false;
  }
  else {
    Memory.Sources[creep.memory.MySource].Busy = true;
  }
}


var CreepType = 'harvester';


var roleHarvester = {
  STRUCTURE_ENERGY_DROP_OF: [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
  ],
  STRUCTURE_ENERGY_SOURCE: [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE
  ],
  LongDistanceHarvesting: function (creep) {


  },
  MIN_ENERGY_TOWER_REFILL: 150,
  /** @param {ObjectInRoom} Some Object in the room **/
  GetClosestEnergyDropOffArray: function (ObjectInRoom) {
    let target;
    if (ObjectInRoom.memory.role === 'longDistanceHarvester' ) {
      //console.log(ObjectInRoom.name,'Looking for drop off');
      target = ObjectInRoom.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return STRUCTURE_CONTAINER === structure.structureType
              && _.sum(structure.store) + 400 < structure.storeCapacity
        }
      });
      //console.log(ObjectInRoom.name,'Got Container as drop off',target);
    }

    if (target === undefined || target === null) {
      target = ObjectInRoom.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return this.STRUCTURE_ENERGY_DROP_OF.includes(structure.structureType)
              && structure.energy < structure.energyCapacity && (
                  structure.structureType !== STRUCTURE_TOWER
                  || structure.energyCapacity - structure.energy > this.MIN_ENERGY_TOWER_REFILL);
        }
      });
    }
    // If no source found drop at the storage
    if (target === undefined || target === null) {
      target = ObjectInRoom.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return [STRUCTURE_STORAGE].includes(structure.structureType)


        }
      });
    }
    //console.log('target', target, );
    return [target]
  },
  /** @param {ObjectInRoom} Some Object in the room **/
  GetClosestEnergyPickUp: function (ObjectInRoom) {
    let target;

    target = ObjectInRoom.pos.findInRange(FIND_STRUCTURES, 6, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_STORAGE
      }
    })[0];

    if (target === undefined || target.store[RESOURCE_ENERGY] < 300) {
      target = ObjectInRoom.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return (this.STRUCTURE_ENERGY_SOURCE.includes(structure.structureType) && (structure.energy > 25))
              || (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100)
        }
      });
      //console.log('2 GetClosestEnergyPickUp', JSON.stringify(target));
    } else {
      //console.log('harvesting>>>', target);
      //console.log('harvesting', JSON.stringify(target.store), target.store[RESOURCE_ENERGY]);
    }

    return [target]
  },

  /** @param {Creep} creep **/
  ContainerHarvesting: true,
  run: function (creep) {



    // Defining the TASK
    util.getTask(creep);
    //theTask(creep);
    var target;
    // Harvesting

    if (creep.memory.task == 'harvest') {
      target = Game.getObjectById(creep.memory['MySource']);
      if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
        util.movingTo(creep, target);
      }
      // Containerharvesting
      if (this.ContainerHarvesting) {
        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType == STRUCTURE_CONTAINER;
          }
        });
        let isCloseToContainer = creep.pos.isEqualTo(container);
        //console.log('TEST: Is close to a container', isCloseToContainer);
        //console.log('container.storeCapacity', container.storeCapacity);
        //console.log('container.store', container.store.energy);
        if (isCloseToContainer && container.storeCapacity > container.store.energy + creep.carry.energy) {
          creep.drop(RESOURCE_ENERGY);
        }
      }

    }
    // Transfering
    else if (creep.memory.task == 'transfer') {
      var targets = this.GetClosestEnergyDropOffArray(creep);
      if (targets.length > 0) {
        target = targets[0];
        creep.memory['MoveBack'] = 0;
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          util.movingTo(creep, target);
        }
      }
      // Waiting
      else {
        moveBack(creep);
      }
    }
  }
};

module.exports = roleHarvester;