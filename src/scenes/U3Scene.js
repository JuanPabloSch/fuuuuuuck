import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class U3Scene extends BaseRoomScene {
    constructor() {
        super("U3Scene");
        this.lockOpened = false;
        this.bossAlive = false;
    }

    preload() {
        this.load.image("background_u3", "src/background/bg_u3.png");
        this.load.image("ui_terminal", "src/assets/ui/box.png"); 
        this.load.image("icon_rocket", "src/assets/ui/icon_rocket.png");
        this.load.image("icon_llave_moto", "src/assets/ui/icon_llave_moto.png");
        super.preload();
        // Sprite de 200x200 con 5 frames (0-3: Direcciones, 4: Muerto)
        this.load.spritesheet("boss2_sprite", "src/assets/boss2.png", { 
            frameWidth: 200, 
            frameHeight: 200 
        });
    }

    create(data = {}) {
        this.add.image(400, 300, "background_u3").setDisplaySize(800, 600).setTint(0x444444);
        
        // Spawn del jugador (lejos del spawn del boss)
        this.createBase(data.spawnX ?? 600, data.spawnY ?? 450);

        // --- 🔧 GENERAR TEXTURA PARA LAS PARTÍCULAS (Poné esto al principio del create) ---
    if (!this.textures.exists('particle_dot')) {
        const dot = this.make.graphics({ x: 0, y: 0, add: false });
        dot.fillStyle(0xffffff);
        dot.fillCircle(4, 4, 4);
        dot.generateTexture('particle_dot', 8, 8);
    }

        // --- 🚨 EFECTO DE ALARMA ROJA ---
        this.alarmOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0);
        this.alarmOverlay.setDepth(5000).setScrollFactor(0); // Más profundidad para que tape todo

        this.tweens.add({
            targets: this.alarmOverlay,
            alpha: 0.25, // Un poco menos para que no moleste al jugar
            duration: 1000,
            yoyo: true,
            loop: -1
        });

        // --- ✨ PARTÍCULAS DE HUMO/GAS (Corregidas) ---
        this.add.particles(0, 0, 'particle_dot', { // Usamos la textura que generamos arriba
            x: { min: 0, max: 800 },
            y: { min: 0, max: 600 },
            quantity: 1,
            lifespan: 3000,
            speed: { min: 10, max: 40 },
            scale: { start: 1, end: 0 }, // Un poco más grandes para que parezca humo
            alpha: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            frequency: 150
        }).setDepth(1500);

        // --- PAREDES ---
        this.createWall(400, 75, 800, 150);
        this.createWall(40, 300, 80, 600);
        this.createWall(760, 300, 80, 600);
        this.createWall(400, 560, 800, 80);

        // --- TERMINAL (Visual PNG + Sensor invisible) ---
        this.terminalSprite = this.add.image(120, 480, "ui_terminal").setScale(0.4);
        this.terminal = this.add.rectangle(120, 480, 60, 60, 0x00ff00, 0); 
        this.physics.add.existing(this.terminal);

        this.setupRetorno();

        // --- LÓGICA DEL BOSS ---
        if (!PlayerState.bossU3Dead) {
            this.iniciarBossU3();
        } else {
            this.mostrarCartel("Sector despejado.");
        }
    }

    iniciarBossU3() {
        this.bossAlive = true;
        this.boss = this.physics.add.sprite(200, 200, "boss2_sprite");
        this.boss.hp = 60;
        this.boss.maxHp = 60;
        this.boss.setDepth(101);
        
        // --- 📦 ACHICAR LA HITBOX ---
        // Ajustamos la caja de colisión al centro del cuerpo (80x120)
        this.boss.body.setSize(80, 120); 
        this.boss.body.setOffset(60, 40);

        // Bloqueo visual de salida
        if (this.pipeToU2) this.pipeToU2.setFillStyle(0xff0000, 0.5);

        this.bossHealthBar = this.add.graphics().setDepth(5001);
        this.mostrarCartel("¡ALERTA: Amenaza biológica detectada!");
    }

    handleCollisions() {
        super.handleCollisions();

        // Lógica de la terminal
        if (PlayerState.bossU3Dead && !this.lockOpened) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.terminal.getBounds())) {
                this.abrirTeclado();
            }
        } else if (!PlayerState.bossU3Dead && Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.terminal.getBounds())) {
            if (Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, this.terminal.x, this.terminal.y) < 70) {
                this.mostrarCartel("Terminal bloqueada: El Boss interfiere la señal.");
            }
        }

        // Recoger items (Rocket + Llave)
        if (this.itemRocket && this.itemRocket.active) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.itemRocket.getBounds())) {
                this.recogerTodo();
            }
        }
    }

    abrirTeclado() {
        this.lockOpened = true; 
        let pass = window.prompt(`SISTEMA U3\nIngrese código de seguridad:`);
        
        if (pass === PlayerState.safeCode) {
            this.mostrarCartel("ACCESO CONCEDIDO");
            this.spawnItems();
        } else {
            this.mostrarCartel("CÓDIGO INCORRECTO");
            this.time.delayedCall(3000, () => { this.lockOpened = false; });
        }
    }

    spawnItems() {
        this.itemRocket = this.physics.add.sprite(120, 420, "icon_rocket").setScale(0.7);
        this.itemKey = this.add.image(170, 420, "icon_llave_moto").setScale(0.7);
        
        this.tweens.add({
            targets: [this.itemRocket, this.itemKey],
            y: 410,
            duration: 800,
            yoyo: true,
            loop: -1
        });
    }

    recogerTodo() {
        PlayerState.inventory.push("llave_moto");
        PlayerState.inventory.push("rocket_launcher");
        PlayerState.weapons.rocket = true;
        PlayerState.ammo.rocket = 2;

        this.mostrarCartel("¡LLAVE MOTO DE AGUA Y ROCKET LAUNCHER RECUPERADOS!");
        this.cameras.main.flash(500, 255, 0, 0);

        this.itemRocket.destroy();
        this.itemKey.destroy();
    }

    killBoss() {
        this.bossAlive = false;
        PlayerState.bossU3Dead = true;
        this.boss.setVelocity(0, 0);
        
        // --- FRAME DE MUERTE ---
        this.boss.setFrame(4); 
        this.boss.setTint(0x666666);
        
        this.bossHealthBar.clear();
        this.mostrarCartel("Amenaza eliminada. Salida desbloqueada.");
        if (this.pipeToU2) this.pipeToU2.setFillStyle(0x00ff00, 0.2);
    }

    setupRetorno() {
        this.pipeToU2 = this.add.rectangle(750, 250, 100, 100, 0x00ff00, 0.1);
        this.physics.add.existing(this.pipeToU2, true);
        this.physics.add.overlap(this.player.sprite, this.pipeToU2, () => {
            if (this.bossAlive) {
                this.mostrarCartel("¡La salida está sellada!");
                return;
            }
            this.scene.start("U2Scene", { spawnX: 200, spawnY: 200 });
        });
    }

    update(time, delta) {
        this.updateBase(time, delta);
        this.handleCollisions();

        if (this.bossAlive && this.boss && this.boss.body) {
            this.physics.moveToObject(this.boss, this.player.sprite, 180);
            this.updateBossHealthBar();

            // --- 🔄 LÓGICA DE DIRECCIONES ---
            const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.sprite.x, this.player.sprite.y);
            const deg = Phaser.Math.RadToDeg(angle);

            if (deg > -45 && deg <= 45) this.boss.setFrame(3);      // Derecha
            else if (deg > 45 && deg <= 135) this.boss.setFrame(0); // Abajo
            else if (deg <= -45 && deg > -135) this.boss.setFrame(1); // Arriba
            else this.boss.setFrame(2);                             // Izquierda

            // Daño al boss
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

    updateBossHealthBar() {
        if (!this.bossAlive || !this.boss) return;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0x000000, 0.8);
        this.bossHealthBar.fillRect(200, 20, 400, 15);
        const healthWidth = (this.boss.hp / this.boss.maxHp) * 400;
        this.bossHealthBar.fillStyle(0x00ff00, 1);
        this.bossHealthBar.fillRect(200, 20, Math.max(0, healthWidth), 15);
    }
}
