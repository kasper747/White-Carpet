// Walls Management
let WALL_HITS_START_REPAIR = 30000;
let spawnName = 'Home';
let CONSTRUCTION_PRIORITY = [
  STRUCTURE_SPAWN,
  STRUCTURE_EXTENSION,
  STRUCTURE_CONTAINER,
  STRUCTURE_TOWER,
  STRUCTURE_WALL,
  STRUCTURE_RAMPART,
  STRUCTURE_ROAD,
  STRUCTURE_STORAGE,
  STRUCTURE_LINK,

];

function findWallsOrRampsToRepair(creep) {
  let returnedWalls = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return [STRUCTURE_WALL, STRUCTURE_RAMPART].includes(structure.structureType)
              && structure.hits < WALL_HITS_START_REPAIR;
        }
      })
  ;
  return returnedWalls;
}


let util = require('util');
let harvester = require('role.harvester');

let CreepType = 'builder';


function moveBack(creep) {
  //console.log(creep.name, creep.memory.MoveBack);
  if (creep.memory.MoveBack === undefined) {
    creep.memory['MoveBack'] = 0;
  }
  //console.log('Now', creep.memory['MoveBack']);
  if (creep.memory['MoveBack'] < 100) {
    //console.log(creep.name, 'Increasing moveback by one');
    creep.memory['MoveBack'] = 1 + creep.memory['MoveBack'];
    let targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_TOWER
      }
    });
    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
  }

}


let roleBuilder = {
      HITS_STOP_REPAIR: 80000,
      MIN_HITS_CONTAINER: 250 * 1000 / 2,//structure.hitsMax/2,
      MAX_HITS_CONTAINER: 250 * 1000,
      HITS_ROADS_START_REPAIR: 1500,
      /**
       * - Define the room
       * - Define the room
       * - Get the route to there from the spawn or other object in the room.
       * - Ignore swamps, existing road and creeps - get just the cleanest path.
       * - Place road constuctionSites alone the way.
       * - Keep the road priority to high all the time, even if no traffic.
       * @todo teach them to avoid swamps when possible.
       * @constructor
       */
      BuildInterstateRoads: function (SpawnObject, distantSourceId = '') {
        let rooms = Game.map.describeExits(SpawnObject.room.name);
        let homeRoom = SpawnObject.room;
        let path;
        if (distantSourceId === '') {
          for (let idx in rooms) {
            let RoomWestName = rooms[idx];
            console.log(RoomWestName);
            const exitDir = SpawnObject.room.findExitTo(RoomWestName);
            const exit = SpawnObject.pos.findClosestByRange(exitDir);
            let spawn = SpawnObject.room.find(FIND_STRUCTURES, {
              filter: (structure) => {
                return structure.structureType === STRUCTURE_SPAWN
              }
            })[0];
            path = SpawnObject.room.findPath(spawn.pos, exit, {ignoreCreeps: true, ignoreRoads: true, swampCost: 1});
            for (let idx in path) {
              let r = SpawnObject.room.createConstructionSite(path[idx].x, path[idx].y, STRUCTURE_ROAD);
              homeRoom.memory.routs[path[idx].x + ',' + path[idx].y] = 400;
              console.log(r);
            }
          }

        }
        else {
          path = Game.getObjectById(distantSourceId).room.findPath(
              Game.getObjectById(distantSourceId).pos,
              SpawnObject.pos,
              {ignoreCreeps: true, ignoreRoads: true, swampCost: 1});
          for (let idx in path) {
            let r = Game.getObjectById(distantSourceId).room.createConstructionSite(path[idx].x, path[idx].y, STRUCTURE_ROAD);
            Memory.rooms[Game.getObjectById(distantSourceId).room.name].routs[path[idx].x + ',' + path[idx].y] = 400;
            console.log(r);
          }
          return path[0]
        }


      },
      BuildImportantRoads: function (ObjectInRoom = Game.spawns[spawnName], minTraffic = 100) {
        let RouteTraffic;

        RouteTraffic = Memory.rooms[ObjectInRoom.room.name].routs;


        for (let routPos in RouteTraffic) {
          let likes = RouteTraffic[routPos];
          if (likes >= minTraffic) {
            let x = Number(routPos.split(',')[0]);
            let y = Number(routPos.split(',')[1]);
            ObjectInRoom.room.createConstructionSite(x, y, STRUCTURE_ROAD);
          }
        }
      }
      ,
      /** @param {Creep} creep **/
      IsTargetValide: function (creep) {
        let r = false;
        let workType, task, target;
        if (creep.memory.target != undefined && creep.memory.workType != undefined) {

          // The Ant has already a goal.
          target = Game.getObjectById(creep.memory.target);
          workType = creep.memory.workType;
          task = creep.memory.task;

          // Is this target still valid?
          if ((workType === 'build' && target === null) ||
              (workType === 'repair' && target.hits >= Math.min(this.HITS_STOP_REPAIR, target.hitsMax))) {
            r = false;
          }
          else if (workType === 'retreat') {
            if (this.GetNewTarget(creep)[0].structureType != STRUCTURE_SPAWN) {
              r = false;
            }
          }
          else {
            r = true;
          }
        }
        //console.log(creep.name, 'workType:', workType, 'task:', task, 'Is Target Valide: ', r, 'Jobs:', this.GetNewTarget(creep)[0].structureType);
        return r
      }
      ,
      UpdateTarget: function (creep) {
        let target, workType;
        if (creep.structureType !== STRUCTURE_TOWER && this.IsTargetValide(creep)) {
          // The Ant has already a goal and it is correct.
          target = Game.getObjectById(creep.memory.target);
          workType = creep.memory.workType;
        }
        else {
          // The Ant gets new goal.
          [target, workType] = this.GetNewTarget(creep);
          //console.log(creep.name, 'Our new target:', target, workType);
          creep.memory.target = target.id;
          creep.memory.workType = workType;
        }
        return [target, workType]
      }
      ,
      /**
       * Select the roads, that needs to be repaired as first.
       * Takes into account the distance and the traffic.
       * @param ObjectInRoom
       * @param SpawnObject
       * @returns {*}
       * @constructor
       */
      GetRoadToMaintain: function (ObjectInRoom,
                                   SpawnObject = Game.spawns[spawnName],
                                   maxRange = 49,
                                   minTraffic = 10,
                                   JobType = 'repair',
                                   RepairRoadsAt = this.HITS_ROADS_START_REPAIR) {
        //console.log('>>>>>>>>>>>>',ObjectInRoom.id);
        // Selecting memory source


        let target;
        if (JobType === 'repair') {
          target = SpawnObject.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
              return structure.structureType === STRUCTURE_ROAD
                  && structure.hits < RepairRoadsAt
              //&& structure.pos.x+','+structure.pos.x in routsTraffic
            }
          });
        }
        return target
      }
      ,
      GetContainerToRepair: function (ObjectInRoom) {
        let target = ObjectInRoom.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType === STRUCTURE_CONTAINER && structure.hits < this.MIN_HITS_CONTAINER;
          }
        });
        return target
      }
      ,
      GetNewTarget: function (creep) {
        let room = creep.room;
        let workType;
        let target;
        /*
        Repair Walls
         */
        let possibleTarget = findWallsOrRampsToRepair(creep);
        if (possibleTarget !== undefined && possibleTarget !== null) {
          //console.log('get RampsOrWalls');
          workType = 'repair';
          target = possibleTarget;
        }
        /*
        Building
        */
        else {
          let targets;
          // Container
          target = this.GetContainerToRepair(creep);
          if (target) {
            //console.log('get container');
            workType = 'repair';
            return [target, workType]
          }
          // Repair Roads
          target = this.GetRoadToMaintain(creep);
          if (target) {
            //console.log('get road');
            workType = 'repair';
            return [target, workType]
          }
          // Building Structures
          for (let types in CONSTRUCTION_PRIORITY) {
            workType = 'build';
            //console.log('CONSTRUCTION_PRIORITY:', types);
            target = room.find(FIND_CONSTRUCTION_SITES, {
              filter: (structure) => {
                return structure.structureType === CONSTRUCTION_PRIORITY[types]
              }
            })[0];
            //console.log('Building','Type:',CONSTRUCTION_PRIORITY[types],'Count:',targets.length);
            if (target) {
              return [target, workType];
            }
          }

          // Retreating for Waiting

          target = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return structure.structureType === STRUCTURE_SPAWN
            }
          })[0];

          workType = 'retreat';

        }
        return [target, workType]
      }
      ,
      run: function (ComCreep) {
        let creep = Game.creeps[ComCreep.name];
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

        let allawedToGetEnergy = true;
        // Builder Initiation

        /**
         * State Switching
         */
        if (creep.carry.energy === 0) {
          creep.memory.task = 'harvest';

        }
        // Switching to build
        else if (creep.carry.energy > creep.carryCapacity / 2) {
          creep.memory.task = 'build';
        }

        /**
        Actualy Work
         */
        let target, workType;
        [target, workType] = this.UpdateTarget(creep);

        if (creep.memory.task === 'build') {
          if (workType === 'repair') {
            if (creep.repair(target) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target);
            }
          } else if (workType === 'build') {
            if (creep.build(target) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target);
            }
          } else if (workType === 'retreat') {
              delete Memory.communes.r.creeps[creep.name].task;
            creep.moveTo(target);

          }
        }
        // Getting energy
        else if (creep.memory.task === 'harvest') {
          //Check if can pick up energy

          if (allawedToGetEnergy) {
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


      }
    }
;

module.exports = roleBuilder;