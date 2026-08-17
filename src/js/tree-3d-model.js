/**
 * Christmas Tree Joe — Master WebGL 3D Specimen Lab & Interactive Holiday Game Engine
 * Features: Procedural Fraser Fir, Twinkling Stars, Glowing Moon, Flying Santa Sleigh,
 * Distant Alpine Village with Smoke Particles, and Dynamic Environment Switcher.
 */

class InteractiveTreeLab {
    constructor(containerId = 'tree-canvas-container') {
        this.container = document.getElementById(containerId) || 
                         document.getElementById('webgl-canvas-container') || 
                         document.getElementById('webgl-container') || 
                         document.querySelector('.webgl-stage');

        if (!this.container) {
            console.warn(`[WebGL Lab] Target container #${containerId} not found in DOM.`);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        this.resizeObserver = null;

        // 3D Assembly Groups
        this.treeGroup = new THREE.Group();
        this.decorationsGroup = new THREE.Group();
        this.nightEnvGroup = new THREE.Group();
        this.livingRoomGroup = new THREE.Group();
        this.sleighGroup = new THREE.Group();
        this.smokeEmitters = [];
        this.snowSystem = null;
        this.fireLight = null;

        // Interactive States
        this.currentSpecies = 'fraser'; // 'fraser', 'douglas', 'noble'
        this.currentBackdrop = 'night';  // 'night', 'livingroom', 'studio'
        this.decorations = {
            redBaubles: false,
            goldBaubles: false,
            fairyLights: false,
            starCrown: false
        };
        this.snowEnabled = true;
        this.rewardClaimed = false;
        this.santaFlybyActive = false;

        this.init();
    }

    init() {
        const width = this.container.clientWidth || 850;
        const height = this.container.clientHeight || 520;

        // 1. Scene & Camera Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x051810);
        this.scene.fog = new THREE.FogExp2(0x051810, 0.015);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 4, 13.5);

        // 2. WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true, 
            powerPreference: 'high-performance' 
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // 3. OrbitControls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
            this.controls.minDistance = 4;
            this.controls.maxDistance = 24;
            this.controls.target.set(0, 3, 0);
        }

        // 4. Lighting & Environments
        this.setupLighting();
        this.buildNightSkyAndVillage();
        this.buildLivingRoomEnvironment();
        this.buildFlyingSantaSleigh();
        this.buildFallingSnow();

        // 5. Tree Hierarchy
        this.treeGroup.add(this.decorationsGroup);
        this.scene.add(this.treeGroup);
        this.scene.add(this.nightEnvGroup);
        this.scene.add(this.livingRoomGroup);
        this.livingRoomGroup.visible = false;

        this.buildTree(this.currentSpecies);

        // 6. Responsive Handling & Animation
        this.setupResizeListeners();
        this.animate();
    }

    setupResizeListeners() {
        window.addEventListener('resize', () => this.onResize());
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => this.onResize());
            this.resizeObserver.observe(this.container);
        }
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(this.ambientLight);

        this.moonSunLight = new THREE.DirectionalLight(0xd4af37, 1.2);
        this.moonSunLight.position.set(10, 20, 10);
        this.moonSunLight.castShadow = true;
        this.moonSunLight.shadow.mapSize.width = 1024;
        this.moonSunLight.shadow.mapSize.height = 1024;
        this.scene.add(this.moonSunLight);

        this.warmGlowLight = new THREE.PointLight(0xffaa00, 1.4, 12);
        this.warmGlowLight.position.set(0, 3.2, 2.5);
        this.scene.add(this.warmGlowLight);
    }

    disposeGroup(group) {
        while (group.children.length > 0) {
            const obj = group.children[0];
            group.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }
    }

    buildTree(speciesKey = 'fraser') {
        this.disposeGroup(this.treeGroup);
        this.treeGroup.add(this.decorationsGroup);

        let foliageColor = 0x0B3B24; // Fraser Fir
        let tierScale = [2.4, 2.0, 1.5, 0.9];

        if (speciesKey === 'douglas') {
            foliageColor = 0x14532d; // Douglas Fir
            tierScale = [2.7, 2.2, 1.7, 1.1];
        } else if (speciesKey === 'noble') {
            foliageColor = 0x064e3b; // Noble Fir
            tierScale = [2.3, 1.8, 1.4, 0.8];
        }

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2, 16);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1;
        trunk.castShadow = true;
        this.treeGroup.add(trunk);

        // Tiered Foliage Cones
        const foliageMat = new THREE.MeshStandardMaterial({
            color: foliageColor,
            roughness: 0.7,
            flatShading: true
        });

        const tiers = [
            { radius: tierScale[0], height: 2.2, y: 2.5 },
            { radius: tierScale[1], height: 2.0, y: 3.8 },
            { radius: tierScale[2], height: 1.8, y: 4.9 },
            { radius: tierScale[3], height: 1.4, y: 5.9 }
        ];

        tiers.forEach(t => {
            const coneGeo = new THREE.ConeGeometry(t.radius, t.height, 14);
            const cone = new THREE.Mesh(coneGeo, foliageMat);
            cone.position.y = t.y;
            cone.castShadow = true;
            this.treeGroup.add(cone);
        });

        this.renderDecorations();
    }

    renderDecorations() {
        this.disposeGroup(this.decorationsGroup);

        // 1. Red Baubles
        if (this.decorations.redBaubles) {
            const redMat = new THREE.MeshStandardMaterial({ color: 0xC41E3A, metalness: 0.85, roughness: 0.15 });
            const baubleGeo = new THREE.SphereGeometry(0.12, 16, 16);
            const coords = [
                [0.9, 2.3, 0.9], [-0.9, 2.5, 0.8], [0, 2.2, 1.3],
                [0.7, 3.6, 0.7], [-0.7, 3.8, 0.6], [0, 4.8, 0.8]
            ];
            coords.forEach(([x, y, z]) => {
                const b = new THREE.Mesh(baubleGeo, redMat);
                b.position.set(x, y, z);
                this.decorationsGroup.add(b);
            });
        }

        // 2. Gold Baubles
        if (this.decorations.goldBaubles) {
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.9, roughness: 0.1 });
            const baubleGeo = new THREE.SphereGeometry(0.12, 16, 16);
            const coords = [
                [-1.1, 2.2, 0.3], [1.1, 2.4, -0.4], [0.6, 3.7, -0.6],
                [-0.5, 3.9, 0.8], [0.4, 4.9, 0.4], [-0.4, 4.8, -0.5]
            ];
            coords.forEach(([x, y, z]) => {
                const b = new THREE.Mesh(baubleGeo, goldMat);
                b.position.set(x, y, z);
                this.decorationsGroup.add(b);
            });
        }

        // 3. Fairy Lights Spiral
        if (this.decorations.fairyLights) {
            const lightGeo = new THREE.SphereGeometry(0.06, 8, 8);
            const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff0b9 });
            for (let i = 0; i < 28; i++) {
                const angle = i * 0.7;
                const radius = 2.1 - (i * 0.065);
                const y = 2.2 + (i * 0.14);
                const light = new THREE.Mesh(lightGeo, lightMat);
                light.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
                this.decorationsGroup.add(light);
            }
        }

        // 4. Golden Star Crown Topper
        if (this.decorations.starCrown) {
            const starGeo = new THREE.OctahedronGeometry(0.38, 0);
            const starMat = new THREE.MeshStandardMaterial({
                color: 0xD4AF37,
                emissive: 0xD4AF37,
                emissiveIntensity: 0.8,
                roughness: 0.1
            });
            const star = new THREE.Mesh(starGeo, starMat);
            star.position.y = 6.8;
            this.decorationsGroup.add(star);
        }
    }

    buildNightSkyAndVillage() {
        this.disposeGroup(this.nightEnvGroup);
        this.smokeEmitters = [];

        // Starfield Particles
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1500;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i += 3) {
            starPos[i] = (Math.random() - 0.5) * 200;
            starPos[i + 1] = Math.random() * 80 + 10;
            starPos[i + 2] = (Math.random() - 0.5) * 200;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.85 });
        this.nightEnvGroup.add(new THREE.Points(starGeo, starMat));

        // Moon
        const moonGeo = new THREE.SphereGeometry(3, 32, 32);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(-35, 45, -60);
        this.nightEnvGroup.add(moon);

        // Ground Plane
        const groundGeo = new THREE.PlaneGeometry(120, 120);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.nightEnvGroup.add(ground);

        // Village Houses
        const houseConfigs = [
            { x: -18, z: -25, r: 0.2 },
            { x: 22, z: -30, r: -0.4 },
            { x: -5, z: -40, r: 0.1 }
        ];

        houseConfigs.forEach(cfg => {
            const house = new THREE.Group();
            
            const base = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), new THREE.MeshStandardMaterial({ color: 0x332211 }));
            base.position.y = 1.5;
            house.add(base);

            const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2, 4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
            roof.position.y = 4;
            roof.rotation.y = Math.PI / 4;
            house.add(roof);

            const chim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2, 0.6), new THREE.MeshStandardMaterial({ color: 0x552211 }));
            chim.position.set(1.2, 4.2, 0.8);
            house.add(chim);

            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ color: 0xffb703 }));
            win.position.set(0, 1.5, 2.01);
            house.add(win);

            house.position.set(cfg.x, 0, cfg.z);
            house.rotation.y = cfg.r;
            this.nightEnvGroup.add(house);

            // Chimney Smoke
            const smokeGeo = new THREE.SphereGeometry(0.2, 6, 6);
            const smokeMat = new THREE.MeshBasicMaterial({ color: 0xd1d5db, transparent: true, opacity: 0.4 });
            const emitterPuffs = [];

            for (let p = 0; p < 6; p++) {
                const puff = new THREE.Mesh(smokeGeo, smokeMat.clone());
                puff.position.set(cfg.x + 1.2, 5.2 + (p * 0.4), cfg.z + 0.8);
                puff.userData = { initialY: 5.2, offset: p * 0.4 };
                this.nightEnvGroup.add(puff);
                emitterPuffs.push(puff);
            }
            this.smokeEmitters.push(emitterPuffs);
        });
    }

    buildFlyingSantaSleigh() {
        this.disposeGroup(this.sleighGroup);

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1), new THREE.MeshStandardMaterial({ color: 0xC41E3A }));
        body.position.y = 0.5;
        this.sleighGroup.add(body);

        for (let i = 1; i <= 2; i++) {
            const deer = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.4), new THREE.MeshStandardMaterial({ color: 0x8b5a2b }));
            deer.position.set(i * 1.6, 0.4, 0);
            this.sleighGroup.add(deer);
        }

        const noseLight = new THREE.PointLight(0xff0000, 2, 5);
        noseLight.position.set(3.4, 0.5, 0);
        this.sleighGroup.add(noseLight);

        this.sleighGroup.position.set(-60, 28, -35);
        this.sleighGroup.visible = false; // Hidden until game completion
        this.nightEnvGroup.add(this.sleighGroup);
    }

    buildLivingRoomEnvironment() {
        this.disposeGroup(this.livingRoomGroup);

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.4 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.livingRoomGroup.add(floor);

        const rug = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshStandardMaterial({ color: 0xC41E3A, roughness: 0.8 }));
        rug.rotation.x = -Math.PI / 2;
        rug.position.y = 0.02;
        this.livingRoomGroup.add(rug);

        this.fireLight = new THREE.PointLight(0xff6600, 2.5, 12);
        this.fireLight.position.set(-4, 2, -4);
        this.livingRoomGroup.add(this.fireLight);
    }

    buildFallingSnow() {
        if (this.snowSystem) {
            this.scene.remove(this.snowSystem);
            this.snowSystem.geometry.dispose();
            this.snowSystem.material.dispose();
        }

        const snowCount = 600;
        const snowGeo = new THREE.BufferGeometry();
        const snowPos = new Float32Array(snowCount * 3);

        for (let i = 0; i < snowCount * 3; i += 3) {
            snowPos[i] = (Math.random() - 0.5) * 40;
            snowPos[i + 1] = Math.random() * 20;
            snowPos[i + 2] = (Math.random() - 0.5) * 40;
        }

        snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
        const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.9 });
        this.snowSystem = new THREE.Points(snowGeo, snowMat);
        this.scene.add(this.snowSystem);
    }

    setSpecies(speciesKey) {
        this.currentSpecies = speciesKey;
        this.buildTree(speciesKey);
    }

    toggleDecoration(type) {
        if (Object.prototype.hasOwnProperty.call(this.decorations, type)) {
            this.decorations[type] = !this.decorations[type];
            this.renderDecorations();
            this.checkGameReward();
        }
    }

    toggleSnow() {
        this.snowEnabled = !this.snowEnabled;
        if (this.snowSystem) this.snowSystem.visible = this.snowEnabled;
    }

    toggleGlow() {
        if (this.warmGlowLight) {
            this.warmGlowLight.intensity = this.warmGlowLight.intensity > 0 ? 0 : 1.8;
        }
    }

    setBackdrop(backdropKey) {
        this.currentBackdrop = backdropKey;
        if (backdropKey === 'night') {
            this.scene.background = new THREE.Color(0x051810);
            this.scene.fog = new THREE.FogExp2(0x051810, 0.015);
            this.nightEnvGroup.visible = true;
            this.livingRoomGroup.visible = false;
            if (this.snowSystem) this.snowSystem.visible = this.snowEnabled;
        } else if (backdropKey === 'livingroom') {
            this.scene.background = new THREE.Color(0x1a120b);
            this.scene.fog = new THREE.FogExp2(0x1a120b, 0.02);
            this.nightEnvGroup.visible = false;
            this.livingRoomGroup.visible = true;
            if (this.snowSystem) this.snowSystem.visible = false;
        } else if (backdropKey === 'studio' || backdropKey === 'ar') {
            this.scene.background = null;
            this.scene.fog = null;
            this.nightEnvGroup.visible = false;
            this.livingRoomGroup.visible = false;
            if (this.snowSystem) this.snowSystem.visible = false;
        }
    }

    checkGameReward() {
        const allUnlocked = Object.values(this.decorations).every(v => v === true);
        if (allUnlocked && !this.rewardClaimed) {
            this.rewardClaimed = true;
            this.santaFlybyActive = true; // Trigger Santa Sleigh Flyby Celebration!
            
            const rewardEvent = new CustomEvent('treeDecorated', {
                detail: { promoCode: 'XMASJOE10', discountAmount: 10 }
            });
            window.dispatchEvent(rewardEvent);

            console.log('[Tree Lab] Game Complete! Santa Flyby Triggered & Reward Unlocked: XMASJOE10');
        }
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w === 0 || h === 0) return;
        
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Specimen Slow Auto-Rotation
        if (this.treeGroup) this.treeGroup.rotation.y += 0.003;

        // 2. Santa Sleigh Celebration Flyby (Triggers on 4/4 Game Completion)
        if (this.santaFlybyActive && this.sleighGroup) {
            this.sleighGroup.visible = true;
            this.sleighGroup.position.x += 16 * delta;
            this.sleighGroup.position.y += Math.sin(time * 4) * 0.05;
            if (this.sleighGroup.position.x > 60) {
                this.sleighGroup.position.x = -60; // Loop across sky
            }
        }

        // 3. Fireplace Light Flicker
        if (this.fireLight && this.livingRoomGroup.visible) {
            this.fireLight.intensity = 2.3 + Math.sin(time * 8) * 0.3 + (Math.random() - 0.5) * 0.1;
        }

        // 4. Chimney Smoke Particles
        if (this.smokeEmitters && this.nightEnvGroup.visible) {
            this.smokeEmitters.forEach(puffs => {
                puffs.forEach(puff => {
                    puff.position.y += 0.8 * delta;
                    puff.position.x += Math.sin(time + puff.position.y) * 0.005;
                    puff.scale.addScalar(0.15 * delta);
                    if (puff.position.y > 8.0) {
                        puff.position.y = puff.userData.initialY;
                        puff.scale.set(1, 1, 1);
                    }
                });
            });
        }

        // 5. Falling Snow System
        if (this.snowSystem && this.snowEnabled && this.snowSystem.visible) {
            const pos = this.snowSystem.geometry.attributes.position.array;
            for (let i = 1; i < pos.length; i += 3) {
                pos[i] -= 3.2 * delta;
                if (pos[i] < 0) pos[i] = 20;
            }
            this.snowSystem.geometry.attributes.position.needsUpdate = true;
        }

        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Global Exports
window.InteractiveTreeLab = InteractiveTreeLab;
window.TreeSpecimenLab = InteractiveTreeLab;

window.initInteractiveTreeLab = function(containerId) {
    window.treeLabInstance = new InteractiveTreeLab(containerId);
};

window.initTreeLab = function(containerId) {
    window.treeLabInstance = new InteractiveTreeLab(containerId);
};