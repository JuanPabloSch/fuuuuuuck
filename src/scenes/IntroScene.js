export default class IntroScene extends Phaser.Scene {
    constructor() {
        super("IntroScene");
        this.textoIntro = [
            "Me desperté aquí…",
            "No recuerdo nada.",
            "Instalación en cuarentena.",
            "Contención fallida.",
            "No hay sobrevivientes…",
            "",
            "Tengo que escapar."
        ];
        this.lineaActual = 0;
        this.letraActual = 0;
        this.textoPantalla = null;
    }

    preload() {
        // Puedes cargar un fondo oscuro o con estática
        this.load.image("bg_intro", "src/background/bg_intro.png"); 
        this.load.audio("tecla_sfx", "src/assets/sfx/typewriter_key.mp3");
    }

    create() {
        this.add.image(400, 300, "bg_intro").setDisplaySize(800, 600).setAlpha(0.3);

        // Configuramos el objeto de texto de Phaser
        this.textoPantalla = this.add.text(100, 150, "", {
            fontSize: "24px",
            fill: "#ffffff",
            fontFamily: "Courier New", // Fuente tipo máquina de escribir
            lineSpacing: 10
        });

        // Iniciar el efecto
        this.escribirLetra();

        // Opción de saltar la intro con ESPACIO o Click
        this.input.keyboard.on("keydown-SPACE", () => this.saltarAlJuego());
        this.input.on("pointerdown", () => this.saltarAlJuego());
    }

    escribirLetra() {
    if (this.lineaActual < this.textoIntro.length) {
        let frase = this.textoIntro[this.lineaActual];
        
        if (this.letraActual < frase.length) {
            // Añadir la letra al texto
            this.textoPantalla.text += frase[this.letraActual];

            // 🔊 REPRODUCIR SONIDO
            // Solo suena si no es un espacio para que se sienta más natural
            if (frase[this.letraActual] !== " ") {
                this.sound.play("tecla_sfx", { volume: 0.5, detune: Phaser.Math.Between(-100, 100) });
            }

            this.letraActual++;
            this.time.delayedCall(30, () => this.escribirLetra());
        } else {
            // Salto de línea
            this.textoPantalla.text += "\n";
            this.lineaActual++;
            this.letraActual = 0;
            this.time.delayedCall(600, () => this.escribirLetra());
        }
    } else {
        this.time.delayedCall(2000, () => this.saltarAlJuego());
    }
}

    saltarAlJuego() {
        // Transición suave a negro antes de empezar
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("Room1Scene");
        });
    }
}