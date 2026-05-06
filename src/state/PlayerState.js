const PlayerState = {
    hp: 100,
    maxHp: 100,

    ammo: {
        pistol: 10,
        shotgun: 0,
        rifle: 0
    },

    weapons: {
        pistol: true,
        shotgun: false,
        rifle: false
    },

    keys: {
        red: false,
        blue: false
    }
};

export default PlayerState;