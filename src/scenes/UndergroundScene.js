import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class UndergroundScene extends BaseRoomScene {

    constructor() {
        super("UndergroundScene");
    }

    preload() {
        this.load.image("background_under1", "src/background/bg_under1.png");
        this.load.image("icon_llave_norte", "src/assets/ui/icon_llave_norte.png");
        super.preload();
    }

    create(data = {}) {
        // 1. FONDO Y OSCURIDAD
        this.add.image(400, 300, "background_under1").setDisplaySize(800, 600).setTint(0x444444);
        this.cameras.main.setBackgroundColor('#000000');

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 150; 
        this.createBase(x, y);

        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        // --- PAREDES GRUESAS ---
        this.createWall(160, 40, 320, 80); 
        this.createWall(640, 40, 320, 80); 
        this.createWall(400, 560, 800, 80);
        this.createWall(40, 300, 80, 600);
        this.createWall(760, 300, 80, 600);

        // --- PARTÍCULAS ---
        this.add.particles(0, 0, 'bullet', { 
            x: { min: 0, max: 800 },
            y: { min: 0, max: 600 },
            speed: { min: 10, max: 30 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.3, end: 0 },
            lifespan: 4000,
            quantity: 1,
            frequency: 100,
            blendMode: 'ADD'
        });

    // --- 🔑 ITEM: NORTH KEY (ID CARD) ---
    if (!PlayerState.inventory.includes("llave_norte")) {
        // 1. Cargamos el sprite (Asegúrate que el nombre coincida con el preload)
        this.keyItem = this.physics.add.sprite(700, 500, "icon_llave_norte");
        
        // 2. Ajustamos el tamaño según tus PNGs (ej: 0.5 si son muy grandes)
        this.keyItem.setScale(0.5); 
        this.keyItem.setDepth(2000); // Sobre las partículas
        
        // 3. Animación de "levitación" para que se vea que es un item
        this.tweens.add({
            targets: this.keyItem,
            y: 490, // Sube 10 píxeles
            duration: 800,
            yoyo: true,
            loop: -1,
            ease: 'Sine.easeInOut'
        });

        // 4. Lógica de recolección
        this.physics.add.overlap(this.player.sprite, this.keyItem, () => {
            PlayerState.inventory.push("llave_norte");
            
            // Cartel prolijo abajo
            this.mostrarCartel("Encontraste: North Key");

            this.keyItem.destroy();
        });
    }


        // --- SALIDA ---
        this.stairsUp = this.add.rectangle(400, 20, 80, 40, 0x555555, 0.8); 
        this.physics.add.existing(this.stairsUp, true);
        this.physics.add.overlap(this.player.sprite, this.stairsUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room4Scene", { spawnX: 330, spawnY: 300 });
        });

        // 🧟 SPAWNER ACELERADO
        this.time.addEvent({
            delay: 1000, 
            loop: true,
            callback: () => {
                if (this.zombies.getLength() < 12) {
                    this.spawnZombie();
                }
            }
        });
    }

    spawnZombie() {
        let x, y;
        do {
            x = Phaser.Math.Between(120, 680);
            y = Phaser.Math.Between(120, 480);
        } while (Phaser.Math.Distance.Between(x, y, this.player.sprite.x, this.player.sprite.y) < 180);

        const z = new Zombie(this, x, y, "fast");
        this.zombies.add(z.sprite);
        z.sprite.ref = z;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
