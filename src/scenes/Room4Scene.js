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

        this.createWall(420, 230, 180, 40); 
        this.createWall(420, 370, 180, 40); 
        this.createWall(500, 300, 40, 180); 

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

        // 🚪 PUERTA IZQUIERDA (BLOQUEADA - Necesita llave_room5)
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0xff0000, 0.5); 
        this.physics.add.existing(this.doorLeft, true);
        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;

            if (PlayerState.inventory.includes("llave_room5")) {
                this.canChangeRoom = false;
                this.saveState();
                this.scene.start("Room5Scene", { spawnX: 700, spawnY: 300 });
            } else {
                console.log("Cerrado. Necesitás la llave de esta sección.");
            }
        });

        // 🪜 ESCALERA (HABILITADA - Baja al Sótano)
        this.stairs = this.add.rectangle(430, 300, 60, 40, 0x555555, 0.8);
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
