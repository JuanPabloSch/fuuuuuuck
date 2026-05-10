import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class RtopScene extends BaseRoomScene {
    constructor() {
        super("RtopScene");
    }

    preload() {
        this.load.image("background_rtop", "src/background/bg_rtop.png");
        this.load.image("icon_shotgun", "src/assets/ui/icon_shotgun.png");
        this.load.image("icon_llave_este", "src/assets/ui/icon_llave_este.png");
        super.preload();
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

// --- 🔫 PICKUP: SHOTGUN ---
if (!PlayerState.weapons.shotgun) {
    this.shotgunItem = this.physics.add.sprite(200, 300, "icon_shotgun");
    this.shotgunItem.setScale(0.6).setDepth(2000);
    
    // Animación de brillo/levitación
    this.tweens.add({
        targets: this.shotgunItem,
        y: 290,
        duration: 1000,
        yoyo: true,
        loop: -1
    });

    this.physics.add.overlap(this.player.sprite, this.shotgunItem, () => {
        PlayerState.weapons.shotgun = true;
        PlayerState.ammo.shotgun += 10; // Carga inicial
        this.mostrarCartel("Obtuviste la Shot Gun");
        this.shotgunItem.destroy();
    });
}

// --- 🔑 PICKUP: EAST KEY ---
if (!PlayerState.inventory.includes("llave_este")) {
    this.eastKey = this.physics.add.sprite(600, 300, "icon_llave_este");
    this.eastKey.setScale(0.5).setDepth(2000);

    this.tweens.add({
        targets: this.eastKey,
        y: 295,
        duration: 800,
        yoyo: true,
        loop: -1
    });

    this.physics.add.overlap(this.player.sprite, this.eastKey, () => {
        PlayerState.inventory.push("llave_este");
        this.mostrarCartel("Encontraste: East Key");
        this.eastKey.destroy();
    });
}


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
