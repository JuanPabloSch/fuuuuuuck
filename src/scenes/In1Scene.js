import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class In1Scene extends BaseRoomScene {
    constructor() {
        super("In1Scene");
    }

    preload() {
        this.load.image("background_in1", "src/background/bg_in1.png");
    }

    create(data = {}) {
        this.add.image(400, 300, "background_in1").setDisplaySize(800, 600);
        
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTAS ---

        // 🚪 ABAJO: Volver al Hub (Room1)
        this.doorDown = this.add.rectangle(400, 580, 80, 10, 0x00ffff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room1Scene", { 
            spawnX: 400, 
            spawnY: 150 // <--- Lo alejamos de la puerta de arriba (que está en y:20)
        });

        });

        // 🚪 ARRIBA: Ir a in2
        this.doorUp = this.add.rectangle(400, 20, 80, 10, 0xffa500, 0.5); // Naranja
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("In2Scene", { spawnX: 400, spawnY: 450 });
        });

        // --- PAREDES GRUESAS DEL PASILLO VERTICAL (In1) ---

        // 1. PARED IZQUIERDA (Sólida de punta a punta)
        this.createWall(40, 300, 80, 600);

        // 2. PARED DERECHA (Sólida de punta a punta)
        this.createWall(760, 300, 80, 600);

        // 3. PARED SUPERIOR (Abierta al medio para ir a In2)
        // Bloque izquierdo
        this.createWall(160, 40, 320, 80); 
        // Bloque derecho
        this.createWall(640, 40, 320, 80); 
        // El hueco para subir queda en el centro (x:400)

        // 4. PARED INFERIOR (Abierta al medio para volver al Hub)
        // Bloque izquierdo
        this.createWall(160, 560, 320, 80);
        // Bloque derecho
        this.createWall(640, 560, 320, 80);
        // El hueco para bajar queda en el centro (x:400)


        // 🧟 Spawner
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const zombie = new Zombie(this, x, y, Phaser.Math.RND.pick(["normal", "fast"]));
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
