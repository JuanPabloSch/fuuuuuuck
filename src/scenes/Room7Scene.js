import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room7Scene extends BaseRoomScene {
    constructor() {
        super("Room7Scene");
    }

    preload() {
        this.load.image("background_r7", "src/background/bg_r7.png");
        super.preload();
        this.load.spritesheet("zombie_crawler", "src/assets/sucker.png", { 
            frameWidth: 110, 
            frameHeight: 140 
        });
    }

    create(data = {}) {
        this.add.image(400, 300, "background_r7").setDisplaySize(800, 600);

        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // --- PUERTAS Y PAREDES (Tu lógica original se mantiene igual) ---
        this.setupMap();

        // 🧟 SPAWNER ACTUALIZADO: Ahora puede salir el Sucker ("crawler")
        this.time.addEvent({
            delay: 2500, // Un poco más lento el spawn porque el sucker es letal
            loop: true,
            callback: () => {
                // Si hay pocos zombies en pantalla, spawneamos uno
                if (this.zombies.children.entries.length < 5) {
                    this.spawnCustomZombie();
                }
            }
        });
        
        // --- EMBOSCADA INICIAL (Solo la primera vez) ---
    if (!PlayerState.room7AmbushDone) {
    PlayerState.room7AmbushDone = true; // Marcamos que ya pasó
    
    

    // Spawneamos 4 Suckers en las esquinas de la pantalla
    const corners = [
        {x: 100, y: 100}, {x: 700, y: 100},
        {x: 100, y: 500}, {x: 700, y: 500}
    ];

    corners.forEach(pos => {
        const sucker = new Zombie(this, pos.x, pos.y, "crawler");
        this.zombies.add(sucker.sprite);
        sucker.sprite.ref = sucker;
        sucker.sprite.setDepth(100);
    });
}

    }

    setupMap() {
        // Puertas
        this.doorLeft = this.add.rectangle(20, 300, 10, 100, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorLeft, true);
        this.physics.add.overlap(this.player.sprite, this.doorLeft, () => {
            if (!this.canChangeRoom) return;
            this.scene.start("Room1Scene", { spawnX: 720, spawnY: 300 });
        });

        this.doorRight = this.add.rectangle(780, 300, 10, 100, 0x00ffff, 0.5);
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return;
            this.scene.start("Room8Scene", { spawnX: 80, spawnY: 300 });
        });

        // --- 🔧 GENERAR TEXTURA PARA LAS PARTÍCULAS (Poné esto al principio del create) ---
    if (!this.textures.exists('particle_dot')) {
        const dot = this.make.graphics({ x: 0, y: 0, add: false });
        dot.fillStyle(0xffffff);
        dot.fillCircle(4, 4, 4);
        dot.generateTexture('particle_dot', 8, 8);
    }

    // --- 🚨 EFECTO DE ALARMA ROJA ---
    this.alarmOverlay = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0);
    this.alarmOverlay.setDepth(5000).setScrollFactor(0); // Más profundidad para que tape todo

    this.tweens.add({
        targets: this.alarmOverlay,
        alpha: 0.25, // Un poco menos para que no moleste al jugar
        duration: 1000,
        yoyo: true,
        loop: -1
    });

    // --- ✨ PARTÍCULAS DE HUMO/GAS (Corregidas) ---
    this.add.particles(0, 0, 'particle_dot', { // Usamos la textura que generamos arriba
        x: { min: 0, max: 800 },
        y: { min: 0, max: 600 },
        quantity: 1,
        lifespan: 3000,
        speed: { min: 10, max: 40 },
        scale: { start: 1, end: 0 }, // Un poco más grandes para que parezca humo
        alpha: { start: 0.3, end: 0 },
        blendMode: 'ADD',
        frequency: 150
    }).setDepth(1500);

        // Paredes
        this.createWall(400, 40, 800, 80);
        this.createWall(400, 560, 800, 80);
        this.createWall(40, 110, 80, 220); this.createWall(40, 490, 80, 220);
        this.createWall(760, 110, 80, 220); this.createWall(760, 490, 80, 220);
    }
    

    spawnCustomZombie() {
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    // De 5 opciones, 4 son Suckers. El "normal" solo sale de vez en cuando.
    const type = Phaser.Math.RND.pick(["crawler", "crawler", "crawler", "crawler", "normal"]);
    
    const zombie = new Zombie(this, x, y, type);
    zombie.sprite.setDepth(100);
    this.zombies.add(zombie.sprite);
    zombie.sprite.ref = zombie;
    
    // Si es un Sucker, le damos un tinte leve para que se vea más asqueroso
    if (type === "crawler") {
        zombie.sprite.setTint(0x99ff99); 
    }
}



    update(time, delta) {
        this.updateBase(time, delta);
    }
}
