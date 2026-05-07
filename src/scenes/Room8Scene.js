import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room8Scene extends BaseRoomScene {

    constructor() {
        super("Room8Scene");
    }

    preload() {
        this.load.image("background_r8", "src/background/bg_r8.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_r8").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        // --- SEGURO DE ENTRADA ---
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // --- PUERTAS ---

        // 🚪 IZQUIERDA: Volver a r7
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorLeft, true);
        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            this.scene.start("Room7Scene", { spawnX: 720, spawnY: 300 });
        });

        // 🚪 ARRIBA: Ir a by1
        this.doorUp = this.add.rectangle(400, 20, 80, 10, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            this.scene.start("By1Scene", { spawnX: 400, spawnY: 480 });
        });

        // 🚪 DERECHA: Ir a r9
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0xff00ff, 0.5);
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            this.scene.start("Room9Scene", { spawnX: 80, spawnY: 300 });
        });

        // --- PAREDES GRUESAS DEL NODO (r8) ---

        // 1. PARED INFERIOR (Totalmente sólida y gruesa)
        this.createWall(400, 560, 800, 80);

        // 2. PARED SUPERIOR (Abierta al medio para ir a by1)
        this.createWall(160, 40, 320, 80); // Bloque superior izquierdo
        this.createWall(640, 40, 320, 80); // Bloque superior derecho
        // Hueco para by1 en x:400

        // 3. PARED IZQUIERDA (Abierta al medio para volver a r7)
        this.createWall(40, 110, 80, 220); // Bloque superior
        this.createWall(40, 490, 80, 220); // Bloque inferior
        // Hueco para r7 en y:300

        // 4. PARED DERECHA (Abierta al medio para ir a r9)
        this.createWall(760, 110, 80, 220); // Bloque superior
        this.createWall(760, 490, 80, 220); // Bloque inferior
        // Hueco para r9 en y:300


        // 🧟 SPAWNER
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const type = Phaser.Math.RND.pick(["normal", "fast", "tank"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
