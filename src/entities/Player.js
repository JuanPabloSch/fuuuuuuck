export default class Player {
    constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, "player", 0);
    this.sprite.setScale(0.35);
    this.sprite.setCollideWorldBounds(true);
    
    // --- AJUSTE DE HITBOX (LA CLAVE) ---
    // Tu sprite original mide 168x272. Con escala 0.35 mide ~58x95.
    // Vamos a hacer que la caja de choque sea un cuadrado pequeño en los pies.
    // Esto evita que los hombros o el arma del personaje activen la puerta.
    this.sprite.body.setSize(60, 60); // Caja de 60x60 píxeles
    this.sprite.body.setOffset(54, 180); // La movemos para que quede en la base del sprite
    
    this.isKnocked = false;
    this.speed = 200;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.hp = 100;
    this.maxHp = 100;
    this.isDead = false;
}


    update() {

    const body = this.sprite.body;

    // 🚫 NO tocar velocity si está knockeado
    if (this.isKnocked) return;

    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-this.speed);
    if (this.cursors.right.isDown) body.setVelocityX(this.speed);
    if (this.cursors.up.isDown) body.setVelocityY(-this.speed);
    if (this.cursors.down.isDown) body.setVelocityY(this.speed);
}

takeDamage(amount) {

    if (this.invulnerable) return;

    this.hp -= amount;

    this.sprite.setTint(0xff0000);

    this.scene.time.delayedCall(100, () => {
        this.sprite.clearTint();
    });

    this.invulnerable = true;

    this.scene.time.delayedCall(300, () => {
        this.invulnerable = false;
    });
}

applyKnockback(fromX, fromY, force = 120) {

    this.isKnocked = true;

    const angle = Phaser.Math.Angle.Between(
        fromX,
        fromY,
        this.sprite.x,
        this.sprite.y
    );

    this.sprite.setVelocity(
        Math.cos(angle) * force,
        Math.sin(angle) * force
    );

    this.scene.time.delayedCall(200, () => {

        this.sprite.setVelocity(0); // 👈 importante

        this.isKnocked = false;
    });

}
updateDirection(pointer) {

    const angle = Phaser.Math.Angle.Between(
        this.sprite.x,
        this.sprite.y,
        pointer.worldX,
        pointer.worldY
    );

    const deg = Phaser.Math.RadToDeg(angle);

    if (deg > -45 && deg <= 45) {
        this.direction = "right";
    }
    else if (deg > 45 && deg <= 135) {
        this.direction = "down";
    }
    else if (deg <= -45 && deg > -135) {
        this.direction = "up";
    }
    else {
        this.direction = "left";
    }

    // 🎯 CAMBIO DE FRAME
    switch (this.direction) {

        case "down":
            this.sprite.setFrame(0);
            break;

        case "up":
            this.sprite.setFrame(1);
            break;

        case "left":
            this.sprite.setFrame(2);
            break;

        case "right":
            this.sprite.setFrame(3);
            break;
    }
}
}