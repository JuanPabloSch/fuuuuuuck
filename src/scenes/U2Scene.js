import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class U2Scene extends BaseRoomScene {

    constructor() {
        super("U2Scene");
    }

    preload() {
        // Cargamos el fondo del sótano 2
        this.load.image("background_u2", "src/background/bg_u2.png");
    }

create(data = {}) {
    // 1. FONDO
    this.add.image(400, 300, "background_u2").setDisplaySize(800, 600).setTint(0x555555);

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

    // --- PAREDES GRUESAS (Búnker) ---
    this.createWall(400, 560, 800, 80); // Abajo
    this.createWall(40, 300, 80, 600);  // Izquierda
    this.createWall(760, 300, 80, 600); // Derecha
    
    // Pared Superior con hueco para escalera en el centro
    this.createWall(160, 40, 320, 80); 
    this.createWall(640, 40, 320, 80); 

    // --- CONEXIONES ---

    // 🪜 ESCALERA AL MEDIO (Vuelve a r9)
    this.stairsUp = this.add.rectangle(400, 40, 80, 40, 0x555555, 0.8);
    this.physics.add.existing(this.stairsUp, true);
    this.physics.add.overlap(this.player.sprite, this.stairsUp, () => {
        if (!this.canChangeRoom) return;
        this.canChangeRoom = false;
        this.player.sprite.body.enable = false;
        this.saveState();
        this.scene.start("Room9Scene", { spawnX: 400, spawnY: 380 });
    });

    // 🛢️ EL CAÑO "O" (Ajustado: más a la izquierda y más grande)
    // x: 180 (más a la izquierda), y: 150, ancho: 100, alto: 100
    this.pipeU3 = this.add.rectangle(180, 150, 100, 100, 0x00ff00, 0.5); 
    this.physics.add.existing(this.pipeU3, true);
    this.physics.add.overlap(this.player.sprite, this.pipeU3, () => {
        if (!this.canChangeRoom) return;
        this.canChangeRoom = false;
        this.player.sprite.body.enable = false;
        this.saveState();
        
        // Vamos a la U3
        this.scene.start("U3Scene", { 
            spawnX: 700, 
            spawnY: 150 
        });
    });

    // 🧟 SPAWNER
    this.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => this.spawnZombie()
    });
}



    spawnZombie() {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        // Sótano profundo: Más chance de Tanks y Fasts
        const type = Phaser.Math.RND.pick(["fast", "tank", "tank", "normal"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
