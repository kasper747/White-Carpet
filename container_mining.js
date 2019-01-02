var roleMiner = {

  /** @param {Creep} creep **/
  run: function (creep) {

    var targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_CONTAINER) && (structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
      }
    });

    if (targets.length > 0) {
      if (creep.pos.getRangeTo(targets[0]) == 0) {
        var source = creep.pos.findClosestByPath(FIND_SOURCES);
        creep.harvest(source);
      } else {
        creep.moveTo(targets[0]);
      }
    }
  },
  GetRoomsToClaim: function () {
    let ClaimerCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'claimer');


  },

};

module.exports = roleMiner;

////Pickup

var containers = creep.room.find(FIND_STRUCTURES, {
  filter: (structure) => {
    return (structure.structureType == STRUCTURE_CONTAINER) && (structure.store[RESOURCE_ENERGY] > 0);
  }
});
var source = creep.pos.findClosestByPath(containers);
if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
  creep.moveTo(source);
}


GetRoomsToClaim: function () {
  let ClaimerCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'claimer').length;

}
,

Object.keys(Game.map.findRoute(Game.flags.flag1.pos.roomName, Game.spawns.Home.room)).length;


JSON.stringify(Game.map.findRoute(Game.flags.flag1.pos.roomName, Game.spawns.Home.room));

Game.map.getRoomLinearDistance(Game.flags.flag1.pos.roomName, Game.spawns.Home.room.name)

5
bbcaaaa9099fc012e631f42

JSON.stringify(
    PathFinder.search(Game.flags.flag1.pos, {pos: Game.spawns.Home.pos, range: 2})
)

JSON.stringify(
    PathFinder.search(Game.flags['5bbcaac19099fc012e632256'].pos, {pos: Game.spawns.Home.pos, range: 2}).path.length
).length

if (Game.getObjectById('5bbcaab69099fc012e6320c2') !== null)
  Game.getObjectById('5bbcaab69099fc012e6320c2').energy;


Object.keys(PathFinder.search(Game.flaProviding
new sourcegs['5bbcaac19099fc012e632256'].pos, {pos: Game.spawns.Home.pos, range: 2}
))
console.log('Distance:',
    getDistance(
        Game.getObjectById('5bbcaab69099fc012e6320c5'),
        Game.getObjectById('5c218697bb207f79fa7c8a2a')
    )
);

function getDistance(posOne, posTwo) {

  try {
    if (!Memory.hasOwnProperty('distence')) {
      Memory.distence = {};
    }
    let path;
    // Check if the type correct
    if (!posOne.hasOwnProperty('x') || !posTwo.hasOwnProperty('x')) {
      console.log('ERROR in destination');
      alert('posTwo!!!');
    }
    let nameOne, nameTwo;
    nameOne = posOne.x + ',' + posOne.y + ',' + posOne.room;
    nameTwo = posTwo.x + ',' + posTwo.y + ',' + posTwo.room;
    if (Memory.distence.hasOwnProperty(nameOne + '|' + nameTwo)) {
      // DIST available
      path = Memory.distence[nameOne + '|' + nameTwo];
    } else {
      // calculating DIST
      path = PathFinder.search(posOne, {pos: posTwo, range: 2}, {
        plainCost: 1,
        swampCost: 1,
      }).path;
      Memory.distence[nameOne + '|' + nameTwo] = path.length;
      Memory.distence[nameTwo + '|' + nameOne] = path.length;
    }

    console.log('Path langth:', path.length)
  } catch (e) {
    console.log('Distance >>>>>>>>>ERR', e)
  }
}


let Spawn = Game.spawns[spawnName];
if (getDistance(SourceName, Spawn.id) > 100) {
  Memory.rooms[roomName].Sources[SourceName] = getDistance(SourceName, Spawn.id);
}

Game.getObjectById('5bbcaac19099fc012e632253').toString().split(' ')[0].split('[')[1]

// Make a function: get distance. Saves results. Recalulates them.
// Save it. distance.id.id


// Get distance to Source from Spaw.
// Count the distance.

// Save them in the property path.

let DonorLinks = ['5c2ad13ced9c3946cafba0a9', '5c2821177bbaaf5c5a60a02e'];
let ReceiverLinks = ['5c2825b1bffc212cf45b2209'];
for (let dId in DonorLinks) {
  let donor = Game.getObjectById(DonorLinks[dId]);
  if (donor.energy === donor.energyCapacity) {
    let r = donor.transferEnergy(ReceiverLinks[0]);
    if (r === ERR_FULL){
      console.log('Receiver is full');
      break
    } else if (r === ERR_TIRED){
      console.log('Is tierd');
      continue
    }
  }
}

