"use strict";

/*Load the saved character*/

const savedCharacterText =
    localStorage.getItem("darkSiteCharacter");

/*
If no character has been created,
send the user back to index.html.
*/
if (savedCharacterText === null) {
    window.location.href = "index.html";
}

const savedCharacter =
    JSON.parse(savedCharacterText);

/* Player and boss objects */

const player = {
    name: savedCharacter.name,
    className: savedCharacter.className,

    maxHealth: savedCharacter.maxHealth,
    health: savedCharacter.maxHealth,

    maxStamina: savedCharacter.maxStamina,
    stamina: savedCharacter.maxStamina,

    maxFlasks: savedCharacter.flasks,
    flasks: savedCharacter.flasks,

    specialName: savedCharacter.specialName,

    isDodging: false,
    isGuarding: false,
    specialUses: 2
};

const boss = {
    name: "The Ashen Warden",

    maxHealth: 200,
    health: 200,

    phase: 1
};

let gameOver = false;
let playerTurnLocked = false;

/*HTML elements*/

const playerNameElement =
    document.querySelector("#player-name");

const playerClassElement =
    document.querySelector("#player-class");

const playerHealthText =
    document.querySelector("#player-health-text");

const playerHealthBar =
    document.querySelector("#player-health-bar");

const playerStaminaText =
    document.querySelector("#player-stamina-text");

const playerStaminaBar =
    document.querySelector("#player-stamina-bar");

const flaskCount =
    document.querySelector("#flask-count");

const specialName =
    document.querySelector("#special-name");

const bossHealthText =
    document.querySelector("#boss-health-text");

const bossHealthBar =
    document.querySelector("#boss-health-bar");

const bossPhaseText =
    document.querySelector("#boss-phase-text");

const lightAttackButton =
    document.querySelector("#light-attack-button");

const heavyAttackButton =
    document.querySelector("#heavy-attack-button");

const dodgeButton =
    document.querySelector("#dodge-button");

const healButton =
    document.querySelector("#heal-button");

const specialButton =
    document.querySelector("#special-button");

const specialButtonName =
    document.querySelector("#special-button-name");

const specialButtonCost =
    document.querySelector("#special-button-cost");

const navigationRestartButton =
    document.querySelector("#navigation-restart-button");

const battleLog =
    document.querySelector("#battle-log");

const resultScreen =
    document.querySelector("#result-screen");

const resultTitle =
    document.querySelector("#result-title");

const resultMessage =
    document.querySelector("#result-message");

const resultRestartButton =
    document.querySelector("#result-restart-button");

/*Utility functions*/

function randomNumber(minimum, maximum) {
    return Math.floor(
        Math.random() * (maximum - minimum + 1)
    ) + minimum;
}

function calculatePercentage(current, maximum) {
    const percentage =
        (current / maximum) * 100;

    return Math.max(0, percentage);
}

function addBattleMessage(message, className = "") {
    const messageElement =
        document.createElement("p");

    messageElement.textContent = message;

    if (className !== "") {
        messageElement.classList.add(className);
    }

    battleLog.appendChild(messageElement);

    battleLog.scrollTop =
        battleLog.scrollHeight;
}

function recoverStamina(amount) {
    player.stamina = Math.min(
        player.maxStamina,
        player.stamina + amount
    );
}

/*Update information on screen*/

function updateDisplay() {
    playerNameElement.textContent =
        player.name;

    playerClassElement.textContent =
        player.className;

    playerHealthText.textContent =
        `${player.health} / ${player.maxHealth}`;

    playerHealthBar.style.width =
        `${calculatePercentage(
            player.health,
            player.maxHealth
        )}%`;

    playerStaminaText.textContent =
        `${player.stamina} / ${player.maxStamina}`;

    playerStaminaBar.style.width =
        `${calculatePercentage(
            player.stamina,
            player.maxStamina
        )}%`;

    flaskCount.textContent =
        player.flasks;

    specialName.textContent =
        `${player.specialName} (${player.specialUses})`;

    bossHealthText.textContent =
        `${boss.health} / ${boss.maxHealth}`;

    bossHealthBar.style.width =
        `${calculatePercentage(
            boss.health,
            boss.maxHealth
        )}%`;

    specialButtonName.textContent =
        player.specialName;

    specialButtonCost.textContent =
        `${player.specialUses} uses remaining`;

    /*
    Disable buttons when the player cannot
    currently use the action.
    */

    lightAttackButton.disabled =
        gameOver ||
        playerTurnLocked ||
        player.stamina < 20;

    heavyAttackButton.disabled =
        gameOver ||
        playerTurnLocked ||
        player.stamina < 40;

    dodgeButton.disabled =
        gameOver ||
        playerTurnLocked ||
        player.stamina < 30;

    healButton.disabled =
        gameOver ||
        playerTurnLocked ||
        player.flasks <= 0 ||
        player.health >= player.maxHealth;

    specialButton.disabled =
        gameOver ||
        playerTurnLocked ||
        player.specialUses <= 0;
}

/*Player attacks*/

function useLightAttack() {
    if (
        gameOver ||
        playerTurnLocked ||
        player.stamina < 20
    ) {
        return;
    }

    player.stamina -= 20;

    let damage = randomNumber(13, 21);

    /*
    Knights deal slightly more damage
    with normal weapon attacks.
    */
    if (player.className === "Knight") {
        damage += 3;
    }

    boss.health = Math.max(
        0,
        boss.health - damage
    );

    addBattleMessage(
        `${player.name} strikes the Ashen Warden for ${damage} damage.`,
        "player-message"
    );

    finishPlayerTurn();
}

function useHeavyAttack() {
    if (
        gameOver ||
        playerTurnLocked ||
        player.stamina < 40
    ) {
        return;
    }

    player.stamina -= 40;

    const attackHits =
        Math.random() <= 0.75;

    if (attackHits) {
        let damage = randomNumber(27, 40);

        if (player.className === "Knight") {
            damage += 5;
        }

        boss.health = Math.max(
            0,
            boss.health - damage
        );

        addBattleMessage(
            `${player.name}'s heavy attack deals ${damage} damage!`,
            "player-message"
        );
    } else {
        addBattleMessage(
            `${player.name}'s heavy attack misses, leaving them exposed.`,
            "boss-message"
        );
    }

    finishPlayerTurn();
}

function useDodge() {
    if (
        gameOver ||
        playerTurnLocked ||
        player.stamina < 30
    ) {
        return;
    }

    player.stamina -= 30;
    player.isDodging = true;

    addBattleMessage(
        `${player.name} prepares to dodge the next attack.`,
        "player-message"
    );

    finishPlayerTurn();
}

function useHealingFlask() {
    if (
        gameOver ||
        playerTurnLocked ||
        player.flasks <= 0 ||
        player.health >= player.maxHealth
    ) {
        return;
    }

    player.flasks -= 1;

    const healthBeforeHealing =
        player.health;

    const healingAmount =
        randomNumber(32, 46);

    player.health = Math.min(
        player.maxHealth,
        player.health + healingAmount
    );

    const actualHealing =
        player.health - healthBeforeHealing;

    addBattleMessage(
        `${player.name} drinks a flask and restores ${actualHealing} health.`,
        "player-message"
    );

    finishPlayerTurn();
}

/*Character special abilities*/

function useSpecialAbility() {
    if (
        gameOver ||
        playerTurnLocked ||
        player.specialUses <= 0
    ) {
        return;
    }

    player.specialUses -= 1;

    if (player.className === "Knight") {
        useIronGuard();
    } else if (player.className === "Rogue") {
        useShadowStep();
    } else if (player.className === "Pyromancer") {
        useFireball();
    }
}

function useIronGuard() {
    player.isGuarding = true;

    recoverStamina(15);

    addBattleMessage(
        `${player.name} uses Iron Guard. The next attack will deal much less damage.`,
        "system-message"
    );

    finishPlayerTurn();
}

function useShadowStep() {
    player.isDodging = true;

    recoverStamina(20);

    addBattleMessage(
        `${player.name} disappears into the shadows and prepares a nearly certain dodge.`,
        "system-message"
    );

    finishPlayerTurn();
}

function useFireball() {
    const damage =
        randomNumber(38, 55);

    boss.health = Math.max(
        0,
        boss.health - damage
    );

    addBattleMessage(
        `${player.name} casts Fireball for ${damage} damage!`,
        "system-message"
    );

    finishPlayerTurn();
}

/*Boss phase*/

function checkBossPhase() {
    const halfHealth =
        boss.maxHealth / 2;

    if (
        boss.health <= halfHealth &&
        boss.phase === 1
    ) {
        boss.phase = 2;

        bossPhaseText.textContent =
            "Phase Two: The Warden Unchained";

        addBattleMessage(
            "The Ashen Warden tears away its ruined armor. Fire erupts from its body!",
            "important-message"
        );
    }
}

/*Boss attacks*/

function chooseBossAttack() {
    const attackRoll = Math.random();

    if (boss.phase === 1) {
        if (attackRoll < 0.5) {
            return {
                name: "Rusty Cleave",
                damage: randomNumber(11, 18),
                dodgeChance: 0.72
            };
        }

        if (attackRoll < 0.82) {
            return {
                name: "Shield Crush",
                damage: randomNumber(17, 25),
                dodgeChance: 0.58
            };
        }

        return {
            name: "Ashen Roar",
            damage: randomNumber(8, 14),
            dodgeChance: 0.88
        };
    }

    if (attackRoll < 0.4) {
        return {
            name: "Burning Cleave",
            damage: randomNumber(19, 28),
            dodgeChance: 0.62
        };
    }

    if (attackRoll < 0.75) {
        return {
            name: "Flame Rush",
            damage: randomNumber(23, 34),
            dodgeChance: 0.52
        };
    }

    return {
        name: "Warden's Judgment",
        damage: randomNumber(31, 43),
        dodgeChance: 0.38
    };
}

function bossTurn() {
    if (gameOver) {
        return;
    }

    const attack =
        chooseBossAttack();

    let damage =
        attack.damage;

    /*
    Knight's Iron Guard reduces the next
    attack by 70 percent.
    */
    if (player.isGuarding) {
        damage = Math.ceil(damage * 0.3);

        player.health = Math.max(
            0,
            player.health - damage
        );

        addBattleMessage(
            `${player.name}'s Iron Guard reduces ${attack.name} to ${damage} damage.`,
            "player-message"
        );

        player.isGuarding = false;
    } else if (player.isDodging) {
        let dodgeChance =
            attack.dodgeChance;

        /*
        Rogues naturally have a better
        chance to dodge.
        */
        if (player.className === "Rogue") {
            dodgeChance += 0.2;
        }

        /*
        Keep the chance below 100 percent.
        */
        dodgeChance = Math.min(
            dodgeChance,
            0.95
        );

        const dodgeSuccessful =
            Math.random() <= dodgeChance;

        if (dodgeSuccessful) {
            addBattleMessage(
                `${player.name} dodges ${attack.name} and avoids all damage!`,
                "player-message"
            );
        } else {
            player.health = Math.max(
                0,
                player.health - damage
            );

            addBattleMessage(
                `${player.name}'s dodge fails. ${attack.name} deals ${damage} damage.`,
                "boss-message"
            );
        }

        player.isDodging = false;
    } else {
        player.health = Math.max(
            0,
            player.health - damage
        );

        addBattleMessage(
            `The Ashen Warden uses ${attack.name} and deals ${damage} damage.`,
            "boss-message"
        );
    }

    /*
    Stamina returns after the boss acts.
    Rogues recover slightly more.
    */
    let staminaRecovery = 27;

    if (player.className === "Rogue") {
        staminaRecovery = 34;
    }

    recoverStamina(staminaRecovery);

    updateDisplay();

    if (player.health <= 0) {
        endGame(false);
        return;
    }

    playerTurnLocked = false;
    updateDisplay();
}

/*Turn management*/

function finishPlayerTurn() {
    playerTurnLocked = true;

    checkBossPhase();
    updateDisplay();

    if (boss.health <= 0) {
        endGame(true);
        return;
    }

    /*
    Wait a short moment before the boss
    attacks so the fight feels animated.
    */
    window.setTimeout(
        bossTurn,
        800
    );
}

/*Win and lose screens*/

function endGame(playerWon) {
    gameOver = true;
    playerTurnLocked = true;

    updateDisplay();

    resultScreen.classList.remove("hidden");

    if (playerWon) {
        resultTitle.textContent =
            "Victory";

        resultTitle.style.color =
            "#dda05e";

        resultMessage.textContent =
            `${player.name} has defeated the Ashen Warden and claimed the flame of the ruined kingdom.`;
    } else {
        resultTitle.textContent =
            "You Died";

        resultTitle.style.color =
            "#a63128";

        resultMessage.textContent =
            `${player.name}'s flame has faded, but the battle can begin again.`;
    }
}

/*Restart the battle*/

function restartBattle() {
    player.health =
        player.maxHealth;

    player.stamina =
        player.maxStamina;

    player.flasks =
        player.maxFlasks;

    player.isDodging = false;
    player.isGuarding = false;
    player.specialUses = 2;

    boss.health =
        boss.maxHealth;

    boss.phase = 1;

    gameOver = false;
    playerTurnLocked = false;

    bossPhaseText.textContent =
        "Phase One: The Silent Guardian";

    battleLog.innerHTML = `
        <p>
            The Ashen Warden blocks your path.
        </p>
    `;

    resultScreen.classList.add("hidden");

    updateDisplay();
}

/*Button event listeners*/

lightAttackButton.addEventListener(
    "click",
    useLightAttack
);

heavyAttackButton.addEventListener(
    "click",
    useHeavyAttack
);

dodgeButton.addEventListener(
    "click",
    useDodge
);

healButton.addEventListener(
    "click",
    useHealingFlask
);

specialButton.addEventListener(
    "click",
    useSpecialAbility
);

navigationRestartButton.addEventListener(
    "click",
    restartBattle
);

resultRestartButton.addEventListener(
    "click",
    restartBattle
);

/*Begin the game*/

updateDisplay();

addBattleMessage(
    `${player.name} the ${player.className} enters the battlefield.`,
    "important-message"
);