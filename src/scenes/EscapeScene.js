import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class EscapeScene extends BaseRoomScene {
    constructor() {
        super("EscapeScene");
        this.showingMsg = false;
    }

    preload() {
        this.load.image("background_escape", "src/background/bg_escape.png");
        this.load.image("win_screen", "src/background/win_screen.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_escape").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 80;
        const y = data.spawnY ?? 520;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES DE BLOQUEO (Tu diseño original) ---
        this.setupWalls();

        // --- 📦 CAJA DE SUMINISTROS (Rifle + Nota) ---
        // La ponemos en x:450 para que NO se pegue al trigger de salida
        this.supplyBox = this.add.rectangle(450, 300, 50, 50, 0x8b4513); // Marrón madera
        this.physics.add.existing(this.supplyBox);
        this.supplyBox.body.setAllowGravity(false);
        this.supplyBox.body.setImmovable(true);

        // --- SALIDA FINAL (Moto de agua) ---
        this.exitTrigger = this.add.rectangle(680, 300, 180, 180, 0xffff00, 0.3);
        this.physics.add.existing(this.exitTrigger, true);

        // --- PUERTA DE REGRESO A BY3 ---
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

        // 1. LÓGICA DE LA CAJA (Detección por proximidad)
        if (!PlayerState.weapons.rifle) {
            let dist = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, this.supplyBox.x, this.supplyBox.y);
            if (dist < 60) {
                this.recogerSuministros();
            }
        }

        // 2. LÓGICA DE SALIDA
        if (this.canChangeRoom) {
            let onExit = Phaser.Geom.Intersects.RectangleToRectangle(this.player.sprite.getBounds(), this.exitTrigger.getBounds());
            if (onExit) {
                if (PlayerState.inventory.includes("llave_moto")) {
                    this.showWinScreen();
                } else if (!this.showingMsg) {
                    this.showingMsg = true;
                    this.mostrarCartel("La moto está encadenada. Necesito la llave del Sótano.");
                    this.time.delayedCall(3000, () => { this.showingMsg = false; });
                }
            }
        }
    }

    recogerSuministros() {
        PlayerState.weapons.rifle = true;
        PlayerState.ammo.rifle += 15;
        this.supplyBox.setFillStyle(0x333333); // Se vuelve gris al abrirse
        this.mostrarCartel("¡RIFLE OBTENIDO! Nota encontrada: 'Código Sótano 2027'");
        console.log("Rifle y Código 2027 desbloqueados");
    }

    showWinScreen() {
        this.physics.pause();
        this.canChangeRoom = false;
        const win = this.add.image(400, 300, "win_screen").setDisplaySize(800, 600).setDepth(1000).setAlpha(0);
        this.tweens.add({
            targets: win, alpha: 1, duration: 2000,
            onComplete: () => {
                this.add.text(400, 500, "¡ESCAPE EXITOSO!", { fontSize: "32px", fill: "#ffffff", stroke: "#0000", strokeThickness: 6 }).setOrigin(0.5).setDepth(1001);
            }
        });
    }
}
