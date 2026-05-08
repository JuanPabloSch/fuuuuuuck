import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class U3Scene extends BaseRoomScene {
    constructor() {
        super("U3Scene");
        this.correctCode = "2027";
        this.lockOpened = false;
        this.bossAlive = false;
    }

    preload() {
        this.load.image("background_u3", "src/background/bg_u3.png");
        this.load.spritesheet("boss2_sprite", "src/assets/boss2.png", { 
            frameWidth: 200, 
            frameHeight: 200 
        });
    }

    create(data = {}) {
        this.add.image(400, 300, "background_u3").setDisplaySize(800, 600).setTint(0x444444);
        this.createBase(data.spawnX ?? 600, data.spawnY ?? 450);  // Aparece abajo para ver al boss arriba

        // --- PAREDES ---
        this.createWall(400, 75, 800, 150);
        this.createWall(40, 300, 80, 600);
        this.createWall(760, 300, 80, 600);
        this.createWall(400, 560, 800, 80);

        // --- TERMINAL (Abajo a la izquierda) ---
        this.terminal = this.add.rectangle(120, 480, 60, 60, 0x00ff00, 0.2); 
        this.physics.add.existing(this.terminal);
        this.terminal.body.setAllowGravity(false);
        this.terminal.body.setImmovable(true);

        this.setupRetorno();

        // --- LÓGICA DEL BOSS ---
        if (!PlayerState.bossU3Dead) {
            this.iniciarBossU3();
        } else {
            this.mostrarCartel("El sector está despejado.");
        }
    }

    handleCollisions() {
        super.handleCollisions();

        // Solo podés usar la terminal si el Boss está muerto
        if (PlayerState.bossU3Dead && !this.lockOpened) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.terminal.getBounds())) {
                this.abrirTeclado();
            }
        } else if (!PlayerState.bossU3Dead && Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.terminal.getBounds())) {
            this.mostrarCartel("¡Terminal bloqueada por interferencia del Boss!");
        }

        // Detectar Llave Moto (Cuadrado amarillo)
        if (this.keyMoto && this.keyMoto.active && Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.keyMoto.getBounds())) {
            this.recogerLlave();
        }
    }

iniciarBossU3() {
        this.bossAlive = true;
        // Lo spawneamos cerca de la pared izquierda (x: 200) y arriba (y: 200)
        this.boss = this.physics.add.sprite(200, 200, "boss2_sprite");
        this.boss.hp = 60;
        this.boss.maxHp = 60;
        this.boss.setDepth(101);
        
        this.bossHealthBar = this.add.graphics().setDepth(5001);
        this.mostrarCartel("¡AMENAZA BIOLÓGICA DETECTADA!");
    }

    abrirTeclado() {
        this.lockOpened = true; 
        let pass = window.prompt("TERMINAL DE SEGURIDAD - Ingrese código:");
        if (pass === this.correctCode) {
            this.mostrarCartel("ACCESO CONCEDIDO - Recuperando llave...");
            this.spawnKeyMoto();
        } else {
            this.mostrarCartel("CÓDIGO INCORRECTO");
            this.time.delayedCall(3000, () => { this.lockOpened = false; });
        }
    }

    spawnKeyMoto() {
        this.keyMoto = this.add.rectangle(120, 420, 30, 30, 0xffff00);
        this.physics.add.existing(this.keyMoto);
        this.keyMoto.setDepth(100);
    }

    recogerLlave() {
        PlayerState.inventory.push("llave_moto");
        this.mostrarCartel("¡Llave de Moto de Agua obtenida!");
        this.keyMoto.destroy();
    }

    killBoss() {
        this.bossAlive = false;
        PlayerState.bossU3Dead = true; // SE GRABA EL STATUS
        this.boss.setTint(0xff0000);
        this.boss.setVelocity(0, 0);
        this.bossHealthBar.clear();
        this.mostrarCartel("Amenaza eliminada. Terminal operativa.");
        this.time.delayedCall(2000, () => { this.boss.destroy(); });
    }

    updateBossHealthBar() {
        if (!this.bossAlive || !this.boss) return;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0x000000, 0.8);
        this.bossHealthBar.fillRect(200, 20, 400, 15);
        const healthWidth = (this.boss.hp / this.boss.maxHp) * 400;
        this.bossHealthBar.fillStyle(0x00ff00, 1);
        this.bossHealthBar.fillRect(200, 20, Math.max(0, healthWidth), 15);
    }

    setupRetorno() {
        this.pipeToU2 = this.add.rectangle(750, 250, 100, 100, 0x00ff00, 0.1);
        this.physics.add.existing(this.pipeToU2, true);
        this.physics.add.overlap(this.player.sprite, this.pipeToU2, () => {
            this.scene.start("U2Scene", { spawnX: 200, spawnY: 200 });
        });
    }

    update(time, delta) {
        this.updateBase(time, delta);
        this.handleCollisions();

        if (this.bossAlive && this.boss && this.boss.body) {
            this.physics.moveToObject(this.boss, this.player.sprite, 180);
            this.updateBossHealthBar();
            
            this.bullets.forEach((bullet, index) => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.sprite.getBounds(), this.boss.getBounds())) {
                    this.boss.hp -= bullet.damage;
                    bullet.destroy();
                    this.bullets.splice(index, 1);
                    if (this.boss.hp <= 0) this.killBoss();
                }
            });
        }
    }
}
