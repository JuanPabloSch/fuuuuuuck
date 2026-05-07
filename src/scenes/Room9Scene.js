import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room9Scene extends BaseRoomScene {

    constructor() {
        super("Room9Scene");
    }

    preload() {
        this.load.image("background_r9", "src/background/bg_r9.png");
    }

    create(data = {}) {
        this.add.image(400, 300, "background_r9").setDisplaySize(800, 600);

        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // --- PAREDES GRUESAS DE LA r9 ---

// 1. PARED SUPERIOR (Sólida y gruesa)
this.createWall(400, 40, 800, 80);

// 2. PARED INFERIOR (Sólida y gruesa)
this.createWall(400, 560, 800, 80);

// 3. PARED DERECHA (Sólida y gruesa - Final del ala este)
this.createWall(760, 300, 80, 600);

// 4. PARED IZQUIERDA (Abierta al medio para volver a la r8)
this.createWall(40, 110, 80, 220); 
this.createWall(40, 490, 80, 220);
// Hueco para r8 en y:300

// --- ESTRUCTURA CENTRAL: LA "U" INVERTIDA (Escalera a u2) ---
// La abertura de la U mira hacia ABAJO.

// Techo de la U
this.createWall(400, 230, 180, 40); 
// Pared Izquierda de la U
this.createWall(310, 300, 40, 150); 
// Pared Derecha de la U
this.createWall(490, 300, 40, 150); 

// La colisión de la escalera queda dentro de la "U"
// El jugador entra desde abajo (y:380 aprox)
this.stairsU2 = this.add.rectangle(400, 290, 60, 40, 0x555555, 0.8);
this.physics.add.existing(this.stairsU2, true);
this.physics.add.overlap(this.player.sprite, this.stairsU2, () => {
    if (!this.canChangeRoom) return;
    this.canChangeRoom = false;
    this.saveState();
    this.scene.start("U2Scene", { spawnX: 400, spawnY: 100 });
});


        // --- PUERTAS ---

        // 🚪 IZQUIERDA: Volver a r8
        this.doorLeft = this.add.rectangle(20, 300, 10, 80, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorLeft, true);
        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            this.scene.start("Room8Scene", { spawnX: 720, spawnY: 300 });
        });

        // 🪜 ESCALERA AL SÓTANO 2 (u2): JUSTO EN EL MEDIO
        // Ponemos el rectángulo donde esté dibujada la escalera en tu PNG
        this.stairsDown = this.add.rectangle(400, 300, 60, 40, 0x555555, 0.8);
        this.physics.add.existing(this.stairsDown, true);
        this.physics.add.overlap(this.player.sprite, this.stairsDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            // Bajamos a U2Scene
            this.scene.start("U2Scene", { 
                spawnX: 400, 
                spawnY: 100 // Aparece arriba en el sótano como si bajara
            });
        });

        // 🧟 SPAWNER
        this.time.addEvent({
            delay: 2200,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const zombie = new Zombie(this, x, y, Phaser.Math.RND.pick(["normal", "tank"]));
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
