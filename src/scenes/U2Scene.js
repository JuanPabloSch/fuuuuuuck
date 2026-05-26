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
        super.create(data);
        this.updateMusic("song2");

        // --- CAMBIA ESTO EN EL CREATE DE U2SCENE ---
this.zombieSpawner = this.time.addEvent({
    delay: 2500,
    loop: true,
    callback: () => {
        if (this.zombies && this.zombies.getLength() < 6) this.spawnZombie();
    }
});


        this.add.image(400, 300, "background_u2").setDisplaySize(800, 600);

        // Partículas
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

        const startX = data.spawnX ?? 400;
        const startY = data.spawnY ?? 300;
        this.createBase(startX, startY);
        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(800, () => { this.canChangeRoom = true; });

        // Paredes
        this.createWall(400, 560, 800, 80); 
        this.createWall(760, 300, 80, 600); 
        this.createWall(40, 400, 80, 400);  
        this.createWall(250, 40, 150, 80);  
        this.createWall(640, 40, 320, 80);  

        // Backyard Key
        if (!PlayerState.inventory.includes("backyard_key")) {
            this.keyItem = this.physics.add.sprite(650, 450, "backyard_key");
            this.keyItem.setScale(0.5).setDepth(2000);
            this.physics.add.overlap(this.player.sprite, this.keyItem, () => {
                PlayerState.inventory.push("backyard_key");
                this.saveState();
                this.mostrarCartel("¡Obtenida Backyard Key!");
                this.keyItem.destroy();
            });
        }

// Puerta a U3 (Invisibilizada)
this.doorToU3 = this.add.rectangle(160, 160, 60, 60, 0x00ffff, 0);
this.physics.add.existing(this.doorToU3, true);

this.overlapU3 = this.physics.add.overlap(this.player.sprite, this.doorToU3, () => {
    if (!this.canChangeRoom) return;
    this.canChangeRoom = false;

    // 1. CORRECCIÓN RADICAL: Frenamos y removemos el spawner de inmediato
    if (this.zombieSpawner) {
        this.zombieSpawner.destroy();
    }
    this.time.removeAllEvents();

    if (this.overlapU3) this.overlapU3.destroy();
    if (this.overlapR9) this.overlapR9.destroy();

    this.updateMusic("fbossmusic"); 
    this.saveState();
    this.scene.start("U3Scene", { spawnX: 600, spawnY: 450 }); 
});

// Escalera a R9
this.stairsUp = this.add.rectangle(400, 40, 80, 40, 0x555555, 0);
this.physics.add.existing(this.stairsUp, true);

this.overlapR9 = this.physics.add.overlap(this.player.sprite, this.stairsUp, () => {
    if (!this.canChangeRoom) return;
    this.canChangeRoom = false;

    // 2. CORRECCIÓN RADICAL: Frenamos y removemos el spawner de inmediato
    if (this.zombieSpawner) {
        this.zombieSpawner.destroy();
    }
    this.time.removeAllEvents();

    if (this.overlapU3) this.overlapU3.destroy();
    if (this.overlapR9) this.overlapR9.destroy();

    this.saveState();
    this.scene.start("Room9Scene", { spawnX: 400, spawnY: 160 }); 
});



        // Spawner
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => {
                if (this.zombies && this.zombies.getLength() < 6) this.spawnZombie();
            }
        });
    }

spawnZombie() {
    // 1. Si la escena ya no está activa o el cambio de habitación inició, cancelamos
    if (!this.canChangeRoom || !this.scene.isActive()) return;

    // 2. Verificación de seguridad extrema sobre el grupo de zombis
    if (!this.zombies || !this.zombies.scene || typeof this.zombies.add !== 'function') return;

    const x = Phaser.Math.Between(150, 600);
    const y = Phaser.Math.Between(150, 450);
    const type = Phaser.Math.RND.pick(["fast", "tank", "crawler"]);

    try {
        // 3. Instanciamos el objeto lógico del Zombi
        const zombie = new Zombie(this, x, y, type);

        // 4. Doble control: añadimos el sprite físico solo si el grupo sigue vivo en este frame
        if (zombie && zombie.sprite && this.zombies && this.zombies.add) {
            this.zombies.add(zombie.sprite);
            zombie.sprite.ref = zombie;
        }
    } catch (error) {
        console.warn("Spawner omitido de forma segura para evitar cuelgues durante la transición.");
    }
}


    update(time, delta) {
        this.updateBase(time, delta);
    }
}