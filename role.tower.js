let roleBuilder = require('role.builder');
let spawnName = 'Home';
let util = require('util');
let roleHarvester = require('role.harvester');
let safeRooms = ['W42N36'];
module.exports = {
  // a function to run the logic for this role
  run: function (tower) {


    let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    if (closestHostile) {
      console.log('Tower attacks hotals', closestHostile);
      tower.attack(closestHostile);
    }
    else {
      let target = roleBuilder.GetRoadToMaintain(tower);
      if (Memory.NeedEnergyToProcreate === false ) {
        if (target.hasOwnProperty('hits') && target.hits < 1500) {

          //console.log('Repairing road:', tower.repair(target));
          tower.repair(targets);
        }
        else {
          /*
          Supporting a random creep
           */
          for (let name in Game.creeps) {

            let creep = Game.creeps[name];
            if (creep.memory.role === 'builder') {
              if (creep.memory.workType === 'repair') {

                //console.log('Tower repairs this target build', Game.getObjectById(creep.memory.target));
                tower.repair(Game.getObjectById(creep.memory.target));
                break
              }

            }

          }
        }
      }

    }
  }
}

;