import PlayerState from "../state/PlayerState.js";

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    preload() {
        // Asegúrate de que esta ruta sea la correcta para tu imagen de fondo
        this.load.image("fondo_muerte", "src/assets/ui/gameover_bg.png"); 
        this.load.image("crosshair", "src/assets/ui/crosshair.png");
    }

    create() {
        // 1. IMAGEN DE FONDO
        // La centramos y escalamos para que cubra los 800x600
        this.add.image(400, 300, "fondo_muerte").setDisplaySize(800, 600);

        // 2. TEXTO "HAS MUERTO" CON EFECTO
        const deathText = this.add.text(400, 250, "HAS MUERTO", { 
            fontSize: '80px', 
            fill: '#ff0000', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Animación de latido para el texto
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
            backgroundColor: '#000000aa', // Fondo semitransparente para que se lea bien
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        retryBtn.on('pointerdown', () => {
            PlayerState.hp = 100; // Reset de vida
            this.scene.start("Room1Scene"); // Cambia esto por tu sala de inicio
        });

        // Efectos del botón
        retryBtn.on('pointerover', () => retryBtn.setTint(0xff0000));
        retryBtn.on('pointerout', () => retryBtn.clearTint());

        // 4. MIRA DEL MOUSE
        this.input.setDefaultCursor('none');
        this.crosshair = this.add.image(0, 0, "crosshair").setDisplaySize(30, 30).setDepth(100);
    }

    update() {
        // Movimiento de la mira
        if (this.crosshair) {
            this.crosshair.x = this.input.activePointer.x;
            this.crosshair.y = this.input.activePointer.y;
        }
    }
}
