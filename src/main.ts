import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
// @ts-ignore
import * as DAT from "dat.gui"
const Stats = require("stats-js")

// Matcaps
const flame = require("../static/textures/matcaps/flame.jpg").default
const bluefade = require("../static/textures/matcaps/bluefade.png").default
const fireandice = require("../static/textures/matcaps/fireandice.png").default
const green = require("../static/textures/matcaps/green.png").default
const neutronstar =
  require("../static/textures/matcaps/neutronstar.png").default
const bloodcell = require("../static/textures/matcaps/bloodcell.png").default
const radiant = require("../static/textures/matcaps/radiant.png").default
const redhalo = require("../static/textures/matcaps/redhalo.png").default
const sun = require("../static/textures/matcaps/sun.png").default
const blackhole = require("../static/textures/matcaps/void.png").default

const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load(redhalo)

// Controllable parameters
const parameters = {
  radius: 1, // Radius of the sphere
  subdivision: 8, // Subdivision of the sphere
  basecolor: 0xffffff, // Color of the sphere
  worleyScale: 0.00006, // Scale for worley noise
  timeScale: 0.1, // Scale for time
}

function main() {
  // getting the canvas DOM element from our html
  const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement

  // Screen dimension
  const screen = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  // Cursor position
  const cursor = {
    x: 0,
    y: 0,
  }

  window.addEventListener("mousemove", (event) => {
    cursor.x = event.clientX / screen.width - 0.5 // -0.5 to 0.5
    cursor.y = -(event.clientY / screen.height - 0.5)
  })

  // Initial display for framerate
  const stats = Stats()
  stats.setMode(0)
  stats.domElement.style.position = "absolute"
  stats.domElement.style.left = "0px"
  stats.domElement.style.top = "0px"
  document.body.appendChild(stats.domElement)

  const scene = new THREE.Scene()

  // matcap material, override later for shader
  const material = new THREE.MeshMatcapMaterial()
  material.matcap = matcapTexture

  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(parameters.radius, parameters.subdivision),
    material
  )
  // load matcap texture

  scene.add(mesh)

  // Add GUI elements
  const gui = new DAT.GUI()
  gui
    .addColor(parameters, "basecolor")
    .name("Base Color")
    .onChange(() => {
      mesh.material.color.set(parameters.basecolor)
    })

  gui
    .add(parameters, "radius", 0, 2)
    .name("Radius")
    .onChange(() => {
      mesh.geometry = new THREE.IcosahedronGeometry(
        parameters.radius,
        parameters.subdivision
      )
    })

  gui
    .add(parameters, "subdivision", 3, 10, 1)
    .name("Subdivision")
    .onChange(() => {
      mesh.geometry = new THREE.IcosahedronGeometry(
        parameters.radius,
        parameters.subdivision
      )
    })

  // button that will reset the parameters to their default values
  gui
    .add({ reset: () => {} }, "reset")
    .name("Reset")
    .onChange(() => {
      parameters.radius = 1
      parameters.subdivision = 8
      parameters.basecolor = 0xff0000
      parameters.worleyScale = 0.00006
      parameters.timeScale = 0.1
      mesh.geometry = new THREE.IcosahedronGeometry(
        parameters.radius,
        parameters.subdivision
      )
      mesh.material.color.set(parameters.basecolor)
    })

  // perspective camera
  const camera = new THREE.PerspectiveCamera(
    75,
    screen.width / screen.height,
    0.1,
    100
  )
  camera.position.z = 3
  scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  const renderer = new THREE.WebGLRenderer({ canvas: canvas })
  renderer.setSize(screen.width, screen.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Clock in Three.js
  const clock = new THREE.Clock()

  // // Set default color to red
  // lambert.setGeometryColor(new Float32Array([1, 0, 0, 1]))

  // // set the default scale for worley noise
  // lambert.setScale(new Float32Array([worleyScale, worleyScale, worleyScale, 1]))

  // This function will be called every frame
  function tick() {
    const elapsedTime = clock.getElapsedTime()

    // lambert.setTime(elapsedTime)
    controls.update()

    stats.begin()

    renderer.clear()
    renderer.render(scene, camera)

    stats.end()

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick)
  }

  window.addEventListener(
    "resize",
    function () {
      screen.width = window.innerWidth
      screen.height = window.innerHeight

      // Update camera aspect ratio and renderer size
      camera.aspect = screen.width / screen.height
      camera.updateProjectionMatrix()

      renderer.setSize(screen.width, screen.height)
    },
    false
  )

  // event listener for fullscreening if F is pressed
  window.addEventListener("keydown", function (event) {
    if (event.key === "f") {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        canvas.requestFullscreen()
      }
    }
  })

  renderer.setSize(screen.width, screen.height)
  // Start the render loop
  tick()
}

main()
