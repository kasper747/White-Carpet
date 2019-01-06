var spawnName = 'Home';
module.exports = {
  myCron(numberT, numberD = 0) {
    return (Game.time + numberD) / numberT == Math.round((Game.time + numberD) / numberT)
  },
  goHome(creep) {
    this.movingTo(creep, Game.spawns['Home']);
    creep.say('Going home');
  },

  moveBack(creep) {
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
      this.movingTo(creep, targets[0]);
    }
  },
  HandelDeadAnts() {
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        if (Memory.creeps[name].MySource != undefined) {

          this.ReleaseRoomSource(Memory.creeps[name].MySource);
        }
        delete Memory.creeps[name];
        //console.log('Clearing non-existing creep memory:', name);
      }
    }
  },
  CantDoMyJob: function (creep) {
    console.log('☠️ Killing myself ☹️');
    if (creep.getActiveBodyparts(ATTACK).length > 0 || creep.getActiveBodyparts(RANGED_ATTACK).length > 0) {

    } else {
      //creep.suicide();
    }

  },
  MapRooms: function () {
    console.log('☠️ MAPPING ROOMS ☹️');
    for (let roomName in Game.rooms) {
      // Can see the roomName?
      if (Game.rooms[roomName] === undefined) {
        //The room is not invisible
        continue
      }
      //console.log('Mapping roomName:',roomName);
      if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {};
      }
      if (Memory.rooms[roomName].Sources === undefined || Memory.Shard3Objects[Object.id] === undefined
      //|| true
      ) {
        // Sources are unmapped?
        Memory.rooms[roomName].Sources = {};
        let sources = Game.rooms[roomName].find(FIND_SOURCES);
        //Adding visible sources
        for (let idx in sources) {
          //console.log(sources[idx].id);
          let Object = Game.getObjectById(sources[idx].id);
          if (Memory.Shard3Objects[Object.id] === undefined) {
            //console.log('Creating a record',Object,sources[idx].id, Object.pos);
            let pos = Object.pos;
            Memory.Shard3Objects[Object.id] = {};
            Memory.Shard3Objects[Object.id].posStr = pos.x + ',' + pos.y + ',' + pos.roomName;
            Memory.Shard3Objects[Object.id].type =
                Game.getObjectById(Object.id).toString().split(' ')[0].split('[')[1];
            Memory.Shard3Objects[Object.id].roomName = Object.room.name;
          }
          Memory.rooms[roomName].Sources[sources[idx].id] = 0;
        }
      }
      //
    }

  },
  /**
   * @todo Save in the memory of the room, not the swapn.
   * @param creep
   * @param target
   */

  /**
   * Update Lines to Sources
   * CRON
   * @constructor
   */
  UpdateSources() {
    let SourcesInUse = {};
    /*
    Creeps Memory
    */
    console.log('##### --- UpdateSources --- #####');
    for (let creepName in Memory.creeps) {
      let creep = Game.creeps[creepName];
      if (creep.memory.MySource !== undefined) {
        if (creep.memory.MySource in SourcesInUse) {
          SourcesInUse[creep.memory.MySource] += 1;
        } else {
          SourcesInUse[creep.memory.MySource] = 1;
        }
      }
    }

    /*
     Updating Room Source Memory
    */
    let Rooms = Memory.rooms;
    for (let roomName in Rooms) {
      //console.log('room', roomName);
      /*
      CLEAN UP
       */
      if (!roomName) {
        delete Memory.rooms[roomName];
        continue
      }

      for (let SourceName in Memory.rooms[roomName].Sources) {
        /*
        CLEAN UP
       */
        if (!SourceName) {
          delete Memory.rooms[roomName].Sources[SourceName];
          continue
        }

        if (Memory.rooms[roomName].hasOwnProperty('safe')
            && !Memory.rooms[roomName].safe) {
          //NOT SAFE
          Memory.rooms[roomName].Sources[SourceName] = 999;
        }
        else {
          let Spawn = Game.spawns[spawnName];
          let dist = this.getDistance(SourceName, Spawn.id);
          //console.log(roomName, SourceName, 'Distance to source:', dist);
          if (typeof dist === "string") {
            /*
            Cant calculate the distance
             */
            Memory.rooms[roomName].Sources[SourceName] = 999;
            if (dist === '0') {
              //delete Memory.rooms[roomName];
              continue
            }
          }
          if (dist > 100) {
            Memory.rooms[roomName].Sources[SourceName] = this.getDistance(SourceName, Spawn.id);
          }
        }


        if (Memory.rooms[roomName].Sources[SourceName] > 99) {
          //OTHER BLOCK.
          continue
        }
        else if (SourceName in SourcesInUse) {
          //USED SOURCES
          Memory.rooms[roomName].Sources[SourceName] = SourcesInUse[SourceName];
        } else {
          //UNUSED SOURCES
          Memory.rooms[roomName].Sources[SourceName] = 0;
        }
      }
    }
  },


  movingTo(creep, target) {
    var r;

    /*
    Tower does not move
     */
    //console.log(creep.name,creep.memory.role,'ID:',creep.id);
    if (creep.memory.role === 'tower') {
      return
    }
    /*
    WAS ASKED TO MOVE?
     */

    if (creep.memory.hasOwnProperty('Please')
        && 'moveTo' in creep.memory.Please) {
      r = creep.moveTo(new RoomPosition(
          creep.memory.Please.moveTo.x,
          creep.memory.Please.moveTo.y,
          creep.room.name
      ), {visualizePathStyle: {stroke: '#ffffff'}});
      if (r === OK) {
        delete  creep.memory.Please.moveTo;
      }
    }
    /*
    STANDART MOVE
     */
    else {
      /*
     Preparing the PATH
      */
      let nextPos, moveDest, movePath, sameTarget;
      let reusePath = 5;
      let posChanges = true;
      if (creep.memory.hasOwnProperty('prePos')) {

        if (creep.memory.prePos[0] === creep.pos.x &&
            creep.memory.prePos[1] === creep.pos.y) {
          //console.log('I AM BEING BLOCKED!!!!');
          creep.memory.ImBlocked += 1;
          posChanges = false;
        }
      }
      if (creep.fatigue > 0) {
        creep.memory.ImBlocked = 0;
      }
      creep.memory.prePos = [creep.pos.x, creep.pos.y];
      if (creep.memory._move && creep.memory._move.path.length > 0) {
        moveDest = new RoomPosition(
            creep.memory._move.dest.x,
            creep.memory._move.dest.y,
            creep.memory._move.dest.room);
        if (creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {
          filter: (s) => {
            return s.structureType === STRUCTURE_SPAWN;
          }
        }).length > 0) {
          creep.memory.ImBlocked = 0;
        }
        if (moveDest.isEqualTo(target) && creep.memory.ImBlocked < 3) {
          // Target has not changed
          movePath = Room.deserializePath(creep.memory._move.path);
          nextPos = new RoomPosition(movePath[0].x, movePath[0].y, creep.room.name);
          if (creep.memory.ImBlocked < 3 || creep.memory.ImBlocked === undefined) {
            // NOT Blocked
            reusePath = 20;
            creep.memory.Ingnored = false;
          } else {
            reusePath = 5;
          }
        }
        else {
          /*
          IF BLOCKED
           */
          try {
            if (creep.memory.ImBlocked > 10) {
              /*
              Check if already at home
               */


              creep.memory.ImBlocked -= 1;
              target = Game.spawns[spawnName];


            }
          } catch (e) {
            console.log('MomeHome >>>>>>>>>ERR', e)
          }
          console.log(creep.name, 'Deliting the path');
          delete creep.memory._move;
          reusePath = 1;
        }
      }
      let ignoreCreeps =
          (!creep.memory.Ingnored || creep.memory.Ingnored === undefined)  // Yes, if you are not ignored
          // ALSO NEEDS:
          && (creep.memory.ImBlocked < 3) // Yes, if you are not blocked
      ;
      //console.log(ignoreCreeps,reusePath);
      /*
      MOVING
       */
      r = creep.moveTo(target, {
        visualizePathStyle: {stroke: '#ffffff'},
        reusePath: reusePath,
        swampCost: 15,
        plainCost: 3,
        maxRooms: 3,
        ignoreCreeps: false//!creep.memory.Ingnored || creep.memory.Ingnored === undefined && (creep.memory.ImBlocked < 3)
      });
      //console.log('Move', creep.name, r,posChanges);
      if (r === OK && posChanges === true) {
        creep.memory.ImBlocked = 0;
      }

      // ERROR Handling
      if (r < OK) {
        //console.log('Move', creep.name, r);

        if (r === ERR_NO_PATH) {
          creep.memory.ImBlocked += 1;
          if (creep.memory._move.path !== '') {
            //console.log('Move', creep.name, JSON.stringify(creep.memory._move));
            nextPos = new RoomPosition(movePath[0].x, movePath[0].y, creep.room.name);
            let otherCreep = creep.room.lookForAt(LOOK_CREEPS, target)[0];
            if (otherCreep !== null) {
              if (!otherCreep[0].memory.hasOwnProperty('Please')) {
                otherCreep[0].memory.Please = {}
              }
              let myAsk = {
                x: creep.pos.x,
                y: creep.pos.y,
                room: creep.room.name,
                creepName: creep.name
              };
              if (otherCreep[0].memory.Please.moveTo === myAsk) {
                // I AM being ignored!
                creep.memory.Ingnored = true;
              } else {
                otherCreep[0].memory.Please.moveTo = myAsk;
              }

            }
          }
          //console.log('Move', creep.name, creep.room, 'ERR_NO_PATH', nextPos);
        } else if (r === ERR_INVALID_TARGET) {
          //console.log('Move', creep.name, creep.room, 'ERR_INVALID_TARGET', JSON.stringify(target), nextPos);
        } else if (r === ERR_NO_BODYPART) {
          console.log('No body parts ️');
          if (creep.getActiveBodyparts(ATTACK).length > 0 || creep.getActiveBodyparts(RANGED_ATTACK).length > 0) {
            console.log('Cant move! Die with honor!');
            //Soldger. Keep alive.
          }
          else {
            this.CantDoMyJob(creep);
          }

        }
      }

    }
    /*
    RECORD TRAFFIC
     */
    let roomName = creep.room.name;
    if (Game.rooms[roomName].memory.routs === undefined) {
      Game.rooms[roomName].memory.routs = {};
    }
    let posName = creep.pos.x.toString() + ',' + creep.pos.y.toString();
    if (Game.rooms[roomName].memory.routs[posName] === undefined) {
      Game.rooms[roomName].memory.routs[posName] = 0;
    }
    if (Game.rooms[roomName].memory.routs[posName] < 200) {
      Game.rooms[roomName].memory.routs[posName] += 1;
    }
    return r
  },
  // Sorts the Dict returning a list of list, where the last list is the lement of the dict.
  // Smallest first.
  getSortedDictAsArray(DictToSort) {
    let items;
    items = Object.keys(DictToSort).map(function (key) {
      return [key, DictToSort[key]];
    });
    // Sort the array based on the second element
    items.sort(function (first, second) {
      return second[1] - first[1];
    });


    return items
  },
  /**
   * A function to calculate distance between two positions on the map.
   * @param ObjectID, PosObject or RoomObject
   * @param ObjectID, PosObject or RoomObject
   */
  getDistance(posOne, posTwo) {

    if ('distance' in Memor.map === false) {
      Memory.map.distance = {};
    }
    let nameOne, nameTwo;
    let params = [posOne, posTwo];
    let path, len;
    let posObjects = [];
    let posStrings = [];
    //console.log('>>>>>>>>>>',pos, '>>>>>>>>>>',posTwo);
    for (let i in params) {

      let obj = params[i];
      //console.log('Distance. Got this:', obj);
      let posStr;
      let posObj;
      /*
      ID provided
       */
      if (typeof obj === 'string') {
        /*
        Getting from GAME
         */
        if (Game.getObjectById(obj)) {
          obj = Game.getObjectById(obj);
          let Object = obj;
          let pos = Object.pos;
          posStr = pos.x + ',' + pos.y + ',' + pos.roomName;
          posObj = Object.pos;
        }
        /*
        Getting from MEMORY
         */
        else if (Memory.map.shard3[obj]) {
          posStr = Memory.map.shard3[obj].pos;
          posObj = new RoomPosition(posStr.x, posStr.y, posStr.roomName);
        }
        else {
          // ERROR
          // THE ROOM NEED TO BE RESCOUTED
          //console.log('The room needs rescouting', obj);
          return i.toString();
        }
      }
      /*
      PosObject provided
      */
      else if (typeof obj === 'object') {
        let pos = obj;
        posStr = pos.x + ',' + pos.y + ',' + pos.roomName;
        posObj = obj;
      }
      //console.log('Params',i, posStr, '|', posObj);
      posStrings.push(posStr);
      posObjects.push(posObj);

    }
    nameOne = posStrings[0] + '|' + posStrings[1];
    nameTwo = posStrings[1] + '|' + posStrings[0];
    //console.log('Distance already calculated', nameOne, '|', nameTwo);
    if (nameOne in Memory.map.distance) {
      // DIST available
      //console.log('Distance already calculated');
      len = Memory.map.distance[nameOne];
    }
    else {
      /*
      Calculating distance
      */
      //console.log('Distance will be calculated');
      let r = PathFinder.search(posObjects[0], {pos: posObjects[1], range: 2}, {
        plainCost: 1,
        swampCost: 1,
        ignoreCreeps: true,
        ignoreDestructibleStructures: true,
        ignoreRoads: true,
      });
      if (r.incomplete === true) {
        console.log('Path not calculated correctly');
        return null
      }
      /*
      Saving in MEMORY
       */
      console.log('#################costs', r.cost);
      console.log('#################path', r.path.length);
      len = r.path.length;
      Memory.map.distance[nameOne] = len;
      Memory.map.distance[nameTwo] = len;

    }

    //console.log('Path length:', len);
    return len


  },


  AllocateRoomSource(creep, roomName = '', SourceID = '') {
    console.log(creep, creep.room.name);
    let originalRoom = roomName;
    if (creep.MySource !== undefined) {
      this.ReleaseRoomSource(creep);
    }

    if (roomName === '' || creep.role === 'harvester') {
      roomName = creep.room.name;
    }
    const maxSpots = 2;
    if (SourceID === '') {
      console.log(Memory.rooms[roomName].Sources, roomName);
      if (Object.keys(Memory.rooms[roomName].Sources).length) {
        let items = this.getSortedDictAsArray(Memory.rooms[roomName].Sources);

        SourceID = items[items.length - 1][0];
        let sourceObj = Game.getObjectById(SourceID);
        let energyLeft = sourceObj.energy;
        if (Memory.rooms[roomName].Sources[SourceID] >= 99
            || Memory.rooms[roomName].Sources[SourceID] > maxSpots
            || energyLeft < 200) {

          return null
        }
      }

    }

    Memory.rooms[roomName].Sources[SourceID] += 1;
    creep.memory.MySource = SourceID;
    creep.memory.targetRoom = roomName;
    console.log('+++++++++++Allocating', SourceID, 'to', creep.name);
    return SourceID
  }
  ,
  ReleaseRoomSource(creep) {
    if (typeof creep === 'string') {
      let SourceName1 = creep;
      for (let roomName in Memory.rooms) {
        for (let SourceName in Memory.rooms[roomName].Sources) {
          if (SourceName === SourceName1) {
            Memory.rooms[roomName].Sources[SourceName] -= 1;
          }
        }
      }
    }
    else if (creep.memory.MySource !== undefined) {
      Memory.rooms[creep.room.name].Sources[creep.memory.MySource] -= 1;
      creep.memory.MySource = undefined;
    } else {
    }
  }


  ,
  CreepTalk: {
    'upgrader':
        {
          'task':
              {
                'upgrade':
                    '📡-⚡',
                'withdraw':
                    '📡-🛒'
              }
        }
    ,
    'harvester':
        {
          'task':
              {
                'transfer':
                    '🐮-🚚',
                'harvest':
                    '🐮-🚜'
              }
        }
    ,
    'build':
        {
          'task':
              {
                'build':
                    '🔨-🛠️',
                'harvest':
                    '🔨-🛒',
                'wait':
                    '🔨-💤',
                'retreat':
                    '🔨-💢'
              }
        }
    ,


  }
  ,
  BUILDER_GETS_E_FROM_SOURCE: false,
  getTask(creep, role = '') {
    let CreepType = role;
    if (CreepType === '') {
      CreepType = creep.memory.role;
    }
    /**
     * BUILDER
     */
    else if (CreepType === 'builder') {

    }
    console.log('Talking:', CreepType, creep.memory.task);
    creep.say(this.CreepTalk[CreepType]['task'][creep.memory.task]);
  }
}
;

