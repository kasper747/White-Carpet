function BuroOfProgress(comName = 'r') {
  this.shard = 'shard3';
  this.com = comName;
  this.needMoreCreeps = false;
  this.memory = Memory.communes[this.com];
  this.creeps = this.memory.creeps;
  this.map = Memory.map[this.shard];

}


BuroOfProgress.prototype.getBurosCreeps = function (id) {
  let r = [];
  r = _.filter(this.creeps, function (o) {
    return o.task === 'progress' && o.target === id;
  });
  return r
};
BuroOfProgress.prototype.getFreeCreeps = function (room = '') {
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


BuroOfProgress.prototype.AssignJobs = function () {
  let ControllerToProgress = this.getJobs();
  let freeCreeps = [];
  this.needMoreCreeps = false;

  for (const id in ControllerToProgress) {
    let controllerID = ControllerToProgress[id];
    let creepsWorkingOnIt = this.getBurosCreeps(controllerID);
    console.log('Progress. ID:', controllerID);
    let controllerRoom = this.map[controllerID].pos.roomName;
    console.log('BuroOfProgress Creeps working:', controllerID,creepsWorkingOnIt.length);
    if (creepsWorkingOnIt.length > 0) {
      break;
    }
    else {
      freeCreeps = this.getFreeCreeps(controllerRoom);

      if (freeCreeps.length === 0) {
        freeCreeps = this.getFreeCreeps();
      }
      if (freeCreeps.length === 0) {
        this.needMoreCreeps = true;
        break
      }
      console.log('Creep name:', freeCreeps[freeCreeps.length - 1].name);
      this.creeps[freeCreeps[freeCreeps.length - 1].name].task = 'progress';
      this.creeps[freeCreeps[freeCreeps.length - 1].name].target = controllerID;
      freeCreeps.pop();
    }
  }
  console.log('BuroOfProgress needs more Creeps:', this.needMoreCreeps);
};

BuroOfProgress.prototype.getJobs = function () {
  let ControllerToProgress = [];
  for (let roomName in Game.rooms) {
    let control = Game.rooms[roomName].controller;
    if (control.my) {
      ControllerToProgress.push(control.id);
    }
  }
  console.log('ControllerToProgress:', JSON.stringify(ControllerToProgress));
  return ControllerToProgress
};


module.exports = BuroOfProgress;