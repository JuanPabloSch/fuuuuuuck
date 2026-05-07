import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class EscapeScene extends BaseRoomScene {

    constructor() {
        super("EscapeScene");
    }

    preload() {
        // Fondo de la zona de escape y la imagen de "Game Over / Victoria"
        this.load.image("background_escape", "src/background/bg_escape.png");
        this.load.image("win_screen", "src/background/win_screen.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_escape").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        // spawnX: 80, spawnY: 520 (según tu indicación de abajo a la izquierda)
        const x = data.spawnX ?? 80;
        const y = data.spawnY ?? 520;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- CONEXIONES ---

        // 🚪 ABAJO IZQUIERDA: Volver a by3
        this.doorBack = this.add.rectangle(40, 560, 80, 80, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorBack, true);
        this.physics.add.overlap(this.player.sprite, this.doorBack, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("By3Scene", { spawnX: 720, spawnY: 300 });
        });

        // 🚁 EXIT FINAL: Al medio de la pantalla
        this.exitTrigger = this.add.rectangle(400, 300, 100, 100, 0xffff00, 0.8);
        this.physics.add.existing(this.exitTrigger, true);
        
        this.physics.add.overlap(this.player.sprite, this.exitTrigger, () => {
            this.showWinScreen();
        });

        // En esta escena quizás no quieras zombies para que el jugador respire
    }

    showWinScreen() {
        // Pausamos las físicas
        this.physics.pause();
        
        // Ponemos la foto de "Juego Terminado / Victoria" arriba de todo
        const win = this.add.image(400, 300, "win_screen").setDisplaySize(800, 600);
        win.setDepth(1000); 
        win.setScrollFactor(0);

        this.add.text(400, 500, "Presiona F5 para volver a jugar", {
            fontSize: "24px",
            fill: "#ffffff"
        }).setOrigin(0.5).setDepth(1001);
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
