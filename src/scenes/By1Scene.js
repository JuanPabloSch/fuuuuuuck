import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By1Scene extends BaseRoomScene {
    constructor() {
        super("By1Scene");
    }

    preload() {
        this.load.image("background_by1", "src/background/bg_by1.png");
        this.load.image("rain_drop", "src/assets/rain.png"); 
        this.load.spritesheet("zombie_crawler", "src/assets/sucker.png", { frameWidth: 199, frameHeight: 282 });
    }

    create(data = {}) {
        // 1. FONDO (Luz natural, pero un pelín fría para la tormenta)
        this.add.image(400, 300, "background_by1").setDisplaySize(800, 600).setTint(0xdddddd);

        // 2. EFECTO DE LLUVIA DEL PATIO (Rápida y densa)
        this.crearLluviaPatio();

        // --- ⚡ SISTEMA DE RAYOS ---
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000), // Rayos cada 3 a 8 segundos
            loop: true,
            callback: () => {
                this.lanzarRayo();
            }
        });


        // 3. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES Y PUERTAS (Mantenemos tu diseño) ---
        this.setupPuertas();
        this.setupParedes();

        // 🧟 SPAWNER (Muchos Suckers)
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                if (this.zombies.children.entries.length < 6) this.spawnZombie();
            }
        });
    }

    crearLluviaPatio() {
        // Esta es la configuración de la lluvia que "pega" fuerte
        const lluvia = this.add.particles(0, 0, 'rain_drop', {
            x: { min: -100, max: 900 },
            y: -50,
            lifespan: 1200,
            speedY: { min: 700, max: 1000 }, // Muy rápida
            speedX: { min: -100, max: -50 }, // Diagonal
            scale: { start: 0.25, end: 0.15 },
            alpha: { start: 0.5, end: 0.1 },
            quantity: 8, // Más cantidad para que se note
            blendMode: 'ADD'
        });
        lluvia.setDepth(4500);
    }

    lanzarRayo() {
    // 1. Destello de cámara (blanco puro)
    this.cameras.main.flash(200, 255, 255, 255);

    // 2. Crear un rectángulo blanco que cubra todo por un instante
    const rayoFondo = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0.4);
    rayoFondo.setDepth(10000); // Por encima de todo

    // 3. Efecto de parpadeo rápido (doble rayo)
    this.tweens.add({
        targets: rayoFondo,
        alpha: 0,
        duration: 100,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            rayoFondo.destroy();
            // Pequeño temblor de tierra después del trueno
            this.cameras.main.shake(300, 0.005);
        }
    });
}


    setupPuertas() {
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("Room8Scene", { spawnX: 400, spawnY: 100 });
        });

        this.doorUp = this.add.rectangle(400, 20, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("By2Scene", { spawnX: 400, spawnY: 480 });
        });
    }

    setupParedes() {
        this.createWall(40, 450, 80, 300);   this.createWall(760, 450, 80, 300);
        this.createWall(100, 125, 200, 250); this.createWall(700, 125, 200, 250); 
        this.createWall(200, 25, 100, 50);   this.createWall(600, 25, 100, 50); 
        this.createWall(160, 575, 320, 50);  this.createWall(640, 575, 320, 50);
    }

    spawnZombie() {
        const x = Phaser.Math.Between(250, 550);
        const y = Phaser.Math.Between(100, 500);
        const type = Phaser.Math.RND.pick(["crawler", "crawler", "fast"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
        zombie.sprite.setDepth(100);
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
