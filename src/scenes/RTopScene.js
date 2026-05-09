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
        // --- 🌧️ EFECTO DE LLUVIA ---
        const rain = this.add.graphics();
        rain.fillStyle(0xffffff, 0.5);
        rain.fillRect(0, 0, 2, 10);
        rain.generateTexture('drop', 2, 10);
        rain.destroy();

        this.add.particles(0, 0, 'drop', {
            x: { min: 0, max: 800 },
            y: -10,
            lifespan: 2000,
            speedY: { min: 500, max: 700 }, // Un poco más rápida por la altura
            scale: { start: 0.5, end: 0.2 },
            quantity: 4, // Un poco más intensa que en el patio
            blendMode: 'ADD'
        }).setDepth(1500);

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
                this.mostrarCartel("Encontraste WEST KEY");
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
            this.mostrarCartel("Encontraste SHOTGUN");
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

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
