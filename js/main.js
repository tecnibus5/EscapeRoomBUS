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
    let initial_scene = scenes.filter(s => s.tipo === "INICIAL");
    console.assert(initial_scene.length > 0);
    return initial_scene[0];
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
    const actionsArray = Object.keys(scene.acciones);
    if (is_auto_scene(scene) || actionsArray.includes(action)) {
        return true;
    }
    return false;
}

function get_next_scene(scene,action) {
    if (is_auto_scene(scene)) {
        return scene.acciones[""];
    }
    return scene.acciones[action];
}

function is_auto_scene(scene) {
    const actionsArray = Object.keys(scene.acciones);
    if (actionsArray.length === 1 && actionsArray[0] === "") {
        return true;
    }
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
    let errorState = false;

    while (!gameOver) {
        if (!errorState) render_text(currentScene,texts);
        errorState = false;
        let chosenAction = wait_for_input();
        if (check_valid_action(chosenAction,currentScene)) {
            let nextScene = get_next_scene(currentScene,chosenAction);
            currentScene = scenes.filter(s => s.id === nextScene)[0];
            if (currentScene.tipo === "FINAL") {
                gameOver = true;
                render_text(currentScene,texts);
            }
        } else {
            errorState = true;
            console.log(currentScene.error);
        }
    }

    return 0;
}