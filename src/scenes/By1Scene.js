import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By1Scene extends BaseRoomScene {

    constructor() {
        super("By1Scene");
    }

    preload() {
        // Cargamos el fondo del pasillo by1
        this.load.image("background_by1", "src/background/bg_by1.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_by1").setDisplaySize(800, 600);

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

        // 🚪 ABAJO: Volver a la r8
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Regresamos a la parte superior de la r8
            this.scene.start("Room8Scene", { 
                spawnX: 400, 
                spawnY: 100 
            });
        });

        // 🚪 ARRIBA: Ir a by2
        this.doorUp = this.add.rectangle(400, 20, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorUp, true);
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Vamos hacia la siguiente parte del pasillo
            this.scene.start("By2Scene", { 
                spawnX: 400, 
                spawnY: 480 
            });
        });

    // --- PAREDES DEL PASILLO BY1 (Con bloques extra arriba) ---

    // 1. PAREDES LATERALES BASE (Abajo)
    this.createWall(40, 450, 80, 300);   // Izquierda abajo
    this.createWall(760, 450, 80, 300);  // Derecha abajo

    // 2. BLOQUE EXTRA ARRIBA IZQUIERDA (Más grande)
    // x:100, w:200 lo hace sobresalir bastante hacia el centro
    this.createWall(100, 125, 200, 250); 

    // 3. BLOQUE EXTRA ARRIBA DERECHA
    // x:700, w:200 para que sea simétrico al de la izquierda
    this.createWall(700, 125, 200, 250); 

    // 4. PARED SUPERIOR (El "techo" que une los bloques con el hueco central)
    this.createWall(200, 25, 100, 50); // Unión izq
    this.createWall(600, 25, 100, 50); // Unión der
    // El hueco para subir a By2 queda justo en el centro (x:400)

    // 5. PARED INFERIOR (Abierta al medio para volver a r8)
    this.createWall(160, 575, 320, 50);
    this.createWall(640, 575, 320, 50);

        // 🧟 SPAWNER (Zona de pasillo, quizás menos zombies pero más rápidos)
        this.time.addEvent({
            delay: 2500,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650); // Pasillo más estrecho
        const y = Phaser.Math.Between(100, 500);
        const zombie = new Zombie(this, x, y, Phaser.Math.RND.pick(["normal", "fast"]));
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
