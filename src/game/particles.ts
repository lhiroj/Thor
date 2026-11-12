/**
 * THOR: GOD OF THUNDER - Particle System & Visual Effects
 * Zero-GC high-performance procedural lightning bolts, electric sparks, and floating damage numbers.
 */
import * as THREE from 'three';

export interface FloatingText {
  id: number;
  text: string;
  isCrit: boolean;
  position: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class ParticleManager {
  private scene: THREE.Scene;
  private sparkPoints: THREE.Points;
  private sparkPositions: Float32Array;
  private sparkVelocities: Float32Array;
  private sparkLifetimes: Float32Array;
  private maxSparks: number = 300;
  private sparkIndex: number = 0;

  // Reusable Lightning Line
  private lightningLines: THREE.LineSegments[] = [];
  private activeLightning: { line: THREE.LineSegments; timer: number }[] = [];

  // Floating Combat Damage Text Array (read by HUD)
  public floatingTexts: FloatingText[] = [];
  private textCounter: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Instanced/Pooled Sparks Buffer
    const sparkGeo = new THREE.BufferGeometry();
    this.sparkPositions = new Float32Array(this.maxSparks * 3);
    this.sparkVelocities = new Float32Array(this.maxSparks * 3);
    this.sparkLifetimes = new Float32Array(this.maxSparks);

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.35,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    this.scene.add(this.sparkPoints);

    // 2. Pre-allocate 6 reusable Lightning Bolt LineSegments
    for (let i = 0; i < 6; i++) {
      const lineGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(64 * 3);
      lineGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: 0x80d8ff,
        linewidth: 3,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.LineSegments(lineGeo, lineMat);
      line.visible = false;
      this.scene.add(line);
      this.lightningLines.push(line);
    }
  }

  /**
   * Spawns a burst of electric sparks at pos
   */
  public spawnSparkBurst(pos: THREE.Vector3, count: number = 20, speed: number = 6) {
    for (let i = 0; i < count; i++) {
      const idx = this.sparkIndex;
      this.sparkPositions[idx * 3] = pos.x;
      this.sparkPositions[idx * 3 + 1] = pos.y;
      this.sparkPositions[idx * 3 + 2] = pos.z;

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const v = (0.4 + Math.random() * 0.6) * speed;

      this.sparkVelocities[idx * 3] = Math.sin(phi) * Math.cos(theta) * v;
      this.sparkVelocities[idx * 3 + 1] = Math.cos(phi) * v + 1.5; // slight upward drift
      this.sparkVelocities[idx * 3 + 2] = Math.sin(phi) * Math.sin(theta) * v;

      this.sparkLifetimes[idx] = 0.4 + Math.random() * 0.4;
      this.sparkIndex = (this.sparkIndex + 1) % this.maxSparks;
    }
  }

  /**
   * Strikes a jagged procedural 3D lightning bolt between start and end
   */
  public spawnLightningStrike(start: THREE.Vector3, end: THREE.Vector3, duration: number = 0.25) {
    const freeLine = this.lightningLines.find((l) => !l.visible);
    if (!freeLine) return;

    const positions = (freeLine.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const segments = 16;
    let current = start.clone();
    let posIdx = 0;

    for (let i = 1; i <= segments; i++) {
      const alpha = i / segments;
      const target = new THREE.Vector3().lerpVectors(start, end, alpha);

      // Add jagged chaotic fractal noise (decreases near endpoint)
      if (i < segments) {
        const jitter = (1.0 - alpha) * 2.5;
        target.x += (Math.random() - 0.5) * jitter;
        target.y += (Math.random() - 0.5) * jitter * 0.5;
        target.z += (Math.random() - 0.5) * jitter;
      }

      // Segment start
      positions[posIdx++] = current.x;
      positions[posIdx++] = current.y;
      positions[posIdx++] = current.z;

      // Segment end
      positions[posIdx++] = target.x;
      positions[posIdx++] = target.y;
      positions[posIdx++] = target.z;

      current.copy(target);
    }

    freeLine.geometry.attributes.position.needsUpdate = true;
    freeLine.visible = true;
    this.activeLightning.push({ line: freeLine, timer: duration });
  }

  /**
   * Spawns a floating 3D combat damage number
   */
  public spawnFloatingDamage(pos: THREE.Vector3, amount: number, isCrit: boolean = false) {
    const text = isCrit ? `CRIT! -${amount}` : `-${amount}`;
    this.floatingTexts.push({
      id: ++this.textCounter,
      text,
      isCrit,
      position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 1.8, (Math.random() - 0.5) * 0.6)),
      life: 0.85,
      maxLife: 0.85,
    });
  }

  /**
   * Updates all active particles & lightning every frame
   */
  public update(dt: number) {
    // 1. Update Sparks
    const posAttr = this.sparkPoints.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < this.maxSparks; i++) {
      if (this.sparkLifetimes[i] > 0) {
        this.sparkLifetimes[i] -= dt;

        this.sparkPositions[i * 3] += this.sparkVelocities[i * 3] * dt;
        this.sparkPositions[i * 3 + 1] += this.sparkVelocities[i * 3 + 1] * dt;
        this.sparkPositions[i * 3 + 2] += this.sparkVelocities[i * 3 + 2] * dt;

        // Gravity
        this.sparkVelocities[i * 3 + 1] -= 9.8 * dt;

        if (this.sparkLifetimes[i] <= 0) {
          // Hide particle
          this.sparkPositions[i * 3 + 1] = -9999;
        }
      }
    }
    posAttr.needsUpdate = true;

    // 2. Update Lightning lines
    for (let i = this.activeLightning.length - 1; i >= 0; i--) {
      const item = this.activeLightning[i];
      item.timer -= dt;
      if (item.timer <= 0) {
        item.line.visible = false;
        this.activeLightning.splice(i, 1);
      }
    }

    // 3. Update Floating Damage Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.position.y += 1.2 * dt; // Float upwards
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public dispose() {
    this.sparkPoints.geometry.dispose();
    (this.sparkPoints.material as THREE.Material).dispose();
    this.lightningLines.forEach((l) => {
      l.geometry.dispose();
      (l.material as THREE.Material).dispose();
    });
  }
}
