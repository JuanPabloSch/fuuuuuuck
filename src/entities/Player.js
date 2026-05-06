export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.add.rectangle(x, y, 40, 20, 0x00ff00);
        scene.physics.add.existing(this.sprite);

        this.sprite.body.setCollideWorldBounds(true);

        this.speed = 200;
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.hp = 100;
        this.maxHp = 100;
        this.isDead = false;
    }

    update() {
        const body = this.sprite.body;
        body.setVelocity(0);

        if (this.cursors.left.isDown) body.setVelocityX(-this.speed);
        if (this.cursors.right.isDown) body.setVelocityX(this.speed);
        if (this.cursors.up.isDown) body.setVelocityY(-this.speed);
        if (this.cursors.down.isDown) body.setVelocityY(this.speed);
        this.sprite.x += this.knockbackX;
        this.sprite.y += this.knockbackY;

        // fricción (se va frenando solo)
        this.knockbackX *= 0.8;
        this.knockbackY *= 0.8;
    }

takeDamage(amount) {

    if (this.invulnerable) return;

    this.hp -= amount;

    // 🟥 flash rojo (compatible con rectangle)
    this.sprite.setFillStyle(0xff0000);

    this.scene.time.delayedCall(100, () => {
        this.sprite.setFillStyle(0xffffff); // volver a color original
    });

    this.invulnerable = true;

    this.scene.time.delayedCall(300, () => {
        this.invulnerable = false;
    });
}

applyKnockback(fromX, fromY, force = 80) {

    const angle = Phaser.Math.Angle.Between(
        fromX,
        fromY,
        this.sprite.x,
        this.sprite.y
    );

    this.knockbackX += Math.cos(angle) * force;
    this.knockbackY += Math.sin(angle) * force;

    // 🔒 clamp para evitar impulsos exagerados
    this.knockbackX = Phaser.Math.Clamp(this.knockbackX, -6, 6);
    this.knockbackY = Phaser.Math.Clamp(this.knockbackY, -6, 6);
}
    updateRotation(pointer) {
        this.angle = Phaser.Math.Angle.Between(
            this.sprite.x,
            this.sprite.y,
            pointer.worldX,
            pointer.worldY
        );

        this.sprite.rotation = this.angle;
    }
}