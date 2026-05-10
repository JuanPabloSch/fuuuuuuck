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
        frameWidth: 100, 
        frameHeight: 130 
    });

     // Zombie Fast (640x256) -> 640 / 4 = 160
    this.load.spritesheet("zombie_fast", "src/assets/zombie_fast.png", {
        frameWidth: 100, 
        frameHeight: 130 
    });

    // 🛡️ Zombie Tank (852x278)
    this.load.spritesheet("zombie_tank", "src/assets/tankzombie.png", {
        frameWidth: 100, 
        frameHeight: 140 
    });

        // Spritesheets de movimiento
    this.load.spritesheet("player_pistol", "src/assets/player_pistol.png", { frameWidth: 100, frameHeight: 130 });
    this.load.spritesheet("player_rifle", "src/assets/player_rifle.png", { frameWidth: 100, frameHeight: 130 });
    this.load.spritesheet("player_shotgun", "src/assets/player_shotgun.png", { frameWidth: 110, frameHeight: 130 });
    this.load.spritesheet("player_rocket", "src/assets/player_rocket.png", { frameWidth: 110, frameHeight: 120 });

    // Imagen de muerte (1 solo frame)
    this.load.image("player_dead", "src/assets/player_dead.png");

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

    // --- OBSTÁCULOS DE PLANTAS (Centro del Hub) ---
    // Los posicionamos de forma simétrica alrededor del centro (400, 300)

// --- OBSTÁCULOS DE PLANTAS (Más juntas en el centro) ---
// Posiciones ajustadas para cerrar el cuadrado central

    this.createWall(330, 250, 40, 40); // Planta Superior Izquierda
    this.createWall(470, 250, 40, 40); // Planta Superior Derecha
    this.createWall(330, 350, 40, 40); // Planta Inferior Izquierda
    this.createWall(470, 350, 40, 40); // Planta Inferior Derecha

        // 3. LÓGICA DE LA HABITACIÓN
    this.physics.add.collider(this.zombies, this.zombies);
    this.player.hp = PlayerState.hp;

    // --- SEGURO DE ENTRADA (Agregalo para que no falle el canChangeRoom) ---
    this.canChangeRoom = false;
    this.time.delayedCall(500, () => { this.canChangeRoom = true; });

    // 4. LAS PUERTAS

    // 🚪 Puerta IZQUIERDA (ABIERTA - Room 2)
    // Aumentamos el alto a 100 y subimos el centro a 280
    this.doorLeft = this.add.rectangle(20, 280, 10, 100, 0x00ff00, 0.5);
    this.physics.add.existing(this.doorLeft, true);
    this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
        if (!this.canChangeRoom) return;
        this.canChangeRoom = false;
        this.saveState();
        this.scene.start("Room2Scene", { spawnX: 740, spawnY: 300 });
    });

    // 🚪 Puerta DERECHA (BLOQUEADA - Room 7)
    this.doorRight = this.add.rectangle(780, 280, 10, 100, 0xff0000, 0.5); // Roja para indicar bloqueo
    this.physics.add.existing(this.doorRight, true);
    this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
        if (!this.canChangeRoom) return;
        
        // Solo pasa si tiene la llave en PlayerState.inventory
        if (PlayerState.inventory.includes("llave_este")) {
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            this.scene.start("Room7Scene", { spawnX: 80, spawnY: 300 });
        } else {
            this.mostrarCartel("Puerta Cerrada");
        }
    });

    // 🚪 Puerta ARRIBA (BLOQUEADA - In 1)
    this.doorUp = this.add.rectangle(400, 20, 80, 10, 0xff0000, 0.5); // Roja
    this.physics.add.existing(this.doorUp, true);
    this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
        if (!this.canChangeRoom) return;

        if (PlayerState.inventory.includes("llave_norte")) {
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("In1Scene", { spawnX: 400, spawnY: 480 });
        } else {
            this.mostrarCartel("Parece cerrada con llave");
        }
    });


    // 🧟 ZOMBIES
    this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => this.spawnZombie()
    });
}

spawnZombie() {
    // Definimos la posición al azar
    const x = Phaser.Math.Between(150, 650);
    const y = Phaser.Math.Between(150, 450);

    // FORZAMOS el tipo "normal" (así no salen los otros por ahora)
    const type = "normal"; 

    const zombie = new Zombie(this, x, y, type);
    this.zombies.add(zombie.sprite);
    zombie.sprite.ref = zombie;
}


    update(time, delta) {
        this.updateBase(time, delta);
    }
}