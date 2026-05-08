import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room8Scene extends BaseRoomScene {

    constructor() {
        super("Room8Scene");
    }

    preload() {
        this.load.image("background_r8", "src/background/bg_r8.png");
        // Cargamos al Sucker por si aparece en esta sala
        this.load.spritesheet("zombie_crawler", "src/assets/sucker.png", { 
            frameWidth: 199, 
            frameHeight: 282 
        });
    }

    create(data = {}) {
        this.add.image(400, 300, "background_r8").setDisplaySize(800, 600);

        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // --- PUERTAS ---

        // 🚪 IZQUIERDA: Volver a r7 (Desbloqueada)
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorLeft, true);
        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.scene.start("Room7Scene", { spawnX: 720, spawnY: 300 });
        });

        // 🚪 ARRIBA: Ir a by1 (BLOQUEADA - Requiere backyard_key)
        this.doorUp = this.add.rectangle(400, 20, 80, 10, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;

            if (PlayerState.inventory.includes("backyard_key")) {
                this.canChangeRoom = false;
                this.saveState();
                this.scene.start("By1Scene", { spawnX: 400, spawnY: 480 });
            } else {
                this.mostrarCartel("La puerta hacia el patio está cerrada. Necesitas la Backyard Key.");
                // Pequeño rebote para que no se quede pegado a la puerta
                this.player.sprite.y += 10; 
            }
        });

        // 🚪 DERECHA: Ir a r9 (Abierta)
        this.doorRight = this.add.rectangle(780, 300, 10, 80, 0xff00ff, 0.5);
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.scene.start("Room9Scene", { spawnX: 80, spawnY: 300 });
        });

        this.setupWalls();

        // 🧟 SPAWNER (Incluye a los 4 tipos)
        this.time.addEvent({
            delay: 2500,
            loop: true,
            callback: () => {
                if (this.zombies.children.entries.length < 6) {
                    this.spawnZombie();
                }
            }
        });
    }

    setupWalls() {
        // Inferior
        this.createWall(400, 560, 800, 80);
        // Superior (Hueco en x:400)
        this.createWall(160, 40, 320, 80); 
        this.createWall(640, 40, 320, 80); 
        // Izquierda (Hueco en y:300)
        this.createWall(40, 110, 80, 220); 
        this.createWall(40, 490, 80, 220); 
        // Derecha (Hueco en y:300)
        this.createWall(760, 110, 80, 220); 
        this.createWall(760, 490, 80, 220);
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650);
        const y = Phaser.Math.Between(150, 450);
        // Ahora el spawner elige entre los 4 tipos disponibles
        const type = Phaser.Math.RND.pick(["normal", "fast", "tank", "crawler"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
        zombie.sprite.setDepth(100);
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
