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
    console.log('Position:', i, nextPos.x, nextPos.y, JSON.stringify(nextPos));
    console.log('Terrain Type:', i, terrain.get(nextPos.x, nextPos.y));
    if (terrain.get(nextPos.x, nextPos.y) !== TERRAIN_MASK_WALL)
      accessPoses.push(JSON.parse(JSON.stringify(nextPos)));
    i = i + 1;
  }
  return accessPoses
};


function BuroOfHarvest(comName) {
  this.shard = 'shard3';
  this.com = comName;
  this.sources = Memory.communes[this.com].sources;

  if (!Memory.communes[this.com].jobs) Memory.communes[this.com].jobs = {};
  this.tasks = Memory.communes[this.com].tasks;
}


BuroOfHarvest.prototype.produceCreep = function (BodyParts) {
  const spawns = this.getProductionFacilities();
  let r;
  let name = Game.time + Math.round(Math.random() * 100);
  r = spawns[0].spawnCreep(BodyParts, name);
  Memory.communes[this.comName].creeps[name] = {};
  return r
};


BuroOfHarvest.prototype.AssignePermaHarvest = function () {
  let miningCreeps = _.filter(this.jobs, function (o) {
    return o.task === 'mine' || o.task === 'harvest'
  });
  let freeCreeps = _.filter(this.jobs, function (o) {
    return !o.task
  });
  for (let SourceId in this.sources) {
    let source = this.sources[SourceId];
    let CreepsAtSource = _.filter(miningCreeps, function (o) {
      return o.target === SourceId
    });
    let workBaingDone = 0;
    for (let creepId in CreepsAtSource) {
      let creep = Game.getObjectById(creepId);
      workBaingDone += creep.getActiveBodyparts(WORK) * 2;
    }
    if (workBaingDone < 10) {
      freeCreeps[freeCreeps.length - 1].task = 'harvest';
      freeCreeps[freeCreeps.length - 1].target = SourceId;
      freeCreeps[freeCreeps.length - 1].storage = 'c673e1f26e7efd3';
      freeCreeps.pop();
    }
    if (freeCreeps.length === 0) break;

  }
};

module.exports = [BuroOfCartography, BuroOfHarvest];


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
  console.log(new RoomPosition(this.x + adjacentPos[direction][0], this.y + adjacentPos[direction][1], this.roomName));
  return new RoomPosition(this.x + adjacentPos[direction][0], this.y + adjacentPos[direction][1], this.roomName);
};

/**
 *
 * @returns {Array}
 */
RoomPosition.prototype.getAllAdjacentPositions = function* () {
  for (let direction = 1; direction <= 8; direction++) {
    console.log('getAllAdjacentPositions', this.getAdjacentPosition(direction));

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