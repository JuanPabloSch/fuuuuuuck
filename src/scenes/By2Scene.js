import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By2Scene extends BaseRoomScene {

    constructor() {
        super("By2Scene");
    }

    preload() {
        // Cargamos el fondo del tramo medio del pasillo
        this.load.image("background_by2", "src/background/bg_by2.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_by2").setDisplaySize(800, 600);

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

        // 🚪 ABAJO: Volver a by1
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            this.scene.start("By1Scene", { 
                spawnX: 400, 
                spawnY: 150 
            });
        });

        // 🚪 ARRIBA: Ir a by3
        this.doorUp = this.add.rectangle(400, 20, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            this.scene.start("By3Scene", { 
                spawnX: 400, 
                spawnY: 480 
            });
        });

                // --- PAREDES DEL PASILLO BY2 (Vertical Estrecho) ---

        // 1. PAREDES LATERALES EXTRA GRUESAS (250px de ancho cada una)
        // Esto deja un pasillo central de solo 300px libres para moverte
        this.createWall(125, 300, 250, 600); // Pared Izquierda
        this.createWall(675, 300, 250, 600); // Pared Derecha

        // 2. PARED SUPERIOR (Abierta al medio para By3)
        // Bloque superior izquierdo
        this.createWall(125, 40, 250, 80); 
        // Bloque superior derecho
        this.createWall(675, 40, 250, 80); 
        // El hueco para subir queda en el centro (x:400)

        // 3. PARED INFERIOR (Abierta al medio para By1)
        // Bloque inferior izquierdo
        this.createWall(125, 560, 250, 80); 
        // Bloque inferior derecho
        this.createWall(675, 560, 250, 80); 
        // El hueco para bajar queda en el centro (x:400)

        // 🧟 SPAWNER
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650);
        const y = Phaser.Math.Between(100, 500);
        // Mezclamos un poco más de dificultad por ser el medio del pasillo
        const type = Phaser.Math.RND.pick(["normal", "fast"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
