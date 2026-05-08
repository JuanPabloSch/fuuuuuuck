import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room5Scene extends BaseRoomScene {
    constructor() {
        super("Room5Scene");
    }

    preload() {
        this.load.image("background_room5", "src/background/bg_room5.png");
    }

    create(data = {}) {
        this.add.image(400, 300, "background_room5").setDisplaySize(800, 600);
        this.createBase(data.spawnX ?? 720, data.spawnY ?? 300);
        
        // Si el jefe ya murió antes, las puertas están abiertas
        this.bossAlive = !PlayerState.bossRoom5Dead;
        this.canChangeRoom = PlayerState.bossRoom5Dead;

        // --- 🚨 LUCES DE EMERGENCIA ---
        // Solo se crean si el jefe está VIVO
        if (this.bossAlive) {
            this.alarmOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.3);
            this.alarmOverlay.setDepth(4000); // Super profundo para que tape todo
            this.tweens.add({
                targets: this.alarmOverlay,
                alpha: 0.1,
                duration: 500,
                yoyo: true,
                loop: -1
            });
        }

        // --- 👹 EL BOSS (Solo si está vivo) ---
        if (this.bossAlive) {
            this.boss = this.add.rectangle(200, 300, 120, 120, 0xff0000);
            this.physics.add.existing(this.boss);
            this.boss.hp = 40;
            this.boss.maxHp = 40;
            this.boss.setDepth(100);

            this.bossHealthBar = this.add.graphics().setDepth(4001);
            this.updateBossHealthBar();
        }

        // --- PAREDES ---
        this.createWall(400, 40, 800, 80);
        this.createWall(400, 560, 800, 80);
        this.createWall(40, 110, 80, 220); this.createWall(40, 490, 80, 220);
        this.createWall(760, 110, 80, 220); this.createWall(760, 490, 80, 220);

        // --- PUERTAS ---
        const doorColor = this.bossAlive ? 0xff0000 : 0x00ff00;
        this.doorRight = this.add.rectangle(780, 300, 15, 100, doorColor, 0.6);
        this.physics.add.existing(this.doorRight, true);

        this.doorLeft = this.add.rectangle(20, 300, 15, 100, doorColor, 0.6);
        this.physics.add.existing(this.doorLeft, true);

        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room4Scene", { spawnX: 100, spawnY: 300 });
        });

        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room6Scene", { spawnX: 700, spawnY: 300 });
        });
    }

    updateBossHealthBar() {
        if (!this.bossAlive) return;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0x000000, 0.8);
        this.bossHealthBar.fillRect(200, 40, 400, 15);
        const healthWidth = (this.boss.hp / this.boss.maxHp) * 400;
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(200, 40, Math.max(0, healthWidth), 15);
    }

    handleCollisions() {
        super.handleCollisions();
        if (!this.bossAlive) return;

        this.bullets.forEach((bullet, index) => {
            if (this.boss && this.boss.active && Phaser.Geom.Intersects.RectangleToRectangle(bullet.sprite.getBounds(), this.boss.getBounds())) {
                this.boss.hp -= bullet.damage;
                bullet.destroy();
                this.bullets.splice(index, 1);
                this.updateBossHealthBar();
                if (this.boss.hp <= 0) this.killBoss();
            }
        });
    }

    killBoss() {
        this.bossAlive = false;
        PlayerState.bossRoom5Dead = true; // <--- GUARDAMOS LA MUERTE
        this.boss.destroy();
        this.bossHealthBar.clear();
        if (this.alarmOverlay) this.alarmOverlay.destroy();
        
        this.canChangeRoom = true;
        this.doorRight.setFillStyle(0x00ff00);
        this.doorLeft.setFillStyle(0x00ff00);
    }

    update(time, delta) {
        this.updateBase(time, delta);
        if (this.bossAlive && this.boss.body) {
            this.physics.moveToObject(this.boss, this.player.sprite, 150);
        }
    }
}
