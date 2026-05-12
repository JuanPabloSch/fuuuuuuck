import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room8Scene extends BaseRoomScene {

    constructor() {
        super("Room8Scene");
    }

    preload() {
        this.load.image("background_r8", "src/background/bg_r8.png");
        super.preload();
        this.load.spritesheet("zombie_crawler", "src/assets/sucker.png", { 
            frameWidth: 199, 
            frameHeight: 282 
        });
    }

    create(data = {}) {
        super.create(data);
        this.updateMusic("song2");
        this.add.image(400, 300, "background_r8").setDisplaySize(800, 600);

        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // --- PUERTAS ---

        // 🚪 IZQUIERDA: Volver a r7 (Desbloqueada)
        this.doorLeft = this.add.rectangle(20, 300, 10, 100, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorLeft, true);
        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.scene.start("Room7Scene", { spawnX: 720, spawnY: 300 });
        });

        // 🚪 ARRIBA: Ir a by1 (BLOQUEADA - Requiere backyard_key)
        this.doorUp = this.add.rectangle(400, 20, 100, 10, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;

            if (PlayerState.inventory.includes("backyard_key")) {
                this.canChangeRoom = false;
                this.saveState();
                this.scene.start("By1Scene", { spawnX: 400, spawnY: 480 });
            } else {
                this.mostrarCartel("La puerta hacia el patio está cerrada");
                // Pequeño rebote para que no se quede pegado a la puerta
                this.player.sprite.y += 10; 
            }
        });

        // 🚪 DERECHA: Ir a r9 (Abierta)
        this.doorRight = this.add.rectangle(780, 380, 10, 100, 0xff00ff, 0.5);
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.scene.start("Room9Scene", { spawnX: 80, spawnY: 180 });
        });

        this.setupWalls();

        // --- 🔧 GENERAR TEXTURA PARA LAS PARTÍCULAS (Poné esto al principio del create) ---
    if (!this.textures.exists('particle_dot')) {
        const dot = this.make.graphics({ x: 0, y: 0, add: false });
        dot.fillStyle(0xffffff);
        dot.fillCircle(4, 4, 4);
        dot.generateTexture('particle_dot', 8, 8);
    }

    // --- 🚨 EFECTO DE ALARMA ROJA ---
    this.alarmOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0);
    this.alarmOverlay.setDepth(5000).setScrollFactor(0); // Más profundidad para que tape todo

    this.tweens.add({
        targets: this.alarmOverlay,
        alpha: 0.25, // Un poco menos para que no moleste al jugar
        duration: 1000,
        yoyo: true,
        loop: -1
    });

    // --- ✨ PARTÍCULAS DE HUMO/GAS (Corregidas) ---
    this.add.particles(0, 0, 'particle_dot', { // Usamos la textura que generamos arriba
        x: { min: 0, max: 800 },
        y: { min: 0, max: 600 },
        quantity: 1,
        lifespan: 3000,
        speed: { min: 10, max: 40 },
        scale: { start: 1, end: 0 }, // Un poco más grandes para que parezca humo
        alpha: { start: 0.3, end: 0 },
        blendMode: 'ADD',
        frequency: 150
    }).setDepth(1500);

        // 🧟 SPAWNER (Incluye a los 4 tipos)
        this.time.addEvent({
            delay: 2500,
            loop: true,
            callback: () => {
                if (this.zombies.children.entries.length < 6) {
                    this.spawnZombie();
                }
            }
        });
    }
    

    setupWalls() {
        // Inferior
        this.createWall(400, 560, 800, 80);
        // Superior (Hueco en x:400)
        this.createWall(160, 40, 320, 80); 
        this.createWall(640, 40, 320, 80); 
        // Izquierda (Hueco en y:300)
        this.createWall(40, 110, 80, 220); 
        this.createWall(40, 490, 80, 220); 
        // Derecha (Hueco ajustado para puerta en y:350)
        this.createWall(760, 220, 80, 160); 
        this.createWall(760, 520, 80, 120);
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650);
        const y = Phaser.Math.Between(150, 450);
        // Ahora el spawner elige entre los 4 tipos disponibles
        const type = Phaser.Math.RND.pick(["normal", "fast", "tank", "crawler"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
        zombie.sprite.setDepth(100);
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
