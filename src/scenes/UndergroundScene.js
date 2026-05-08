import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class UndergroundScene extends BaseRoomScene {

    constructor() {
        super("UndergroundScene");
    }

    preload() {
        this.load.image("background_under1", "src/background/bg_under1.png");
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

        // --- 🔑 LA LLAVE (ID CARD) ---
        if (!PlayerState.inventory.includes("llave_norte")) {
            // Le damos profundidad (setDepth) para que se vea sobre las partículas
            this.keyItem = this.add.rectangle(700, 500, 20, 20, 0xffff00).setDepth(2000);
            this.physics.add.existing(this.keyItem, true);
            
            this.tweens.add({
                targets: this.keyItem,
                alpha: 0.3,
                duration: 500,
                yoyo: true,
                loop: -1
            });

            this.physics.add.overlap(this.player.sprite, this.keyItem, () => {
                PlayerState.inventory.push("llave_norte");
                
                // --- 📝 ACÁ LLAMAMOS AL CARTEL ---
                this.mostrarCartel("ENCONTRASTE ID CARD");

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
            this.scene.start("Room4Scene", { spawnX: 430, spawnY: 300 });
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

    // --- AGREGAMOS ESTA FUNCIÓN AL FINAL ---
    mostrarCartel(texto) {
        const cartel = this.add.text(400, 300, texto, {
            fontSize: "32px",
            fill: "#ffff00",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(3000);

        this.tweens.add({
            targets: cartel,
            y: 200,
            alpha: 0,
            duration: 2500,
            onComplete: () => cartel.destroy()
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
