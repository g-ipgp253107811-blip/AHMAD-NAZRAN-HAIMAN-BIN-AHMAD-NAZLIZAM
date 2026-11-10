/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Enjin 3D Tiga Dimensi Terbuka Sinematik (Cinematic Three.js Open World Engine)
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ZoneId,
  WeatherType,
  CharacterGender,
  GraphicQuality,
} from '../types/game.ts';
import {
  READING_BOARDS,
  NPCS,
  INITIAL_TRASH_ITEMS,
  INITIAL_PLANTING_SPOTS,
  INITIAL_RIVER_SPOTS,
  FLORA_FAUNA_COLLECTIBLES,
  WEATHER_PRESETS,
} from './curriculumData.ts';
import { calculateWeatherMovementModifiers } from './rules.ts';
import {
  createGrassPBRMaterial,
  createStonePathPBRMaterial,
  createWoodPlankPBRMaterial,
  createTreeBarkPBRMaterial,
} from './proceduralTextures.ts';

export interface InteractionTarget {
  type: 'npc' | 'board' | 'puzzle' | 'trash' | 'bin' | 'planting' | 'river' | 'collectible' | 'mini_game_sorting' | 'mini_game_bird';
  id: string;
  name: string;
  prompt: string;
  distance: number;
  position: THREE.Vector3;
}

interface SparkleParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface AnimatedSapling {
  group: THREE.Group;
  currentScale: number;
  targetScale: number;
  flowers: THREE.Mesh[];
}

export class TamanLestari3DEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private frameId = 0;
  private isDisposed = false;
  private isSoftwareGl = false;

  // Mod Kamera Sinematik Title Screen
  public isTitleMode = true;

  // Environment & Lighting
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private fog!: THREE.FogExp2;
  private waterMesh!: THREE.Mesh;
  private waterfallCascadeMesh!: THREE.Mesh;
  private waterfallMistParticles!: THREE.Points;
  private waterfallMistPositions!: Float32Array;

  // Weather Particles
  private rainParticles!: THREE.Points;
  private leafParticles!: THREE.Points;
  private rainPositions!: Float32Array;
  private leafPositions!: Float32Array;

  // Dynamic Visual Effects (Sparkles & Growing Saplings)
  private sparkles: SparkleParticle[] = [];
  private animatedSaplings: Map<string, AnimatedSapling> = new Map();

  // Player & Character Rig
  private playerGroup = new THREE.Group();
  private playerBody!: THREE.Group;
  private playerLegLeft!: THREE.Mesh;
  private playerLegRight!: THREE.Mesh;
  private playerArmLeft!: THREE.Mesh;
  private playerArmRight!: THREE.Mesh;
  private playerShadowDisc!: THREE.Mesh;

  // Interactive Meshes Maps
  private npcMeshes: Map<string, THREE.Group> = new Map();
  private boardMeshes: Map<string, THREE.Group> = new Map();
  private trashMeshes: Map<string, THREE.Group> = new Map();
  private plantMeshes: Map<string, THREE.Group> = new Map();
  private riverSpotsMeshes: Map<string, THREE.Group> = new Map();
  private collectibleMeshes: Map<string, THREE.Group> = new Map();
  private butterflies: THREE.Group[] = [];
  private fishMeshes: THREE.Group[] = [];

  // Physics & Movement
  public playerPosition = new THREE.Vector3(-32, 0, -30);
  private playerVelocity = new THREE.Vector3();
  private playerRotation = -Math.PI * 0.75;
  private isGrounded = true;
  private walkTime = 0;

  // Camera Rig
  private cameraYaw = -Math.PI * 0.75;
  private cameraPitch = 0.22;
  private cameraDistance = 6.5;
  private cameraTarget = new THREE.Vector3();

  // Inputs
  public moveInput = { x: 0, z: 0 };
  public isRunning = false;
  public isJumping = false;

  // State
  public currentWeather: WeatherType = 'cerah';
  public currentZone: ZoneId = 'PINTU_MASUK';
  public gender: CharacterGender = 'lelaki';
  public quality: GraphicQuality = 'tinggi';

  // Callbacks
  public onInteractionChange?: (target: InteractionTarget | null) => void;
  public onZoneChange?: (zone: ZoneId) => void;
  public onStepSound?: (surface: 'grass' | 'stone' | 'wood') => void;

  private activeTarget: InteractionTarget | null = null;
  private stepAccumulator = 0;

  constructor(
    container: HTMLElement,
    gender: CharacterGender = 'lelaki',
    quality: GraphicQuality = 'tinggi',
    isTitle = true
  ) {
    this.container = container;
    this.gender = gender;
    this.quality = quality;
    this.isTitleMode = isTitle;
    this.init();
  }

  private init() {
    // 1. Detect Software GL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#7ec0ee');
    this.fog = new THREE.FogExp2('#7ec0ee', 0.007);
    this.scene.fog = this.fog;

    // 3. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 450);
    this.camera.position.set(-35, 15, -10);

    // 4. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && this.quality !== 'rendah',
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl || this.quality === 'rendah' ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && this.quality !== 'rendah';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 5. Environment Map (RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 6. Lights
    this.setupLighting();

    // 7. World Construction
    this.buildTerrainAndRoads();
    this.buildRiverAndBridges();
    this.buildWaterfallCascade();
    this.buildLandmarksAndBuildings();
    this.buildObservationTower();
    this.buildFoliageAndTrees();
    this.buildInteractiveObjects();
    this.buildWeatherParticles();
    this.buildWildlife();

    // 8. Player Avatar
    this.buildPlayerAvatar();

    // 9. Resize Listener
    window.addEventListener('resize', this.onWindowResize);

    // 10. Start Loop
    this.tick();
  }

  public setTitleMode(enabled: boolean) {
    this.isTitleMode = enabled;
  }

  private setupLighting() {
    // Key Light (Matahari Tropika)
    this.dirLight = new THREE.DirectionalLight('#fff4e0', 1.85);
    this.dirLight.position.set(45, 65, 35);
    this.dirLight.castShadow = !this.isSoftwareGl && this.quality !== 'rendah';
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 170;
    const d = 55;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    // Hemisphere Fill (Biru Langit & Hijau Tropika)
    this.hemiLight = new THREE.HemisphereLight('#87ceeb', '#3a6625', 0.95);
    this.scene.add(this.hemiLight);

    // Ambient Baseline
    const ambient = new THREE.AmbientLight('#ffffff', 0.35);
    this.scene.add(ambient);
  }

  /**
   * Bentuk Muka Bumi Taman & Denai Pejalan Kaki (PBR Procedural Terrain)
   */
  private buildTerrainAndRoads() {
    // Tanah Utama (Rolling Green Terrain 180x180)
    const terrainGeo = new THREE.PlaneGeometry(180, 180, 56, 56);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      pos.setY(i, this.getTerrainHeight(vx, vz));
    }
    terrainGeo.computeVertexNormals();

    const grassMat = createGrassPBRMaterial(this.isSoftwareGl);
    const terrain = new THREE.Mesh(terrainGeo, grassMat);
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // Laluan Berturap Batu (Stone Pathways menghubungkan 6 zon)
    const pathCurves = [
      // Pintu Masuk (-35, -35) ke Hub Tengah (0, 0)
      [new THREE.Vector3(-35, 0.05, -35), new THREE.Vector3(-18, 0.05, -20), new THREE.Vector3(0, 0.05, 0)],
      // Hub Tengah (0, 0) ke Pusat Kitar Semula (40, -30)
      [new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(20, 0.05, -15), new THREE.Vector3(40, 0.05, -30)],
      // Pusat Kitar Semula (40, -30) ke Taman Rekreasi (40, 35)
      [new THREE.Vector3(40, 0.05, -30), new THREE.Vector3(42, 0.05, 5), new THREE.Vector3(40, 0.05, 35)],
      // Pintu Masuk (-35, -35) ke Hutan Hijau (-45, 25)
      [new THREE.Vector3(-35, 0.05, -35), new THREE.Vector3(-42, 0.05, -5), new THREE.Vector3(-45, 0.05, 25)],
      // Hutan Hijau (-45, 25) ke Menara Tinjau & Kawasan Pemuliharaan (-25, 50)
      [new THREE.Vector3(-45, 0.05, 25), new THREE.Vector3(-35, 0.05, 40), new THREE.Vector3(-25, 0.05, 50)],
      // Hub Tengah (0, 0) ke Kawasan Pemuliharaan (-25, 50)
      [new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(-12, 0.05, 25), new THREE.Vector3(-25, 0.05, 50)],
      // Hub Tengah (0, 0) ke Taman Rekreasi (40, 35)
      [new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(20, 0.05, 18), new THREE.Vector3(40, 0.05, 35)],
    ];

    const stoneMat = createStonePathPBRMaterial(this.isSoftwareGl);

    pathCurves.forEach((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 36, 1.45, 6, false);
      tubeGeo.scale(1, 0.08, 1);
      const pathMesh = new THREE.Mesh(tubeGeo, stoneMat);
      pathMesh.position.y += 0.035;
      pathMesh.receiveShadow = true;
      this.scene.add(pathMesh);
    });

    // Dataran Tengah (Central Hub Plaza dengan Pokok Warisan & Dataran Bulat)
    const plazaGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.12, 28);
    const plazaMat = createWoodPlankPBRMaterial(this.isSoftwareGl);
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.07, 0);
    plaza.receiveShadow = true;
    this.scene.add(plaza);
  }

  /**
   * Ketinggian Tanah Prosedural (Terrain Height Function)
   */
  public getTerrainHeight(x: number, z: number): number {
    // Parit Sungai Lestari (mengalir dari z = -55 hingga z = 55 sekitar x = 5 + sin(z*0.08)*6)
    const riverX = 5 + Math.sin(z * 0.08) * 6;
    const distToRiver = Math.abs(x - riverX);

    // Ketinggian Air Terjun di utara (z < -45)
    if (z < -45 && Math.abs(x - 5) < 9) {
      const waterfallCliff = THREE.MathUtils.clamp((-45 - z) * 0.35, 0, 3.8);
      return waterfallCliff;
    }

    if (distToRiver < 4.8) {
      // Jurang tebing sungai
      return -0.85 + (distToRiver / 4.8) * 0.75;
    }

    // Bukit Kawasan Pemuliharaan & Menara Tinjau Rimba (-25, 52)
    const distToTower = Math.hypot(x - (-25), z - 52);
    let towerHill = 0;
    if (distToTower < 22) {
      towerHill = Math.cos((distToTower / 22) * (Math.PI / 2)) * 3.2;
    }

    // Bukit kecil di Hutan Hijau
    const forestHill = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.5;
    // Cerun lembut Pintu Masuk
    const entranceSlope = Math.max(0, -x * 0.02 - z * 0.02);

    return Math.max(0, forestHill + entranceSlope + towerHill);
  }

  /**
   * Sungai Lestari & Jambatan Kayu Tradisional & Batu Melompat
   */
  private buildRiverAndBridges() {
    // Permukaan Air Sungai (Cyan-Blue Glossy Water)
    const waterGeo = new THREE.PlaneGeometry(16, 120, 24, 48);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0277bd,
      roughness: 0.12,
      metalness: 0.65,
      transparent: true,
      opacity: 0.82,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.set(5, -0.4, 0);
    this.scene.add(this.waterMesh);

    // Jambatan Kayu Melengkung (Pusat Hub Merentasi Sungai 0, 0)
    const bridgeGroup = new THREE.Group();
    const woodMat = createWoodPlankPBRMaterial(this.isSoftwareGl);
    const barkMat = createTreeBarkPBRMaterial(this.isSoftwareGl);

    // Lantai Jambatan
    const deckGeo = new THREE.BoxGeometry(11.5, 0.28, 3.4);
    const deck = new THREE.Mesh(deckGeo, woodMat);
    deck.position.set(5, 0.45, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Tiang & Pagar Jambatan dengan Lampu Tanglung
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffe082 });
    for (const zOffset of [-1.6, 1.6]) {
      const railGeo = new THREE.BoxGeometry(11.5, 0.12, 0.14);
      const rail = new THREE.Mesh(railGeo, woodMat);
      rail.position.set(5, 1.15, zOffset);
      bridgeGroup.add(rail);

      for (let rx = 0; rx <= 10; rx += 2.5) {
        const postGeo = new THREE.BoxGeometry(0.14, 0.85, 0.14);
        const post = new THREE.Mesh(postGeo, barkMat);
        post.position.set(rx, 0.75, zOffset);
        bridgeGroup.add(post);

        // Lampu Tanglung Mini di atas tiang
        if (rx === 0 || rx === 10) {
          const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.22), lanternMat);
          lantern.position.set(rx, 1.35, zOffset);
          bridgeGroup.add(lantern);
        }
      }
    }
    this.scene.add(bridgeGroup);

    // Batu Melompat (Stepping Stones) Merentasi Sungai di Zon Rekreasi (x: 5, z: 15)
    const stoneGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.4, 8);
    const riverStoneMat = new THREE.MeshStandardMaterial({
      color: 0x78909c,
      roughness: 0.6,
      metalness: 0.1,
    });
    for (let s = -2; s <= 2; s++) {
      const stone = new THREE.Mesh(stoneGeo, riverStoneMat);
      stone.position.set(5 + s * 1.5, -0.22, 15 + Math.sin(s) * 0.4);
      stone.rotation.y = s * 0.5;
      stone.receiveShadow = true;
      this.scene.add(stone);
    }
  }

  /**
   * Jeram Air Terjun Semula Jadi (Rocky Waterfall Cascade at North River)
   */
  private buildWaterfallCascade() {
    const waterfallGroup = new THREE.Group();
    waterfallGroup.position.set(6, 0, -55);

    // Batu-batan Air Terjun (Stacked Weathered Boulders)
    const boulderMat = new THREE.MeshStandardMaterial({
      color: 0x546e7a,
      roughness: 0.85,
      metalness: 0.1,
    });

    const boulderConfigs = [
      { x: -3.5, y: 1.2, z: 0, s: 2.2 },
      { x: 3.5, y: 1.4, z: 0.2, s: 2.4 },
      { x: -2.0, y: 2.4, z: -1.2, s: 2.0 },
      { x: 2.0, y: 2.6, z: -1.0, s: 2.1 },
      { x: 0, y: 3.2, z: -2.0, s: 2.5 },
    ];

    boulderConfigs.forEach((cfg) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(cfg.s, 1), boulderMat);
      rock.position.set(cfg.x, cfg.y, cfg.z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      waterfallGroup.add(rock);
    });

    // Jalur Air Terjun Mengalir Deras (Curved Cascading Foam Sheet)
    const fallGeo = new THREE.PlaneGeometry(3.6, 5.2, 8, 12);
    fallGeo.rotateX(Math.PI / 4);
    const fallMat = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa,
      roughness: 0.2,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88,
    });
    this.waterfallCascadeMesh = new THREE.Mesh(fallGeo, fallMat);
    this.waterfallCascadeMesh.position.set(0, 1.8, -0.6);
    waterfallGroup.add(this.waterfallCascadeMesh);

    // Kolam Percikan Bawah
    const poolFoam = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        transparent: true,
        opacity: 0.65,
      })
    );
    poolFoam.rotation.x = -Math.PI / 2;
    poolFoam.position.set(0, -0.32, 1.8);
    waterfallGroup.add(poolFoam);

    // Zarah Semburan Kabus Air Terjun (Mist Particles)
    const mistCount = 60;
    const mistGeo = new THREE.BufferGeometry();
    this.waterfallMistPositions = new Float32Array(mistCount * 3);
    for (let i = 0; i < mistCount; i++) {
      this.waterfallMistPositions[i * 3] = (Math.random() - 0.5) * 4.5;
      this.waterfallMistPositions[i * 3 + 1] = Math.random() * 2.5;
      this.waterfallMistPositions[i * 3 + 2] = 1.0 + Math.random() * 2.0;
    }
    mistGeo.setAttribute('position', new THREE.BufferAttribute(this.waterfallMistPositions, 3));
    const mistMat = new THREE.PointsMaterial({
      color: 0xb2ebf2,
      size: 0.45,
      transparent: true,
      opacity: 0.55,
    });
    this.waterfallMistParticles = new THREE.Points(mistGeo, mistMat);
    waterfallGroup.add(this.waterfallMistParticles);

    this.scene.add(waterfallGroup);
  }

  /**
   * Menara Tinjau Rimba (Wooden Observation Tower at Kawasan Pemuliharaan: -25, 52)
   */
  private buildObservationTower() {
    const towerGroup = new THREE.Group();
    const hillY = this.getTerrainHeight(-25, 52);
    towerGroup.position.set(-25, hillY, 52);

    const timberMat = createWoodPlankPBRMaterial(this.isSoftwareGl);
    const postMat = createTreeBarkPBRMaterial(this.isSoftwareGl);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });

    // 4 Tiang Penyangga Utama (Main Vertical Stilts: Tinggi 8.5m)
    const legGeo = new THREE.CylinderGeometry(0.22, 0.28, 8.5, 8);
    const legPositions = [
      [-2.4, -2.4],
      [2.4, -2.4],
      [-2.4, 2.4],
      [2.4, 2.4],
    ];

    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, postMat);
      leg.position.set(lx, 4.25, lz);
      leg.castShadow = true;
      towerGroup.add(leg);
    });

    // Palang Silang Struktur (Cross Braces)
    const braceMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
    for (const height of [2.8, 5.8]) {
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.16, 0.16), braceMat);
      b1.position.set(0, height, -2.4);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.16, 0.16), braceMat);
      b2.position.set(0, height, 2.4);
      const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 5.0), braceMat);
      b3.position.set(-2.4, height, 0);
      const b4 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 5.0), braceMat);
      b4.position.set(2.4, height, 0);
      towerGroup.add(b1, b2, b3, b4);
    }

    // Dek Tinjau Atas (Top Observation Platform: Luas 6x6m pada ketinggian 7.5m)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.3, 6.0), timberMat);
    deck.position.set(0, 7.5, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    towerGroup.add(deck);

    // Pagar Keselamatan Dek Tinjau
    for (const offset of [-2.85, 2.85]) {
      const railX = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.12, 0.1), timberMat);
      railX.position.set(0, 8.4, offset);
      const railZ = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 5.8), timberMat);
      railZ.position.set(offset, 8.4, 0);
      towerGroup.add(railX, railZ);
    }

    // Tiang Bumbung Dek Tinjau
    legPositions.forEach(([lx, lz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.2), postMat);
      post.position.set(lx * 0.9, 8.6, lz * 0.9);
      towerGroup.add(post);
    });

    // Bumbung Limas Kayu Menara
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.0, 4), roofMat);
    roof.position.set(0, 10.7, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    towerGroup.add(roof);

    // Tangga Akses Menara
    const ladderGroup = new THREE.Group();
    ladderGroup.position.set(0, 0, 2.4);
    for (let step = 0; step < 18; step++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.12), timberMat);
      rung.position.set(0, 0.4 + step * 0.4, 0.1);
      ladderGroup.add(rung);
    }
    towerGroup.add(ladderGroup);

    // Teropong Rimba di Tengah Dek
    const scopeStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.8, roughness: 0.2 })
    );
    scopeStand.position.set(0, 8.2, 0);
    const scopeTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.05, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.9, roughness: 0.1 })
    );
    scopeTube.position.set(0, 8.8, 0.1);
    scopeTube.rotation.x = Math.PI / 3;
    towerGroup.add(scopeStand, scopeTube);

    this.scene.add(towerGroup);
  }

  /**
   * Mercu Tanda & Struktur Bangunan (Entrance Arch, Recycling Center, Playground, Gazebo)
   */
  private buildLandmarksAndBuildings() {
    // 1. GERBANG UTAMA PINTU MASUK (-35, -35)
    const archGroup = new THREE.Group();
    archGroup.position.set(-35, 0, -35);
    const timberMat = createTreeBarkPBRMaterial(this.isSoftwareGl);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.6 });

    // Tiang kiri & kanan
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 5.5, 0.85), timberMat);
    p1.position.set(-3.2, 2.75, 0);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 5.5, 0.85), timberMat);
    p2.position.set(3.2, 2.75, 0);
    // Rasuk atas
    const beam = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.65, 1.1), timberMat);
    beam.position.set(0, 5.2, 0);
    // Bumbung limas gaya Melayu
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 1.5, 4), roofMat);
    roof.position.set(0, 6.3, 0);
    roof.rotation.y = Math.PI / 4;
    archGroup.add(p1, p2, beam, roof);
    this.scene.add(archGroup);

    // 2. KIOSK PUSAT KITAR SEMULA (40, -30)
    const recyclingKiosk = new THREE.Group();
    recyclingKiosk.position.set(40, 0, -30);
    const kioskWall = new THREE.Mesh(
      new THREE.BoxGeometry(8, 3.5, 5),
      new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.4 })
    );
    kioskWall.position.y = 1.75;
    const kioskRoof = new THREE.Mesh(
      new THREE.BoxGeometry(9.5, 0.4, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.5 })
    );
    kioskRoof.position.y = 3.7;
    recyclingKiosk.add(kioskWall, kioskRoof);
    this.scene.add(recyclingKiosk);

    // 3 TONG KITAR SEMULA WARNA STANDARD MALAYSIA
    const bins = [
      { color: 0x1e88e5, label: 'Kertas (Biru)', x: 37, z: -27, id: 'bin_kertas' },
      { color: 0xfb8c00, label: 'Plastik/Tin (Jingga)', x: 40, z: -27, id: 'bin_plastik' },
      { color: 0x8d6e63, label: 'Kaca/Logam (Coklat)', x: 43, z: -27, id: 'bin_kaca' },
    ];
    bins.forEach((b) => {
      const binGroup = new THREE.Group();
      binGroup.position.set(b.x, 0, b.z);
      const binBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.4, 1.2, 16),
        new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.35 })
      );
      binBody.position.y = 0.6;
      binBody.castShadow = true;
      const binCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.45, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.5 })
      );
      binCap.position.y = 1.25;
      binGroup.add(binBody, binCap);
      this.scene.add(binGroup);
    });

    // 3. TAMAN REKREASI: Gelongsor & Buaian Kanak-Kanak (40, 35)
    const playGroup = new THREE.Group();
    playGroup.position.set(40, 0, 35);
    // Buaian (Swings)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.4 });
    const swingBar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.15, 0.15), frameMat);
    swingBar.position.set(0, 3.2, 0);
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4), frameMat);
    leg1.position.set(-2.2, 1.6, 0.8);
    leg1.rotation.x = 0.25;
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4), frameMat);
    leg2.position.set(-2.2, 1.6, -0.8);
    leg2.rotation.x = -0.25;
    const leg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4), frameMat);
    leg3.position.set(2.2, 1.6, 0.8);
    leg3.rotation.x = 0.25;
    const leg4 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4), frameMat);
    leg4.position.set(2.2, 1.6, -0.8);
    leg4.rotation.x = -0.25;
    playGroup.add(swingBar, leg1, leg2, leg3, leg4);

    // Gelongsor (Slide)
    const slideLadder = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 2.5, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xffb300 })
    );
    slideLadder.position.set(-5, 1.25, 0);
    const slideRamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 3.6, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x00bcd4, roughness: 0.2 })
    );
    slideRamp.position.set(-3.5, 1.2, 0);
    slideRamp.rotation.z = -0.7;
    playGroup.add(slideLadder, slideRamp);
    this.scene.add(playGroup);

    // 4. PONDOK REHAT GAZEBO (Central Rest Area: -15, 0, 10)
    const gazebo = new THREE.Group();
    gazebo.position.set(-15, 0, 10);
    const gDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 0.3, 8),
      createWoodPlankPBRMaterial(this.isSoftwareGl)
    );
    gDeck.position.y = 0.15;
    const gRoof = new THREE.Mesh(
      new THREE.ConeGeometry(4.0, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x388e3c })
    );
    gRoof.position.y = 3.4;
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const gPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 2.9),
        createTreeBarkPBRMaterial(this.isSoftwareGl)
      );
      gPost.position.set(Math.cos(angle) * 2.8, 1.45, Math.sin(angle) * 2.8);
      gazebo.add(gPost);
    }
    gazebo.add(gDeck, gRoof);
    this.scene.add(gazebo);
  }

  /**
   * Pepohon Tropika, Pokok Beringin, Pokok Kelapa, Bunga Raya & Paku-Pakis
   */
  private buildFoliageAndTrees() {
    const barkMat = createTreeBarkPBRMaterial(this.isSoftwareGl);
    const leafMats = [
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.68 }),
    ];

    // 1. POKOK BERINGIN BESAR (Banyan Trees) dengan Akar Banir & Sulur Udara
    const banyanPositions = [
      { x: -48, z: 22, s: 1.3 },
      { x: -38, z: 35, s: 1.15 },
      { x: 0, z: -12, s: 1.2 },
      { x: -16, z: 46, s: 1.25 },
    ];

    banyanPositions.forEach((bp) => {
      const banyan = new THREE.Group();
      const y = this.getTerrainHeight(bp.x, bp.z);
      banyan.position.set(bp.x, y, bp.z);
      banyan.scale.set(bp.s, bp.s, bp.s);

      // Batang Utama Padu
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 1.3, 5.2, 10),
        barkMat
      );
      trunk.position.y = 2.6;
      trunk.castShadow = true;
      banyan.add(trunk);

      // 4 Akar Banir (Buttress Roots yang menyokong pokok)
      for (let r = 0; r < 4; r++) {
        const angle = (r / 4) * Math.PI * 2;
        const root = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 2.2, 1.6),
          barkMat
        );
        root.position.set(Math.cos(angle) * 1.2, 1.0, Math.sin(angle) * 1.2);
        root.rotation.y = angle;
        banyan.add(root);
      }

      // Kanopi Rimbun Berlapis (Wide Spreading Canopy)
      for (let layer = 0; layer < 4; layer++) {
        const radius = 3.6 - layer * 0.6;
        const canopyMesh = new THREE.Mesh(
          new THREE.DodecahedronGeometry(radius, 1),
          leafMats[layer % leafMats.length]
        );
        canopyMesh.position.set(
          (Math.random() - 0.5) * 1.5,
          5.0 + layer * 1.4,
          (Math.random() - 0.5) * 1.5
        );
        canopyMesh.castShadow = true;
        banyan.add(canopyMesh);
      }

      // Sulur Udara / Akar Bergayut (Hanging Vines)
      const vineMat = new THREE.MeshStandardMaterial({ color: 0x33691e, roughness: 0.9 });
      for (let v = 0; v < 6; v++) {
        const vAngle = (v / 6) * Math.PI * 2;
        const vine = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 3.6),
          vineMat
        );
        vine.position.set(Math.cos(vAngle) * 2.2, 3.6, Math.sin(vAngle) * 2.2);
        banyan.add(vine);
      }

      this.scene.add(banyan);
    });

    // 2. POKOK PALMA / KELAPA (Coconut / Fan Palms di tepi sungai & taman)
    const palmPositions = [
      { x: 12, z: -15 }, { x: 14, z: 8 }, { x: 9, z: 28 }, { x: -2, z: -22 },
      { x: 28, z: -20 }, { x: 34, z: 12 }, { x: -32, z: -22 },
    ];

    palmPositions.forEach((pp) => {
      const palm = new THREE.Group();
      const y = this.getTerrainHeight(pp.x, pp.z);
      palm.position.set(pp.x, y, pp.z);

      // Batang Pokok Palma Beruas-ruas & Melengkung
      const trunkHeight = 6.2;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.35, trunkHeight, 8),
        barkMat
      );
      trunk.position.set(0.4, trunkHeight / 2, 0);
      trunk.rotation.z = -0.12;
      trunk.castShadow = true;
      palm.add(trunk);

      // Buah Kelapa Mini di pucuk
      const cocoMat = new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.5 });
      for (let c = 0; c < 3; c++) {
        const nut = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), cocoMat);
        nut.position.set(0.6 + Math.cos(c * 2) * 0.25, trunkHeight - 0.1, Math.sin(c * 2) * 0.25);
        palm.add(nut);
      }

      // 8 Pelepah Daun Palma Melengkung Keluar
      const frondMat = new THREE.MeshStandardMaterial({
        color: 0x43a047,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });
      for (let f = 0; f < 8; f++) {
        const angle = (f / 8) * Math.PI * 2;
        const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3.2), frondMat);
        frond.position.set(0.6, trunkHeight + 0.1, 0);
        frond.rotation.y = angle;
        frond.rotation.x = Math.PI / 3.2;
        frond.castShadow = true;
        palm.add(frond);
      }

      this.scene.add(palm);
    });

    // 3. POKOK HUJAN-HUJAN & RIMBA TROPIKA (Forest Trees)
    const treePositions = [
      { x: -52, z: 15 }, { x: -44, z: 28 }, { x: -55, z: 32 }, { x: -36, z: 22 },
      { x: -48, z: 40 }, { x: -56, z: 20 }, { x: -42, z: 12 }, { x: -38, z: 30 },
      { x: 12, z: 35 }, { x: 15, z: -5 }, { x: -3, z: 20 }, { x: -5, z: 38 },
      { x: -28, z: 38 }, { x: -18, z: 42 }, { x: -12, z: 52 },
      { x: 32, z: 25 }, { x: 44, z: 40 }, { x: 36, z: 46 }, { x: -28, z: -44 },
      { x: -44, z: -30 }, { x: 26, z: -38 }, { x: 46, z: -15 },
    ];

    treePositions.forEach((pos, idx) => {
      const treeGroup = new THREE.Group();
      const scale = 0.85 + (idx % 4) * 0.2;
      treeGroup.scale.set(scale, scale, scale);

      const y = this.getTerrainHeight(pos.x, pos.z);
      treeGroup.position.set(pos.x, y, pos.z);

      // Batang
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.48, 4.6, 8),
        barkMat
      );
      trunk.position.y = 2.3;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);

      // Kanopi Bertingkat
      const mat = leafMats[idx % leafMats.length];
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3.4, 7), mat);
      c1.position.y = 4.6;
      c1.castShadow = true;
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.6, 7), mat);
      c2.position.y = 6.2;
      c2.castShadow = true;
      const c3 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.8, 7), mat);
      c3.position.y = 7.5;
      c3.castShadow = true;

      treeGroup.add(c1, c2, c3);
      this.scene.add(treeGroup);
    });

    // 4. PAKU-PAKIS RIMBA & BUNGA RAYA (Giant Ferns & Tropical Hibiscus Shrubbery)
    const flowerMatRed = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });
    const flowerMatYellow = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.4 });
    const shrubMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.7 });

    for (let i = 0; i < 28; i++) {
      const bush = new THREE.Group();
      const bx = -50 + Math.random() * 95;
      const bz = -50 + Math.random() * 95;
      const by = this.getTerrainHeight(bx, bz);

      bush.position.set(bx, by, bz);

      // Dedaun Pokok Renek
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), shrubMat);
      shrub.position.y = 0.5;
      bush.add(shrub);

      // Bunga Raya Mekar (Hibiscus Blooms)
      const flower = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.25, 5),
        i % 2 === 0 ? flowerMatRed : flowerMatYellow
      );
      flower.position.set(0.3, 0.9, 0.2);
      flower.rotation.x = Math.PI / 4;
      bush.add(flower);

      this.scene.add(bush);
    }
  }

  /**
   * Entiti Interaktif: Papan Maklumat, NPC, Sampah, Tapak Semaian, Relik
   */
  private buildInteractiveObjects() {
    // 1. TIGA PAPAN MAKLUMAT (Misi 1: Pemburu Kosa Kata)
    READING_BOARDS.forEach((b) => {
      const boardGroup = new THREE.Group();
      const y = this.getTerrainHeight(b.coordinates.x, b.coordinates.z);
      boardGroup.position.set(b.coordinates.x, y, b.coordinates.z);

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 2.2),
        createTreeBarkPBRMaterial(this.isSoftwareGl)
      );
      post.position.y = 1.1;

      // Papan Paparan Kayu
      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.4, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xfff9c4, roughness: 0.3 })
      );
      plaque.position.y = 2.0;

      // Glow Beacon
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x38ef7d })
      );
      beacon.position.y = 3.0;

      boardGroup.add(post, plaque, beacon);
      this.scene.add(boardGroup);
      this.boardMeshes.set(b.id, boardGroup);
    });

    // 2. TIGA NPC INTERAKTIF (Pak Osman, Si Oyen, Puan Aminah)
    NPCS.forEach((npc) => {
      const npcGroup = new THREE.Group();
      const y = this.getTerrainHeight(npc.coordinates.x, npc.coordinates.z);
      npcGroup.position.set(npc.coordinates.x, y, npc.coordinates.z);

      if (npc.id === 'si_oyen') {
        // Model Kucing Comel Oren (Si Oyen)
        const catMat = new THREE.MeshStandardMaterial({ color: 0xf57c00, roughness: 0.4 });
        const cBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.8), catMat);
        cBody.position.y = 0.3;
        const cHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), catMat);
        cHead.position.set(0, 0.55, 0.35);
        const cEarL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 3), catMat);
        cEarL.position.set(-0.12, 0.78, 0.35);
        const cEarR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 3), catMat);
        cEarR.position.set(0.12, 0.78, 0.35);
        const cTail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5), catMat);
        cTail.position.set(0, 0.4, -0.45);
        cTail.rotation.x = -0.6;
        npcGroup.add(cBody, cHead, cEarL, cEarR, cTail);
      } else {
        // Model Manusia (Pak Osman / Puan Aminah)
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7 });
        const uniformMat = new THREE.MeshStandardMaterial({
          color: npc.id === 'pak_osman' ? 0x8d6e63 : 0x00897b,
          roughness: 0.6,
        });

        // Badan
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.4), uniformMat);
        body.position.y = 1.35;
        // Kepala
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), skinMat);
        head.position.y = 2.15;
        // Topi / Tudung
        const hat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.15, 12),
          new THREE.MeshStandardMaterial({ color: 0x3e2723 })
        );
        hat.position.y = 2.35;
        // Kaki
        const legL = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.8, 0.25),
          new THREE.MeshStandardMaterial({ color: 0x263238 })
        );
        legL.position.set(-0.2, 0.4, 0);
        const legR = legL.clone();
        legR.position.x = 0.2;

        npcGroup.add(body, head, hat, legL, legR);
      }

      // Dialog Icon Indicator
      const chatBubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffeb3b })
      );
      chatBubble.position.y = npc.id === 'si_oyen' ? 1.2 : 2.7;
      npcGroup.add(chatBubble);

      this.scene.add(npcGroup);
      this.npcMeshes.set(npc.id, npcGroup);
    });

    // 3. KUTIPAN SAMPAH (Misi 4: Penyelamat Taman)
    INITIAL_TRASH_ITEMS.forEach((t) => {
      const trashGroup = new THREE.Group();
      const y = this.getTerrainHeight(t.coordinates.x, t.coordinates.z) + 0.1;
      trashGroup.position.set(t.coordinates.x, y, t.coordinates.z);

      let geo: THREE.BufferGeometry;
      let color = 0x29b6f6;
      if (t.category === 'kertas') {
        geo = new THREE.BoxGeometry(0.35, 0.1, 0.3);
        color = 0xffffff;
      } else if (t.category === 'plastik_aluminium') {
        geo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8);
        color = 0x03a9f4;
      } else {
        geo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
        color = 0x8d6e63;
      }

      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.3 }));
      mesh.castShadow = true;
      trashGroup.add(mesh);

      // Lingkaran sinaran interaktif
      const glow = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.42, 16),
        new THREE.MeshBasicMaterial({ color: 0xff5722, side: THREE.DoubleSide })
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.02;
      trashGroup.add(glow);

      this.scene.add(trashGroup);
      this.trashMeshes.set(t.id, trashGroup);
    });

    // 4. TAPAK PENANAMAN POKOK (Misi 4)
    INITIAL_PLANTING_SPOTS.forEach((spot) => {
      const plantGroup = new THREE.Group();
      const y = this.getTerrainHeight(spot.coordinates.x, spot.coordinates.z);
      plantGroup.position.set(spot.coordinates.x, y, spot.coordinates.z);

      // Busut Tanah Semaian
      const mound = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.25, 0.28, 12),
        new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 })
      );
      mound.position.y = 0.14;
      plantGroup.add(mound);

      this.scene.add(plantGroup);
      this.plantMeshes.set(spot.id, plantGroup);
    });

    // 5. KAWASAN SUNGAI TERCEMAR (River Slicks)
    INITIAL_RIVER_SPOTS.forEach((spot) => {
      const riverSpotGroup = new THREE.Group();
      riverSpotGroup.position.set(spot.coordinates.x, -0.35, spot.coordinates.z);

      const slick = new THREE.Mesh(
        new THREE.CircleGeometry(1.6, 16),
        new THREE.MeshStandardMaterial({
          color: 0x546e7a,
          roughness: 0.5,
          transparent: true,
          opacity: 0.78,
        })
      );
      slick.rotation.x = -Math.PI / 2;
      riverSpotGroup.add(slick);

      this.scene.add(riverSpotGroup);
      this.riverSpotsMeshes.set(spot.id, riverSpotGroup);
    });

    // 6. ENAM RELIK FLORA & FAUNA TERSEMBUNYI
    FLORA_FAUNA_COLLECTIBLES.forEach((c) => {
      const colGroup = new THREE.Group();
      const y = this.getTerrainHeight(c.coordinates.x, c.coordinates.z) + 0.3;
      colGroup.position.set(c.coordinates.x, y, c.coordinates.z);

      // Bebola Kilauan Emas Purba
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({
          color: c.type === 'flora' ? 0xff4081 : 0xffd700,
          roughness: 0.2,
          metalness: 0.85,
          emissive: c.type === 'flora' ? 0x880e4f : 0xff6f00,
          emissiveIntensity: 0.65,
        })
      );
      colGroup.add(orb);

      this.scene.add(colGroup);
      this.collectibleMeshes.set(c.id, colGroup);
    });
  }

  /**
   * Zarah Cuaca: Hujan Tropika & Dedaun Angin
   */
  private buildWeatherParticles() {
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    this.rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 120;
      this.rainPositions[i * 3 + 1] = Math.random() * 40;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0xbbdefb,
      size: 0.35,
      transparent: true,
      opacity: 0.65,
    });
    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);

    // Zarah Daun Gugur untuk Angin
    const leafCount = 150;
    const leafGeo = new THREE.BufferGeometry();
    this.leafPositions = new Float32Array(leafCount * 3);
    for (let i = 0; i < leafCount; i++) {
      this.leafPositions[i * 3] = (Math.random() - 0.5) * 100;
      this.leafPositions[i * 3 + 1] = 1 + Math.random() * 15;
      this.leafPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    leafGeo.setAttribute('position', new THREE.BufferAttribute(this.leafPositions, 3));

    const leafMat = new THREE.PointsMaterial({
      color: 0x8bc34a,
      size: 0.45,
      transparent: true,
      opacity: 0.8,
    });
    this.leafParticles = new THREE.Points(leafGeo, leafMat);
    this.leafParticles.visible = false;
    this.scene.add(this.leafParticles);
  }

  /**
   * Haiwan Bergerak: Kupu-kupu & Ikan Berenang
   */
  private buildWildlife() {
    // 6 Kupu-kupu Berterbangan di Hutan & Bunga
    for (let i = 0; i < 6; i++) {
      const bGroup = new THREE.Group();
      const wingMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffeb3b : 0x00e5ff,
        side: THREE.DoubleSide,
      });
      const wL = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.25), wingMat);
      wL.position.x = -0.12;
      const wR = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.25), wingMat);
      wR.position.x = 0.12;
      bGroup.add(wL, wR);
      bGroup.position.set(-40 + Math.random() * 20, 2 + Math.random() * 2, 20 + Math.random() * 20);
      this.butterflies.push(bGroup);
      this.scene.add(bGroup);
    }

    // 5 Ikan Kelah/Karp Berenang di Sungai Lestari
    for (let i = 0; i < 5; i++) {
      const fGroup = new THREE.Group();
      const fishMat = new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.3 });
      const fBody = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), fishMat);
      fBody.rotation.x = Math.PI / 2;
      fGroup.add(fBody);
      fGroup.position.set(4 + Math.random() * 3, -0.45, -30 + i * 15);
      this.fishMeshes.push(fGroup);
      this.scene.add(fGroup);
    }
  }

  /**
   * Membina Avatar Watak Pemain (Wira Alam 3D - 10 Parts Rig)
   */
  private buildPlayerAvatar() {
    this.playerBody = new THREE.Group();

    // Palet Warna Seragam Wira Alam
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.6 });
    const uniformColor = this.gender === 'lelaki' ? 0x2e7d32 : 0x00897b;
    const vestMat = new THREE.MeshStandardMaterial({ color: uniformColor, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.8 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.4 });
    const packMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.8 });

    // 1. Badan / Vest
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.38), vestMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    this.playerBody.add(torso);

    // 2. Beg Galas Wira (Backpack)
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.25), packMat);
    pack.position.set(0, 1.1, -0.28);
    this.playerBody.add(pack);

    // 3. Kepala & Rambut
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 14), skinMat);
    head.position.y = 1.68;
    head.castShadow = true;

    // Ciri Wajah Mesra: Mata & Senyuman
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x212121 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), eyeMat);
    eyeL.position.set(-0.09, 1.72, 0.23);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), eyeMat);
    eyeR.position.set(0.09, 1.72, 0.23);

    const smileGeo = new THREE.TorusGeometry(0.05, 0.015, 6, 8, Math.PI);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0xbf360c });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.position.set(0, 1.63, 0.24);
    smile.rotation.x = Math.PI;

    this.playerBody.add(head, eyeL, eyeR, smile);

    // 4. Topi Penjelajah (Explorer Cap)
    const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.16, 12), capMat);
    capCrown.position.y = 1.88;
    const capPeak = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.3), capMat);
    capPeak.position.set(0, 1.82, 0.28);
    this.playerBody.add(capCrown, capPeak);

    // 5. Kaki Kiri & Kanan (Pivot di pinggang)
    const legGeo = new THREE.BoxGeometry(0.22, 0.7, 0.22);
    this.playerLegLeft = new THREE.Mesh(legGeo, pantsMat);
    this.playerLegLeft.position.set(-0.18, 0.35, 0);
    this.playerLegLeft.castShadow = true;

    this.playerLegRight = new THREE.Mesh(legGeo, pantsMat);
    this.playerLegRight.position.set(0.18, 0.35, 0);
    this.playerLegRight.castShadow = true;
    this.playerBody.add(this.playerLegLeft, this.playerLegRight);

    // Kasut Boot
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.32), bootMat);
    bootL.position.set(0, -0.32, 0.04);
    this.playerLegLeft.add(bootL);
    const bootR = bootL.clone();
    this.playerLegRight.add(bootR);

    // 6. Tangan Kiri & Kanan (Pivot di bahu)
    const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    this.playerArmLeft = new THREE.Mesh(armGeo, vestMat);
    this.playerArmLeft.position.set(-0.45, 1.05, 0);
    this.playerArmRight = new THREE.Mesh(armGeo, vestMat);
    this.playerArmRight.position.set(0.45, 1.05, 0);
    this.playerBody.add(this.playerArmLeft, this.playerArmRight);

    // 7. Contact Shadow Disc (Bawah Kaki)
    const shadowGeo = new THREE.CircleGeometry(0.65, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.playerShadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    this.playerShadowDisc.position.y = 0.02;

    this.playerGroup.add(this.playerBody);
    this.playerGroup.add(this.playerShadowDisc);

    this.playerGroup.position.copy(this.playerPosition);
    this.scene.add(this.playerGroup);
  }

  // ==========================================
  // LOGIK PERGERAKAN & KAWALAN KAMERA
  // ==========================================

  public setMoveInput(x: number, z: number, running: boolean) {
    this.moveInput.x = x;
    this.moveInput.z = z;
    this.isRunning = running;
  }

  public jump() {
    if (this.isGrounded) {
      this.playerVelocity.y = 7.5;
      this.isGrounded = false;
    }
  }

  public rotateCamera(deltaX: number, deltaY: number) {
    this.cameraYaw -= deltaX * 0.0035;
    this.cameraPitch = Math.max(-0.2, Math.min(0.85, this.cameraPitch + deltaY * 0.0035));
  }

  public setWeather(weather: WeatherType) {
    this.currentWeather = weather;

    if (weather === 'hujan') {
      this.rainParticles.visible = true;
      this.leafParticles.visible = false;
      this.scene.background = new THREE.Color('#455a64');
      this.fog.color = new THREE.Color('#455a64');
      this.fog.density = 0.012;
      this.dirLight.intensity = 0.8;
      this.hemiLight.intensity = 0.5;
    } else if (weather === 'senja') {
      this.rainParticles.visible = false;
      this.leafParticles.visible = false;
      this.scene.background = new THREE.Color('#e65100');
      this.fog.color = new THREE.Color('#ff8f00');
      this.fog.density = 0.0065;
      this.dirLight.color = new THREE.Color('#ff9800');
      this.dirLight.intensity = 1.4;
      this.hemiLight.color = new THREE.Color('#ffb74d');
    } else if (weather === 'berangin') {
      this.rainParticles.visible = false;
      this.leafParticles.visible = true;
      this.scene.background = new THREE.Color('#81d4fa');
      this.fog.color = new THREE.Color('#81d4fa');
      this.fog.density = 0.006;
      this.dirLight.intensity = 1.6;
    } else {
      // Cerah
      this.rainParticles.visible = false;
      this.leafParticles.visible = false;
      this.scene.background = new THREE.Color('#7ec0ee');
      this.fog.color = new THREE.Color('#7ec0ee');
      this.fog.density = 0.007;
      this.dirLight.color = new THREE.Color('#fff4e0');
      this.dirLight.intensity = 1.85;
      this.hemiLight.intensity = 0.95;
    }
  }

  // Visual Reactions apabila misi diselesaikan (Sparkles, Sapling Growth, Crystal River)
  public updateRestorationVisuals(
    trashId: string,
    isPlanted: boolean,
    spotId: string,
    isRiverCleaned: boolean,
    riverSpotId: string
  ) {
    // 1. Kutip Sampah: Ledakan Kilauan Emas (Sparkle Burst)
    if (trashId) {
      const mesh = this.trashMeshes.get(trashId);
      if (mesh) {
        this.spawnSparkleBurst(mesh.position.clone().add(new THREE.Vector3(0, 0.4, 0)));
        mesh.visible = false;
      }
    }

    // 2. Tanam Pokok: Tumbuh daripada Benih ke Pokok Mekar
    if (isPlanted && spotId) {
      const pMesh = this.plantMeshes.get(spotId);
      if (pMesh && !this.animatedSaplings.has(spotId)) {
        const saplingGroup = new THREE.Group();
        saplingGroup.position.set(0, 0.14, 0);
        saplingGroup.scale.set(0.1, 0.1, 0.1);

        // Batang pokok muda
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.18, 1.8),
          createTreeBarkPBRMaterial(this.isSoftwareGl)
        );
        trunk.position.y = 0.9;
        saplingGroup.add(trunk);

        // Kanopi muda
        const leaves = new THREE.Mesh(
          new THREE.ConeGeometry(0.9, 1.6, 7),
          new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.5 })
        );
        leaves.position.y = 1.9;
        saplingGroup.add(leaves);

        // Bunga mekar
        const flowerMat = new THREE.MeshStandardMaterial({ color: 0xff4081 });
        const flowers: THREE.Mesh[] = [];
        for (let fl = 0; fl < 4; fl++) {
          const f = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flowerMat);
          const angle = (fl / 4) * Math.PI * 2;
          f.position.set(Math.cos(angle) * 0.6, 1.8, Math.sin(angle) * 0.6);
          saplingGroup.add(f);
          flowers.push(f);
        }

        pMesh.add(saplingGroup);
        this.animatedSaplings.set(spotId, {
          group: saplingGroup,
          currentScale: 0.1,
          targetScale: 1.0,
          flowers,
        });

        this.spawnSparkleBurst(pMesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
      }
    }

    // 3. Bersihkan Sungai: Hapus Kekotoran & Cetuskan Ikan Melompat
    if (isRiverCleaned && riverSpotId) {
      const rMesh = this.riverSpotsMeshes.get(riverSpotId);
      if (rMesh) {
        this.spawnSparkleBurst(rMesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)));
        rMesh.visible = false;

        // Tambah ikan emas baharu yang aktif berenang
        const bonusFish = new THREE.Group();
        const fMesh = new THREE.Mesh(
          new THREE.ConeGeometry(0.14, 0.5, 6),
          new THREE.MeshStandardMaterial({ color: 0xffa726, metalness: 0.4 })
        );
        fMesh.rotation.x = Math.PI / 2;
        bonusFish.add(fMesh);
        bonusFish.position.copy(rMesh.position);
        this.fishMeshes.push(bonusFish);
        this.scene.add(bonusFish);
      }
    }
  }

  private spawnSparkleBurst(pos: THREE.Vector3) {
    const starGeo = new THREE.DodecahedronGeometry(0.1, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    for (let i = 0; i < 14; i++) {
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.0,
        Math.random() * 3.5 + 1.5,
        (Math.random() - 0.5) * 4.0
      );
      this.sparkles.push({
        mesh: star,
        velocity: vel,
        life: 0,
        maxLife: 0.85,
      });
      this.scene.add(star);
    }
  }

  public updateCollectibleVisual(id: string) {
    const mesh = this.collectibleMeshes.get(id);
    if (mesh) {
      this.spawnSparkleBurst(mesh.position.clone());
      mesh.scale.set(0.5, 0.5, 0.5);
    }
  }

  // ==========================================
  // PER-FRAME GAME LOOP
  // ==========================================

  private tick = () => {
    if (this.isDisposed) return;

    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (!this.isTitleMode) {
      this.updatePhysics(delta);
    }
    this.updateCamera(delta);
    this.updateAnimations(delta);
    this.updateVisualEffects(delta);
    this.checkInteractions();

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updatePhysics(delta: number) {
    const weatherMods = calculateWeatherMovementModifiers(this.currentWeather);

    // Arah pergerakan berasaskan orientasi kamera
    const moveX = this.moveInput.x;
    const moveZ = this.moveInput.z;
    const isMoving = Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05;

    let targetSpeed = 0;
    if (isMoving) {
      targetSpeed = (this.isRunning ? 8.5 : 4.5) * weatherMods.speedMultiplier;
    }

    // Tukar koordinat input mengikut arah sudut kamera (yaw)
    const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
    const moveDir = new THREE.Vector3()
      .addScaledVector(right, moveX)
      .addScaledVector(forward, -moveZ);

    if (moveDir.lengthSq() > 0.01) {
      moveDir.normalize();
      // Pusingkan badan watak ke arah bergerak
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.playerRotation = THREE.MathUtils.damp(this.playerRotation, targetAngle, 12, delta);
      this.playerGroup.rotation.y = this.playerRotation;
    }

    // Kelajuan Mendatar
    const friction = 12 * weatherMods.frictionMultiplier;
    this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, moveDir.x * targetSpeed, friction, delta);
    this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, moveDir.z * targetSpeed, friction, delta);

    // Graviti
    if (!this.isGrounded) {
      this.playerVelocity.y -= 19.6 * delta;
    }

    // Kemas kini kedudukan
    const nextX = this.playerPosition.x + this.playerVelocity.x * delta;
    const nextZ = this.playerPosition.z + this.playerVelocity.z * delta;

    // Halangan sempadan taman (Boundaries 75m)
    this.playerPosition.x = Math.max(-75, Math.min(75, nextX));
    this.playerPosition.z = Math.max(-75, Math.min(75, nextZ));

    const groundY = this.getTerrainHeight(this.playerPosition.x, this.playerPosition.z);

    this.playerPosition.y += this.playerVelocity.y * delta;
    if (this.playerPosition.y <= groundY) {
      this.playerPosition.y = groundY;
      this.playerVelocity.y = 0;
      this.isGrounded = true;
    }

    this.playerGroup.position.copy(this.playerPosition);

    // Animasi Langkah & Bunyi Pijakan Kaki
    if (isMoving && this.isGrounded) {
      this.walkTime += delta * (this.isRunning ? 14 : 8);
      const swing = Math.sin(this.walkTime);

      this.playerLegLeft.rotation.x = swing * 0.6;
      this.playerLegRight.rotation.x = -swing * 0.6;
      this.playerArmLeft.rotation.x = -swing * 0.6;
      this.playerArmRight.rotation.x = swing * 0.6;

      // Picu kesan bunyi tapak kaki mengikut permukaan
      this.stepAccumulator += delta * (this.isRunning ? 14 : 8);
      if (this.stepAccumulator > Math.PI) {
        this.stepAccumulator = 0;
        if (this.onStepSound) {
          let surf: 'grass' | 'stone' | 'wood' = 'grass';
          const distToBridge = Math.hypot(this.playerPosition.x - 5, this.playerPosition.z);
          const distToTower = Math.hypot(this.playerPosition.x - (-25), this.playerPosition.z - 52);

          if (distToBridge < 6.5 || distToTower < 3.5) {
            surf = 'wood';
          } else if (Math.abs(this.playerPosition.x) < 8.5 && Math.abs(this.playerPosition.z) < 8.5) {
            surf = 'stone';
          }
          this.onStepSound(surf);
        }
      }
    } else {
      // Idle pose
      this.playerLegLeft.rotation.x = THREE.MathUtils.damp(this.playerLegLeft.rotation.x, 0, 10, delta);
      this.playerLegRight.rotation.x = THREE.MathUtils.damp(this.playerLegRight.rotation.x, 0, 10, delta);
      this.playerArmLeft.rotation.x = THREE.MathUtils.damp(this.playerArmLeft.rotation.x, 0, 10, delta);
      this.playerArmRight.rotation.x = THREE.MathUtils.damp(this.playerArmRight.rotation.x, 0, 10, delta);
    }
  }

  private updateCamera(delta: number) {
    if (this.isTitleMode) {
      // Sinematik Panoramic Flyover di Skrin Utama
      const time = this.clock.getElapsedTime();
      const radius = 55;
      const angle = time * 0.12;

      const titleCamX = Math.cos(angle) * radius;
      const titleCamZ = Math.sin(angle) * radius;
      const titleCamY = 22 + Math.sin(time * 0.25) * 3;

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, titleCamX, 4, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, titleCamY, 4, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, titleCamZ, 4, delta);

      this.camera.lookAt(0, 2.5, 0);
      return;
    }

    // Kamera Third-Person Over-the-Shoulder Gaya Konsol
    const targetOffset = new THREE.Vector3(0, 1.6, 0);
    this.cameraTarget.copy(this.playerPosition).add(targetOffset);

    const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const verticalDist = this.cameraDistance * Math.sin(this.cameraPitch);

    const desiredCamPos = new THREE.Vector3(
      this.cameraTarget.x + horizontalDist * Math.sin(this.cameraYaw),
      this.cameraTarget.y + verticalDist,
      this.cameraTarget.z + horizontalDist * Math.cos(this.cameraYaw)
    );

    // Halang kamera terbenam dalam tanah
    const minCamY = this.getTerrainHeight(desiredCamPos.x, desiredCamPos.z) + 0.55;
    if (desiredCamPos.y < minCamY) {
      desiredCamPos.y = minCamY;
    }

    // Exponential Damping untuk Kamera Lembut
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, desiredCamPos.x, 14, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, desiredCamPos.y, 14, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, desiredCamPos.z, 14, delta);

    this.camera.lookAt(this.cameraTarget);
  }

  private updateAnimations(delta: number) {
    const time = this.clock.getElapsedTime();

    // Ombak Air Sungai
    if (this.waterMesh) {
      this.waterMesh.position.y = -0.4 + Math.sin(time * 2) * 0.03;
    }

    // Air Terjun Bergelora & Kabus Semburan
    if (this.waterfallCascadeMesh) {
      this.waterfallCascadeMesh.position.y = 1.8 + Math.sin(time * 4) * 0.04;
    }
    if (this.waterfallMistParticles) {
      const pos = this.waterfallMistParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let py = pos.getY(i) + delta * 1.5;
        if (py > 3.0) py = 0;
        pos.setY(i, py);
      }
      pos.needsUpdate = true;
    }

    // Kupu-kupu mengepakkan sayap
    this.butterflies.forEach((b, i) => {
      const flap = Math.sin(time * 18 + i) * 0.6;
      b.children[0].rotation.y = flap;
      b.children[1].rotation.y = -flap;
      b.position.y += Math.sin(time * 3 + i) * 0.01;
    });

    // Ikan melompat & berenang
    this.fishMeshes.forEach((f, i) => {
      f.position.y = -0.45 + Math.max(0, Math.sin(time * 2.5 + i * 2) * 0.6);
      f.rotation.z = Math.sin(time * 6 + i) * 0.2;
    });

    // Relik Emas Berputar & Terapung
    this.collectibleMeshes.forEach((mesh) => {
      mesh.rotation.y += delta * 1.5;
      mesh.position.y += Math.sin(time * 3) * 0.002;
    });

    // Zarah Hujan Bergerak ke Bawah
    if (this.rainParticles.visible) {
      const pos = this.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let py = pos.getY(i) - delta * 35;
        if (py < 0) py = 35;
        pos.setY(i, py);
      }
      pos.needsUpdate = true;
    }

    // Zarah Daun Ditiup Angin
    if (this.leafParticles.visible) {
      const pos = this.leafParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let px = pos.getX(i) + delta * 8;
        let py = pos.getY(i) - delta * 2;
        if (px > 50) px = -50;
        if (py < 0.5) py = 12;
        pos.setX(i, px);
        pos.setY(i, py);
      }
      pos.needsUpdate = true;
    }
  }

  private updateVisualEffects(delta: number) {
    // 1. Kemas kini Zarah Kilauan (Sparkles)
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sp = this.sparkles[i];
      sp.life += delta;
      sp.mesh.position.addScaledVector(sp.velocity, delta);
      sp.velocity.y -= 4.9 * delta; // Graviti kilauan
      sp.mesh.rotation.x += delta * 5;
      sp.mesh.rotation.y += delta * 5;

      const progress = sp.life / sp.maxLife;
      const scale = (1 - progress) * 1.2;
      sp.mesh.scale.set(scale, scale, scale);

      if (sp.life >= sp.maxLife) {
        this.scene.remove(sp.mesh);
        this.sparkles.splice(i, 1);
      }
    }

    // 2. Kemas kini Pertumbuhan Pokok (Growing Saplings Animation)
    this.animatedSaplings.forEach((sapling) => {
      if (sapling.currentScale < sapling.targetScale) {
        sapling.currentScale = THREE.MathUtils.damp(
          sapling.currentScale,
          sapling.targetScale,
          4,
          delta
        );
        sapling.group.scale.set(
          sapling.currentScale,
          sapling.currentScale,
          sapling.currentScale
        );
      }
    });
  }

  /**
   * Pemeriksaan Jarak Sasaran Interaksi Terdekat [E]
   */
  private checkInteractions() {
    if (this.isTitleMode) return;

    let closestTarget: InteractionTarget | null = null;
    let minDistance = 3.8; // Radius interaksi 3.8 meter

    const pPos = this.playerPosition;

    // 1. NPC
    for (const npc of NPCS) {
      const dist = Math.hypot(pPos.x - npc.coordinates.x, pPos.z - npc.coordinates.z);
      if (dist < minDistance) {
        minDistance = dist;
        closestTarget = {
          type: 'npc',
          id: npc.id,
          name: npc.name,
          prompt: `Bercakap dengan ${npc.name}`,
          distance: dist,
          position: new THREE.Vector3(npc.coordinates.x, 0, npc.coordinates.z),
        };
      }
    }

    // 2. Papan Maklumat
    for (const b of READING_BOARDS) {
      const dist = Math.hypot(pPos.x - b.coordinates.x, pPos.z - b.coordinates.z);
      if (dist < minDistance) {
        minDistance = dist;
        closestTarget = {
          type: 'board',
          id: b.id,
          name: b.title,
          prompt: `Baca ${b.title}`,
          distance: dist,
          position: new THREE.Vector3(b.coordinates.x, 0, b.coordinates.z),
        };
      }
    }

    // 3. Sampah Kutipan
    for (const t of INITIAL_TRASH_ITEMS) {
      if (t.collected) continue;
      const dist = Math.hypot(pPos.x - t.coordinates.x, pPos.z - t.coordinates.z);
      if (dist < minDistance) {
        minDistance = dist;
        closestTarget = {
          type: 'trash',
          id: t.id,
          name: t.name,
          prompt: `Kutip ${t.name}`,
          distance: dist,
          position: new THREE.Vector3(t.coordinates.x, 0, t.coordinates.z),
        };
      }
    }

    // 4. Tapak Semaian Anak Pokok
    for (const s of INITIAL_PLANTING_SPOTS) {
      if (s.planted) continue;
      const dist = Math.hypot(pPos.x - s.coordinates.x, pPos.z - s.coordinates.z);
      if (dist < minDistance) {
        minDistance = dist;
        closestTarget = {
          type: 'planting',
          id: s.id,
          name: s.name,
          prompt: `Tanam Anak Pokok di ${s.name}`,
          distance: dist,
          position: new THREE.Vector3(s.coordinates.x, 0, s.coordinates.z),
        };
      }
    }

    // 5. Relik Flora & Fauna
    for (const c of FLORA_FAUNA_COLLECTIBLES) {
      if (c.found) continue;
      const dist = Math.hypot(pPos.x - c.coordinates.x, pPos.z - c.coordinates.z);
      if (dist < minDistance) {
        minDistance = dist;
        closestTarget = {
          type: 'collectible',
          id: c.id,
          name: c.name,
          prompt: `Periksa Khazanah ${c.name}`,
          distance: dist,
          position: new THREE.Vector3(c.coordinates.x, 0, c.coordinates.z),
        };
      }
    }

    // 6. Kiosk Mini-Game Stesen Kitar Semula (40, -27)
    const distToBins = Math.hypot(pPos.x - 40, pPos.z - (-27));
    if (distToBins < 3.2 && distToBins < minDistance) {
      closestTarget = {
        type: 'mini_game_sorting',
        id: 'sorting_station',
        name: 'Stesen Kitar Semula Pantas',
        prompt: 'Mula Cabaran Asingkan Sisa Kitar Semula',
        distance: distToBins,
        position: new THREE.Vector3(40, 0, -27),
      };
    }

    // 7. Pokok Kicauan Burung Mini-Game (-45, 25)
    const distToBirdTree = Math.hypot(pPos.x - (-45), pPos.z - 25);
    if (distToBirdTree < 3.5 && distToBirdTree < minDistance) {
      closestTarget = {
        type: 'mini_game_bird',
        id: 'bird_tree',
        name: 'Pohon Kicauan Burung Rimba',
        prompt: 'Main Cabaran Teka Suara Rimba',
        distance: distToBirdTree,
        position: new THREE.Vector3(-45, 0, 25),
      };
    }

    if (
      this.activeTarget?.id !== closestTarget?.id ||
      this.activeTarget?.type !== closestTarget?.type
    ) {
      this.activeTarget = closestTarget;
      if (this.onInteractionChange) {
        this.onInteractionChange(closestTarget);
      }
    }
  }

  private onWindowResize = () => {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onWindowResize);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
