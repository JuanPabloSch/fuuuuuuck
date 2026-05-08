import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class In2Scene extends BaseRoomScene {
    constructor() {
        super("In2Scene");
    }

    preload() {
        this.load.image("background_in2", "src/background/bg_in2.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_in2").setDisplaySize(800, 600);
        
        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 450;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        // --- 🚨 EFECTO DE ALARMA ROJA ---
        // Creamos un rectángulo rojo que ocupa toda la pantalla con poca opacidad
        this.alarmOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0);
        this.alarmOverlay.setDepth(2000).setScrollFactor(0);

        // Animación de parpadeo infinito
        this.tweens.add({
            targets: this.alarmOverlay,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            loop: -1
        });

        // --- ✨ PARTÍCULAS DE HUMO/GAS ---
        this.add.particles(0, 0, 'bullet', {
            x: { min: 0, max: 800 },
            y: { min: 0, max: 600 },
            quantity: 2,
            lifespan: 3000,
            speed: { min: 20, max: 50 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.2, end: 0 },
            blendMode: 'ADD'
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
        this.doorDown = this.add.rectangle(400, 580, 80, 10, 0xffa500, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("In1Scene", { spawnX: 400, spawnY: 150 });
        });

        this.doorUp = this.add.rectangle(400, 20, 80, 10, 0xff0000, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("RtopScene", { spawnX: 400, spawnY: 480 });
        });

        // 🧟 SPAWNER (Tanques y Rápidos solamente)
        this.time.addEvent({
            delay: 1500, 
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
