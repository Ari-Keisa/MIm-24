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
      },
      tick: function (time, delta) {
        const dt = delta / 1000

        const daysPassed = dt * this.el.sceneEl.systems['system-controller'].animationSpeed / 86400

        this.angle += this.orbitSpeed * daysPassed

        const x = this.data.dist * Math.cos(this.angle)
        const z = this.data.dist * Math.sin(this.angle)
        this.el.setAttribute('position', { x: x, y: 0, z: z })

        const rotation = this.el.getAttribute('rotation') || { x: 0, y: 0, z: 0 }
        const spinDirection = this.isRetrograde ? -1 : 1
        rotation.y += spinDirection * this.spinSpeed * (daysPassed * 24)
        this.el.setAttribute('rotation', rotation)
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
        this.animationSpeed = 1

        this.camera = document.querySelector('#cameraRig')
        this.speedSlider = document.getElementById('speedSlider')
        this.moveSpeedSlider = document.getElementById('moveSpeedSlider')
        this.zoomSlider = document.getElementById('zoomSlider')
        this.heightSlider = document.getElementById('heightSlider')

        this.speedVal = document.getElementById('speedVal')
        this.moveSpeedVal = document.getElementById('moveSpeedVal')
        this.zoomVal = document.getElementById('zoomVal')
        this.heightVal = document.getElementById('heightVal')

        this.cameraPosition = new THREE.Vector3(0, 50, 150)
        this.camera.object3D.position.copy(this.cameraPosition)

        this.speedSlider.addEventListener('input', e => {
          this.animationSpeed = parseFloat(e.target.value)
          this.speedVal.textContent = (this.animationSpeed / 86400).toFixed(2)
        })

        this.moveSpeedSlider.addEventListener('input', e => {
          const speed = parseFloat(e.target.value)
          this.camera.querySelector('a-camera').setAttribute('wasd-controls', 'moveSpeed', speed)
          this.moveSpeedVal.textContent = speed.toFixed(0)
        })

        this.heightSlider.addEventListener('input', e => {
          this.cameraPosition.y = parseFloat(e.target.value)
          this.camera.object3D.position.copy(this.cameraPosition)
          this.heightVal.textContent = this.cameraPosition.y.toFixed(0)
        })

        this.zoomSlider.addEventListener('input', e => {

          const distance = parseFloat(e.target.value)
          const pos = this.camera.object3D.position
          const direction = pos.clone().normalize()
          direction.multiplyScalar(distance)
          this.camera.object3D.position.copy(direction)

          this.cameraPosition.copy(this.camera.object3D.position)
          this.zoomVal.textContent = distance.toFixed(0)
        })

        window.addEventListener('wheel', e => {
          e.preventDefault()

          const cameraEl = this.camera.querySelector('a-camera')
          const direction = new THREE.Vector3()
          cameraEl.object3D.getWorldDirection(direction)

          const zoomStep = 5
          const delta = e.deltaY > 0 ? zoomStep : -zoomStep

          const pos = this.camera.object3D.position

          pos.add(direction.multiplyScalar(delta))

          const distance = pos.length()
          if (distance < 50) pos.setLength(50)
          else if (distance > 1000) pos.setLength(1000)

          this.camera.object3D.position.copy(pos)
          this.cameraPosition.copy(pos)

          this.zoomVal.textContent = pos.length().toFixed(0)
          this.zoomSlider.value = pos.length()
        }, { passive: false })

        this.speedVal.textContent = (this.animationSpeed / 86400).toFixed(2)
        this.moveSpeedVal.textContent = this.camera.querySelector('a-camera').getAttribute('wasd-controls').acceleration || 100
        this.heightVal.textContent = this.cameraPosition.y.toFixed(0)
        this.zoomVal.textContent = this.cameraPosition.length().toFixed(0)
        this.zoomSlider.value = this.cameraPosition.length()

        this.createOrbits()
      },

      createOrbits: function () {
        const orbitsEntity = document.getElementById('orbits')
        const planetData = [
          { dist: 12 },
          { dist: 18 },
          { dist: 24 },
          { dist: 30 },
          { dist: 42 },
          { dist: 60 },
          { dist: 72 },
          { dist: 84 },
          { dist: 96 }
        ]

        planetData.forEach(p => {
          const ring = document.createElement('a-ring')
          ring.setAttribute('radius-inner', p.dist - 0.1)
          ring.setAttribute('radius-outer', p.dist + 0.1)
          ring.setAttribute('color', '#cccccc')
          ring.setAttribute('rotation', '-90 0 0')
          ring.setAttribute('opacity', '0.3')
          orbitsEntity.appendChild(ring)
        })
      }
    })