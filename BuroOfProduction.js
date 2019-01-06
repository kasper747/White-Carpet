function BuroOfProduction(commune) {
  this.creeps = commune.creeps;
  this.structures = commune.structures;
  this.comName = commune.name;
}

/**
 * Removes missing creeps  from normal memory
 * @constructor
 */
BuroOfProduction.prototype.DefaulCleartDestroyCreeps = function () {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
};


/**
 * Remove missing creeps from the given Commune
 * @returns {Array}
 */
BuroOfProduction.prototype.clearDestroyedCreeps = function () {
  let removedCreeps = [];
  this.DefaulCleartDestroyCreeps();
  for (let creepName in this.creeps) {
    if (!Game.creeps[creepName]) {
      removedCreeps.push(creepName);
      delete this.creeps[creepName];
    }
  }
  return removedCreeps
};


/**
 * Adds new production facilities and also returns them.
 * @returns
 */
BuroOfProduction.prototype.getProductionFacilities = function () {
  let s = this.structures;
  let r = [];
  for (let id in s) {
    const obj = Game.getObjectById(id);
    if (obj && 'spawnCreep' in obj) {
      r.push(obj);
    }
  }
  return r
};


/**
 * Produces a creep for its commune
 * @param {Array} BodyParts
 * @returns {*}
 */
BuroOfProduction.prototype.produceCreep = function (BodyParts) {
  const spawns = this.getProductionFacilities();
  let r;
  let name = 'Creep'+Game.time + Math.round(Math.random() * 100);
  let productionFacility = spawns[0];
  r = productionFacility.spawnCreep(BodyParts, name);
  if (r === OK) {
    Memory.communes[this.comName].creeps[name] = {
      'manufactured': {
        'productionDate': Game.time,
        'productionFacility': productionFacility.name,
        'productionPlace': JSON.parse(JSON.stringify(productionFacility.pos)),
      },
      'name': name,
    };

  }
  return r
};

BuroOfProduction.prototype.produceCreepByType = function (type, spawn) {
  const spawns = this.getProductionFacilities();
  let r;
  let name = Game.time + Math.round(Math.random() * 100);
  r = spawns[0].spawnCreep(BodyParts, name);
  Memory.communes[this.comName].creeps[name] = {};
  return r
};


module.exports = BuroOfProduction;















