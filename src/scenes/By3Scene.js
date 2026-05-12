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
        this.load.image("medikit", "src/assets/ui/medikit.png");
        super.preload();
        this.load.spritesheet("final_boss", "src/assets/finalboss.png", { 
            frameWidth: 200, 
            frameHeight: 256 
        });

        // --- CARGA DE AUDIOS ---
        // Asegúrate de que las rutas sean exactas a tus carpetas
        this.load.audio("finalboss_show", "src/assets/sfx/finalboss_show.mp3");
        this.load.audio("fbossmusic", "src/assets/music/fbossmusic.mp3");
    }

    create(data = {}) {
        // 1. BASE Y FONDO
        this.add.image(400, 300, "background_by3").setDisplaySize(800, 600);
        this.crearLluviaPatio();

        // 2. SISTEMA DE RAYOS
        this.time.addEvent({
            delay: Phaser.Math.Between(3000, 5000),
            loop: true,
            callback: () => this.lanzarRayo()
        });

        // 3. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);
        this.player.hp = PlayerState.hp;
        this.spawnMedikit(680, 320); 

        // --- 🧱 PAREDES ---
        this.createWall(100, 300, 200, 600);
        this.createWall(760, 400, 80, 400);
        this.createWall(225, 30, 450, 60);
        this.createWall(600, 570, 400, 60);

        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- LÓGICA DE APARICIÓN ---
        const tieneLlave = PlayerState.inventory.includes("llave_moto");
        const tieneRocket = PlayerState.inventory.includes("rocket_launcher");

        if (tieneLlave && tieneRocket && !PlayerState.finalBossDead) {
            // Ponemos en pausa la música anterior primero
            this.updateMusic(null); 
            
            // Retrasamos la música un milisegundo para evitar el crash de entrada
            this.time.delayedCall(100, () => {
                if (!PlayerState.finalBossDead) {
                    this.sound.play("finalboss_show", { volume: 0.8 });
                    this.updateMusic("fbossmusic");
                }
            });
            
            this.iniciarBossFinal();
        } else {
            this.updateMusic("song2");
            this.time.addEvent({
                delay: 1500,
                loop: true,
                callback: () => {
                    if (this.zombies.getLength() < 8 && !this.bossActive) this.spawnWorm();
                }
            });
        }

        this.setupPuertas();
    }

    iniciarBossFinal() {
        this.bossActive = true;
        this.mostrarCartel("¡NO PODRÁS ESCAPAR!");
        
        this.boss = this.physics.add.sprite(500, 200, "final_boss");
        this.boss.hp = 200;
        this.boss.maxHp = 200;
        this.boss.setDepth(100);
        this.boss.body.setSize(120, 200);
        this.boss.body.setOffset(40, 30);
        
        if (!this.anims.exists('boss_final_walk')) {
            this.anims.create({
                key: 'boss_final_walk',
                frames: this.anims.generateFrameNumbers('final_boss', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: 'boss_final_dead',
                frames: [{ key: 'final_boss', frame: 4 }],
                frameRate: 1
            });
        }
        this.boss.play('boss_final_walk');
        this.bossHealthBar = this.add.graphics().setDepth(5000);
    }

    killBoss() {
        this.bossActive = false;
        PlayerState.finalBossDead = true;
        
        // Silencio total
        this.updateMusic(null); 
        // Si tienes música de victoria podrías ponerla aquí, si no, queda en silencio.

        this.boss.setVelocity(0, 0);
        this.boss.play('boss_final_dead');
        this.boss.setTint(0x666666); 
        if (this.bossHealthBar) this.bossHealthBar.clear();
        this.mostrarCartel("AMENAZA ELIMINADA. ¡HUYE AL MUELLE!");
    }

    // ... (El resto de funciones: update, lanzarRayo, etc., se mantienen igual que tu versión funcional)
    update(time, delta) {
        this.updateBase(time, delta);
        if (this.bossActive && this.boss && this.boss.active) {
            this.physics.moveToObject(this.boss, this.player.sprite, 120);
            this.boss.flipX = this.player.sprite.x < this.boss.x;
            this.updateBossHealthBar();
            
            this.bullets.forEach((bullet, index) => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.sprite.getBounds(), this.boss.getBounds())) {
                    this.boss.hp -= bullet.damage;
                    bullet.destroy();
                    this.bullets.splice(index, 1);
                    this.boss.setTint(0xff0000);
                    this.time.delayedCall(100, () => { if(this.bossActive) this.boss.clearTint(); });
                    if (this.boss.hp <= 0) this.killBoss();
                }
            });
        }
    }

    updateBossHealthBar() {
        if (!this.bossActive || !this.bossHealthBar) return;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0x000000, 0.7);
        this.bossHealthBar.fillRect(200, 50, 400, 20);
        const width = (this.boss.hp / this.boss.maxHp) * 400;
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(200, 50, Math.max(0, width), 20);
        this.bossHealthBar.lineStyle(2, 0xffffff);
        this.bossHealthBar.strokeRect(200, 50, 400, 20);
    }

    setupPuertas() {
        this.doorDown = this.add.rectangle(300, 580, 100, 15, 0x5555ff, 0);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("By2Scene", { spawnX: 400, spawnY: 150 });
        });

        this.doorEscape = this.add.rectangle(730, 40, 120, 40, 0xffff00, 0); 
        this.physics.add.existing(this.doorEscape, true);
        this.physics.add.overlap(this.player.sprite, this.doorEscape, () => {
            if (!this.canChangeRoom) return;
            if (this.bossActive) {
                this.mostrarCartel("¡EL BOSS BLOQUEA LA SALIDA!");
                return;
            }
            this.saveState();
            this.scene.start("EscapeScene", { spawnX: 100, spawnY: 500 });
        });
    }

    crearLluviaPatio() {
        if (!this.textures.exists('rain_drop')) {
            const rainGraphic = this.make.graphics({ x: 0, y: 0, add: false });
            rainGraphic.fillStyle(0xffffff, 0.7);
            rainGraphic.fillRect(0, 0, 2, 10);
            rainGraphic.generateTexture('rain_drop', 2, 10);
        }
        this.add.particles(0, 0, 'rain_drop', {
            x: { min: -100, max: 900 },
            y: -50,
            lifespan: 1200,
            speedY: { min: 700, max: 1000 },
            speedX: { min: -100, max: -50 },
            scale: { start: 1, end: 0.5 },
            alpha: { start: 0.6, end: 0.1 },
            quantity: 8,
            blendMode: 'ADD'
        }).setDepth(4500);
    }

    lanzarRayo() {
        this.cameras.main.flash(200, 255, 255, 255);
        const rayoFondo = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0.4).setDepth(10000);
        this.tweens.add({
            targets: rayoFondo,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 1,
            onComplete: () => { rayoFondo.destroy(); this.cameras.main.shake(300, 0.005); }
        });
    }

    spawnWorm() {
        const x = Phaser.Math.Between(350, 700);
        const y = Phaser.Math.Between(100, 500);
        const worm = new Zombie(this, x, y, "worm");
        this.zombies.add(worm.sprite);
        worm.sprite.ref = worm;
    }
}