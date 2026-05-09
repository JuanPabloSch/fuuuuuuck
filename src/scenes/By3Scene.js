import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By3Scene extends BaseRoomScene {
    constructor() {
        super("By3Scene");
        this.bossActive = false;
    }

    preload() {
        this.load.image("background_by3", "src/background/bg_by3.png");
        this.load.image("rain_drop", "src/assets/rain.png");
        // Final Boss: 761 / 4 frames = 190.25 (usamos 190)
        this.load.spritesheet("final_boss", "src/assets/finalboss.png", { 
            frameWidth: 190, 
            frameHeight: 328 
        });
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_by3").setDisplaySize(800, 600);
        
        // 2. LLUVIA (La del patio que te gustó)
        this.crearLluviaPatio();

        // --- ⚡ SISTEMA DE RAYOS ---
        this.time.addEvent({
            delay: Phaser.Math.Between(3000, 5000), // Rayos cada 3 a 8 segundos
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

        // --- 🧱 LÍMITES (CODO HACIA EL ESCAPE) ---
        this.createWall(100, 300, 200, 600); // 1. Pared Izquierda Extra Ancha
        this.createWall(760, 400, 80, 400);  // 2. Pared Derecha (Deja libre arriba)
        this.createWall(225, 30, 450, 60); 
        this.createWall(600, 570, 400, 60);  // 4. Pared Inferior (Hueco en x:400)

        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- CONDICIÓN DE BOSS FINAL ---
        const tieneLlave = PlayerState.inventory.includes("llave_moto");
        const tieneRocket = PlayerState.inventory.includes("rocket_launcher");

        if (tieneLlave && tieneRocket && !PlayerState.finalBossDead) {
            this.iniciarBossFinal();
        } else {
            // MODO PLAGA (Solo gusanos si no hay Boss)
            this.time.addEvent({
                delay: 1500,
                loop: true,
                callback: () => {
                    if (this.zombies.getLength() < 8) this.spawnWorm();
                }
            });
        }

        this.setupPuertas();
    }

    crearLluviaPatio() {
        if (this.textures.exists('rain_drop')) {
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


    iniciarBossFinal() {
        this.bossActive = true;
        this.mostrarCartel("¡NO PODRÁS ESCAPAR!");
        
        this.boss = this.physics.add.sprite(500, 200, "final_boss"); // Aparece por la derecha
        this.boss.hp = 150;
        this.boss.setDepth(100);
        
        if (!this.anims.exists('boss_final_walk')) {
            this.anims.create({
                key: 'boss_final_walk',
                frames: this.anims.generateFrameNumbers('final_boss', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        }
        this.boss.play('boss_final_walk');
    }

    spawnWorm() {
        // Spawnean en el área abierta del codo
        const x = Phaser.Math.Between(350, 700);
        const y = Phaser.Math.Between(100, 500);
        const worm = new Zombie(this, x, y, "worm");
        this.zombies.add(worm.sprite);
        worm.sprite.ref = worm;
    }

    setupPuertas() {
        // ABAJO: Volver a By2
        this.doorDown = this.add.rectangle(300, 580, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("By2Scene", { spawnX: 400, spawnY: 150 });
        });

        // ÁNGULO SUPERIOR DERECHO: ¡ESCAPE!
        this.doorEscape = this.add.rectangle(730, 40, 120, 40, 0xffff00, 0.5); 
        this.physics.add.existing(this.doorEscape, true);
        this.physics.add.overlap(this.player.sprite, this.doorEscape, () => {
            if (!this.canChangeRoom) return;
            if (this.bossActive) {
                this.mostrarCartel("¡El Boss bloquea la salida!");
                return;
            }
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            this.scene.start("EscapeScene", { spawnX: 100, spawnY: 500 });
        });
    }

    update(time, delta) {
        this.updateBase(time, delta);
        if (this.bossActive && this.boss && this.boss.active) {
            this.physics.moveToObject(this.boss, this.player.sprite, 120);
            this.boss.flipX = this.player.sprite.x < this.boss.x;
            
            // Colisión balas (Rocket Launcher será clave aquí)
            this.bullets.forEach((bullet, index) => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.sprite.getBounds(), this.boss.getBounds())) {
                    this.boss.hp -= bullet.damage;
                    bullet.destroy();
                    this.bullets.splice(index, 1);
                    if (this.boss.hp <= 0) {
                        PlayerState.finalBossDead = true;
                        this.bossActive = false;
                        this.boss.destroy();
                        this.mostrarCartel("Amenaza eliminada. ¡CORRE AL MUELLE!");
                    }
                }
            });
        }
    }
}
