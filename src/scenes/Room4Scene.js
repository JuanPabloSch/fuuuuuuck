import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room4Scene extends BaseRoomScene {
    constructor() {
        super("Room4Scene");
    }

    preload() {
        this.load.image("background_room4", "src/background/bg_room4.png");
    }

    create(data = {}) {
        this.add.image(400, 300, "background_room4").setDisplaySize(800, 600);

        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES GRUESAS Y "C" ---
        this.createWall(400, 40, 800, 80);  
        this.createWall(400, 560, 800, 80); 
        this.createWall(40, 110, 80, 220);  this.createWall(40, 490, 80, 220); 
        this.createWall(760, 110, 80, 220); this.createWall(760, 490, 80, 220); 

        this.createWall(420, 280, 180, 40); // Techo de la "U" (bajó de 230 a 280)
        this.createWall(420, 420, 180, 40); // Base de la "U" (bajó de 370 a 420)
        this.createWall(500, 350, 40, 180); // Lado derecho (bajó de 300 a 350)

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

        // --- PUERTAS ---

        // 🚪 PUERTA DERECHA (ABIERTA - Vuelve al Patio)
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0x00ff00, 0.5); 
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room3Scene", { spawnX: 130, spawnY: 300 });
        });

        // --- En Room4Scene.js ---

    // 🚪 PUERTA IZQUIERDA (BLOQUEADA - Ahora pide west_key)
    this.doorLeft = this.add.rectangle(60, 300, 10, 100, 0xff0000, 0.5); 
    this.physics.add.existing(this.doorLeft, true);

    this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
        if (!this.canChangeRoom) return;

    // IMPORTANTE: El nombre tiene que ser "west_key" igual que en la Rooftop
    if (PlayerState.inventory.includes("west_key")) {
        this.canChangeRoom = false;
        this.saveState();
        this.scene.start("Room5Scene", { 
            spawnX: 720, // Apareces a la derecha en la Room 5
            spawnY: 300 
        });
    } else {
        this.mostrarCartel("Cerrado");
        // Opcional: podrías mostrar un pequeño texto en pantalla aquí también
    }
});


        // 🪜 ESCALERA (HABILITADA - Baja al Sótano)
        this.stairs = this.add.rectangle(430, 350, 80, 60, 0x555555, 0.8);
        this.physics.add.existing(this.stairs, true);
        this.physics.add.overlap(this.player.sprite, this.stairs, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("UndergroundScene", { spawnX: 400, spawnY: 150 });
        });

        // 🧟 ZOMBIES (Solo Tank y Normal)
        this.time.addEvent({
            delay: 1500, 
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        let x, y;
        do {
            x = Phaser.Math.Between(150, 650);
            y = Phaser.Math.Between(150, 450);
        } while (Phaser.Math.Distance.Between(x, y, this.player.sprite.x, this.player.sprite.y) < 200);

        const type = Phaser.Math.RND.pick(["normal", "tank"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
