import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room3Scene extends BaseRoomScene {

    constructor() {
        super("Room3Scene");
    }

    preload() {
        // Cargamos el fondo del Patio
        this.load.image("background_patio", "src/background/bg_patio.png");
    }

    create(data = {}) {
        // 1. FONDO: Ajustado a 800x600 como las anteriores
        this.add.image(400, 300, "background_patio").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        // 3. LÓGICA
        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- PUERTAS ---

        // 🚪 PUERTA ABAJO (Vuelve a la Room 2)
        this.doorDown = this.add.rectangle(400, 580, 80, 10, 0xffff00); // Amarillo
        this.physics.add.existing(this.doorDown, true);

        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            this.scene.start("Room2Scene", {
                spawnX: 400,
                spawnY: 100 // Aparece abajo de la puerta superior de la Room 2
            });
        });

        // 🚪 PUERTA IZQUIERDA (Para ir a la futura Room 4)
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0xff00ff); // Violeta
        this.physics.add.existing(this.doorLeft, true);

        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            // Esto asume que crearás una Room4Scene después
            this.scene.start("Room4Scene", {
                spawnX: 700, 
                spawnY: 300
            });
        });

 // --- PAREDES GRUESAS DEL PATIO (Room 3) ---

    // 1. PARED SUPERIOR (Sólida y gruesa)
    this.createWall(400, 40, 800, 80);

    // 2. PARED DERECHA (Sólida y gruesa)
    this.createWall(760, 300, 80, 600);

    // 3. PARED IZQUIERDA (Abierta al medio para ir a la Room 4)
    // Bloque que va desde el techo hasta la puerta
    this.createWall(40, 110, 80, 220); 
    // Bloque que va desde el piso hasta la puerta
    this.createWall(40, 490, 80, 220); 
    // El hueco queda libre entre y:220 y y:380 aproximadamente

    // 4. PARED INFERIOR (Abierta al medio para volver a la Room 2)
    this.createWall(160, 560, 320, 80); 
    this.createWall(640, 560, 320, 80); 
    // El hueco queda libre en el centro x:400


        // Creamos la lluvia usando un rectángulo blanco chiquito como gota
        const rain = this.add.graphics();
        rain.fillStyle(0xffffff, 0.5);
        rain.fillRect(0, 0, 2, 10);
        rain.generateTexture('drop', 2, 10);
        rain.destroy();

        this.add.particles(0, 0, 'drop', {
            x: { min: 0, max: 800 },
            y: -10,
            lifespan: 2000,
            speedY: { min: 400, max: 600 },
            scale: { start: 0.5, end: 0.2 },
            quantity: 3,
            blendMode: 'ADD'
        }).setDepth(1000); // Para que caiga por encima de los zombies


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
