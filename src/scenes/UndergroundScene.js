import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class UndergroundScene extends BaseRoomScene {

    constructor() {
        super("UndergroundScene");
    }

    preload() {
        // Cargamos el fondo del sótano (si no lo tenés, podés usar bg_key temporalmente)
        this.load.image("background_under1", "src/background/bg_under1.png");
    }

    create(data = {}) {
        // 1. FONDO: Estilo sótano oscuro
        // Podés usar setTint(0x555555) para que se vea más oscuro aunque sea la misma imagen
        this.add.image(400, 300, "background_under1").setDisplaySize(800, 600).setTint(0x666666);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        // 3. LÓGICA
        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = true;

        // --- SALIDA (ESCALERA HACIA ARRIBA) ---

        // 🪜 La escalera está arriba en el medio (coincidiendo con la bajada de la Room 4)
        this.stairsUp = this.add.rectangle(400, 20, 80, 40, 0x555555, 0.8); 
        this.physics.add.existing(this.stairsUp, true);

        this.physics.add.overlap(this.player.sprite, this.stairsUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();

            // Volvemos a la Room 4
            this.scene.start("Room4Scene", {
                spawnX: 400, // Aparecemos en el centro de la Room 4
                spawnY: 350  // Un poco más abajo de la escalera para no re-entrar
            });
        });

        // --- PAREDES GRUESAS DEL SÓTANO (U1) ---

    // 1. PARED SUPERIOR (Abierta al medio para volver a la Room 4)
    // Bloque superior izquierdo
    this.createWall(160, 40, 320, 80); 
    // Bloque superior derecho
    this.createWall(640, 40, 320, 80); 
    // El hueco para subir por la escalera queda en x:400

    // 2. PARED INFERIOR (Sólida y gruesa)
    this.createWall(400, 560, 800, 80);

    // 3. PARED IZQUIERDA (Sólida y gruesa)
    this.createWall(40, 300, 80, 600);

    // 4. PARED DERECHA (Sólida y gruesa)
    this.createWall(760, 300, 80, 600);

    // --- EFECTO DE OSCURIDAD ---
    // Le damos un tinte oscuro a toda la escena para que se sienta bajo tierra
    this.cameras.main.setBackgroundColor('#000000');
    // Si ya cargaste el fondo, lo oscurecemos así:
    // this.background.setTint(0x444444);


        // 🧟 SPAWNER DE ZOMBIES (Más agresivos o más seguidos por ser el sótano)
        this.time.addEvent({
            delay: 1500, // Salen más rápido que en la superficie
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        
        // En el sótano hay más chance de que salgan Fast o Tanks
        const type = Phaser.Math.RND.pick(["normal", "fast", "fast", "tank"]);

        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
