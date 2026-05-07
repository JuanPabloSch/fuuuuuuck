import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room1Scene extends BaseRoomScene {

    constructor() {
        super("Room1Scene");
    }

    preload() {
    // En tu preload
// 🖼️ Fondo de la primera habitación
    this.load.image("background_hub", "src/background/bg_hub.png");

    this.load.spritesheet("zombie_normal", "src/assets/zombie.png", {
        frameWidth: 168, // 672 dividido 4
        frameHeight: 253 // El alto total
    });

     // Zombie Fast (640x256) -> 640 / 4 = 160
    this.load.spritesheet("zombie_fast", "src/assets/zombie_fast.png", {
        frameWidth: 160, 
        frameHeight: 256 
    });

    // 🛡️ Zombie Tank (852x278)
    this.load.spritesheet("zombie_tank", "src/assets/tankzombie.png", {
        frameWidth: 213, 
        frameHeight: 278 
    });

    // Tu player
    this.load.spritesheet("player", "src/assets/player.png", {
        frameWidth: 168,
        frameHeight: 272
    });
    this.load.image("background_key", "src/background/bg_key.png");
    // ... y los spritesheets si no los cargaste antes
    // En el preload de Room3Scene (o donde cargues todo)
this.load.image("background_patio", "src/background/bg_patio.png");

}

create(data = {}) {
    // 1. EL FONDO: Lo obligamos a medir 800x600 (o el tamaño de tu juego)
    // Esto hace que la habitación se vea entera de un solo vistazo
    this.add.image(400, 300, "background_hub").setDisplaySize(800, 600);

    // 2. SPAWN Y BASE (Mantenemos los límites de 800x600)
    const x = data.spawnX ?? 400;
    const y = data.spawnY ?? 300;
    this.createBase(x, y);
    // Límites de la habitación (Ajustalos según veas que el personaje se choca)
// --- PAREDES DEL HUB (Diseño Octogonal/Cruciforme) ---

// 1. Paredes Superiores (dejando el hueco para la puerta de arriba)
this.createWall(200, 30, 300, 60);  // Esquina superior izquierda
this.createWall(600, 30, 300, 60);  // Esquina superior derecha

// 2. Paredes Laterales Superiores
this.createWall(30, 100, 60, 150);  // Costado superior izquierdo
this.createWall(770, 100, 60, 150); // Costado superior derecho

// 3. Paredes Laterales Inferiores
this.createWall(30, 500, 60, 150);  // Costado inferior izquierdo
this.createWall(770, 500, 60, 150); // Costado inferior derecho

// 4. Paredes Inferiores (dejando hueco abajo para la entrada)
this.createWall(200, 570, 320, 60); // Esquina inferior izquierda
this.createWall(600, 570, 320, 60); // Esquina inferior derecha

// 5. Diagonales (opcional, para suavizar las esquinas si el dibujo lo pide)
// Si ves que el jugador se traba, podés comentar estas:
this.createWall(100, 100, 80, 80); // Relleno esquina superior izq
this.createWall(700, 100, 80, 80); // Relleno esquina superior der
this.createWall(100, 500, 80, 80); // Relleno esquina inferior izq
this.createWall(700, 500, 80, 80); // Relleno esquina inferior der


// Ejemplo: Si tenés una mesa en el medio del dibujo en x:200 y:200
// this.createWall(200, 200, 100, 50); 


    // 3. LÓGICA DE LA HABITACIÓN
    this.physics.add.collider(this.zombies, this.zombies);
    this.player.hp = PlayerState.hp;

    // 4. LA PUERTA: Volvemos a las coordenadas que tenías antes (cerca de x:20 o x:780)
    this.doorLeft = this.add.rectangle(20, 300, 10, 60, 0x00ff00);
    this.physics.add.existing(this.doorLeft, true);

    this.canChangeRoom = true;

    this.physics.add.overlap(
        this.player.sprite,
        this.doorLeft,
        () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            this.scene.start("Room2Scene", {
                spawnX: 740, // Aparece cerca del borde derecho (800)
                spawnY: 300
            });
        }
    );
    // En el create de Room1Scene.js
    this.doorRight = this.add.rectangle(780, 300, 10, 80, 0x00ffff, 0.5);
    this.physics.add.existing(this.doorRight, true);
    this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
        if (!this.canChangeRoom) return;
        this.canChangeRoom = false;
        this.player.sprite.body.enable = false;
        this.saveState();
        this.scene.start("Room7Scene", { spawnX: 80, spawnY: 300 });
    });


    // Puerta ARRIBA (hacia in1)
    this.doorUp = this.add.rectangle(400, 20, 80, 10, 0x00ffff, 0.5);
    this.physics.add.existing(this.doorUp, true);

    this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
        if (!this.canChangeRoom) return;
        this.canChangeRoom = false;
        this.saveState();

        this.scene.start("In1Scene", { 
        spawnX: 400, 
        spawnY: 480 // <--- Bajamos el spawn para que no toque la puerta de abajo
    });
    
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

        const types = ["normal", "fast", "tank"];
        const type = Phaser.Math.RND.pick(types);

        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}