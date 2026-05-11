import PlayerState from "../state/PlayerState.js";

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // 1. Inicialización del Sprite
        this.sprite = scene.physics.add.sprite(x, y, `player_${PlayerState.activeWeapon}`, 0);
        this.sprite.setScale(0.8); 

        // 2. Configuración de Hitbox (Pies)
        this.sprite.body.setSize(40, 40); 
        this.sprite.body.setOffset(30, 90); 
        this.sprite.setCollideWorldBounds(true);
        
        // 3. Estados
        this.isKnocked = false;
        this.speed = 200;
        this.hp = PlayerState.hp || 100;
        this.maxHp = 100;
        this.isDead = false;
        this.invulnerable = false;

        // 4. --- ⌨️ CONFIGURACIÓN DE TECLAS (CORREGIDO) ---
        // Creamos un objeto de teclas que incluye tanto WASD como Flechas
        this.controls = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
            downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
            leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
            rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });
    }

    update() {
        // Si está muerto o knockeado, no se mueve
        if (this.isDead || this.isKnocked) return;

        const body = this.sprite.body;
        body.setVelocity(0);

        // --- 🕹️ MOVIMIENTO (Detección de estado físico constante) ---
        const moveLeft = this.controls.left.isDown || this.controls.leftArrow.isDown;
        const moveRight = this.controls.right.isDown || this.controls.rightArrow.isDown;
        const moveUp = this.controls.up.isDown || this.controls.upArrow.isDown;
        const moveDown = this.controls.down.isDown || this.controls.downArrow.isDown;

        if (moveLeft) body.setVelocityX(-this.speed);
        else if (moveRight) body.setVelocityX(this.speed);

        if (moveUp) body.setVelocityY(-this.speed);
        else if (moveDown) body.setVelocityY(this.speed);

        // Normalizar velocidad diagonal para evitar que corra más rápido en esquinas
        if (body.velocity.x !== 0 && body.velocity.y !== 0) {
            body.velocity.normalize().scale(this.speed);
        }

        // --- 🏃 EFECTO DE CAMINADO ---
        const isMoving = body.velocity.x !== 0 || body.velocity.y !== 0;

        if (isMoving) {
            if (!this.walkTween) {
                this.walkTween = this.scene.tweens.add({
                    targets: this.sprite,
                    angle: { from: -3, to: 3 }, 
                    scaleY: { from: 0.8, to: 0.77 }, 
                    duration: 150,
                    yoyo: true,
                    loop: -1
                });
            }
        } else {
            if (this.walkTween) {
                this.walkTween.stop();
                this.walkTween = null;
                this.sprite.setAngle(0);
                this.sprite.setScale(0.8); 
            }
        }
    }

    updateWeaponVisual(weaponName) {
        if (this.isDead) return;
        this.sprite.setTexture(`player_${weaponName}`);
        
        if (weaponName === "shotgun" || weaponName === "rocket") {
            this.sprite.body.setOffset(35, 90);
        } else {
            this.sprite.body.setOffset(30, 90);
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        
        this.sprite.setVelocity(0);
        this.sprite.setTexture("player_dead"); 
        
        this.sprite.body.setSize(120, 50);
        this.sprite.body.setOffset(20, 40);
        
        this.sprite.setTint(0x999999); 
        this.sprite.body.enable = false;

        if (this.walkTween) this.walkTween.stop();

        this.scene.time.delayedCall(2000, () => {
            this.scene.scene.start("GameOverScene");
        });
    }

    takeDamage(amount) {
        if (this.invulnerable || this.isDead) return;

        this.hp -= amount;
        PlayerState.hp = this.hp;

        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) this.sprite.clearTint();
        });

        this.invulnerable = true;
        this.scene.time.delayedCall(300, () => {
            this.invulnerable = false;
        });
    }

    applyKnockback(fromX, fromY, force = 120) {
        if (this.isDead) return;
        this.isKnocked = true;

        const angle = Phaser.Math.Angle.Between(fromX, fromY, this.sprite.x, this.sprite.y);

        this.sprite.setVelocity(
            Math.cos(angle) * force,
            Math.sin(angle) * force
        );

        this.scene.time.delayedCall(200, () => {
            if (!this.isDead) this.sprite.setVelocity(0);
            this.isKnocked = false;
        });
    }

    updateDirection(pointer) {
        if (this.isDead) return;

        const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, pointer.worldX, pointer.worldY);
        const deg = Phaser.Math.RadToDeg(angle);

        if (deg > -45 && deg <= 45) this.direction = "right";
        else if (deg > 45 && deg <= 135) this.direction = "down";
        else if (deg <= -45 && deg > -135) this.direction = "up";
        else this.direction = "left";

        switch (this.direction) {
            case "down": this.sprite.setFrame(0); break;
            case "up": this.sprite.setFrame(1); break;
            case "left": this.sprite.setFrame(2); break;
            case "right": this.sprite.setFrame(3); break;
        }
    }
}