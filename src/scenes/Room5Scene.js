import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room5Scene extends BaseRoomScene {
    constructor() {
        super("Room5Scene");
    }

    preload() {
    this.load.image("background_room5", "src/background/bg_room5.png");
    super.preload();
    this.load.spritesheet("boss_sprite", "src/assets/boss1.png", { 
        frameWidth: 200,  // <--- Exactamente 1000 / 5
        frameHeight: 200  // <--- La altura de tu lienzo
    });
}


    create(data = {}) {
        this.add.image(400, 300, "background_room5").setDisplaySize(800, 600);
        this.createBase(data.spawnX ?? 720, data.spawnY ?? 300);
        
        // --- ANIMACIONES ---
    if (!this.anims.exists('boss_move') && this.textures.get('boss_sprite').frameTotal > 1) {
        this.anims.create({
            key: 'boss_move',
            frames: this.anims.generateFrameNumbers('boss_sprite', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'boss_dead',
            frames: [{ key: 'boss_sprite', frame: 4 }],
            frameRate: 1
        });
    }


        this.bossAlive = !PlayerState.bossRoom5Dead;
        this.canChangeRoom = PlayerState.bossRoom5Dead;

        // --- LUCES DE EMERGENCIA ---
        if (this.bossAlive) {
            this.alarmOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.2);
            this.alarmOverlay.setDepth(4000).setScrollFactor(0);
            this.tweens.add({
                targets: this.alarmOverlay, alpha: 0.05, duration: 800, yoyo: true, loop: -1
            });
        }

        // --- BOSS (SPRITE) ---
        if (this.bossAlive) {
            this.boss = this.physics.add.sprite(200, 300, 'boss_sprite');
            this.boss.play('boss_move');
            this.boss.hp = 50; // Un poco más de vida para que dure
            this.boss.maxHp = 50;
            this.boss.setDepth(100);
            // Ajustamos la hitbox al centro del sprite
            this.boss.body.setSize(80, 180); 
            this.boss.body.setOffset(40, 40);

            this.bossHealthBar = this.add.graphics().setDepth(4001);
            this.updateBossHealthBar();
        } else {
            // Si ya murió, mostramos el frame de muerto en el suelo
            const deadBoss = this.add.sprite(200, 300, 'boss_sprite', 4);
            deadBoss.setDepth(90).setTint(0x666666);
        }

        this.setupCollisions();
    }

    setupCollisions() {
        this.createWall(400, 40, 800, 80);
        this.createWall(400, 560, 800, 80);
        this.createWall(40, 110, 80, 220); this.createWall(40, 490, 80, 220);
        this.createWall(760, 110, 80, 220); this.createWall(760, 490, 80, 220);

        // Cambiamos el color de las puertas según el estado
        const doorColor = this.bossAlive ? 0xaa0000 : 0x00ff00;
        
        this.doorRight = this.add.rectangle(780, 300, 15, 100, doorColor, 0.6);
        this.physics.add.existing(this.doorRight, true);

        this.doorLeft = this.add.rectangle(20, 300, 15, 100, doorColor, 0.6);
        this.physics.add.existing(this.doorLeft, true);

        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("Room4Scene", { spawnX: 100, spawnY: 300 });
        });

        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("Room6Scene", { spawnX: 700, spawnY: 300 });
        });
    }

    updateBossHealthBar() {
        if (!this.bossAlive || !this.bossHealthBar) return;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0x000000, 0.8);
        this.bossHealthBar.fillRect(200, 30, 400, 12);
        const healthWidth = (this.boss.hp / this.boss.maxHp) * 400;
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(200, 30, Math.max(0, healthWidth), 12);
    }

    handleCollisions() {
        super.handleCollisions();
        if (!this.bossAlive || !this.boss) return;

        this.bullets.forEach((bullet, index) => {
            if (this.boss.active && Phaser.Geom.Intersects.RectangleToRectangle(bullet.sprite.getBounds(), this.boss.getBounds())) {
                this.boss.hp -= bullet.damage;
                bullet.destroy();
                this.bullets.splice(index, 1);
                this.updateBossHealthBar();
                
                // Pequeño flash rojo al boss cuando recibe daño
                this.boss.setTint(0xff0000);
                this.time.delayedCall(100, () => { if(this.boss) this.boss.clearTint(); });

                if (this.boss.hp <= 0) this.killBoss();
            }
        });
    }

    killBoss() {
        this.bossAlive = false;
        PlayerState.bossRoom5Dead = true;
        this.boss.setVelocity(0, 0);
        this.boss.stop();
        this.boss.setFrame(4); // Se queda en la pose de muerte
        this.boss.setTint(0x666666); // Se oscurece al morir
        this.bossHealthBar.clear();
        if (this.alarmOverlay) this.alarmOverlay.destroy();
        
        this.canChangeRoom = true;
        this.doorRight.setFillStyle(0x00ff00);
        this.doorLeft.setFillStyle(0x00ff00);
        
        this.mostrarCartel("SISTEMA DE SEGURIDAD DESACTIVADO");
    }

update(time, delta) {
    this.updateBase(time, delta);

    if (this.bossAlive && this.boss && this.boss.body) {
        // 1. Persecución del Boss (Ya lo tenías)
        this.physics.moveToObject(this.boss, this.player.sprite, 130);
        this.boss.flipX = this.player.sprite.x < this.boss.x;

        // 2. LÓGICA DE DAÑO (Agregado para que use tu código de Player)
        const dist = Phaser.Math.Distance.Between(
            this.boss.x, this.boss.y,
            this.player.sprite.x, this.player.sprite.y
        );

        // Si el Boss te toca y NO sos invulnerable
        if (dist < 65 && !this.player.invulnerable) { 
            // 20 de daño porque es un Boss, podés bajarlo si es mucho
            this.player.takeDamage(20); 
            
            // Te empuja hacia atrás usando tu función
            this.player.applyKnockback(this.boss.x, this.boss.y, 250);
            
            // Opcional: Sacudida de cámara para que se sienta el golpe
            this.cameras.main.shake(200, 0.02);
        }
    }
}


}
