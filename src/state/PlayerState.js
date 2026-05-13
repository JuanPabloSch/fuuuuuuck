const PlayerState = {
    hp: 100,
    maxHp: 100,

    activeWeapon: "pistol",

    ammo: {
        pistol: 10,
        shotgun: 5,
        rifle: 3,
        rocket: 1
    },

    weapons: {
        pistol: true,
        shotgun: true,
        rifle: true,
        rocket: true
    },

     safeCode: Math.floor(1000 + Math.random() * 9000).toString(),
    //"llave_norte", "west_key", "llave_este", "backyard_key", "llave_moto"  
            
    inventory: ["llave_norte", "west_key", "llave_este", "backyard_key", ],
    bossU3Dead: false, 
    room2TrapDone: false,
    bossRoom5Dead: false,
    room9PuzzleSolved: false,
    // --- 🚩 NUEVO FLAG PARA LA EMBOSCADA ---
    room7AmbushDone: false, 
    vistoNotaEscape: false,

    keys: {
        red: false,
        blue: false
    }
};

export default PlayerState;
