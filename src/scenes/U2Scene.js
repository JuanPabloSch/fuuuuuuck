import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class U2Scene extends BaseRoomScene {
    constructor() {
        super("U2Scene");
    }

    preload() {
        // Fondo y assets
        this.load.image("background_u2", "src/background/bg_u2.png");
        this.load.image("backyard_key", "src/assets/items/key_gold.png");
        // Para la neblina usamos el mismo fondo o una mancha blanca (fog)
        this.load.image("fog_cloud", "src/background/bg_u2.png"); 
    }

    create(data = {}) {
        // 1. FONDO ORIGINAL (Con el tinte que te gustó)
        this.add.image(400, 300, "background_u2").setDisplaySize(800, 600).setTint(0x555555);

        // 2. EFECTO HUMEDAD (Opción 2: Neblina Deslizable)
        // Creamos una capa superior que se mueve suavemente
        this.fog = this.add.image(400, 300, "background_u2");
        this.fog.setDisplaySize(1200, 900); // Más grande para que al moverse no se vean los bordes
        this.fog.setAlpha(0.15); // Muy sutil
        this.fog.setTint(0xaaaaaa); // Color humo/vapor
        this.fog.setBlendMode('ADD'); // Se mezcla con el fondo
        this.fog.setDepth(4500);

        // 3. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);
        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES GRUESAS (Tu diseño de Búnker) ---
        this.createWall(400, 560, 800, 80); // Abajo
        this.createWall(40, 300, 80, 600);  // Izquierda
        this.createWall(760, 300, 80, 600); // Derecha
        this.createWall(160, 40, 320, 80); 
        this.createWall(640, 40, 320, 80); 

        // --- ITEM: BACKYARD KEY ---
        if (!PlayerState.inventory.includes("backyard_key")) {
            this.keyItem = this.physics.add.sprite(650, 450, "backyard_key");
            this.physics.add.overlap(this.player.sprite, this.keyItem, () => {
                PlayerState.inventory.push("backyard_key");
                this.mostrarCartel("¡Obtenida Backyard Key! El camino al patio está libre.");
                this.keyItem.destroy();
            });
        }

        // --- CONEXIONES ---
        this.setupConexiones();

        // 🧟 SPAWNER
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    setupConexiones() {
        // 🪜 ESCALERA (Vuelve a r9)
        this.stairsUp = this.add.rectangle(400, 40, 80, 40, 0x555555, 0.8);
        this.physics.add.existing(this.stairsUp, true);
        this.physics.add.overlap(this.player.sprite, this.stairsUp, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("Room9Scene", { spawnX: 400, spawnY: 380 });
        });

        // 🛢️ EL CAÑO "O" (A U3)
        this.pipeU3 = this.add.rectangle(180, 150, 100, 100, 0x00ff00, 0.5); 
        this.physics.add.existing(this.pipeU3, true);
        this.physics.add.overlap(this.player.sprite, this.pipeU3, () => {
            if (!this.canChangeRoom) return;
            this.saveState();
            this.scene.start("U3Scene", { spawnX: 700, spawnY: 150 });
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650);
        const y = Phaser.Math.Between(150, 500);
        // Sótano profundo: Mezclamos tipos
        const type = Phaser.Math.RND.pick(["fast", "tank", "tank", "crawler"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
        zombie.sprite.setDepth(100);
    }

    update(time, delta) {
        this.updateBase(time, delta);

        // --- MOVIMIENTO DE LA NEBLINA ---
        if (this.fog) {
            this.fog.x = 400 + Math.sin(time / 2000) * 20;
            this.fog.y = 300 + Math.cos(time / 3000) * 15;
        }
    }
}
