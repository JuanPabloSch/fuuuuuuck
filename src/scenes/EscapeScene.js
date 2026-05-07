import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class EscapeScene extends BaseRoomScene {
    constructor() {
        super("EscapeScene");
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
        
        // Seguro de entrada para evitar bucles
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES DE BLOQUEO (FORMA IRREGULAR) ---

        // Techo superior izquierdo
        this.createWall(100, 40, 200, 80);

        // Túnel diagonal superior (\ \) - Escalonado
        for(let i = 0; i < 5; i++) {
            this.createWall(180 + (i * 30), 100 + (i * 40), 60, 40); // Lado izq
            this.createWall(300 + (i * 30), 150 + (i * 40), 60, 40); // Lado der
        }

        // Plataforma horizontal larga (____)
        this.createWall(550, 200, 400, 60);

        // Bloqueo diagonal inferior (/ /) - Escalonado inverso
        for(let i = 0; i < 4; i++) {
            this.createWall(150 - (i * 30), 400 + (i * 40), 60, 40);
        }

        // Línea horizontal central (----)
        this.createWall(600, 450, 300, 40);

        // Columna final inclinada ( / )
        this.createWall(450, 550, 40, 150);

        // --- CONEXIONES ---

        // 🚪 VOLVER A BY3: Salida por abajo a la izquierda
        // Corregido: Al volver, apareces en el ángulo superior derecho de By3
        this.doorBack = this.add.rectangle(40, 560, 80, 80, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorBack, true);
        this.physics.add.overlap(this.player.sprite, this.doorBack, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            this.scene.start("By3Scene", { 
                spawnX: 730, // Cerca del ángulo superior derecho
                spawnY: 80 
            });
        });

        // 🚁 EXIT FINAL: Movido 80px a la derecha del centro (480, 300)
        this.exitTrigger = this.add.rectangle(680, 300, 180, 180, 0xffff00, 0.8);
        this.physics.add.existing(this.exitTrigger, true);
        
        this.physics.add.overlap(this.player.sprite, this.exitTrigger, () => {
            this.showWinScreen();
        });
    }

    showWinScreen() {
        this.physics.pause();
        this.canChangeRoom = false;

        const win = this.add.image(400, 300, "win_screen")
            .setDisplaySize(800, 600)
            .setDepth(1000)
            .setAlpha(0);

        this.tweens.add({
            targets: win,
            alpha: 1,
            duration: 2000,
            onComplete: () => {
                this.add.text(400, 500, "¡MISIÓN CUMPLIDA!", {
                    fontSize: "32px",
                    fill: "#ffffff",
                    stroke: "#000000",
                    strokeThickness: 6
                }).setOrigin(0.5).setDepth(1001);
            }
        });
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
