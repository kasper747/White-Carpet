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
BuroOfProduction.prototype.produceCreep = function (BodyParts = []) {
  const spawns = this.getProductionFacilities();
  const productionFacility = spawns[0];
  let r;
  let name = 'Creep' + Game.time + Math.round(Math.random() * 100);
  if (BodyParts.length === 0)
    BodyParts = this.getBody(spawns[0]);
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
    console.log('Final Design.', 'Name', name, 'Costs', this.designCosts(BodyParts), 'Body', JSON.stringify(BodyParts));
  }
  if ([ERR_BUSY].includes(r)) {

  } else console.log('Production:', r);
  return r
};
/**
 * Calculates the costs of the Design
 * @param {Array} designBody
 * @returns {number}
 */
BuroOfProduction.prototype.designCosts = function (designBody) {
  let costs = 0;
  for (let idx in designBody) {
    let b = designBody[idx];
    costs += BODYPART_COST[b];
  }
  return costs
};


BuroOfProduction.prototype.getBody = function (spawn) {
  let type = {
    'work': ['harvest'],
    'move': ['road', 'fast'],
    'carry': ['short']
  };
  const roomEnergy = spawn.room.energyCapacityAvailable;
  let BodyParts = [];
  let standardType = [
    MOVE, WORK, CARRY, MOVE, CARRY, CARRY];
  while (this.designCosts(BodyParts) <= roomEnergy) {
    BodyParts = BodyParts.concat(standardType);
  }
  while (this.designCosts(BodyParts) > roomEnergy) {
    BodyParts.pop();
  }
  if (BodyParts[BodyParts.length - 1] === MOVE)
    BodyParts.pop();

  return BodyParts
};


module.exports = BuroOfProduction;















