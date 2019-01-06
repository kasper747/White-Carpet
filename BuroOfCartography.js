let CommitteeOfAppropriation = require('Committis');

function BuroOfCartography(ShardName = 'shard3') {
  this.shard = ShardName;
  if (!Memory.map) Memory.map = {};
  if (!Memory.map[this.shard]) Memory.map[this.shard] = {};
  this.memory = Memory.map[this.shard];
}


BuroOfCartography.prototype.mapRoom = function (roomName) {
  this.mapRoomSources(roomName);
};


/**
 * Process sources in the given room
 * @param {String} room
 * @returns {Array} SourcesAdded
 */
BuroOfCartography.prototype.mapRoomSources = function (room) {
  let SourcesAdded = [];
  // create a balanced body as big as possible with the given energy
  if (Game.rooms[room]) {
    const sources = Game.rooms[room].find(FIND_SOURCES);
    for (let i in sources) {
      const s = sources[i];
      SourcesAdded.push(s.id);
      this.memory[s.id] = JSON.parse(JSON.stringify(s));
      this.memory[s.id]['access'] = this.getAccessSpots(s.pos);
    }
  }
  // create creep with the created body and the given role
  return SourcesAdded
};

/**
 *
 * @param {RoomPosition} pos
 * @returns {Array} accessPoses
 */
BuroOfCartography.prototype.getAccessSpots = function (pos) {
  console.log('getAccessSpots init', pos, pos.roomName);
  const terrain = new Room.Terrain(pos.roomName);
  let accessPoses = [];
  let adjPos = pos.getAllAdjacentPositions();
  let i = 0;
  while (i < 8) {
    let nextPos = adjPos.next().value;
    if (terrain.get(nextPos.x, nextPos.y) !== TERRAIN_MASK_WALL)
      accessPoses.push(JSON.parse(JSON.stringify(nextPos)));
    i = i + 1;
  }
  return accessPoses
};



/**
 * Get the position adjacent to this position in a specific direction
 *
 * @param {Number} direction (or 0)
 * @return {RoomPosition} adjacent position, or this position for direction==0
 */
RoomPosition.prototype.getAdjacentPosition = function (direction) {
  const adjacentPos = [
    [0, 0],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];
  // no clean way to handle negative directions here because 0 is a special case instead of equivalent to 8
  if (direction > 8) {
    direction = RoomPosition.fixDirection(direction);
  }
  return new RoomPosition(this.x + adjacentPos[direction][0], this.y + adjacentPos[direction][1], this.roomName);
};

/**
 *
 * @returns {Array}
 */
RoomPosition.prototype.getAllAdjacentPositions = function* () {
  for (let direction = 1; direction <= 8; direction++) {

    yield this.getAdjacentPosition(direction);
  }
};

/**
 * Given a direction-like number, wrap it to fit in 1-8
 *
 * @param {Number} direction
 * @return {Number} fixed direction
 */
RoomPosition.fixDirection = function (direction) {
  return (((direction - 1) % 8) + 8) % 8 + 1;
};


/**
 * A function to calculate distance between two positions on the map.
 * @param ObjectID, PosObject or RoomObject
 * @param ObjectID, PosObject or RoomObject
 */


/**
 *
 * @param {[RoomPosition,String]} posOne
 * @param {[RoomPosition,String]} posTwo
 * @param {String} shard
 * @returns {Number} Dist
 */
BuroOfCartography.prototype.getDistance = function (posOne, posTwo, shard = 'shard3') {
  if ('distance' in Memory.map === false) {
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
      else if (Memory.map[shard][obj]) {
        posStr = Memory.map[shard][obj].pos;
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


};

module.exports = BuroOfCartography;
