import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class In2Scene extends BaseRoomScene {
    constructor() {
        super("In2Scene");
    }

    preload() {
        this.load.image("background_in2", "src/background/bg_in2.png");
        super.preload();
    }

    create(data = {}) {
        super.create(data);
        this.updateMusic("song1");
        // 1. FONDO
        this.add.image(400, 300, "background_in2").setDisplaySize(800, 600);
        
        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 450;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
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


        // --- SEGURO DE ENTRADA ---
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES GRUESAS ---
        this.createWall(40, 300, 80, 600);  // Izquierda
        this.createWall(760, 300, 80, 600); // Derecha
        this.createWall(160, 40, 320, 80);  this.createWall(640, 40, 320, 80); // Arriba
        this.createWall(160, 560, 320, 80); this.createWall(640, 560, 320, 80); // Abajo

        // --- PUERTAS ---
        this.doorDown = this.add.rectangle(400, 580, 80, 10, 0xffa500, 0);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("In1Scene", { spawnX: 400, spawnY: 150 });
        });

        this.doorUp = this.add.rectangle(400, 20, 80, 10, 0xff0000, 0);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("RtopScene", { spawnX: 400, spawnY: 480 });
        });

        // 🧟 SPAWNER (Tanques y Rápidos solamente)
        this.time.addEvent({
            delay: 2000, 
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650);
        const y = Phaser.Math.Between(100, 500);
        // Quitamos los normales, ahora es un pasillo de élite
        const type = Phaser.Math.RND.pick(["fast", "tank", "fast"]); 
        const z = new Zombie(this, x, y, type);
        this.zombies.add(z.sprite);
        z.sprite.ref = z;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
