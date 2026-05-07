import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room2Scene extends BaseRoomScene {

    constructor() {
        super("Room2Scene");
    }

create(data = {}) {
    // 1. FONDO: Lo achicamos al tamaño de la pantalla (800x600)
    // Usamos "background_key" que cargamos en el preload
    this.add.image(400, 300, "background_key").setDisplaySize(800, 600);

    // 2. SPAWN Y BASE
    const x = data.spawnX ?? 400;
    const y = data.spawnY ?? 300;
    this.createBase(x, y);

    // 3. LÓGICA DE LA HABITACIÓN
    this.physics.add.collider(this.zombies, this.zombies);
    this.player.hp = PlayerState.hp;

// --- PAREDES GRUESAS Y ESQUINAS SÓLIDAS (Room 2) ---

// 1. LAS 4 ESQUINAS (Los cuadrados que no se pueden pisar)
this.createWall(80, 80, 160, 160);   // Esquina Superior Izquierda
this.createWall(720, 80, 160, 160);  // Esquina Superior Derecha
this.createWall(80, 520, 160, 160);  // Esquina Inferior Izquierda
this.createWall(720, 520, 160, 160); // Esquina Inferior Derecha

// 2. PARED IZQUIERDA (Sólida y gruesa)
this.createWall(40, 300, 80, 600);

// 3. PARED INFERIOR (Sólida y gruesa)
this.createWall(400, 560, 800, 80);

// 4. PARED SUPERIOR (Abierta SOLO en el medio para el Patio)
// Bloque que une la esquina izq con el centro
this.createWall(220, 40, 120, 80); 
// Bloque que une la esquina der con el centro
this.createWall(580, 40, 120, 80); 
// El hueco para subir queda entre x:340 y x:460

// 5. PARED DERECHA (Abierta SOLO en el medio para el Hub)
// Bloque que une la esquina sup con el centro
this.createWall(760, 220, 80, 120);
// Bloque que une la esquina inf con el centro
this.createWall(760, 380, 80, 120);
// El hueco para ir a la derecha queda entre y:280 y y:320



    // 4. PUERTA DERECHA (Para volver a la Room 1)
    // La ponemos en el borde derecho (780)
    this.doorRight = this.add.rectangle(780, 300, 10, 60, 0xff0000);
    this.physics.add.existing(this.doorRight, true);

    this.canChangeRoom = true;

    this.physics.add.overlap(
        this.player.sprite,
        this.doorRight, // Corregido: antes decía doorLeft
        () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            // Volvemos a la Room 1
            this.scene.start("Room1Scene", {
                spawnX: 100, // Aparecemos lejos de la puerta izquierda de Room 1
                spawnY: 300
            });
        }
    );

    // 🧟 EVENTO DE ZOMBIES (Opcional si querés zombies acá también)
    this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => this.spawnZombie()
    });

    // En el create de Room2Scene.js
    this.doorUp = this.add.rectangle(400, 20, 80, 10, 0x0000ff); // Azul para diferenciar
    this.physics.add.existing(this.doorUp, true);

    this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
    if (!this.canChangeRoom) return;
    this.canChangeRoom = false;
    this.saveState();

    this.scene.start("Room3Scene", {
        spawnX: 400, // Mismo X para que parezca que entraste derecho
        spawnY: 530  // Apareces abajo en la nueva habitación
    });
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