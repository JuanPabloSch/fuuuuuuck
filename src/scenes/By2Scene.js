import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By2Scene extends BaseRoomScene {
    constructor() {
        super("By2Scene");
    }

    preload() {
        this.load.image("background_by2", "src/background/bg_by2.png");
        this.load.image("rain_drop", "src/assets/rain.png"); 
        // Cargamos el nuevo sprite del gusano (783 / 4 frames = 195.75 -> usamos 195)
        this.load.spritesheet("zombie_worm", "src/assets/worm.png", { 
        frameWidth: 100, 
        frameHeight: 80
    });
    }

    create(data = {}) {
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
        const lluvia = this.add.particles(0, 0, 'rain_drop', {
            x: { min: -100, max: 900 },
            y: -50,
            lifespan: 1200,
            speedY: { min: 700, max: 1000 },
            speedX: { min: -100, max: -50 },
            scale: { start: 0.25, end: 0.15 },
            alpha: { start: 0.5, end: 0.1 },
            quantity: 8,
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
