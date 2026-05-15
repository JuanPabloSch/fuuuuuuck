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
        
        // --- ASSETS DEL BOSS ---
        this.load.audio("boss2_attack", "src/assets/sfx/boss2_attack.mp3");
        this.load.audio("boss2_die", "src/assets/sfx/boss2_die.mp3");
        this.load.spritesheet("boss2_sprite", "src/assets/boss2.png", { 
            frameWidth: 200, 
            frameHeight: 200 
        });
    }

create(data = {}) {
    // Inicializa la base (físicas, jugador, etc.)
    super.create(data);

    // Llamas al método centralizado. Si ya sonaba 'fbossmusic' continuará, si venías de 'song2' cambiará limpiamente.
    this.updateMusic("fbossmusic"); 

    // Al salir de la habitación, limpiamos de forma segura sin romper el mezclador general
    this.events.once('shutdown', () => {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    });



        this.add.image(400, 300, "background_u3").setDisplaySize(800, 600);
        
        const startX = data.spawnX ?? 150; 
        const startY = data.spawnY ?? 150;
        this.createBase(startX, startY);

        // --- 2. SEGURO DE ESCENA ---
        this.canChangeRoom = false;
        this.time.delayedCall(800, () => { 
            this.canChangeRoom = true;
        });

        // --- 3. EFECTOS VISUALES (Alarma y Partículas) ---
        if (!this.textures.exists('particle_dot')) {
            const dot = this.make.graphics({ x: 0, y: 0, add: false });
            dot.fillStyle(0xffffff);
            dot.fillCircle(4, 4, 4);
            dot.generateTexture('particle_dot', 8, 8);
        }

        this.alarmOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0);
        this.alarmOverlay.setDepth(5000).setScrollFactor(0);

        if (!PlayerState.bossU3Dead) {
            this.tweens.add({
                targets: this.alarmOverlay,
                alpha: 0.25,
                duration: 1000,
                yoyo: true,
                loop: -1
            });
        }

        this.add.particles(0, 0, 'particle_dot', {
            x: { min: 0, max: 800 },
            y: { min: 0, max: 600 },
            quantity: 1,
            lifespan: 3000,
            speed: { min: 10, max: 40 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            frequency: 150
        }).setDepth(1500);

        // --- 4. COLISIONES DEL MAPA ---
        this.createWall(400, 75, 800, 150);
        this.createWall(40, 300, 80, 600);
        this.createWall(760, 300, 80, 600);
        this.createWall(400, 560, 800, 80);

        // --- 5. TERMINAL Y RETORNO ---
        this.terminalSprite = this.add.image(120, 480, "ui_terminal").setScale(0.4);
        this.terminal = this.add.rectangle(120, 480, 60, 60, 0x00ff00, 0); 
        this.physics.add.existing(this.terminal);

        this.setupRetorno();

        // --- 6. ESTADO DEL BOSS ---
        if (!PlayerState.bossU3Dead) {
            this.iniciarBossU3();
        } else {
            this.mostrarCartel("Sector despejado.");
            const deadBoss = this.add.sprite(200, 200, "boss2_sprite", 4);
            deadBoss.setDepth(100).setTint(0x666666);
        }
    }

    iniciarBossU3() {
        this.bossAlive = true;
        this.boss = this.physics.add.sprite(200, 200, "boss2_sprite");
        this.boss.hp = 60;
        this.boss.maxHp = 60;
        this.boss.setDepth(101);
        this.bossCanAttack = true; 
        this.boss.body.setSize(80, 120); 
        this.boss.body.setOffset(60, 40);
        this.bossHealthBar = this.add.graphics().setDepth(5001);
        this.updateBossHealthBar();
        this.mostrarCartel("¡ALERTA: Amenaza biológica detectada!");
    }

    handleCollisions() {
        super.handleCollisions();

        // Interacción con Terminal
        if (PlayerState.bossU3Dead && !this.lockOpened) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.terminal.getBounds())) {
                this.abrirTeclado();
            }
        } else if (!PlayerState.bossU3Dead && Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.terminal.getBounds())) {
            if (Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, this.terminal.x, this.terminal.y) < 70) {
                this.mostrarCartel("Terminal bloqueada: El Boss interfiere la señal.");
            }
        }

        // Recoger Items
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
        // Estaban en x:120 y x:170. 
        // Movemos el Rocket 20px a la izquierda (100) y la Llave 20px a la derecha (190)
        this.itemRocket = this.physics.add.sprite(100, 420, "icon_rocket").setScale(0.7);
        this.itemKey = this.add.image(190, 420, "icon_llave_moto").setScale(0.7);
        
        this.tweens.add({
            targets: [this.itemRocket, this.itemKey],
            y: 410, 
            duration: 800, 
            yoyo: true, 
            loop: -1
        });
    }

    recogerTodo() {
        if (!PlayerState.inventory.includes("llave_moto")) PlayerState.inventory.push("llave_moto");
        if (!PlayerState.inventory.includes("rocket_launcher")) PlayerState.inventory.push("rocket_launcher");
        PlayerState.weapons.rocket = true;
        PlayerState.ammo.rocket = 2;
        this.mostrarCartel("¡OBJETOS RECUPERADOS!");
        this.cameras.main.flash(500, 255, 0, 0);
        this.itemRocket.destroy();
        this.itemKey.destroy();
    }

    killBoss() {
        if (!this.bossAlive) return;
        this.bossAlive = false;
        PlayerState.bossU3Dead = true;

        this.cameras.main.flash(500, 255, 255, 255);
        this.cameras.main.shake(500, 0.02);

        // Paramos música de boss y lanzamos el grito de muerte
        if (this.music) this.music.stop(); 
        this.sound.play("boss2_die", { volume: 0.9 });

        if (this.boss && this.boss.body) {
            this.boss.setVelocity(0, 0);
            this.boss.body.enable = false;
            this.boss.setFrame(4);
            this.boss.setTint(0x444444);
        }
        
        if (this.bossHealthBar) this.bossHealthBar.clear();
        this.tweens.killTweensOf(this.alarmOverlay);
        this.alarmOverlay.setAlpha(0);

        this.mostrarCartel("AMENAZA ELIMINADA - TERMINAL OPERATIVA");
        
        // El pipe ahora es invisible pero funciona
        if (this.pipeToU2) {
            this.pipeToU2.setFillStyle(0x00ff00, 0);
        }

        // Delay para volver a la música ambiental
        this.time.delayedCall(3000, () => {
            this.updateMusic("song2"); 
        });
    }

    setupRetorno() {
        this.pipeToU2 = this.add.rectangle(750, 250, 100, 100, 0x00ff00, 0);
        this.physics.add.existing(this.pipeToU2, true);
        this.physics.add.overlap(this.player.sprite, this.pipeToU2, () => {
            if (this.bossAlive) {
                this.mostrarCartel("¡La salida está sellada!");
                return;
            }
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("U2Scene", { spawnX: 400, spawnY: 400 });
        });
    }

    updateBossHealthBar() {
        if (!this.bossAlive || !this.bossHealthBar) return;
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0x000000, 0.8);
        this.bossHealthBar.fillRect(200, 20, 400, 15);
        const healthWidth = (this.boss.hp / this.boss.maxHp) * 400;
        this.bossHealthBar.fillStyle(0x00ff00, 1);
        this.bossHealthBar.fillRect(200, 20, Math.max(0, healthWidth), 15);
    }

    update(time, delta) {
        this.updateBase(time, delta);
        this.handleCollisions();

        if (this.bossAlive && this.boss && this.boss.body) {
            this.physics.moveToObject(this.boss, this.player.sprite, 180);
            this.updateBossHealthBar();

            const dist = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.sprite.x, this.player.sprite.y);

            // Ataque
            if (dist < 75 && !this.player.invulnerable && this.bossCanAttack) {
                this.bossCanAttack = false; 
                this.sound.play("boss2_attack", { volume: 0.6 });
                this.player.takeDamage(15); 
                this.player.applyKnockback(this.boss.x, this.boss.y, 300);
                this.time.delayedCall(1500, () => { this.bossCanAttack = true; });
            }

            // Animación por dirección
            const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.sprite.x, this.player.sprite.y);
            const deg = Phaser.Math.RadToDeg(angle);
            if (deg > -45 && deg <= 45) this.boss.setFrame(3);
            else if (deg > 45 && deg <= 135) this.boss.setFrame(0);
            else if (deg <= -45 && deg > -135) this.boss.setFrame(1);
            else this.boss.setFrame(2);

            // Balas
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.sprite.getBounds(), this.boss.getBounds())) {
                    this.boss.hp -= bullet.damage;
                    this.boss.setTint(0xff0000);
                    this.time.delayedCall(100, () => { if (this.boss && this.boss.active) this.boss.clearTint(); });
                    bullet.destroy();
                    this.bullets.splice(i, 1);
                    if (this.boss.hp <= 0) this.killBoss();
                }
            }
        } else if (this.boss) {
            this.boss.setVelocity(0, 0);
        }
    }
}