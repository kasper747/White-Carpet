'use strict';

const STRUCTURES = 'structures';
const ROOMS = 'rooms';
const CREEPS = 'creeps';
const SOURCES = 'sources';


/**
 * Can appropriate only stuff that is already yours.
 * Public goods can be always appropriated. Like Sources, Mines and Containers. Also controllers?
 * @constructor
 */
function CommitteeOfAppropriation() {
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
}

module.exports = CommitteeOfAppropriation;



/**
 * Focus on the specific Commune
 * @param {String} comName {test2}
 */
CommitteeOfAppropriation.prototype.focusOnCommune = function (comName) {
  this.comName = comName;
};
/**
 * Transfer the assets
 * @param {[Object,Array]} assets
 * @param {String} comName
 */
CommitteeOfAppropriation.prototype.transferAssets = function (assets, comName = this.comName) {
  //Check if

  // How it is identified in DB
  const ID = 'id';
  const NAME = 'name';
  /*
  Which asset type is it?
   */
  let assetType;
  let idType;

  /*
  Search in the memory
   */
  for (const idx in assets) {
    /*
    Defining the type
     */
    for (let assetName in this.assetTypes) {
      console.log(assetName, this.assetTypes[assetName].uniqueProp, assets[idx].name, this.assetTypes[assetName].uniqueProp in assets[idx]);
      if (this.assetTypes[assetName].uniqueProp in assets[idx]
          && (!this.assetTypes[assetName].uniqueProp1
              || this.assetTypes[assetName].uniqueProp1 in assets[idx])
      ) {
        idType = this.assetTypes[assetName].idType;
        assetType = assetName;
        break
      }
    }
    /*
    Removing it from other commmunes
     */
    if (!assetType || !idType) alert('!');
    let data = {};
    let uniqueID = assets[idx][idType];
    console.log('Transfer:', assets[idx], uniqueID, assetType);
    if (Memory.communes[comName][assetType][uniqueID])
      continue;
    for (let com in Memory.communes) {
      console.log('Transfer:', com, assets[idx], uniqueID, assetType);
      if (Memory.communes[com][assetType][uniqueID]) {
        data = Memory.communes[com][assetType][uniqueID];
        delete Memory.communes[com][assetType][uniqueID];
        break;
      }
    }
    Memory.communes[comName][assetType][uniqueID] = data;
  }

};

