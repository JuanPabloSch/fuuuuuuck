import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class RtopScene extends BaseRoomScene {
    constructor() {
        super("RtopScene");
    }

    preload() {
        this.load.image("background_rtop", "src/background/bg_rtop.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_rtop").setDisplaySize(800, 600);
        
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

        // --- PUERTA ---

        // 🚪 ABAJO: Volver a In2
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0xff0000, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            this.scene.start("In2Scene", { 
                spawnX: 400, 
                spawnY: 100 // Aparece arriba en In2, lejos de la puerta
            });
        });

        // --- PAREDES DE LA ROOFTOP (Extra Sólidas) ---

        // 1. PARED SUPERIOR (Extra ancha: 150px de grosor)
        // Esto da la sensación de que es el borde real del edificio
        this.createWall(400, 75, 800, 150);

        // 2. PAREDES LATERALES (Un poquito más gruesas: 100px)
        this.createWall(50, 300, 100, 600); // Izquierda
        this.createWall(750, 300, 100, 600); // Derecha

        // 3. PARED INFERIOR (Abierta al medio para volver a In2)
        // Bloque izquierdo inferior
        this.createWall(175, 560, 350, 80); 
        // Bloque derecho inferior
        this.createWall(625, 560, 350, 80); 
        // El hueco para bajar queda justo en el centro (x:400)


        // 🧟 ZOMBIES (Podemos poner solo voladores o rápidos por ser la azotea)
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const type = Phaser.Math.RND.pick(["fast", "normal"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
