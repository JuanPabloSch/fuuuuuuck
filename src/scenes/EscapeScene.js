import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class EscapeScene extends BaseRoomScene {
    constructor() {
        super("EscapeScene");
        this.showingMsg = false;
        this.hasWon = false;
    }

    preload() {
        this.load.image("background_escape", "src/background/bg_escape.png");
        this.load.image("win_screen", "src/background/win_screen.png");
        super.preload();
        this.load.image("box2", "src/assets/ui/box2.png"); 
        this.load.audio("escape_ambient", "src/assets/music/escape.mp3");
        this.load.audio("escaping_theme", "src/assets/music/escaping.mp3");
    }

    create(data = {}) {
        super.create(data);
        this.sound.stopAll(); 
        this.sound.play("escape_ambient", { volume: 0.6, loop: true });
        
        this.add.image(400, 300, "background_escape").setDisplaySize(800, 600);

        const x = data.spawnX ?? 80;
        const y = data.spawnY ?? 520;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        this.setupWalls();

        // --- 📦 CAJA DE SUMINISTROS ---
        this.supplyBox = this.add.image(450, 300, "box2").setScale(0.4);
        this.supplyBox.setDepth(100);
        
        // Si ya tiene el rifle, oscurecemos la caja desde el inicio
        if (PlayerState.weapons.rifle) {
            this.supplyBox.setTint(0x666666);
        }

        // --- SALIDA FINAL ---
        this.exitTrigger = this.add.rectangle(680, 300, 180, 180, 0xffff00, 0.3);
        this.physics.add.existing(this.exitTrigger, true);

        // --- REGRESO ---
        this.doorBack = this.add.rectangle(40, 560, 80, 80, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorBack, true);
        this.physics.add.overlap(this.player.sprite, this.doorBack, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("By3Scene", { spawnX: 730, spawnY: 80 });
        });
    }

    setupWalls() {
        this.createWall(100, 40, 200, 80);
        for(let i = 0; i < 5; i++) {
            this.createWall(180 + (i * 30), 100 + (i * 40), 60, 40);
            this.createWall(300 + (i * 30), 150 + (i * 40), 60, 40);
        }
        this.createWall(550, 200, 400, 60);
        this.createWall(600, 450, 300, 40);
        this.createWall(450, 550, 40, 150);
    }

    update(time, delta) {
        this.updateBase(time, delta);

        // 1. LÓGICA DE LA CAJA
        if (!PlayerState.weapons.rifle) {
            let dist = Phaser.Math.Distance.Between(
                this.player.sprite.x, 
                this.player.sprite.y, 
                this.supplyBox.x, 
                this.supplyBox.y
            );
            if (dist < 60) {
                this.recogerSuministros();
            }
        }

        // 2. LÓGICA DE SALIDA
        if (this.canChangeRoom && !this.hasWon) {
            let onExit = Phaser.Geom.Intersects.RectangleToRectangle(
                this.player.sprite.getBounds(), 
                this.exitTrigger.getBounds()
            );

            if (onExit) {
                if (PlayerState.inventory.includes("llave_moto")) {
                    this.hasWon = true; 
                    this.showWinScreen();
                } else if (!this.showingMsg) {
                    this.showingMsg = true;
                    this.mostrarCartel("TODO PARECE OK, SOLO DEBO CONSEGUIR LA LLAVE...");
                    this.time.delayedCall(3000, () => { this.showingMsg = false; });
                }
            }
        }
    }

    // --- 🛠️ ESTA ES LA FUNCIÓN QUE FALTABA ---
    recogerSuministros() {
        PlayerState.weapons.rifle = true;
        PlayerState.ammo.rifle += 30; // Un cargador lleno
        
        this.supplyBox.setTint(0x666666); 
        PlayerState.vistoNotaEscape = true; 
        
        this.mostrarCartel(`¡RIFLE OBTENIDO! NOTA: SEGURIDAD SÓTANO: ${PlayerState.safeCode}`);
        console.log("Rifle obtenido. Código:", PlayerState.safeCode);
    }

    showWinScreen() {
        this.physics.pause();
        this.player.sprite.setVelocity(0, 0);
        
        this.sound.stopAll(); 
        this.sound.play("escaping_theme", { volume: 0.8 });

        const win = this.add.image(400, 300, "win_screen")
            .setDisplaySize(800, 600)
            .setDepth(1000)
            .setAlpha(0);

        this.tweens.add({
            targets: win,
            alpha: 1,
            duration: 1000
        });

        this.add.text(400, 500, "¡ESCAPE EXITOSO!", { 
            fontSize: "40px", 
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 6 
        }).setOrigin(0.5).setDepth(1001);
    }
}