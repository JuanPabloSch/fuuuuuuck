import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class U2Scene extends BaseRoomScene {
    constructor() {
        super("U2Scene");
    }

    preload() {
        this.load.image("background_u2", "src/background/bg_u2.png");
        this.load.image("backyard_key", "src/assets/ui/icon_backyard_key.png");
        super.preload();
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_u2").setDisplaySize(800, 600).setTint(0x555555);

        // 2. TEXTURA DE PARTÍCULAS (Humedad/Vapor)
        if (!this.textures.exists('humedad_dot')) {
            const dot = this.make.graphics({ x: 0, y: 0, add: false });
            dot.fillStyle(0x88aaff);
            dot.fillCircle(2, 2, 2);
            dot.generateTexture('humedad_dot', 4, 4);
        }

        this.add.particles(0, 0, 'humedad_dot', {
            x: { min: 0, max: 800 },
            y: { min: 0, max: 600 },
            quantity: 1,
            lifespan: 5000,
            speed: { min: 5, max: 15 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.2, end: 0 },
            blendMode: 'ADD',
            frequency: 200
        }).setDepth(1500);

        // 3. SPAWN Y BASE
        const startX = data.spawnX ?? 400;
        const startY = data.spawnY ?? 300;
        this.createBase(startX, startY);
        this.player.hp = PlayerState.hp;
        
        // SEGURO DE ESCENA
        this.canChangeRoom = false;
        this.time.delayedCall(800, () => { this.canChangeRoom = true; });

        // 4. PAREDES AJUSTADAS (Dejamos hueco arriba a la izquierda para el caño)
        this.createWall(400, 560, 800, 80); // Abajo
        this.createWall(760, 300, 80, 600); // Derecha completa
        
        // Pared Izquierda (La cortamos para dejar entrar al caño arriba)
        this.createWall(40, 400, 80, 400);  // Parte inferior izq
        
        // Pared Superior (La cortamos para el caño y la escalera)
        this.createWall(250, 40, 150, 80);  // Bloque entre caño y escalera
        this.createWall(640, 40, 320, 80);  // Bloque derecha de escalera

        // 5. ITEM: BACKYARD KEY
        if (!PlayerState.inventory.includes("backyard_key")) {
            this.keyItem = this.physics.add.sprite(650, 450, "backyard_key");
            this.keyItem.setScale(0.5).setDepth(2000);
            this.tweens.add({
                targets: this.keyItem,
                y: 440,
                duration: 1000,
                yoyo: true,
                loop: -1,
                ease: 'Sine.easeInOut'
            });

            this.physics.add.overlap(this.player.sprite, this.keyItem, () => {
                PlayerState.inventory.push("backyard_key");
                this.saveState();
                this.mostrarCartel("¡Obtenida Backyard Key!");
                this.cameras.main.flash(400, 150, 200, 255); 
                this.keyItem.destroy();
            });
        }

        // 6. PUERTA A U3 (ZONA BOSS - EN EL CAÑO IZQUIERDA ARRIBA)
        // Posicionada en la esquina superior izquierda (aprox x:60, y:60)
        this.doorToU3 = this.add.rectangle(60, 60, 60, 60, 0x00ffff, 0.3);
        this.physics.add.existing(this.doorToU3, true);

        this.physics.add.overlap(this.player.sprite, this.doorToU3, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            // Al entrar a U3, aparecemos lejos de su salida
            this.scene.start("U3Scene", { spawnX: 600, spawnY: 450 }); 
        });

        // 7. ESCALERA A R9 (CENTRO ARRIBA)
        this.stairsUp = this.add.rectangle(400, 40, 80, 40, 0x555555, 0.8);
        this.physics.add.existing(this.stairsUp, true);
        this.physics.add.overlap(this.player.sprite, this.stairsUp, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room9Scene", { spawnX: 400, spawnY: 160 }); 
        });

        // 8. SPAWNER
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => {
                if (this.zombies.getLength() < 6) this.spawnZombie();
            }
        });
    }


    spawnZombie() {
        const x = Phaser.Math.Between(150, 600);
        const y = Phaser.Math.Between(150, 450);
        const type = Phaser.Math.RND.pick(["fast", "tank", "crawler"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
        zombie.sprite.setDepth(100);
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
