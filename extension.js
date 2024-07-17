const Keyboard = imports.ui.status.keyboard;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Meta = imports.gi.Meta
const Shell = imports.gi.Shell

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.palamar');
        console.log(this.activate);
        Main.wm.addKeybinding(
            `hotkey-lang1`,
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            this.activateEn
        );
        Main.wm.addKeybinding(
            `hotkey-lang2`,
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            this.activateUk
        );
    }

    activateEn(layout) {
        let sources = Keyboard.getInputSourceManager().inputSources;

        for (let index in sources) {
            if (sources[index].id == 'us') {
                
            console.log(sources[index]);
                sources[index].activate();
                return;
            }
        }
    }
    
    activateUk(layout) {
        let sources = Keyboard.getInputSourceManager().inputSources;

        for (let index in sources) {
            if (sources[index].id == 'ua') {
            console.log(sources[index]);
                sources[index].activate();
                return;
            }
        }
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
