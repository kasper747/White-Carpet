let spawnName = 'Home';
let util = require('util');
let roleHarvester = require('role.harvester');
let roleBuilder = require('role.builder');
let safeRooms = ['W42N36'];
module.exports = {
  // a function to run the logic for this role
  GetRoomsToScout: function () {
    try {
      let RoomsToScout = [];
      for (let myRoom in Game.rooms) {
        let rooms = Game.map.describeExits(myRoom);
        for (let roomDirection in rooms) {
          //console.log('Rooms to consider',myRoom);
          let roomName = rooms[roomDirection];
          //Skip known rooms.
          if (!(roomName in Memory.rooms)
              || Memory.rooms[roomName] === {}
              || !Memory.rooms[roomName].hasOwnProperty('Sources')
              || !Memory.rooms[roomName].hasOwnProperty('routs')) {
            //console.log('>>Room we dont know:', roomName);
            RoomsToScout.push(roomName);
            // Is room available?
          }

        }
      }
      return RoomsToScout
    } catch (e) {
      console.log('-------------------Get rooms to scout', e);
    }


  },
  /**
   * Selects room based on how empty the sources there are
   * @param creep
   * @constructor
   */
  SelectTargetRoom: function (creep = '', RoomsToExclude = []) {
    let lineToSource = {};
    let shortDist = 99999;
    let shortSourceID = '';
    let shortRoom = '';
    let shortFlag;
    for (let roomName in Memory.rooms) {
      if (roomName in RoomsToExclude) {
        continue
      }
      if ('Sources' in Memory.rooms[roomName]  //Is this room mapped?
          && roomName !== Game.spawns[spawnName].room.name  // Is room not Home?
      ) {
        lineToSource[roomName] = 0;
        for (let SourceID in Memory.rooms[roomName].Sources) {
          lineToSource[roomName] += Memory.rooms[roomName].Sources[SourceID];
          /*
          Calculation DISTANCE/FLAGS
           */
          if (Memory.rooms[roomName].Sources[SourceID] < 2) {
            const flag = creep.pos.findClosestByPath(creep.room.find(FIND_FLAGS));
            const dist = util.getDistance(creep.pos, SourceID);
            if (flag && dist < shortDist) {
              shortDist = dist;
              shortSourceID = SourceID;
              shortRoom = roomName;
              shortFlag = flag;
            }
            //util.getDistance(creep.memory.MySource, flag.pos)

          }
        }
        lineToSource[roomName] = lineToSource[roomName] / Object.keys(Memory.rooms[roomName].Sources).length;
      }
    }
    let emptiestRoomLine = 999;
    let emptiestRoomName = undefined;
    /*
    Finding the fullest room
     */
    if (!shortFlag) {
      for (let roomName in lineToSource) {
        if (emptiestRoomLine >= lineToSource[roomName]) {
          emptiestRoomLine = lineToSource[roomName];
          shortRoom = roomName;
        }
      }
    }
    //creep.pos.findClosestByPath(creep.room.find(FIND_FLAGS))


    if (creep !== '') {
      /*
      util.AllocateRoomSource(creep, emptiestRoomName);
      creep.memory.targetRoom = emptiestRoomName;
      console.log('Creep is in this room', creep.room.name, 'Allocating new', emptiestRoomName, 'dislike this rooms[0]', RoomsToExclude[0]);
      const flag = creep.pos.findClosestByPath(creep.room.find(FIND_FLAGS));
      if (flag) {
        const dist = util.getDistance(creep.memory.MySource, flag.pos);
        console.log('-------------Found Flag', flag.name, 'Distance:', dist);
      }
       */
      util.AllocateRoomSource(creep, shortRoom, shortSourceID);
      creep.memory.targetRoom = shortRoom;
      creep.memory.distTest = shortDist;
      console.log('-------------Found Flag', 'Distance:', shortDist);


    }

    return emptiestRoomName

  },
  UpdateHarvestRecord: function (creep, energy) {
    if (Game.spawns[spawnName].memory.HarvestRecords === undefined) {
      Game.spawns[spawnName].memory.HarvestRecords = {};

    }
    if (Game.spawns[spawnName].memory.HarvestRecords[creep.name] !== undefined) {
      Game.spawns[spawnName].memory.HarvestRecords[creep.name] += energy;
    } else {
      Game.spawns[spawnName].memory.HarvestRecords[creep.name] = 0;
    }
    creep.memory.HarvestRecords = Game.spawns[spawnName].memory.HarvestRecords[creep.name];
  },
  LedgerRecord: function (creep) {
    if (creep.memory.wasInRoom === undefined) {
      creep.memory.wasInRoom = creep.room.name;
    }
    let sameRoom = creep.memory.wasInRoom === creep.room.name;

    /*
    Adding record
     */

    if (!sameRoom) {
      let myLedger = Game.spawns.Home.memory.Ladger;
      if (myLedger === undefined) {
        Game.spawns.Home.memory.Ladger = {};
        myLedger = Game.spawns.Home.memory.Ladger;
      }
      let recordName = creep.memory.wasInRoom + '>' + creep.room.name;
      if (recordName in myLedger) {
        Memory.spawns.Home.Ladger[recordName] += creep.carry[RESOURCE_ENERGY];
      } else {
        Memory.spawns.Home.Ladger[recordName] = 0;
      }
      console.log('%%%% ', recordName, creep.carry[RESOURCE_ENERGY], 'Total', Memory.spawns.Home.Ladger[recordName])
    }
    creep.memory.wasInRoom = creep.room.name;

  },
  IsRoomRand: function (pos) {
    if (!Memory.rooms[pos.roomName].routs) {
      Memory.rooms[pos.roomName].routs = {};
    }
    let r = false;
    if (Number(pos.x) === 49 || Number(pos.x) === 0 || Number(pos.y) === 0 || Number(pos.y) === 49) {
      r = true
    }
    //console.log('Positions to check:', pos, r);
    return r
  },
  ErrorHandling: function (creep, r) {
    // ERROR
    if (r === ERR_NOT_OWNER) {
      // NOT Owner
      Memory.rooms[creep.room.name].safe = false;
      creep.memory.MySource = undefined;
      console.log('retreat!!!!');
      return 'retreat'
    } else if (r === ERR_NOT_ENOUGH_RESOURCES) {
      console.log(creep, 'ERR_NOT_ENOUGH_RESOURCES', 'Providing new source');
      let r = util.AllocateRoomSource(creep);
      try {
        console.log(creep, 'Source Undefined:', r === null, 'Exclude this room', creep.room.name);
        if (r === undefined || r === null) {
          console.log('Calling select TargetRoom');
          this.SelectTargetRoom(creep, [creep.room.name]);
        }
      } catch (e) {
        console.log('ErrorHandling: Last changes error', e)
      }
    } else if (r === ERR_INVALID_TARGET) { //-7
      console.log(creep, 'ERR_INVALID_TARGET', 'Providing new source');
      let r = util.AllocateRoomSource(creep);
      if (r === undefined || r === null) {
        this.SelectTargetRoom(creep, [creep.room.name]);
      }
    }

  },
  MIN_ROAD_TRAFFIC_FOR_REPAIR: 10,
  MIN_ROAD_TRAFFIC_TO_BUILD: 10,
  run: function (creep) {

    // if creep is bringing energy to a structure but has no energy left
    this.LedgerRecord(creep);
    /**
     * TOMB RAIDER
     */
    let tombs = creep.pos.findInRange(FIND_TOMBSTONES, 3, {
      filter: (structure) => {
        return structure.store[RESOURCE_ENERGY] > 100
      }
    });
    if (tombs.length > 0) {
      let r = creep.withdraw(tombs[0], RESOURCE_ENERGY);
      if (r === ERR_NOT_IN_RANGE) {
        util.movingTo(creep, tombs[0]);
        return
      }
    }
    /**
     State changer
     */


    /*
    HOSTILE in view
     */
    if (creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
      filter: function (object) {
        return object.getActiveBodyparts(ATTACK) > 0;
      }
    }) && creep.memory.task !== 'retreat'
    ) {
      try {
        Memory.danger.rooms[creep.room.name] = true;
      } catch (e) {

      }
      console.log(creep.name, '----------- retreating');
      creep.memory.task = 'retreat';
    }
    /*
    ON-SITE CONSTRUCTION
     */
    else if (creep.carry.energy === creep.carryCapacity && false
        && creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES) !== null) {
      creep.memory.task = 'building'
    }
    else if (creep.memory.task === 'building' && true &&
        (creep.carry.energy < 10 || creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES) === null)) {
      creep.memory.task = 'harvest';
    }
    /*
    Harvesting
     */
    else if (creep.memory.task === 'transfer' && creep.carry.energy === 0) {
      // switch state
      this.UpdateHarvestRecord(creep, creep.carry.energy);
      creep.memory.task = 'harvest';
      this.SelectTargetRoom(creep);
    }
    /*
    Transporting
    */
// if creep is harvesting energy but is full
    else if (creep.memory.task === 'harvest' && creep.carry.energy === creep.carryCapacity) {
      // switch state
      creep.memory.task = 'transfer';
    }
    /*
    DEFAULT
    */
    else if (creep.memory.task === undefined) {
      // In case of initiation or to abort the setting before
      creep.memory.task = 'transfer';
    }
    /*
    BACK HOME
     */
    else if (creep.pos.findInRange(FIND_MY_STRUCTURES, 10, {
          filter: (s) => {
            return s.structureType === STRUCTURE_SPAWN;
          }
        }).length > 0
        && creep.memory.task === 'retreat' && creep.memory.home === creep.room.name) {


      creep.memory.task = 'harvest';
      console.log(creep.name, 'Changed to harvest', creep.memory.task);
    }

    /**
     * TRANSFER
     */
    if (creep.memory.task === 'transfer') {
      // if in home room

      /*
      TRANSFER: HOME
      */
      if (creep.room.name === creep.memory.home) {
        if (creep.MySource !== undefined) {
          util.ReleaseRoomSource(creep);
        }
        creep.say('Hi!');
        let structure = roleHarvester.GetClosestEnergyDropOffArray(creep)[0];
        // if we found one
        if (structure !== undefined) {
          // try to transfer energy, if it is not in range
          let r = creep.transfer(structure, RESOURCE_ENERGY);
          if (r === ERR_NOT_IN_RANGE) {
            util.movingTo(creep, structure);
          }
        }
      } else {
        /*
        TRANSFER: AWAY
         */
        /*
          Repairing rooms
        */
        let routsTraffic = Memory.rooms[creep.room.name].routs;
        console.log(Memory.rooms[creep.room.name].routs, creep.room.name);
        if (this.IsRoomRand(creep.pos) === false) {

          if (routsTraffic[creep.pos.x + ',' + creep.pos.y] > this.MIN_ROAD_TRAFFIC_TO_BUILD
              /**
               * Repair all roads
               */
              && true) {
            let r = creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
            //console.log('Create consturction:',r , creep.pos);// Check, if there is no road or any construction.
            if (creep.room.lookForAt(LOOK_STRUCTURES, creep.pos, {
              filter: (structure) => {
                return structure.structureType === STRUCTURE_ROAD
              }
            }).length === 0) {
              let r = creep.build(creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos)[0]);
              console.log(
                  creep.name,
                  'Building a road',
                  creep.build(creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos)[0]),
                  'its traffic is:',
                  routsTraffic[creep.pos.x + ',' + creep.pos.y]);
              if (r >= 0) {
                return
              }
            }
            let target = roleBuilder.GetRoadToMaintain(creep, creep,
                5,
                this.MIN_ROAD_TRAFFIC_FOR_REPAIR,
                'repair',
                3000);
            if (target !== false) {
              //console.log(creep.name, 'Repairing road:', creep.repair(target));
              creep.repair(target);
            }
          }
          let r = util.goHome(creep);
          console.log(creep.name, 'Moving', r);
        }
        /*
        Moving
         */
        else {
          let r = util.goHome(creep);
          console.log(creep.name, 'Wrong option');
        }
      }

    }
    /**
     * ON-SITE Construction
     */
    else if (creep.memory.task === 'building') {
      let target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);

      let r = creep.build(target);
      if (r === ERR_NOT_IN_RANGE) {
        util.movingTo(creep, target);
        r = creep.build(target);
      }
    }
    /**
     * HARVESTING
     */
    else if (creep.memory.task === 'harvest') {


      /*
      HARVEST: TARGET ROOM
       */
      if (creep.room.name === creep.memory.targetRoom) {

        creep.say('Geme!');
        console.log(creep.room.name);
        if (creep.memory.MySource === undefined
            || !('Sources' in Memory.rooms[creep.room.name]
                && creep.memory.MySource in Memory.rooms[creep.room.name].Sources
            )
        ) {
          //console.log(creep.name, creep.memory.MySource , Object.keys(Memory.rooms[creep.room.name]));
          util.AllocateRoomSource(creep);
          if (!creep.memory.MySource){
            this.SelectTargetRoom();
          }
          if (!creep.memory.MySource){
            console.log(creep.name, 'NO GOOD SOURCES');
          }

          //console.log(creep.name, 'got new source', creep.memory.MySource);
        }
        // find source


        // try to harvest energy, if the source is not in range
        let x, y, room;
        console.log(creep.memory.targetRoom,creep.memory.MySource);
        [x, y, room] = Memory.Shard3Objects[creep.memory.MySource].posStr.split(',');
        let pos = new RoomPosition(x, y, room);
        let target = Game.getObjectById(creep.memory.MySource);
        if (pos === null || pos === undefined) {
          console.log('New Feature does not work.');
          alarm('!');
        }
        //Get CONTAINER
        let container = target.pos.findInRange(FIND_STRUCTURES, 1, {
              filter: (s) => {
                return s.structureType === STRUCTURE_CONTAINER;
              }
            }
        )[0];
        let r;
        // Try to performe REPAIR
        if (container !== undefined && creep.carry.energy > 20 && container.hits < container.hitsMax) {
          //r = creep.repair(container);
          console.log(creep.name, 'REPAIR', r);
        }

        if (r === OK) {
          r = OK;
        } else {

          if (container !== undefined && container.store.energy > 0) {
            console.log('Found container');
            r = creep.withdraw(container, RESOURCE_ENERGY);
            if (r === ERR_NOT_IN_RANGE) {

              util.movingTo(creep, container);
              return
            }
          } else {
            // Try to performe HARVEST
            r = creep.harvest(target);
            console.log(creep.name, 'HARVEST', r, target);
          }


          if (r === OK) {

            // Try to DROP
            if (container !== undefined && container !== null
                && container.pos.isEqualTo(creep.pos)
                && container.storeCapacity > container.store.energy + creep.carry.energy) {
              if (false) {
                creep.drop(RESOURCE_ENERGY);
              }
              //
            }
          } else {
            //Try to COLLECT from CONTAINER


          }

        }


        //console.log(creep.name, 'Got Object Source:', target, r);
        /**
         * Placing container
         * - Check if a container nearby
         * - If not, check  if a construction site for container is nearby
         */
        try {

          //console.log('Contianer', container);
          let constSite;
          if (container === undefined) {
            if (r === OK) {
              //Get Construction Site
              let constSite = target.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
                    filter: (s) => {
                      return s.structureType === STRUCTURE_CONTAINER;
                    }
                  }
              )[0];
              //console.log('constSite', constSite);
              //Placing construction site
              if (constSite === undefined) {
                if (false) {
                  creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                }
                //
                constSite = target.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
                      filter: (s) => {
                        return s.structureType === STRUCTURE_CONTAINER;
                      }
                    }
                )[0];

              }
            }
          }


        }
        catch
            (e) {
          console.log('ERROR', e)

        }
        if (r === ERR_NOT_IN_RANGE) {
          // move towards the source
          console.log('Moving to the:', pos);
          util.movingTo(creep, pos);
          if (creep.memory.ImBlocked > 4 && creep.memory.ImBlocked < 9) {
            util.AllocateRoomSource(creep);
          } else if (creep.memory.ImBlocked > 4) {
            //util.
            console.log(creep.name, 'Need to reset room and Source');
            this.SelectTargetRoom(creep, [creep.memory.targetRoom]);

          }

        }
        else if (r < 0) {
          console.log(creep.name, 'getting unusual error', r);
          if (r === ERR_NO_BODYPART) {
            console.log(creep.name, 'ERR_NO_BODYPART');
            util.CantDoMyJob(creep);
          }
          if (this.ErrorHandling(creep, r) === 'retreat') {
            creep.memory.task = 'retreat';
            util.goHome(creep);
            return
          }
        } else {
          //alarm("!");
        }

      }
      /*
      HARVEST HOME
       */
      else {
        creep.say('Bay!');
        console.log(creep.name, 'Move to target Room', creep.memory.targetRoom);
        if (!creep.memory.targetRoom || !creep.memory.MySource) {
          this.SelectTargetRoom(creep);
        }

        // find exit to target
        let x, y, room;
        console.log(creep.name, creep.memory.targetRoom, creep.memory.MySource);
        [x, y, room] = Memory.Shard3Objects[creep.memory.MySource].posStr.split(',');
        let pos = new RoomPosition(x, y, room);
        //let target = Game.getObjectById(creep.memory.MySource);


        let r = util.movingTo(creep, pos);
        console.log(creep.name, 'Do the moveTo. r:', r, 'Im Blocker', creep.memory.ImBlocked);
        if (r === ERR_NOT_IN_RANGE || creep.memory.ImBlocked > 0) {
          // move towards the source
          console.log('Moving to the:', pos);
          util.movingTo(creep, pos);
          if (creep.memory.ImBlocked > 4 && creep.memory.ImBlocked < 7) {
            console.log(creep.name, 'Getting new sources');
            util.AllocateRoomSource(creep);
          } else if (creep.memory.ImBlocked >= 7) {
            //util.
            console.log(creep.name, 'Need to reset room and Source');
            this.SelectTargetRoom(creep, [creep.memory.targetRoom]);
            creep.memory.ImBlocked = 0;
            console.log(creep.name, 'New room', creep.memory.targetRoom);

          }

        }
        else if (r < 0) {
          console.log(creep.name, 'getting unusual error', r);
          if (r === ERR_NO_BODYPART) {
            console.log(creep.name, 'ERR_NO_BODYPART');
            util.CantDoMyJob(creep);
          }
          if (r === ERR_NO_PATH) {
            console.log(creep.name, 'ERR_NO_PATH');
            this.SelectTargetRoom(creep, [creep.memory.targetRoom]);
          }
          if (this.ErrorHandling(creep, r) === 'retreat') {
            creep.memory.task = 'retreat';
            util.goHome(creep);
            return
          }
        } else {
          //alarm("!");
        }
        // move to exit

      }
    }
    /**
     * RETREAT
     */
    else if (creep.memory.task === 'retreat'
    ) {
      console.log(creep.name, 'going home');
      util.goHome(creep);

    }
    else {
      console.log(creep.name, 'WARNING');
    }
  }
}
;