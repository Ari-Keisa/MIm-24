AFRAME.registerComponent('planet', {
	schema: {
		name: { type: 'string' },
		dist: { type: 'number' },
		T: { type: 'number' },
		rotationPeriod: { type: 'number' }
	},
	init: function () {
		this.angle = Math.random() * 2 * Math.PI
		this.orbitSpeed = -2 * Math.PI / this.data.T
		this.spinSpeed = 360 / Math.abs(this.data.rotationPeriod)
		this.isRetrograde = this.data.rotationPeriod < 0
		this.rotator = this.el.querySelector('.rotator')
	},
	tick: function (time, delta) {
		const dt = delta / 1000
		const daysPassed = dt * this.el.sceneEl.systems['system-controller'].animationSpeed / 86400

	this.angle += this.orbitSpeed * daysPassed
	const x = this.data.dist * Math.cos(this.angle)
	const z = this.data.dist * Math.sin(this.angle)
	this.el.setAttribute('position', { x, y: 0, z })

	const rotation = this.rotator.getAttribute('rotation') || { x: 0, y: 0, z: 0 }
	const spinDirection = this.isRetrograde ? -1 : 1
	rotation.y += spinDirection * this.spinSpeed * (daysPassed * 24)
	this.rotator.setAttribute('rotation', rotation)
	}
})

AFRAME.registerComponent('moon', {
	init: function () {
		this.angle = 0
		this.orbitRadius = 1.5
		this.orbitPeriod = 27.3
		this.orbitSpeed = -2 * Math.PI / this.orbitPeriod
		this.moonEl = this.el.querySelector('a-sphere')
	},
	tick: function (time, delta) {
		const dt = delta / 1000
		const daysPassed = dt * this.el.sceneEl.systems['system-controller'].animationSpeed / 86400

		this.angle += this.orbitSpeed * daysPassed

    		const x = this.orbitRadius * Math.cos(this.angle)
    		const z = this.orbitRadius * Math.sin(this.angle)
		this.moonEl.setAttribute('position', { x, y: 0, z })

    		const rotationY = -THREE.MathUtils.radToDeg(this.angle)
    		this.moonEl.setAttribute('rotation', { x: 0, y: rotationY, z: 0 })
  	}
})

AFRAME.registerSystem('system-controller', {
	init: function () {
    		this.animationSpeed = 86400 // Один день на секунду

		this.speedSlider = document.getElementById('speedSlider')
    		this.speedVal = document.getElementById('speedVal')

    		this.speedSlider.addEventListener('input', e => {
      		this.animationSpeed = parseFloat(e.target.value)
      		this.speedVal.textContent = (this.animationSpeed / 86400).toFixed(2)
    		})

		this.createOrbits()
	},

	createOrbits: function () {
		const orbitsEntity = document.getElementById('orbits')
		const planetDistances = [12, 18, 24, 30, 42, 60, 72, 84, 96]

	planetDistances.forEach(dist => {
		const ring = document.createElement('a-ring')
		ring.setAttribute('radius-inner', dist - 0.1)
		ring.setAttribute('radius-outer', dist + 0.1)
		ring.setAttribute('color', '#cccccc')
		ring.setAttribute('rotation', '-90 0 0')
		ring.setAttribute('opacity', '0.3')
		orbitsEntity.appendChild(ring)
		})
	}
})