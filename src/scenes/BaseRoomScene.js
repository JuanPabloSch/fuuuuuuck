import Player from "../entities/Player.js";
import WeaponSystem from "../entities/WeaponSystem.js";
import PlayerState from "../state/PlayerState.js";

export default class BaseRoomScene extends Phaser.Scene {

    constructor(key) {
        super(key);
    }

    preload() {
    // Esto asegura que TODAS las habitaciones carguen la mira
    this.load.image("crosshair", "src/assets/ui/crosshair.png");
    // --- CARGA DE SONIDOS ---
    this.load.audio("player_hurt", "src/assets/sfx/grunt.mp3");
    this.load.audio("player_death", "src/assets/sfx/death_scream.mp3");
    // En el preload
    this.load.audio("rain_ambient", "src/assets/sfx/rain_ambient.mp3");
    this.load.audio("thunder_sfx", "src/assets/sfx/thunder_sfx.mp3");
    this.load.audio("rain_ambient", "src/assets/sfx/rain_ambient.mp3");
    this.load.audio("pistol_shot", "src/assets/sfx/pistol_shot.mp3");
    this.load.audio("pistol_empty", "src/assets/sfx/pistol_empty.mp3");
    this.load.audio("pistol_reload", "src/assets/sfx/pistol_reload.mp3");

    // --- CARGA DE MÚSICA ---
    this.load.audio("song1", "src/assets/music/song1.mp3");
    this.load.audio("song2", "src/assets/music/song2.mp3");
    this.load.audio("bossmusic", "src/assets/music/bossmusic.mp3");
    this.load.audio("fbossmusic", "src/assets/music/fbossmusic.mp3");
    // --- NUEVOS SONIDOS ---
    // Shotgun
    this.load.audio("shotgun_shot", "src/assets/sfx/shotgun_shot.mp3");
    this.load.audio("shotgun_reload", "src/assets/sfx/shotgun_reload.mp3");

    // Rifle
    this.load.audio("rifle_shot", "src/assets/sfx/rifle_shot.mp3");
    this.load.audio("rifle_reload", "src/assets/sfx/rifle_reload.mp3");

    // Rocket Launcher
    this.load.audio("rocket_shot", "src/assets/sfx/rocket_shot.mp3");
    this.load.audio("rocket_reload", "src/assets/sfx/rocket_reload.mp3");

    // Dentro de preload() en BaseRoomScene.js
    const types = ['normal', 'fast', 'tank', 'crawler', 'worm']; // Eliminamos 'sucker', agregamos 'normal' y 'crawler'

    types.forEach(type => {
        this.load.audio(`${type}_spawn`, `src/assets/sfx/${type}_spawn.mp3`);
        this.load.audio(`${type}_die`, `src/assets/sfx/${type}_die.mp3`);
    });
    }

    // 1. AGREGA ESTO JUSTO AQUÍ: El método que Room1 necesita para no explotar
    create(data) {
        // Se queda vacío. Es el "puente" para super.create(data)
    }

updateMusic(key) {
    // 1. Si pedimos la misma música y está sonando, no hacemos nada
    if (this.currentMusicKey === key && this.music?.isPlaying) return;

    // 2. Parada de emergencia de cualquier rastro de sonido
    if (this.music) {
        this.music.stop();
        this.music.destroy(); // Borramos la instancia anterior
        this.music = null;
    }

    if (!key) {
        this.currentMusicKey = null;
        return;
    }

    // 3. Pequeño delay para dejar que Phaser limpie el canal de audio anterior
    this.time.delayedCall(100, () => {
        try {
            this.music = this.sound.add(key, { loop: true, volume: 0.4 });
            this.music.play();
            this.currentMusicKey = key;
        } catch (err) {
            console.warn("No se pudo reproducir:", key);
        }
    });
}
    // Herramienta para crear paredes
    createWall(x, y, w, h) {
    // Cambiamos el 0.5 final por 0
    // El color (0xff0000) ya no importa porque no se va a ver
    let wall = this.add.rectangle(x, y, w, h, 0xff0000, 0); 
    
    this.walls.add(wall); // Se mantiene en el grupo físico para las colisiones
    return wall;
}

    createBase(x = 400, y = 300) {
        // 🧱 Grupo de paredes (DEBE IR ANTES QUE EL PLAYER PARA LAS COLISIONES)
        this.walls = this.physics.add.staticGroup();

        // 🧍 player
        this.player = new Player(this, x, y);
        this.player.hp = PlayerState.hp;

        // 🔫 weapons
        this.weapon = new WeaponSystem(this, this.player);

        // 🔫 bullets
        this.bullets = [];

        // 🧟 zombies
        this.zombies = this.physics.add.group();

        this.input.setDefaultCursor('none');

        // Creamos la imagen de la mira
        this.crosshair = this.add.image(0, 0, "crosshair");
        this.crosshair.setDisplaySize(30, 30);
        this.crosshair.setDepth(10000); 

        // --- CONFIGURACIÓN DE COLISIONES GLOBALES ---
        // Esto hace que el player choque con todas las paredes que crees
        this.physics.add.collider(this.player.sprite, this.walls);
        
        // Esto hace que los zombies choquen con las paredes
        this.physics.add.collider(this.zombies, this.walls);
        
        // Esto hace que los zombies choquen entre ellos
        this.physics.add.collider(this.zombies, this.zombies);

        // 🎮 input (UNA SOLA VEZ)
        this.input.mouse.disableContextMenu();
        this.input.keyboard.resetKeys();
        this.input.on("pointerdown", (pointer) => {
            if (pointer.leftButtonDown()) {
                this.weapon.shoot(this.time.now, pointer);
            }
            if (pointer.rightButtonDown()) {
                this.weapon.reload();
            }
        });
        // ... dentro de createBase ...
        this.input.keyboard.resetKeys();

        // Forzar la actualización del estado de las teclas capturadas por el navegador
        this.events.on('resume', () => {
            this.input.keyboard.resetKeys();
        });

        //HUD
        this.hudWeaponText = this.add.text(16, 16, "", { fontSize: "18px", fill: "#ffffff" });
        this.hudAmmoText = this.add.text(16, 40, "", { fontSize: "18px", fill: "#ffffff" });
        this.hudHpText = this.add.text(16, 64, "", { fontSize: "18px", fill: "#ff4444" });
        
        this.hudWeaponText.setScrollFactor(0);
        this.hudAmmoText.setScrollFactor(0);
        this.hudHpText.setScrollFactor(0);

        // Teclas de armas (usa .on solo para acciones de un solo pulso, no para movimiento)
        this.input.keyboard.on("keydown-ONE", () => this.weapon.setWeapon("pistol"));
        this.input.keyboard.on("keydown-TWO", () => this.weapon.setWeapon("shotgun"));
        this.input.keyboard.on("keydown-THREE", () => this.weapon.setWeapon("rifle"));
        this.input.keyboard.on("keydown-FOUR", () => this.weapon.setWeapon("rocket"));
        this.input.keyboard.on('keydown-P', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { fromScene: this.scene.key });
        });
        // ... al final de createBase ...

    // Detectar cuando un zombie toca al jugador
    this.physics.add.overlap(this.player.sprite, this.zombies, (playerSprite, zombieSprite) => {
        // 10 es el daño por golpe, puedes ajustarlo
        this.handleDamage(5);
});
    }

    spawnMedikit(x, y, healAmount = 30) {
    const kit = this.physics.add.sprite(x, y, "medikit");
    
    // 1. ESCALA MUY CHICA
    // Prueba con 0.1 o 0.2 (esto es el 10% o 20% del tamaño original)
    kit.setScale(0.15); 
    kit.setDepth(90);

    // 2. AJUSTE DEL TWEEN (CUIDADO AQUÍ)
    // Si usas scale: 1.2, Phaser lo vuelve a agrandar a su tamaño original.
    // Para que mantenga el tamaño chico, el tween debe basarse en el setScale de arriba.
    this.tweens.add({
        targets: kit,
        scale: 0.18, // Que crezca solo un poquito más de su escala base (0.15)
        duration: 800,
        yoyo: true,
        loop: -1
    });

    this.physics.add.overlap(this.player.sprite, kit, () => {
        this.player.hp = Math.min(100, this.player.hp + healAmount);
        PlayerState.hp = this.player.hp;
        
        this.player.sprite.setTint(0x00ff00);
        this.time.delayedCall(200, () => this.player.sprite.setTint(0xffffff));

        kit.destroy();
    });
}


updateBase(time, delta) {
    this.player.update();
    this.player.updateDirection(this.input.activePointer);

    this.zombies.getChildren().forEach(sprite => {
        sprite.ref.update(this.player, this.zombies);
    });
    this.bullets.forEach(b => b.update(time, delta));

    this.handleCollisions();
    
    this.hudHpText.setText(`HP: ${Math.floor(this.player.hp)}`);
    this.hudWeaponText.setText(`Weapon: ${this.weapon.activeWeapon}`);
    this.hudAmmoText.setText(
        this.weapon.w.reloading
            ? "Reloading..."
            : `Ammo: ${PlayerState.ammo[this.weapon.activeWeapon]}`
    );

    // Movimiento de la mira
    if (this.crosshair) {
        this.crosshair.x = this.input.activePointer.worldX;
        this.crosshair.y = this.input.activePointer.worldY;
    }

    // 💀 SI MUERE, LLAMAMOS A LA FUNCIÓN DE MUERTE (una sola vez)
    if (this.player.hp <= 0 && !this.player.isDead) {
        this.ejecutarMuerte();
    }
}

handleDamage(amount) {
    // 1. Verificación de existencia: Si el jugador o su sprite no están, salimos
    if (!this.player || !this.player.sprite || !this.player.sprite.body) return;

    // 2. Si ya está muerto o es invulnerable, salimos
    if (this.player.isDead || this.player.isHurt) return;

    this.player.hp -= amount;
    PlayerState.hp = this.player.hp;

    if (this.player.hp > 0) {
        // Sonido y efectos visuales
        this.sound.play("player_hurt", { volume: 0.6 });
        this.player.isHurt = true;
        this.player.sprite.setTint(0xff0000); 
        this.cameras.main.shake(200, 0.01);

        // --- 🛡️ FIX PARA EL CRASH (setVelocity) ---
        // Solo aplicamos velocidad si el cuerpo físico todavía existe en este frame
        if (this.player.sprite.body) {
            const bounceX = this.player.sprite.body.velocity.x * -1.5;
            const bounceY = this.player.sprite.body.velocity.y * -1.5;
            this.player.sprite.setVelocity(bounceX, bounceY);
        }

        // --- 🕒 TIEMPO DE RECUPERACIÓN ---
        this.time.delayedCall(1000, () => {
            // Verificamos de nuevo antes de quitar el tinte, por si cambiamos de escena
            if (this.player && this.player.sprite) {
                this.player.isHurt = false;
                this.player.sprite.clearTint();
            }
        });
    } else {
        this.ejecutarMuerte();
    }
}

ejecutarMuerte() {
    this.player.isDead = true;
    
    // Bloquea el input para que no puedas disparar mientras mueres
    this.input.enabled = false; 

    // Pausa la física y detiene a los enemigos
    this.physics.pause();
    this.zombies.getChildren().forEach(z => {
        if(z.body) z.body.enable = false;
    });
    
    this.sound.play("player_death", { volume: 0.8 });
    this.updateMusic(null); 

    this.player.sprite.setTint(0xff0000);
    
    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
        // MUY IMPORTANTE: Antes de empezar GameOver, apagamos esta escena
        this.scene.stop(this.scene.key); 
        this.scene.start("GameOverScene");
    });
}
autosave() {
    // 1. Guardamos la escena y el estado físico
    PlayerState.checkpointScene = this.scene.key;
    PlayerState.hp = this.player.hp;
    
    // 2. Sincronizamos todo el inventario (asegura que no se pierdan llaves/armas)
    // Asumimos que PlayerState ya tiene las armas y llaves actuales
    this.saveState(); 

    // 3. Feedback visual con tu función
    if (this.mostrarCartel) {
        this.mostrarCartel("PUNTO DE CONTROL: PROGRESO GUARDADO");
    }

    console.log("Autosave completado en:", this.scene.key);
}

mostrarCartel(mensaje) {
    // 1. LIMPIEZA: Si ya existe un cartel, detenemos sus animaciones y lo borramos
    if (this.cartelContainer) {
        this.tweens.killTweensOf(this.cartelContainer); // Detiene el parpadeo actual
        this.cartelContainer.destroy();
    }

    const estiloTexto = {
        fontSize: "18px", 
        fill: "#ffffff",
        fontFamily: "Arial",
        align: "center",
        stroke: "#000000",
        strokeThickness: 4,
        shadow: { blur: 2, color: '#000000', fill: true }
    };

    const texto = this.add.text(0, 0, mensaje.toUpperCase(), estiloTexto).setOrigin(0.5);

    // 2. Creamos el contenedor
    this.cartelContainer = this.add.container(400, 530, [texto])
        .setScrollFactor(0)
        .setDepth(10000);

    this.cartelContainer.alpha = 0;

    // 3. Animación controlada
    this.tweens.add({
        targets: this.cartelContainer,
        alpha: 1,
        duration: 300,
        yoyo: true,
        hold: 2000, // Tiempo exacto que se queda en pantalla (2 segundos)
        onComplete: () => {
            if (this.cartelContainer) {
                this.cartelContainer.destroy();
                this.cartelContainer = null; // Limpiamos la referencia
            }
        }
    });
}

handleCollisions() {
    const zombies = this.zombies.getChildren();
    for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        
        for (let j = zombies.length - 1; j >= 0; j--) {
            const zombieSprite = zombies[j];
            const zombie = zombieSprite.ref;
            
            // Si es un Rocket (damage 50), aumentamos el radio de detección
            const detectionRadius = (bullet.damage >= 50) ? 60 : 25; 

            const dist = Phaser.Math.Distance.Between(
                bullet.sprite.x, bullet.sprite.y,
                zombie.sprite.x, zombie.sprite.y
            );

            if (dist < detectionRadius) {
            zombie.takeDamage(bullet.damage);
            
            if (bullet.damage >= 50) {
                this.cameras.main.shake(200, 0.02);
            }

            bullet.destroy();
            this.bullets.splice(i, 1);
            
            if (zombie.hp <= 0) {
                const dieKey = `${zombie.type}_die`;
                if (this.cache.audio.exists(dieKey)) {
                    this.sound.play(dieKey, { volume: 0.4 });
                }
                zombie.destroy();
                this.zombies.remove(zombieSprite);
            }
            break; // Importante para que la bala no siga chocando con otros si ya desapareció
        }
        }
    }
    
}
saveState() {
        PlayerState.hp = this.player.hp;
    }
}
