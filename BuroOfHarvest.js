let BuroOfCartography = require('BuroOfCartography');
let CartographyBuro = new BuroOfCartography();



function BuroOfHarvest(comName) {
  this.shard = 'shard3';
  this.com = comName;
  this.sources = Memory.communes[this.com].sources;

  if (!Memory.communes[this.com].jobs) Memory.communes[this.com].jobs = {};
  this.tasks = Memory.communes[this.com].tasks;
  this.creeps = Memory.communes[this.com].creeps;
  this.needMoreCreeps = false;
  this.needCreep = {
    'work':['harvest'],
    'move':['road','fast'],
    'carry':['short']
  }
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
  let miningCreeps = _.filter(this.creeps, function (o) {
    return o.task === 'harvest';
  });
  let freeCreeps = _.filter(this.creeps, function (o) {
    return !o.task
  });
  //console.log('Mining Creeps', JSON.stringify(miningCreeps));
  //console.log('Free Creeps', JSON.stringify(freeCreeps));
  this.needMoreCreeps = false;
  for (let SourceId in this.sources) {
    let StorageID = 'c673e1f26e7efd3';
    let source = this.sources[SourceId];
    let freeSlots = Memory.map.shard3[SourceId].access.length;
    let numberOrCreepsWorking = 0;
    let distance = CartographyBuro.getDistance(StorageID, SourceId);
    let CreepsAtSource = _.filter(miningCreeps, function (o) {
      return o.target === SourceId
    });


    let workBeingDone = 0;
    for (let idx in CreepsAtSource) {
      let creep = Game.creeps[CreepsAtSource[idx].name];
      let work = creep.getActiveBodyparts(WORK);
      let carry = creep.getActiveBodyparts(CARRY);
      let timeToMine = carry * 50 / (work * 2);
      let timeToGo = distance * 2;
      let centTimeWorking = timeToMine / (timeToGo + timeToMine);
      workBeingDone += creep.getActiveBodyparts(WORK) * 2 * centTimeWorking;
      numberOrCreepsWorking += 1 * centTimeWorking;
      //console.log('timeToMine:', timeToMine, work, '/', carry);
      //console.log('timeToGo:', timeToGo, '');
      //console.log('cent Time Working:', centTimeWorking, '')
    }
    if (workBeingDone < 10 && numberOrCreepsWorking <= freeSlots) {
      if (freeCreeps.length === 0) {
        this.needMoreCreeps = true;
        break
      }
      console.log('Creep name', freeCreeps[freeCreeps.length - 1].name);
      this.creeps[freeCreeps[freeCreeps.length - 1].name].task = 'harvest';
      this.creeps[freeCreeps[freeCreeps.length - 1].name].target = SourceId;
      this.creeps[freeCreeps[freeCreeps.length - 1].name].storage = StorageID;
      freeCreeps.pop();
    }

  }
};

module.exports = BuroOfHarvest;
