import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class RtopScene extends BaseRoomScene {
    constructor() {
        super("RtopScene");
    }

    preload() {
        this.load.image("background_rtop", "src/background/bg_rtop.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_rtop").setDisplaySize(800, 600);
        
        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 480; // Spawn ajustado para entrar desde abajo
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        // --- SEGURO DE ENTRADA ---
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES EXTRA SÓLIDAS ---
        this.createWall(400, 75, 800, 150);  // Techo extra grueso
        this.createWall(50, 300, 100, 600);  // Izquierda
        this.createWall(750, 300, 100, 600); // Derecha
        this.createWall(175, 560, 350, 80);  // Inferior Izq
        this.createWall(625, 560, 350, 80);  // Inferior Der

        // --- 🔑 LLAVE OESTE (WEST KEY) ---
        if (!PlayerState.inventory.includes("west_key")) {
            this.westKey = this.add.rectangle(250, 250, 20, 20, 0xffff00).setDepth(1000);
            this.physics.add.existing(this.westKey, true);
            
            // Brillo
            this.tweens.add({ targets: this.westKey, alpha: 0.4, duration: 600, yoyo: true, loop: -1 });

            this.physics.add.overlap(this.player.sprite, this.westKey, () => {
                PlayerState.inventory.push("west_key");
                this.mostrarCartel("ENCONTRASTE WEST KEY");
                this.westKey.destroy();
            });
        }

        // --- 🔫 PICKUP ESCOPETA (SHOTGUN) ---
        // Ponemos un cuadrado naranja o un sprite si tenés
        this.shotgunPickup = this.add.rectangle(550, 250, 40, 20, 0xffa500).setDepth(1000);
        this.physics.add.existing(this.shotgunPickup, true);

        this.physics.add.overlap(this.player.sprite, this.shotgunPickup, () => {
            PlayerState.weapons.shotgun = true;
            PlayerState.ammo.shotgun += 10; // Le damos unas balas de regalo
            this.mostrarCartel("NUEVA ARMA: SHOTGUN");
            this.shotgunPickup.destroy();
        });

        // --- PUERTA ABAJO ---
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0xff0000, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("In2Scene", { spawnX: 400, spawnY: 120 });
        });
    }

    mostrarCartel(texto) {
        const cartel = this.add.text(400, 300, texto, {
            fontSize: "32px",
            fill: "#ffffff",
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
