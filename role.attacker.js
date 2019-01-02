let rolelongDistanceHarvester = require('role.longDistanceHarvester');
let util = require('util');


module.exports = {
  Groupping: true,
  GroupSize: 1, //Math.min(2 * Object.keys(Memory.danger.rooms).length, 3),
  GuardRooms: [],
  run: function (creep) {
    let moveToPos;
    let targetFalg;
    try {
      if (Game.flags.move !== undefined) {
        util.movingTo(creep, Game.flags.move);
        moveToPos = Game.flags.move.pos;
        return
      }
      if (Game.flags.target !== undefined) {
        targetFalg = Game.flags.target.pos;
      }

      /**
       * BUILD GROUPS
       */
      if (creep.spawning) {
        return
      }
      if (this.Groupping === true) {
        if (creep.memory.inGroup !== true) {
          let creepsInRoom = _.filter(Game.creeps, (c) =>
              c.memory.role === 'attacker'
              && c.room.name === creep.room.name
              && c.spawning !== true).length;
          let needInGroup = this.GroupSize;
          console.log(creep.name, creep.room, 'GROUP', 'Need', needInGroup);
          console.log(creep.name, creep.room, 'GROUP', 'Haves', creepsInRoom);

          if (creepsInRoom >= needInGroup) {
            console.log('got a group');
            creep.memory.inGroup = true;
          } else {
            console.log('waiting');
            creep.say('w');
            return
          }
        }
      }

    } catch (e) {
      console.log('Attacker Group error', e);
    }

    /**
     Defining the Target ROOM
     */

    if (creep.memory.target === undefined
        || Memory.danger.rooms[creep.memory.target] !== true
    ) {
      //Guard room is always a priority
      creep.memory.target = this.GuardRooms.concat(Object.keys(Memory.danger.rooms))[0];
    }
    let attackRoom = creep.memory.target;
    creep.say('ATT', attackRoom);
    console.log(creep.name, 'ATT', attackRoom);

    /**
     * Selecting Target
     */
    let target;
    /*
    Target ATTACK creep
     */
    //console.log('ATTACK creep');
    target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
      filter: function (object) {
        return object.getActiveBodyparts(ATTACK) > 0 || object.getActiveBodyparts(RANGED_ATTACK) > 0;
      }
    });
    /*
    Target ANY creep
     */
    if (target === null) {
      //console.log('Target ANY creep');
      target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (target !== null && rolelongDistanceHarvester.IsRoomRand(target.pos)) {
        target = null;
      }
    }
    /*
    Target STRUCTURES
     */

    if (target === null) {
      //console.log('Target STRUCTURES');
      target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => {
              return structure.structureType !== STRUCTURE_CONTROLLER
                  && structure.structureType !== STRUCTURE_RAMPART;
            }
          }
      );
    }
    /*
    Target WALLS
     */
    if (target === null) {
      //console.log('Target WALLS');
      target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_WALL &&
              structure.room.controller.owner !== undefined
              && structure.room.controller.my === false
              ;
        }
      });
    }
    if (target === null) {
      console.log(creep.name, 'Target NO TARGET', target);
    } else {
      console.log(creep.name, 'Target ', target);
    }
    /**
     * Attack!
     */
    let r;
    if (target !== null) {
      r = creep.attack(target);
      let rang = creep.rangedAttack(target);
      if (r !== 0) {
        r = creep.attack(creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {}));

      }
      if (rang !== 0) {
        rang = creep.rangedAttack(creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {}));
      }
    }


    /**
     * MOVING
     */
    if (target !== null) {

      /**
       * Retreating
       */
      try {
        console.log('Considering retreat');
        if (target != null && target.hasOwnProperty('getActiveBodyparts')) {
          console.log('Target', JSON.stringify(target));
          let dir = creep.pos.getDirectionTo(target);
          let tA = target.getActiveBodyparts(ATTACK) > 0;
          let tR = target.getActiveBodyparts(RANGED_ATTACK) > 0;
          console.log('Target has', 'Att:', tA, 'Range:', tR, target.name);

          let range = creep.pos.getRangeTo(target);
          //console.log('Results', 'Is Close:', range <= 3, 'Can harm:', (tA || tR));
          if (range <= 3 && (tA || tR)) {
            //Retreat
            console.log('Retreating');
            let c = creep.move(10 - dir);
            if (c < 0) {
              c = creep.move(10 - dir + 1);
              if (c < 0) {
                c = creep.move(10 - dir - 1);
              }
            }
          } else {
            console.log('Moving to creep');
            util.movingTo(creep, target);
          }
          if (Game.flags.move !== undefined) {
            console.log('Moving to the FLAG');
            util.movingTo(creep, Game.flags.move);
            return
          }

        } else {
          console.log('Moving to other target');
          util.movingTo(creep, target);
        }
        if (Game.flags.move !== undefined) {
          console.log('Moving to the FLAG');
          util.movingTo(creep, Game.flags.move);
          return
        }


      }
      catch
          (e) {
        console.log('Skimishing error', e);
      }

    }

    /**
     * MOVING TO THE ROOM
     */
    /*
    To the FLAG target
     */
    if (moveToPos !== undefined
    ) {
      util.movingTo(creep, moveToPos);
    }
    /*
    To the ROOM
     */
    else if (target === null && creep.room.name !== attackRoom) {
      creep.say('WAR');
      // find exit to target room
      var exits = creep.room.findExitTo(attackRoom);

      // move to exit
      let r = util.movingTo(creep, creep.pos.findClosestByRange(exits));
    }
    /*
    ROOM is SAFE
     */
    if (target === null) {
      // No Targets in the Danger Rooom
      if (target === null && Memory.danger.rooms[creep.room.name] === true) {
        creep.say('VICTORY');
        delete Memory.danger.rooms[creep.room.name];
        Memory.rooms[creep.room.name]['Victory'] = true;
        Memory.rooms[creep.room.name].Sources = undefined;
        util.MapRooms();
      }
      //util.MapRooms();
      creep.say('SAFE');
    }

  }
}
;
