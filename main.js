'use strict';
let spawnName = 'Home';
let util = require('util');
let roleClaimer = require('role.claimer');
const COUNT_SOURCES_HOME = 2;

// Use for HTML styling


/**
 * MEMORY Initiation
 */
if ('danger' in Memory === false) {
  Memory.danger = {};
}
if ('rooms' in Memory.danger === false) {
  Memory.danger.rooms = {};
}
if ('Shard3Objects' in Memory === false) {
  Memory.Shard3Objects = {};
}


if (Memory.sources === undefined || Memory.sources.length < 1) {
  console.log('Updating memory');
  let memorySource = {};
  let sources = Game.spawns[spawnName].room.find(FIND_SOURCES);
  for (let i in sources) {
    memorySource[sources[i].id] = 0;
  }
  Memory.sources = memorySource;
}

function mySuperAwesomeFunction(c, borders = 5, middle = 2) {

  let xR = Math.round(Math.random() * borders);
  // 0 --- 5
  xR = xR - Math.round(borders / 2); // -> 3
  // -3 --- 2
  if (xR >= 0) { //0,1,2
    middle = middle + 1; // 4
    xR = xR + middle; // 4, 5, 6
  }
  else if (xR < 0) { // -3,-2,-1
    xR = xR - middle; // -6,-5,-4
  }
  return xR
}


/**
 * Create automatically extensions in the room
 * @todo Auto-check, if extensions on max.
 * @todo Some other logic on where to build them? Like near to the harvester?
 * @todo Auto-adjust the Range or Area where the extensions can be places.
 * @param RoomObject
 */
function createExtensions(RoomObject = Game.spawns[spawnName]) {
  let r = OK;
  let i = 0; // Prevents the loop from being endless
  while ([OK, ERR_INVALID_TARGET].indexOf(r) > -1 && i < 5) {
    i += 1;
    // Randomly generating positions around the Spawn or other Object
    let hasObjectsInWrongPlaces;
    let pos = new RoomPosition(
        RoomObject.pos.x + mySuperAwesomeFunction('x'),
        RoomObject.pos.y + mySuperAwesomeFunction('y'),
        RoomObject.room.name);
    // Defining pos left, right, down, up as the one, that need to be empty
    try {
      let pos = new RoomPosition(
          31,
          35,
          'W41N36');
      let s = pos.findInRange(FIND_STRUCTURES, 1);
      for (let idx in s) {
        let pos2 = s[idx].pos;
        let d = pos.x + pos.y - pos2.x - pos2.y;
        if (d === -1 || d === 1) {
          console.log('####', pos2, s[idx].structureType);
        }
      }


    }
    catch (err) {
      console.log('>>>>>>>>>>>', err);
    }
    //console.log('X Y:', Game.spawns[spawnName].pos.x, Game.spawns[spawnName].pos.y);
    if (hasObjectsInWrongPlaces === false) {
      r = RoomObject.room.createConstructionSite(pos, STRUCTURE_EXTENSION);
      console.log('Response:', r);
    }

  }
}

let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleLorry = require('role.lorry');
let roleMiner = require('role.miner');
let roleTower = require('role.tower');
let roleAttacker = require('role.attacker');
let rolelongDistanceHarvester = require('role.longDistanceHarvester');

//Game.spawns['Home'].room


/**
 * This function detects, if the storage is overloaded.
 * It fires every x tickes defined by the timer.
 * @param timer
 * @returns {boolean}
 */
function overload(timer = 100) {
  if (Math.round(Game.time / timer) === Game.time / timer &&
      Game.spawns['Home'].room.energyCapacityAvailable === Game.spawns['Home'].room.energyAvailable
  ) {
    for (let creep in Game.creeps) {
      if (['harvester'].includes(creep.role)
          && creep.carry.energy < creep.carryCapacity) {
        return false
      }
    }
    return true
  } else {
    return false
  }
}

function IsOverloaded(AuditFrequency = 50, timesOverload = 5, PercentageAsOverload = 0.8) {
  let room = Game.spawns[spawnName].room;
  if (Math.round(Game.time / AuditFrequency) === Game.time / AuditFrequency &&
      room.energyCapacityAvailable * PercentageAsOverload < room.energyAvailable) {
    Game.spawns[spawnName].memory.overload += 1;
  } else {
    Game.spawns[spawnName].memory.overload = 0;
  }
  let r = Game.spawns[spawnName].memory.overload >= timesOverload;
  return r
}

function RedueseRoutsTraffic(spawn = Game.spawns[spawnName], ticks = 400) {
  console.log();
  let SpownName = spawn.name;
  let roomName = spawn.room.name;
  let tickValue = 400;
  let divisionValue = 100 / 6; //Its like if one creep is running this line, how often he does it in 100 ticks?
  let routs = spawn.memory.routs;

  for (let i in routs) {
    Game.spawns[SpownName].memory.routs[i] = routs[i] - tickValue / divisionValue;
    if (Game.spawns[SpownName].memory.routs[i] < 0) {
      Game.spawns[SpownName].memory.routs[i] = 0;
    }
  }

  routs = Game.rooms[roomName].memory.routs;
  for (let i in routs) {
    Game.rooms[roomName].memory.routs[i] = routs[i] - tickValue / divisionValue;
    if (Game.rooms[roomName].memory.routs[i] < 0) {
      Game.rooms[roomName].memory.routs[i] = 0;
    }
  }

}

/**
 * A function to calculate distance between two positions on the map.
 * @param ObjectID, PosObject or RoomObject
 * @param ObjectID, PosObject or RoomObject
 */
function getDistance(posOne, posTwo) {

  try {
    if ('distance' in Memory === false) {
      Memory.distance = {};
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
        else if (Memory.Shard3Objects.obj) {
          posStr = Memory.Shard3Objects[obj].posStr;
          let x, y, rN;
          [x, y, rN] = posStr.split(',');
          posObj = new RoomPosition(x, y, rN);
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
    if (nameOne in Memory.distance) {
      // DIST available
      //console.log('Distance already calculated');
      len = Memory.distance[nameOne];
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
      Memory.distance[nameOne] = len;
      Memory.distance[nameTwo] = len;

    }

    //console.log('Path length:', len);
    return len
  } catch (e) {


    var err = getErrorObject();
    var caller_line = err.stack.split("\n")[4];
    var index = caller_line.indexOf("at ");
    var clean = caller_line.slice(index + 2, caller_line.length);
    console.log('Distance >>>>>>>>>ERR', e, clean, index, caller_line);
  }

}





function getErrorObject() {
  try {
    throw Error('')
  } catch (err) {
    return err;
  }
}

function UpdateSourcesLine() {
  _.filter(Game.creeps.my, {my: true});

}


/**
 * Gives overview of availble sources from memory.
 * Can be made to return also other objects. Like Creeps or Mines
 * @constructor
 */
function GetNumberOfSources(ObjectType = 'Sources') {
  let SourcesInRooms = {};
  for (let roomName in Memory.rooms) {
    for (let SourceName in Memory.rooms[roomName][ObjectType]) {
      if (Memory.rooms[roomName][ObjectType][SourceName] < 100) {
        SourcesInRooms[SourceName] = roomName;
      }
    }
  }
  return SourcesInRooms
}


/**
 * Update Lines to Sources
 * CRON
 * @constructor
 */
function UpdateSources() {
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
    if (roomName === undefined || roomName === null) {
      delete Memory.rooms[roomName];
      continue
    }

    for (let SourceName in Memory.rooms[roomName].Sources) {
      /*
      CLEAN UP
     */
      if (SourceName === undefined || SourceName === null) {
        delete Memory.rooms[roomName][SourceName];
        continue
      }

      if (Memory.rooms[roomName].hasOwnProperty('safe')
          && !Memory.rooms[roomName].safe) {
        //NOT SAFE
        Memory.rooms[roomName].Sources[SourceName] = 999;
      }
      else {
        let Spawn = Game.spawns[spawnName];
        let dist = getDistance(SourceName, Spawn.id);
        //console.log(roomName, SourceName, 'Distance to source:', dist);
        if (typeof dist === "string") {
          /*
          Cant calculate the distance
           */
          if (dist === '0') {
            delete Memory.rooms[roomName];
            continue
          }
        }
        if (dist > 100) {
          Memory.rooms[roomName].Sources[SourceName] = getDistance(SourceName, Spawn.id);
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
}


module.exports.loop = function () {
  console.log('>>>>>>>>>>>>>> NEW TICK <<<<<<<<<<<<<');
  try {

    let DonorLinks = ['5c2ad13ced9c3946cafba0a9', '5c2821177bbaaf5c5a60a02e'];
    let ReceiverLinks = ['5c2825b1bffc212cf45b2209'];
    console.log(Game.spawns.Home.room.controller.progress);
    for (let dId in DonorLinks) {

      let donor = Game.getObjectById(DonorLinks[dId]);
      console.log('Link:', donor, donor.energy, donor.energyCapacity);
      if (donor.energy === donor.energyCapacity) {
        let receiver = Game.getObjectById(ReceiverLinks[0]);
        let r = donor.transferEnergy(receiver);
        console.log('Tranfering:', r);
        if (r === OK) {
          console.log('Transfer Successful');
          // Do not use one link twice
          break
        }
        else if (r === ERR_FULL) {
          console.log('Receiver is full');
          break
        } else if (r === ERR_TIRED) {
          console.log('Is tierd');
          continue
        }
      }
    }
  } catch (e) {
    console.log(e)
  }


  //let test = util.getSortedDictAsArray(Memory.rooms['W42N36'].Sources);
  //Roads to repair
  //console.log(badPositions);

  //test[0][1] +=1;
  //console.log('W42N36', 'Sources:', JSON.stringify(test));
  //
  //
  console.log('Rooms to scout:', JSON.stringify(rolelongDistanceHarvester.GetRoomsToScout()));
  //console.log('Emptiest Room:', rolelongDistanceHarvester.SelectTargetRoom());
  //console.log('Total EnergyLevel', 'Game.rooms.Home.');
  //rolelongDistanceHarvester.ScoutRooms();
  //console.log('Rouds to repair:', roleBuilder.GetRoadToMaintain(Game.spawns[spawnName]));
  let IsOverloaded1 = overload(100);
  //UpdateLineToSources();

  util.HandelDeadAnts();


  // Create items array
  let items = Object.keys(Memory.sources).map(function (key) {
    return [key, Memory.sources[key]];
  });

  // Sort the array based on the second element
  items.sort(function (first, second) {
    return second[1] - first[1];
  });


  //RemoveRoads(STRUCTURE_ROAD);

  //createExtensions(Game.spawns[spawnName])
  if (util.myCron(10)) {
    UpdateSources();
    if (util.myCron(50)) {
      util.MapRooms();
      if (util.myCron(100)) {
        roleBuilder.BuildImportantRoads(Game.spawns[spawnName], 20);
        if (util.myCron(400)) {
          RedueseRoutsTraffic();

          //createExtensions(Game.spawns[spawnName]);

          if (util.myCron(1000)) {
            roleBuilder.BuildInterstateRoads(Game.spawns[spawnName]);

          }
        }
      }

    }
  }
  if (util.myCron(5)) {
    /**
     * NUMBER OF CREEPS
     */
    let countContainers = Game.spawns['Home'].room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_CONTAINER;
      }
    }).length;
    let RoomsToScout = rolelongDistanceHarvester.GetRoomsToScout();

    let countLorry = _.filter(Game.creeps, (creep) => creep.memory.role === 'lorry').length;
    let countUpgrader = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader').length;
    let countRemoteSources = Object.keys(GetNumberOfSources()).length - COUNT_SOURCES_HOME;
    //console.log('Remote rooms', countRemoteSources);
    let min_creeps = {
          'harvester': Math.max(4 - countLorry, 2),
          'lorry': countContainers,
          'builder': 1,
          'upgrader': 2,
          'interstate_road_builder': 0,
          'longDistanceHarvester': countRemoteSources * 1.7,
          'attacker': Math.max(Object.keys(Memory.danger.rooms).length + roleAttacker.GuardRooms.length, 0),//Object.keys(Memory.danger.rooms).len
          'claimer': 0,
          'scout': Math.min(1, RoomsToScout.length),
          'range': 0
        }
    ;
    let ConstructionJob = roleBuilder.GetNewTarget(Game.spawns[spawnName])[1];
    if (ConstructionJob === 'retreat') {
      min_creeps['builder'] = 0;
      min_creeps['upgrader'] = 3;
    }
    else if (ConstructionJob === 'build'
        || Game.spawns[spawnName].room.find(FIND_CONSTRUCTION_SITES).length > 0) {
      min_creeps['builder'] = 2;
      min_creeps['upgrader'] = 1;
    }
    else if (ConstructionJob === 'repair') {
      min_creeps['builder'] = 1;
      min_creeps['upgrader'] = 3;
    }
    let countLongHarvester = _.filter(Game.creeps, (creep) => creep.memory.role === 'longDistanceHarvester').length;
    let countClaimer = _.filter(Game.creeps, (creep) => creep.memory.role === 'claimer').length;

    if (countClaimer === 0 && countLongHarvester === min_creeps['countLongHarvester'] / 2) {
      min_creeps['countLongHarvester'] = 0;
    }
    let creepsPriority = [
      'attacker',

      'range',

      'harvester',
      'lorry',
      'scout',
      'builder',
      'upgrader',
      'interstate_road_builder',

      'longDistanceHarvester',
      'claimer',

    ];
    if (countUpgrader > 0) {

    }
    console.log('Attacker:', min_creeps['attacker']);
    roleHarvester.ContainerHarvesting = countLorry > 0;
    //roleHarvester.ContainerHarvesting;
    let body_parts = {
      'scout': {
        'XS': [ //5 |250
          MOVE, //350 //7
        ],
      },
      'range': 0,
      'attacker': {
        'XS': [ATTACK, ATTACK,//560
          MOVE, MOVE,//250
        ], //
        'S': //950
            [TOUGH, TOUGH, TOUGH,  //3 |150
              ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, //400  //5
              MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,  //400 //8
            ], //
        'L': //1360
            [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,//5 |250

              MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,  //600 //7
              ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, ATTACK,
            ], //
      },
      'longDistanceHarvester': {
        'XS': [WORK, CARRY, CARRY, MOVE, MOVE],
        'S': [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], //600
        // 1100
        'L': [
          WORK, CARRY, CARRY, CARRY, MOVE, MOVE, //350
          WORK, CARRY, CARRY, CARRY, MOVE, MOVE,//350
          WORK, CARRY, CARRY, CARRY, MOVE, MOVE,  //300 : 6
          WORK, CARRY, CARRY, CARRY, MOVE, MOVE,  //300 : 6
        ] // 300 : -12 :total 1050
        ,
      },
      'interstate_road_builder': {
        'XS': [WORK, CARRY, MOVE],
        'S': [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], //600

      },
      'claimer': {
        'XS': [CLAIM, MOVE],
        'S': [CLAIM, MOVE, CLAIM, MOVE, CLAIM, MOVE], //600
      },
      'harvester': {
        'XS': [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], //550
        'S': [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], //650
        'L': [
          WORK, WORK, WORK, WORK, WORK, //  500 : 5
          CARRY, CARRY,        //  100 : 3
          MOVE, MOVE, MOVE, MOVE,    //  200 : -8
        ], //650
        'C': [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, //  600 : 6
          CARRY,         //  50 : 1
          MOVE, MOVE, MOVE, MOVE,    //  200 : -8
        ], //650

      },
      'builder': {
        'XS': [WORK, CARRY, MOVE],
        'S': [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        'L': [WORK, WORK, WORK,  //300 : 3
          CARRY, CARRY, CARRY,  // 150 : 3
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,], // 300 : -12
      },
      'upgrader': {
        'XS': [WORK, CARRY, MOVE],
        'S': [WORK, WORK, WORK, CARRY, MOVE, MOVE],
        'M': [WORK, WORK, WORK, WORK, //400
          CARRY, CARRY, //100
          MOVE, MOVE, MOVE], //150
        'L': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,//800 :8
          CARRY, CARRY, CARRY, CARRY,//200 : 4
          MOVE, MOVE, MOVE,], //150 :6
      },
      'lorry': {
        'XS': [CARRY, CARRY, MOVE, MOVE],
        'S': [ //350
          CARRY, CARRY, CARRY, CARRY, //200 : 4
          MOVE, MOVE], //100 :4
        'L': [ //800
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, //400 : 8
          MOVE, MOVE, MOVE, MOVE], //200 :8
      },

    };
    //console.log('Total Energy:', Game.spawns['Home'].room.energyAvailable);
    //if (Game.spawns[spawnName].room.energyAvailable >= 200) {

    if (IsOverloaded1 || IsOverloaded()) {
      //Spawn an extra upgrader
      min_creeps['upgrader'] = Math.min(_.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader').length + 1,5);
    }

    for (let name = 0; name < creepsPriority.length; name += 1) {
      let CreepRole = creepsPriority[name];
      /**
       * IMPORTANT CHANGE!
       * @type {Array}
       */
      let CreepsOfType = _.filter(Game.creeps, (creep) =>
          creep.memory.role === CreepRole
          && creep.memory.home === 'W41N36'
      );


      if (CreepsOfType.length < min_creeps[CreepRole]) {
        console.log('Need to build this ant: ' + CreepRole);
        let newName = CreepRole + Game.time;

        let CreepSize = 'XS';
        // Changing possibly the size
        let HomeEnergy = Game.spawns['Home'].room.energyCapacityAvailable;
        if (HomeEnergy >= 350) {
          if (CreepRole === 'harvester') {
            if (countLorry === countContainers) {
              CreepSize = 'C';
            }
            else if (CreepsOfType.length > 1 && HomeEnergy >= 800) {
              CreepSize = 'L';
            }
            else if (CreepsOfType.length > 1 && HomeEnergy >= 650) {
              CreepSize = 'M';
            }
            else if (CreepsOfType.length > 1 && HomeEnergy >= 350) {
              CreepSize = 'S';
            }
          }
          else if (CreepRole === 'builder') {
            if (HomeEnergy >= 800) {
              CreepSize = 'L';
            } else {
              CreepSize = 'S';
            }
          }
          else if (CreepRole === 'attacker') {
            if (HomeEnergy >= 1400) {
              CreepSize = 'L';
            } else {
              CreepSize = 'S';
            }

          }
          else if (CreepRole === 'claimer') {
            CreepSize = 'S';

          }
          else if (CreepRole === 'upgrader') {
            if (HomeEnergy >= 950) {
              CreepSize = 'L';
            }
            else if (HomeEnergy >= 600) {
              CreepSize = 'M';
            }
            else {
              CreepSize = 'S';
            }
          }
          //interstate_road_builder
          else if (CreepRole === 'interstate_road_builder') {
            if (HomeEnergy >= 600) {
              CreepSize = 'S';
            }
          }
          else if (CreepRole === 'longDistanceHarvester') {
            if (HomeEnergy >= 1050) {
              CreepSize = 'L';
            }
          }
          else if (CreepRole === 'lorry') {
            if (HomeEnergy >= 600) {
              CreepSize = 'L';
            } else {
              CreepSize = 'S';
            }
          }
        }
        // Try to create an Ant
        let r = Game.spawns[spawnName].spawnCreep(body_parts[CreepRole][CreepSize], newName,
            {
              memory: {
                role: CreepRole,
                home: Game.spawns[spawnName].room.name,
              }
            });
        if (r === -6) {
          Memory.NeedEnergyToProcreate = true;
          Memory.WantToBuild = CreepRole + ':' + CreepSize;
        }
        else if (r === 0) {
          Memory.NeedEnergyToProcreate = false;
        }
        console.log('Try to spawning new ' + CreepRole + ': ' + newName + ' Size:' + CreepSize + '. Result:' + r + ' ' + Memory.NeedEnergyToProcreate);

        if (r === ERR_INVALID_ARGS) {
          console.log('Can not build. Problems with body parts:', CreepRole, CreepSize, body_parts[CreepRole][CreepSize]);
        }
        break;
      }
    }
  }
//}


  for (let name in Game.creeps) {

    let creep = Game.creeps[name];

    /*
    if (creep.memory.MySource === undefined || creep.memory.MySource === 'undefined') {
      delete creep.memory['MySource'];
      delete creep.memory['task'];

    }*/
    if (creep.memory.role === 'harvester') {
      roleHarvester.run(creep);
    }
    else if (creep.memory.role === 'upgrader') {
      roleUpgrader.run(creep);
    }
    else if (creep.memory.role === 'builder') {
      roleBuilder.run(creep);
    }
    else if (creep.memory.role === 'interstate_road_builder') {
      roleBuilder.run(creep);
    }
    else if (creep.memory.role === 'lorry') {

      roleLorry.run(creep);

    }
    else if (creep.memory.role === 'claimer') {

      roleClaimer.run(creep);

    }

    else if (creep.memory.role === 'attacker') {

      roleAttacker.run(creep);

    }
    else if (creep.memory.role === 'scout') {

      roleClaimer.run(creep);

    }

    else if (creep.memory.role === 'longDistanceHarvester') {

      rolelongDistanceHarvester.run(creep);

    }

    //
  }
  // Towers initialisatoin
  let towers = Game.spawns[spawnName].room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType === STRUCTURE_TOWER;
    }
  });
  for (let tower in towers) {
    roleTower.run(towers[tower]);
  }
}
;
