import PlayerState from "../state/PlayerState.js";

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    preload() {
        this.load.image("fondo_muerte", "src/assets/ui/gameover_bg.png"); 
        this.load.image("crosshair", "src/assets/ui/crosshair.png");
        
        // 🔊 CARGA DE MÚSICA DE DERROTA
        this.load.audio("lose_music", "src/assets/music/lose.mp3");
    }

    create() {
        this.sound.stopAll(); 
        // 🔊 MÚSICA DE DERROTA SIN LOOP
        this.musicaDerrota = this.sound.add("lose_music", { volume: 0.6, loop: false });
        this.musicaDerrota.play();

        // 1. IMAGEN DE FONDO
        this.add.image(400, 300, "fondo_muerte").setDisplaySize(800, 600);

        // 2. TEXTO "HAS MUERTO" CON EFECTO
        const deathText = this.add.text(400, 250, "HAS MUERTO", { 
            fontSize: '80px', 
            fill: '#ff0000', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.tweens.add({
            targets: deathText,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            loop: -1
        });

        // 3. BOTÓN REINTENTAR
        const retryBtn = this.add.text(400, 450, "REINTENTAR", { 
            fontSize: '32px', 
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerdown', () => {
            // 🔇 DETENER MÚSICA antes de salir
            if (this.musicaDerrota) this.musicaDerrota.stop();
            
            // Restauramos salud
            PlayerState.hp = 100;
            
            const destino = PlayerState.checkpointScene || "Room1Scene";
            this.scene.start(destino);
        });

        retryBtn.on('pointerover', () => retryBtn.setStyle({ fill: '#ff0000' }));
        retryBtn.on('pointerout', () => retryBtn.setStyle({ fill: '#ffffff' }));

        // 4. MIRA DEL MOUSE
        this.input.setDefaultCursor('none');
        this.crosshair = this.add.image(0, 0, "crosshair").setDisplaySize(30, 30).setDepth(100);
    }

    update() {
        if (this.crosshair) {
            this.crosshair.x = this.input.activePointer.x;
            this.crosshair.y = this.input.activePointer.y;
        }
    }
}