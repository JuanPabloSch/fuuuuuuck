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
        this.load.image("backyard_key", "src/assets/ui/icon_backyard_key.png");
        this.load.image("fog_cloud", "src/background/bg_u2.png"); 
        
    }

    create(data = {}) {
        // 1. FONDO ORIGINAL (Con el tinte que te gustó)
        this.add.image(400, 300, "background_u2").setDisplaySize(800, 600).setTint(0x555555);

        // --- 🔧 TEXTURA DE HUMEDAD (Poné esto al inicio del create si no existe) ---
        if (!this.textures.exists('humedad_dot')) {
            const dot = this.make.graphics({ x: 0, y: 0, add: false });
            dot.fillStyle(0x88aaff); // Color azulado/agua
            dot.fillCircle(2, 2, 2);
            dot.generateTexture('humedad_dot', 4, 4);
        }

        // --- ✨ PARTÍCULAS DE HUMEDAD/VAPOR ---
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

        // --- 🔑 ITEM: BACKYARD KEY (PNG) ---
    if (!PlayerState.inventory.includes("backyard_key")) {
    // Usamos el sprite con la imagen cargada en el preload
    // Asegúrate de usar el mismo "apodo" (backyard_key)
    this.keyItem = this.physics.add.sprite(650, 450, "backyard_key");

    this.keyItem.setScale(0.5).setDepth(2000);
    
    // Animación de levitación suave
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
        
        // Cartel abajo, estilo Resident Evil
        this.mostrarCartel("¡Obtenida Backyard Key! El camino al patio está libre.");
        
        // Efecto de brillo al levantarla
        this.cameras.main.flash(400, 150, 200, 255); 
        
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
            this.scene.start("Room9Scene", { spawnX: 400, spawnY: 160 }); 
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
