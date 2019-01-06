
const STRUCTURES = 'structures';
const ROOMS = 'rooms';
const CREEPS = 'creeps';
const SOURCES = 'sources';

function Commune(name) {
  this.name = name;
  this.assetTypes = {};
  this.assetTypes[STRUCTURES] = {
    'idType': 'id',
    'uniqueProp': 'structureType'
  };
  this.assetTypes[ROOMS] = {
    'idType': 'name',
    'uniqueProp': 'controller'
  };
  this.assetTypes[CREEPS] = {
    'idType': 'name',
    'uniqueProp': 'body',
  };
  this.assetTypes[SOURCES] = {
    'idType': 'id',
    'uniqueProp': 'ticksToRegeneration',
    'uniqueProp1': 'energy',
  };
  this.creeps = {};
  this.structures = {};
  this.rooms = {};
  this.sources = {};
  if (!Memory.communes) Memory.communes = {};
  if (!Memory.communes[this.name]) Memory.communes[this.name] = {};
  this[STRUCTURES] = Memory.communes[this.name][STRUCTURES];
  this[ROOMS] = Memory.communes[this.name][ROOMS];
  this[CREEPS] = Memory.communes[this.name][CREEPS];
  this[SOURCES] = Memory.communes[this.name][SOURCES];

}

Commune.prototype.init = function () {
  // Initialis Memory
  if (!Memory.communes) Memory.communes = {};
  if (!Memory.communes[this.name]) Memory.communes[this.name] = {};
  this.memory = Memory.communes[this.name];
  for (let i in this.assetTypes) {
    console.log('Init', i, this.assetTypes[i]['idType']);
    if (!Memory.communes[this.name][i])
      Memory.communes[this.name][i] = {};
    this[i] = Memory.communes[this.name][i];
  }
};

module.exports = Commune;