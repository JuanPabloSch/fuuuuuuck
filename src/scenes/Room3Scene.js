import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room3Scene extends BaseRoomScene {

    constructor() {
        super("Room3Scene");
    }

    preload() {
        // Cargamos el fondo del Patio
        this.load.image("background_patio", "src/background/bg_patio.png");
        super.preload();
    }

    create(data = {}) {
        super.create(data);
        this.updateMusic("song1");

        // --- SONIDO DE LLUVIA ---
    // Verificamos si ya está sonando para no duplicarlo
    if (!this.sound.get("rain_ambient")) {
        this.rainSound = this.sound.add("rain_ambient", { 
            volume: 0.5, 
            loop: true 
        });
        this.rainSound.play();
    }
    // 1. FONDO
    this.add.image(400, 300, "background_patio").setDisplaySize(800, 600);

    // 2. SPAWN Y BASE
    const x = data.spawnX ?? 400;
    const y = data.spawnY ?? 300;
    this.createBase(x, y);

    // 3. LÓGICA
    this.physics.add.collider(this.zombies, this.zombies);
    this.player.hp = PlayerState.hp;
    this.canChangeRoom = true;

    // --- PAREDES GRUESAS DEL PATIO ---
    this.createWall(400, 40, 800, 80);
    this.createWall(760, 300, 80, 600);
    this.createWall(40, 110, 80, 220); 
    this.createWall(40, 490, 80, 220); 
    this.createWall(160, 560, 320, 80); 
    this.createWall(640, 560, 320, 80); 

    // --- 🛡️ TANKS DE ENTRADA (Mecánica nueva) ---
    // Aparecen 3 Tanks en el centro para darte la bienvenida
    const tankPositions = [{x: 300, y: 200}, {x: 500, y: 200}, {x: 400, y: 350}];
    tankPositions.forEach(pos => {
        const tank = new Zombie(this, pos.x, pos.y, "tank");
        this.zombies.add(tank.sprite);
        tank.sprite.ref = tank;
    });

// --- 🚪 PUERTA ABAJO ---
    this.doorDown = this.add.rectangle(400, 570, 100, 30, 0xffff00, 0);
    this.physics.add.existing(this.doorDown, true);
    this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
        if (!this.canChangeRoom) return;
        
        // El "if (this.rainSound)" evita que el juego explote si el sonido no cargó
        if (this.rainSound) this.rainSound.stop();
        
        this.canChangeRoom = false;
        this.saveState();
        this.scene.start("Room2Scene", { spawnX: 400, spawnY: 150 });
    });

    // --- 🚪 PUERTA IZQUIERDA ---
    this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0xff00ff, 0);
    this.physics.add.existing(this.doorLeft, true);
    this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
        if (!this.canChangeRoom) return;

        if (this.rainSound) this.rainSound.stop();

        this.canChangeRoom = false;
        this.saveState();
        this.scene.start("Room4Scene", { spawnX: 700, spawnY: 300 });
    });


    // --- LLUVIA ---
    const rain = this.add.graphics();
    rain.fillStyle(0xffffff, 0.5);
    rain.fillRect(0, 0, 2, 10);
    rain.generateTexture('drop', 2, 10);
    rain.destroy();

    this.add.particles(0, 0, 'drop', {
        x: { min: 0, max: 800 },
        y: -10,
        lifespan: 2000,
        speedY: { min: 400, max: 600 },
        scale: { start: 0.5, end: 0.2 },
        quantity: 3,
        blendMode: 'ADD'
    }).setDepth(1000);

        // 🧟 SPAWNER ACELERADO
    this.time.addEvent({
        delay: 2000, // <--- 1.5 segundos entre cada zombie
        loop: true,
        callback: () => this.spawnZombie()
    });

}


    spawnZombie() {
        // 1. Definimos la posición (evitando los bordes de las paredes gruesas de 80px)
        let x, y;
        do {
            x = Phaser.Math.Between(120, 680);
            y = Phaser.Math.Between(120, 480);
        // 2. Condición para que no te aparezcan encima (distancia de 200px)
        } while (Phaser.Math.Distance.Between(x, y, this.player.sprite.x, this.player.sprite.y) < 200);

        // 3. Mezcla de Tanks y Normales (50/50 de probabilidad)
        const types = ["normal", "tank"];
        const type = Phaser.Math.RND.pick(types);

        // 4. Creación del zombie
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }


    update(time, delta) {
        this.updateBase(time, delta);
    }
}
