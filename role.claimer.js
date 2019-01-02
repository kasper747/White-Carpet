let rolelongDistanceHarvester = require('role.longDistanceHarvester');
let util = require('util');

module.exports = {
  // a function to run the logic for this role
  EnemyNumber: 999,
  GetRoomsToClaim: function () {


    let lineToSource = {};
    for (let roomName in Memory.rooms) {

      if ('Sources' in Memory.rooms[roomName]  //Is this room mapped?
          && roomName !== Game.spawns[spawnName].room.name  // Is room not Home?
      ) {
        lineToSource[roomName] = 0;
        for (let SourceID in Memory.rooms[roomName].Sources) {
          lineToSource[roomName] += Memory.rooms[roomName].Sources[SourceID];
        }
        lineToSource[roomName] = lineToSource[roomName] / Object.keys(Memory.rooms[roomName].Sources).length;
      }
    }


  },
  run: function (creep) {
    //let safeRooms = ['W42N36'];
    if (true) {
      try {
        if (creep.memory.target === undefined) {
          let controlLevel = 6000;
          for (let rName in Game.rooms) {
            let control = Game.rooms[rName].controller;
            if (control.reservation === undefined) {
              creep.memory.target = rName;
              break
            }
            if (control.reservation.ticksToEnd <= controlLevel) {

              creep.memory.target = rName;
            }

            //Game.rooms[ ];
          }
        }


      } catch (e) {

      }
    }


    if (creep.memory.role === 'scout') {


      if (creep.memory.target === undefined) {
        let scoutRooms = rolelongDistanceHarvester.GetRoomsToScout();
        creep.memory.target = scoutRooms[Math.round(Math.random() * (scoutRooms.length - 1))];
      }
      //console.log(creep.name, 'Rooms I scout:', creep.memory.target);
      //let scoutRoom = scoutRooms[Math.round(Math.random() * (1 - scoutRooms.length))];//Math.round(Math.random()*(1-scoutRooms.length));
      /**
       * State control
       */
      /*
      scouting
       */
      if (creep.memory.home === creep.room.name && creep.memory.task === 'retreat') {
        creep.memory.task = 'scout';
      }
      /*
      withdrawal
       */
      if (creep.memory.task === 'retreat') {
        util.goHome(creep);
        return
      }

      console.log('SCOUT >>>>>>', 'Creep room', creep.room.name, 'Target room', creep.memory.target);
      if (creep.room.name !== creep.memory.target) {
        console.log('########### NOT at TARGET', creep.memory.target);
        // find exit to target room
        let exits = creep.room.findExitTo(creep.memory.target);
        let r = creep.moveTo(creep.pos.findClosestByRange(exits));
        //console.log('Move ERR:',r,'EXIT:',creep.pos.findClosestByRange(exits));
        return
      }
      else if (creep.room.name === creep.memory.target) {
        console.log('########### AT TARGET', creep.memory.target);
        //Already scouted this room
        creep.say('Brave New World!');

        let pos = new RoomPosition(25, 25, creep.room.name);
        util.MapRooms();
        creep.memory.target = undefined;
        creep.moveTo(pos);

        creep.say('Going home!');
        creep.memory.task = 'retreat';
        return
      } else {
        console.log('########### NO TARGET', creep.memory.target);
        alert('!');
      }


    } else {
      let safeRooms = 'W43N38';
      /*
      HOME
      */
      if (creep.room.name !== safeRooms) {
        // find exit to target room
        var exits = creep.room.findExitTo(safeRooms);

        // move to exit
        let r = util.movingTo(creep, creep.pos.findClosestByRange(exits));
      }
      /*
      AWAY
      */
      else {
        // try to claim controller
        let r = creep.reserveController(Game.rooms[safeRooms].controller);

        if (r === ERR_NOT_IN_RANGE) {
          // move towards the controller
          util.movingTo(creep, Game.rooms[safeRooms].controller);
        } else if (r < 0) {
          console.log('Got some problem with claimiing the room:', r);
        }
      }
    }


  }
};