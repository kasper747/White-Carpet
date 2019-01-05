function Hero(name, level) {
  this.name = name;
  this.level = level;
}



Hero.prototype.greet = function () {
  return `${this.name} says hello.`;
}

function Warrior(name, level, weapon) {
  // Chain constructor with call
  Hero.call(this, name, level);

  // Add a new property
  this.weapon = weapon;
}


// Initialize Healer constructor
function Healer(name, level, spell) {
  Hero.call(this, name, level);

  this.spell = spell;
}

Warrior.prototype = Object.create(Hero.prototype);
Healer.prototype = Object.create(Hero.prototype);

let hero1 = new Healer('Bj1orn', 1,'Healer');

write(hero1.greet() )