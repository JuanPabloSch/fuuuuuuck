import PlayerState from "../state/PlayerState.js";

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // 1. Iniciamos con la textura según el arma activa (player_pistol, player_shotgun, etc.)
        this.sprite = scene.physics.add.sprite(x, y, `player_${PlayerState.activeWeapon}`, 0);
        // Probá con 0.6 para que coincida con los zombies nuevos
        this.sprite.setScale(0.8); 

        // Reajustamos la hitbox para este nuevo tamaño escalado
        this.sprite.body.setSize(40, 40); 
        this.sprite.body.setOffset(30, 90); 
        // NO usamos setScale porque tus nuevos sprites de 130px de alto ya están a medida
        this.sprite.setCollideWorldBounds(true);
        
        // 2. NUEVA HITBOX (Ajustada a los pies para sprites de ~100x130)
        this.sprite.body.setSize(40, 40); 
        this.sprite.body.setOffset(30, 90); 
        
        this.isKnocked = false;
        this.speed = 200;
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.hp = PlayerState.hp || 100;
        this.maxHp = 100;
        this.isDead = false;
        this.invulnerable = false;
    }

    update() {
        // Si está muerto o knockeado, no se mueve
        if (this.isDead || this.isKnocked) return;

        const body = this.sprite.body;
        body.setVelocity(0);

        if (this.cursors.left.isDown) body.setVelocityX(-this.speed);
        if (this.cursors.right.isDown) body.setVelocityX(this.speed);
        if (this.cursors.up.isDown) body.setVelocityY(-this.speed);
        if (this.cursors.down.isDown) body.setVelocityY(this.speed);
    }

    // --- 🎯 CAMBIO VISUAL DE ARMA ---
    updateWeaponVisual(weaponName) {
        if (this.isDead) return;
        
        // Cambia el PNG (ej: de player_pistol a player_shotgun)
        this.sprite.setTexture(`player_${weaponName}`);
        
        // Ajuste fino de hitbox según el ancho del frame (100 o 110)
        if (weaponName === "shotgun" || weaponName === "rocket") {
            this.sprite.body.setOffset(35, 90);
        } else {
            this.sprite.body.setOffset(30, 90);
        }
    }

    // --- 💀 LÓGICA DE MUERTE ---
    die() {
        if (this.isDead) return;
        this.isDead = true;
        
        this.sprite.setVelocity(0);
        this.sprite.setTexture("player_dead"); // Usa el PNG horizontal
        
        // Ajustamos la box al cuerpo tirado (167x115)
        this.sprite.body.setSize(120, 50);
        this.sprite.body.setOffset(20, 40);
        
        this.sprite.setTint(0x999999); // Tono pálido de cadáver
        this.sprite.body.enable = false; // Deja de chocar con zombies
    }

    takeDamage(amount) {
        if (this.invulnerable || this.isDead) return;

        this.hp -= amount;
        PlayerState.hp = this.hp; // Sincronizamos con el estado global

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
