function BuroOfConstruction(comName = 'r') {
  this.CONSTRUCTION_PRIORITY = [
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
  this.HITS_STOP_REPAIR = 80000;
  this.MIN_HITS_CONTAINER = 250 * 1000 / 2;//structure.hitsMax/2,
  this.MAX_HITS_CONTAINER = 250 * 1000;
  this.HITS_ROADS_START_REPAIR = 1500;
  this.WALL_HITS_START_REPAIR = 30000;
  this.needMoreCreeps = false;
  this.memory = Memory.communes[comName];
  this.creeps = this.memory.creeps;

}


BuroOfConstruction.prototype.getBurosCreeps = function (room = '') {
  let r = [];
  if (room === '') {
    r = _.filter(this.creeps, function (o) {
      return o.task === 'build';
    });
  } else {
    r = _.filter(this.creeps, function (o) {
      return o.task === 'build' && Game.creeps[o.name].room.name === room;
    });
  }
  return r
};
BuroOfConstruction.prototype.getFreeCreeps = function (room = '') {
  let r = [];
  if (room === '') {
    r = _.filter(this.creeps, function (o) {
      return !o.task;
    });
  } else {
    r = _.filter(this.creeps, function (o) {
      return !o.task && Game.creeps[o.name].room.name === room;
    });
  }
  return r
};


BuroOfConstruction.prototype.AssignJobs = function () {
  let roomWithJobs = this.getJobs();
  let freeCreeps = [];
  this.needMoreCreeps = false;
  for (let room in roomWithJobs) {
    let creepsInThisRoom = this.getBurosCreeps(room);
    console.log('ConstructionBuro Creeps in Room:', room, creepsInThisRoom);
    if (creepsInThisRoom.length > 0) {
      console.log('Creeps working:', JSON.stringify(creepsInThisRoom));
      break;
    }
    else {
      freeCreeps = this.getFreeCreeps(room);

      if (freeCreeps.length === 0) {
        freeCreeps = this.getFreeCreeps();
      }
      if (freeCreeps.length === 0) {
        this.needMoreCreeps = true;
        break
      }
      console.log('Creep name:', freeCreeps[freeCreeps.length - 1].name);
      this.creeps[freeCreeps[freeCreeps.length - 1].name].task = 'build';
      this.creeps[freeCreeps[freeCreeps.length - 1].name].targetRoom = room;
      freeCreeps.pop();
    }
  }
  console.log('ConstructionBuro needs more Creeps:', this.needMoreCreeps);
};

BuroOfConstruction.prototype.getJobs = function () {
  let freeCreeps = [];
  let roomsWithJobs = {};
  for (let room in this.memory.rooms) {
    if (Game.rooms[room]) {
      const constSites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES);
      roomsWithJobs[room] = constSites.length;
    }

  }
  console.log('Rooms with Jobs:', JSON.stringify(roomsWithJobs));
  return roomsWithJobs
};


module.exports = BuroOfConstruction;
