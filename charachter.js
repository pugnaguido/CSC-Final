"use strict";

/*Character class information*/

const characterClasses = {
    Knight: {
        name: "Knight",
        health: 125,
        stamina: 90,
        flasks: 4,
        specialName: "Iron Guard",
        description:
            "A heavily protected warrior with high health and an extra healing flask."
    },

    Rogue: {
        name: "Rogue",
        health: 90,
        stamina: 130,
        flasks: 3,
        specialName: "Shadow Step",
        description:
            "A quick fighter with high stamina and a strong chance to avoid attacks."
    },

    Pyromancer: {
        name: "Pyromancer",
        health: 100,
        stamina: 105,
        flasks: 2,
        specialName: "Fireball",
        description:
            "A flame wielder who can use a powerful magical attack against the boss."
    }
};

/*HTML elements*/

const characterNameInput =
    document.querySelector("#character-name");

const classButtons =
    document.querySelectorAll(".class-button");

const selectedClassName =
    document.querySelector("#selected-class-name");

const selectedClassDescription =
    document.querySelector("#selected-class-description");

const classHealth =
    document.querySelector("#class-health");

const classStamina =
    document.querySelector("#class-stamina");

const classFlasks =
    document.querySelector("#class-flasks");

const classSpecial =
    document.querySelector("#class-special");

const characterError =
    document.querySelector("#character-error");

const startGameButton =
    document.querySelector("#start-game-button");

/* This holds the class currently selected by the user. */
let selectedClass = null;

/*Class-selection function*/

function selectCharacterClass(className) {
    selectedClass = characterClasses[className];

    selectedClassName.textContent =
        selectedClass.name;

    selectedClassDescription.textContent =
        selectedClass.description;

    classHealth.textContent =
        selectedClass.health;

    classStamina.textContent =
        selectedClass.stamina;

    classFlasks.textContent =
        selectedClass.flasks;

    classSpecial.textContent =
        selectedClass.specialName;

    characterError.textContent = "";

    classButtons.forEach(function (button) {
        const buttonClass = button.dataset.class;

        if (buttonClass === className) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }
    });
}

/*Save character*/

function saveCharacterAndStartGame() {
    const characterName =
        characterNameInput.value.trim();

    if (characterName === "") {
        characterError.textContent =
            "Please enter a character name.";

        characterNameInput.focus();
        return;
    }

    if (selectedClass === null) {
        characterError.textContent =
            "Please choose a character class.";

        return;
    }

    const character = {
        name: characterName,
        className: selectedClass.name,
        maxHealth: selectedClass.health,
        maxStamina: selectedClass.stamina,
        flasks: selectedClass.flasks,
        specialName: selectedClass.specialName
    };

    localStorage.setItem(
        "darkSiteCharacter",
        JSON.stringify(character)
    );

    window.location.href = "game.html";
}

/*Event listeners*/

classButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedClassName =
            button.dataset.class;

        selectCharacterClass(selectedClassName);
    });
});

startGameButton.addEventListener(
    "click",
    saveCharacterAndStartGame
);

/*
Allows the user to press Enter while typing
their character name.
*/
characterNameInput.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            saveCharacterAndStartGame();
        }
    }
);