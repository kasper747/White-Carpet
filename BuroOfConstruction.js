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
    let totalWork = 0;
    for (let idx in  creepsInThisRoom) {
      console.log('Creeps',JSON.stringify(creepsInThisRoom[idx]));
      totalWork += Game.creeps[creepsInThisRoom[idx].name].getActiveBodyparts(WORK).length * 5;

    }
    console.log('ConstructionBuro Creeps in Room:', room, creepsInThisRoom);
    if (roomWithJobs[room]/totalWork < 200) {
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
  let TotalEffort;
  for (let room in this.memory.rooms) {
    if (Game.rooms[room]) {
      const constSites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES);
      roomsWithJobs[room] = constSites.length;
      TotalEffort = _.sum(constSites, 'progressTotal');
      roomsWithJobs[room] = TotalEffort;

    }

  }
  console.log('Rooms with Jobs:', JSON.stringify(roomsWithJobs), TotalEffort);
  return roomsWithJobs
};


BuroOfConstruction.prototype.placeImportantRoads = function (pos1 = 'eee50774086309c', pos2 = 'c673e1f26e7efd3') {

  let TargetStructures = _.filter(Memory.communes.r.structures, function (o) {
    return Game.getObjectById(o.id)
        && (Game.getObjectById(o.id).structureType === STRUCTURE_SPAWN
            || Game.getObjectById(o.id).structureType === STRUCTURE_STORAGE);
  });
  console.log(JSON.stringify(TargetStructures));
  let SourceStructures = _.filter(this.memory.sources);
  console.log(JSON.stringify(SourceStructures));
  const controllers = _.filter(Memory.communes.r.structures, function (o) {
    return Game.getObjectById(o.id)
        && (Game.getObjectById(o.id).structureType === STRUCTURE_CONTROLLER
            || Game.getObjectById(o.id).structureType === STRUCTURE_TOWER);
  });
  SourceStructures = SourceStructures.concat(controllers);
  console.log(JSON.stringify(controllers));
  for (let targetID in TargetStructures) {
    for (let sourceID in SourceStructures) {
      let pos1 = TargetStructures[targetID].id;
      let pos2 = SourceStructures[sourceID].id;
      let Obj1 = Game.getObjectById(pos1);
      let Obj2 = Game.getObjectById(pos2);
      console.log('Target', pos1, 'Source', pos2);

      if (!Obj1) Obj1 = Memory.map['shard3'][pos1];
      let Pos1 = new RoomPosition(Number(Obj1.pos.x), Number(Obj1.pos.y), Obj1.pos.roomName);
      if (!Obj2) Obj2 = Memory.map['shard3'][pos2];
      let Pos2 = new RoomPosition(Number(Obj2.pos.x), Number(Obj2.pos.y), Obj2.pos.roomName);
      let r = PathFinder.search(Pos1, {pos: Pos2, range: 1}, {
        plainCost: 3,
        swampCost: 3,
        ignoreCreeps: true,
        ignoreDestructibleStructures: false,
        ignoreRoads: false,
      });
      let path = r.path;
      for (let idx in path) {
        path[idx].createConstructionSite(STRUCTURE_ROAD);
        const visual = new RoomVisual(path[idx].roomName);
        visual.text('O', path[idx].x, path[idx].y);
      }
    }
  }

};


module.exports = BuroOfConstruction;
