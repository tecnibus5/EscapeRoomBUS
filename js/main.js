// Carga de ficheros

async function load_scenes() {
    return fetch('../config/cfg.json')
    .then((response) => {
        if (!response.ok) {
            return null;
        } else {
            return response.json();
        }
    })
    .then((json) => {
        if (json == null) {
            return null;
        } else {
            return json;
        }
    })
}

async function load_texts() {
    return fetch('../assets/txt/textos.txt')
    .then((response) => {
        if (!response.ok) {
            return null;
        } else {
            return response.text();
        }
    })
    .then((text) => {
        if (text == null) {
            return null;
        } else {
            return text.split("\n");
        }
    })
}

function load_initial_scene(scenes) {
    let initial_scene = null;
    scenes.forEach(element => {
        if (element.tipo === "INICIAL") {
            initial_scene = element;
        }
    });
    console.assert(initial_scene != null);
    return initial_scene;
}

function render_text(scene,texts) {
    for(line of scene.textos) {
        console.log(texts[line-1]);
    }
}

function wait_for_input() {
    let action = prompt();
    return action.toUpperCase();
}

function check_valid_action(action,scene) {
    const actionsObject = Object.keys(scene.acciones);
    if (actionsObject.length === 1 && actionsObject[0] === "") {
        return true;
    } else {
        if (actionsObject.includes(action)) {
            return true;
        }
    }
    return false;
}

async function main() {
    const scenes = await load_scenes();
    const texts = await load_texts();

    if (scenes == null || texts == null) {
        alert("No se han encontrado los archivos de juego en el servidor");
        return 0;
    }

    let gameOver = false;
    let currentScene = load_initial_scene(scenes);

    while (gameOver == false) {
        render_text(currentScene,texts);
        let chosenAction = wait_for_input();
        if (check_valid_action(chosenAction,currentScene)) {
            currentScene = scenes.filter(s => s.id === currentScene.acciones[chosenAction])[0];
            if (currentScene.tipo === "FINAL") {
                gameOver = true;
                render_text(currentScene,texts);
            }
        } else {
            console.log(currentScene.error);
        }
    }

    return 0;
}