import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room6Scene extends BaseRoomScene {

    constructor() {
        super("Room6Scene");
    }

    preload() {
        // Cargamos el fondo de la habitación 6
        this.load.image("background_room6", "src/background/bg_room6.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_room6").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        // 3. LÓGICA
        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTAS ---

        // 🚪 PUERTA DERECHA (Vuelve a la Room 5)
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0x00ff00, 0.5); 
        this.physics.add.existing(this.doorRight, true);

        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            this.scene.start("Room5Scene", {
                spawnX: 100, // Entra por la izquierda de la Room 5
                spawnY: 300
            });
        });

        // --- PAREDES GRUESAS DE LA ROOM 6 ---

// 1. PARED SUPERIOR (Sólida)
this.createWall(400, 40, 800, 80);

// 2. PARED INFERIOR (Sólida)
this.createWall(400, 560, 800, 80);

// 3. PARED IZQUIERDA (Sólida - Es el final del camino)
this.createWall(40, 300, 80, 600);

// 4. PARED DERECHA (Abierta al medio para volver a la Room 5)
this.createWall(760, 110, 80, 220); 
this.createWall(760, 490, 80, 220);

        // --- ESTRUCTURA CENTRAL: LA "C" (Abertura hacia la derecha) ---
        // Esta C envuelve un objeto o zona en el centro-izquierdo de la sala
        // El jugador entra a la C desde el lado de la puerta (derecha)

        // Techo de la C
        this.createWall(350, 230, 180, 40); 
        // Piso de la C
        this.createWall(350, 370, 180, 40); 
        // Fondo de la C (Pared que cierra la estructura por la IZQUIERDA)
        this.createWall(270, 300, 40, 180); 

        // El "hueco" de la C queda libre para poner un ítem especial en (350, 300) aprox.


        // 🧟 SPAWNER DE ZOMBIES
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
