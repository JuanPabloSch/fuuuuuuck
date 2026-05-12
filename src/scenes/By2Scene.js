import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By2Scene extends BaseRoomScene {
    constructor() {
        super("By2Scene");
    }

    preload() {
        this.load.image("background_by2", "src/background/bg_by2.png");
        this.load.image("block_ui_2", "src/assets/ui/block2.png");
        super.preload();
        this.load.spritesheet("zombie_worm", "src/assets/worm.png", { 
        frameWidth: 100, 
        frameHeight: 80
    });
    }

    create(data = {}) {
        super.create(data);
        this.updateMusic("song2");
        // --- 🔊 CONTROL DE AUDIO AMBIENTAL ---
        if (!this.sound.get("rain_ambient")) {
        this.rainSound = this.sound.add("rain_ambient", { volume: 0.7, loop: true });
        this.rainSound.play();
        } else {
        this.rainSound = this.sound.get("rain_ambient");
        this.rainSound.setVolume(0.7); // Nos aseguramos de que suene fuerte
        }
        this.add.image(400, 300, "background_by2").setDisplaySize(800, 600);
        this.crearLluviaPatio(); // Reusamos el efecto que te gustó

        this.createBase(data.spawnX ?? 400, data.spawnY ?? 300);
        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES LATERALES EXTRA GRUESAS (Pasillo estrecho) ---
        this.createWall(100, 300, 200, 600); // Izquierda
        this.createWall(700, 300, 200, 600);  // Derecha

        // --- ⚡ SISTEMA DE RAYOS ---
        this.time.addEvent({
            delay: Phaser.Math.Between(3000, 5000), // Rayos cada 3 a 8 segundos
            loop: true,
            callback: () => {
                this.lanzarRayo();
            }
        });

        // --- 🧱 BLOQUEO CENTRAL (block2) ---
        const obsX = 450;
        const obsY = 300;
        const size = 90; // Un poco más grande para el pasillo

        this.createWall(obsX, obsY, size, size); // Colisión sólida
        this.add.image(obsX, obsY, "block_ui_2")
            .setDisplaySize(size, size)
            .setDepth(obsY); // Profundidad dinámica

        // --- PUERTAS Y HUECOS ---
        this.setupConexiones();

        // 🧟 SPAWNER: Invasión de gusanos en el pasillo
        this.time.addEvent({
            delay: 1500, // Salen rápido para atosigar
            loop: true,
            callback: () => {
                if (this.zombies.children.entries.length < 8) this.spawnZombie();
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


    setupConexiones() {
        // ABAJO: A By1
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("By1Scene", { spawnX: 400, spawnY: 150 });
        });

        // ARRIBA: A By3
        this.doorUp = this.add.rectangle(400, 20, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("By3Scene", { spawnX: 400, spawnY: 480 });
        });
    }

    spawnZombie() {
    // Solo spawnean en el pasillo central (x entre 300 y 500)
    const x = Phaser.Math.Between(300, 500);
    const y = Phaser.Math.Between(100, 500);
    
    // Forzamos tipo "worm" únicamente
    const type = "worm"; 
    
    const zombieInstance = new Zombie(this, x, y, type);
    
    this.zombies.add(zombieInstance.sprite);
    zombieInstance.sprite.ref = zombieInstance;
    zombieInstance.sprite.setDepth(100);
    
    // Si querés que se retuerzan un poco más, podés darles un tinte
    zombieInstance.sprite.setTint(0xffaaaa); 
}


    update(time, delta) {
        this.updateBase(time, delta);
    }
}
