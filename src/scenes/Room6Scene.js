import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class Room6Scene extends BaseRoomScene {
    constructor() {
        super("Room6Scene");
    }

    preload() {
        this.load.image("background_room6", "src/background/bg_room6.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_room6").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 700;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES (La "C" que dibujamos antes) ---
        this.createWall(400, 40, 800, 80);  // Techo
        this.createWall(400, 560, 800, 80); // Suelo
        this.createWall(40, 300, 80, 600);  // Pared Fondo (Izq)
        this.createWall(760, 110, 80, 220); // Pared Der Superior
        this.createWall(760, 490, 80, 220); // Pared Der Inferior

        // Estructura C en el centro
        this.createWall(350, 230, 180, 40); // Techo C
        this.createWall(350, 370, 180, 40); // Piso C
        this.createWall(270, 300, 40, 180); // Fondo C

        // --- 🔑 LA LLAVE ESTE (EAST KEY) ---
        // Solo aparece si no la tenés
        if (!PlayerState.inventory.includes("llave_este")) {
            this.eastKey = this.add.rectangle(350, 300, 25, 25, 0xffff00).setDepth(1000);
            this.physics.add.existing(this.eastKey, true);

            // Brillo animado
            this.tweens.add({
                targets: this.eastKey,
                alpha: 0.4,
                duration: 600,
                yoyo: true,
                loop: -1
            });

            this.physics.add.overlap(this.player.sprite, this.eastKey, () => {
                PlayerState.inventory.push("llave_este");
                this.mostrarCartel("ENCONTRASTE EAST KEY");
                this.eastKey.destroy();
            });
        }

        // --- PUERTA (Volver a la Room 5) ---
        this.doorRight = this.add.rectangle(780, 300, 15, 100, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room5Scene", { spawnX: 80, spawnY: 300 });
        });
    }

    mostrarCartel(texto) {
        const cartel = this.add.text(400, 300, texto, {
            fontSize: "32px",
            fill: "#ffff00",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: cartel,
            y: 200,
            alpha: 0,
            duration: 2500,
            onComplete: () => cartel.destroy()
        });
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
