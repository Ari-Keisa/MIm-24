const day = 24.0 * 60 * 60; // сек у земному дні
const G = 6.67430e-11; // гравітаційна стала
const scaleFactor = 1e9; // 1 одиниця = 1 млн км
const dt = day / 3; // інтегрування (1/3 дня)

AFRAME.registerComponent('planet', {
  schema: {
    name: {type: 'string', default: ""},
    dist: {type: 'number', default: 0},
    mass: {type: 'number', default: 0},
    T: {type: 'number', default: 0},
    v: {type: 'array', default: [0, 0, 0]},
    a: {type: 'array', default: [0, 0, 0]},
    pos: {type: 'array', default: [0, 0, 0]}
  },

  init: function () {
    this.data.T *= day;
    this.data.pos = [this.data.dist, 0, 0];

    this.el.setAttribute('position', {
      x: this.data.dist / scaleFactor,
      y: 0,
      z: 0
    });

    // Початкова швидкість: для кругової орбіти
    if (this.data.T > 0) {
      this.data.v = [
        0,
        Math.sqrt(G * 1.989e30 / this.data.dist),
        0
      ];
    }

    // Додаємо мітку назви планети
    if (this.data.name !== "Sun") {
      this.textEntity = document.createElement('a-entity');
      this.textEntity.setAttribute('text', {
        value: this.data.name,
        align: 'center',
        color: 'white',
        width: 10
      });
      this.textEntity.setAttribute('position', {
        x: 0,
        y: -2,
        z: 0
      });
      this.el.appendChild(this.textEntity);
    }
  }
});

AFRAME.registerComponent('main', {
  init: function () {
    this.solarSystem = document.querySelectorAll('[planet]');
  },

  tick: function (time, deltaTime) {
    // Гравітаційна взаємодія
    for (let i = 0; i < this.solarSystem.length; i++) {
      let planet_i = this.solarSystem[i].components.planet.data;
      planet_i.a = [0, 0, 0];

      for (let j = 0; j < this.solarSystem.length; j++) {
        if (i !== j) {
          let planet_j = this.solarSystem[j].components.planet.data;
          let r_ij = [
            planet_j.pos[0] - planet_i.pos[0],
            planet_j.pos[1] - planet_i.pos[1],
            planet_j.pos[2] - planet_i.pos[2]
          ];
          let dist = Math.sqrt(r_ij[0] ** 2 + r_ij[1] ** 2 + r_ij[2] ** 2);
          let factor = G * planet_j.mass / (dist ** 3);
          for (let k = 0; k < 3; k++) {
            planet_i.a[k] += factor * r_ij[k];
          }
        }
      }

      // Інтегрування методом Ейлера
      for (let k = 0; k < 3; k++) {
        planet_i.v[k] += planet_i.a[k] * dt;
        planet_i.pos[k] += planet_i.v[k] * dt;
      }

      // Оновлення позиції в сцені
      this.solarSystem[i].setAttribute('position', {
        x: planet_i.pos[0] / scaleFactor,
        y: planet_i.pos[1] / scaleFactor,
        z: planet_i.pos[2] / scaleFactor
      });

      // Оновлення позиції мітки
      let radius = this.solarSystem[i].getAttribute('radius') || 1;
      if (this.solarSystem[i].components.planet.textEntity) {
        this.solarSystem[i].components.planet.textEntity.setAttribute('position', {
          x: 0,
          y: -radius - 2,
          z: 0
        });
      }
    }
  }
});
