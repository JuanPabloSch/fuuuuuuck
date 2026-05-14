import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By1Scene extends BaseRoomScene {
    constructor() {
        super("By1Scene");
    }

    preload() {
        this.load.image("background_by1", "src/background/bg_by1.png");
        this.load.spritesheet("zombie_crawler", "src/assets/sucker.png", { frameWidth: 199, frameHeight: 282 });
        this.load.image("block_ui", "src/assets/ui/block1.png")
        super.preload();
    }

    create(data = {}) {
        super.create(data);
        this.updateMusic("song2");
        // --- 🔊 SONIDO DE LLUVIA ---
    if (!this.sound.get("rain_ambient")) {
        this.rainSound = this.sound.add("rain_ambient", { volume: 0.7, loop: true });
        this.rainSound.play();
    } else {
        this.rainSound = this.sound.get("rain_ambient");
        this.rainSound.setVolume(0.7);
    }
        // 1. FONDO
        this.add.image(400, 300, "background_by1").setDisplaySize(800, 600).setTint(0xdddddd);

        // 2. EFECTOS
        this.crearLluviaPatio();
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 4000),
            loop: true,
            callback: () => this.lanzarRayo()
        });

        // 3. SPAWN Y BASE (Importante: define this.walls y this.player)
        const spawnX = data.spawnX ?? 400;
        const spawnY = data.spawnY ?? 300;
        this.createBase(spawnX, spawnY);

        // --- 🧱 AGREGAR BLOQUEO CENTRAL ---
        const obsX = 400;
        const obsY = 320; // Un poco más abajo del centro
        const size = 80;  // Tamaño del bloque

        // Creamos la pared física (Sólida)
        this.createWall(obsX, obsY, size, size);
        
        // Ponemos la imagen encima
        this.add.image(obsX, obsY, "block_ui")
            .setDisplaySize(size, size)
            .setDepth(obsY); // Esto ayuda a que el personaje pase por detrás/delante correctamente

        // 4. RESTO DE CONFIGURACIÓN
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        this.setupPuertas();
        this.setupParedes();

        // 🧟 SPAWNER
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                if (this.zombies.children.entries.length < 6) this.spawnZombie();
            }
        });
    }

    crearLluviaPatio() {
    // 1. CREAR LA GOTA POR CÓDIGO (Si no existe ya)
    if (!this.textures.exists('rain_drop')) {
        const rainGraphic = this.make.graphics({ x: 0, y: 0, add: false });
        rainGraphic.fillStyle(0xffffff, 0.7);
        rainGraphic.fillRect(0, 0, 2, 10); // Una gota fina de 2x10
        rainGraphic.generateTexture('rain_drop', 2, 10);
    }

    // 2. USAR LA GOTA EN LAS PARTÍCULAS (Como ya tenías)
    const lluvia = this.add.particles(0, 0, 'rain_drop', {
        x: { min: -100, max: 900 },
        y: -50,
        lifespan: 1200,
        speedY: { min: 700, max: 1000 },
        speedX: { min: -100, max: -50 },
        scale: { start: 1, end: 0.5 }, // Ajusté la escala porque ahora la gota base es chica
        alpha: { start: 0.6, end: 0.1 },
        quantity: 8,
        blendMode: 'ADD'
    });
    lluvia.setDepth(4500);
}


    lanzarRayo() {
    // 1. Destello de cámara (blanco puro)
    this.sound.play("thunder_sfx", { volume: 0.6 });
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
    // PUERTA ABAJO (A Room8)
    this.doorDown = this.add.rectangle(400, 580, 100, 15, 0x5555ff, 0);
    this.physics.add.existing(this.doorDown, true);
    this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
        if (!this.canChangeRoom) return;
        
        // 🛑 DETENER LLUVIA al entrar al edificio (Room8)
        if (this.rainSound) this.rainSound.stop();
        
        this.saveState();
        this.scene.start("Room8Scene", { spawnX: 400, spawnY: 100 });
    });

        this.doorUp = this.add.rectangle(400, 20, 100, 15, 0x5555ff, 0);
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
