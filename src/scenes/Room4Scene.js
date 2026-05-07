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
        // 1. FONDO
        this.add.image(400, 300, "background_room4").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTAS ---

        // 🚪 PUERTA DERECHA (Vuelve al Patio)
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0x00ff00, 0.5); 
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room3Scene", { spawnX: 100, spawnY: 300 });
        });

        // 🚪 PUERTA IZQUIERDA (Hacia Room 5)
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0xff00ff, 0.5); 
        this.physics.add.existing(this.doorLeft, true);
        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room5Scene", { spawnX: 700, spawnY: 300 });
        });

        // 🪜 ESCALERA UNDERGROUND (En el centro)
        // La hacemos un poco más ancha para que sea fácil de embocar
        this.stairs = this.add.rectangle(400, 300, 60, 40, 0x555555, 0.8); 
        this.physics.add.existing(this.stairs, true);
        this.physics.add.overlap(this.player.sprite, this.stairs, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("UndergroundScene", { spawnX: 400, spawnY: 100 });
        });

    // --- PAREDES GRUESAS DE LA ROOM 4 ---

    // 1. PARED SUPERIOR (Sólida)
    this.createWall(400, 40, 800, 80);

    // 2. PARED INFERIOR (Sólida)
    this.createWall(400, 560, 800, 80);

    // 3. PARED IZQUIERDA (Abierta al medio para Room 5)
    this.createWall(40, 110, 80, 220); 
    this.createWall(40, 490, 80, 220);

    // 4. PARED DERECHA (Abierta al medio para volver al Patio)
    this.createWall(760, 110, 80, 220);
    this.createWall(760, 490, 80, 220);

    // --- ESTRUCTURA CENTRAL: LA "C" (Abertura a la izquierda) ---
    // El "techo" de la C
    this.createWall(420, 230, 180, 40); 
    // El "piso" de la C
    this.createWall(420, 370, 180, 40); 
    // El "fondo" de la C (Pared derecha que cierra la estructura)
    this.createWall(500, 300, 40, 180); 

    // La escalera queda dentro de la "C"
    // El jugador tiene que entrar desde la izquierda (x:330 aprox)
    this.stairs = this.add.rectangle(430, 300, 60, 40, 0x555555, 0.8);
    this.physics.add.existing(this.stairs, true);
    this.physics.add.overlap(this.player.sprite, this.stairs, () => {
        if (!this.canChangeRoom) return;
        this.canChangeRoom = false;
        this.saveState();
        this.scene.start("UndergroundScene", { spawnX: 400, spawnY: 100 });
    });


        // 🧟 ZOMBIES
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const zombie = new Zombie(this, x, y, Phaser.Math.RND.pick(["normal", "fast", "tank"]));
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
