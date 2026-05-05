export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.add.rectangle(x, y, 40, 20, 0x00ff00);
        scene.physics.add.existing(this.sprite);

        this.sprite.body.setCollideWorldBounds(true);

        this.speed = 200;

        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    update() {
        const body = this.sprite.body;
        body.setVelocity(0);

        if (this.cursors.left.isDown) body.setVelocityX(-this.speed);
        if (this.cursors.right.isDown) body.setVelocityX(this.speed);
        if (this.cursors.up.isDown) body.setVelocityY(-this.speed);
        if (this.cursors.down.isDown) body.setVelocityY(this.speed);
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