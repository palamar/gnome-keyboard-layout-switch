import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Keyboard from 'resource:///org/gnome/shell/ui/status/keyboard.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';



export default class KlspExtension extends Extension {
    settings?: Gio.Settings
    indicator?: PanelMenu.Button
    dbus?: 
    screenSaver?:
    const dbusSessionSubscription = `<node>
        <interface name="dev.palamar.klsp">
            <method name="reset">
            <arg type="b" direction="out" name="success"/>
            <arg type="s" direction="out" name="returnValue"/>
            </method>
        </interface>
    </node>`;

    enable() {
        this.dbus = Gio.DBusExportedObject.wrapJSObject(this.dbusSessionSubscription, this);
        this.dbus.export(Gio.DBus.session, "/dev/palamar/klsp");

        this.ScreenSaver = Gio.DBus.session.signal_subscribe(
            null, 
            'org.gnome.ScreenSaver', 
            'ActiveChanged', 
            '/org/gnome/ScreenSaver', 
            null, 
            Gio.DBusSignalFlags.NONE,
            () => this.reset()
        );
        let sources: any = (Keyboard.getInputSourceManager()).inputSources.sort();
        this.addStatusIcon();
        this.settings = this.getSettings('org.gnome.shell.extensions.klsp');
        this.settings.settings_schema.list_keys().forEach((keyName) => {
            let keyNameParts = keyName.split('-');
            if (keyNameParts.length != 3) {
                return;
            }
            Main.wm.addKeybinding(
                keyName,
                this.settings,
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
                () => this.activateLang(keyNameParts[2])
            );
        });
    }

    disable() {
        this.indicator?.destroy();
        this.indicator = undefined;
    }

    addStatusIcon() {
        // Create a panel button
        this.indicator = new PanelMenu.Button(
            0.0, 
            this.metadata.name, 
            false
        );

        // Add an icon
        const icon = new St.Icon({
            icon_name: 'preferences-desktop-keyboard-shortcuts',
            style_class: 'system-status-icon',
        });
        this.indicator.add_child(icon);

        // Add the indicator to the panel
        Main.panel.addToStatusArea(this.uuid, this.indicator);

        // Add a menu item to open the preferences window
        this.indicator.menu.addAction(
            'Preferences',
            () => this.openPreferences(),
        );

        // Create a new GSettings object, and bind the "show-indicator"
        // setting to the "visible" property.
        this.settings = this.getSettings();
        this.settings.bind(
            'show-indicator', 
            this.indicator, 
            'visible',
            Gio.SettingsBindFlags.DEFAULT,
        );

        // Watch for changes to a specific setting
        this.settings.connect(
            'changed::show-indicator', 
            (settings, key) => {
                console.debug(`${key} = ${settings.get_value(key).print(true)}`);
        });
    }

    reset() {
        this.activateLang('en');
    }

    activateLang(lang: String) {
        let sources: any = (Keyboard.getInputSourceManager()).inputSources;
        for (let index in sources) {
            if (sources[index].id != lang) {
                continue;
            }
            sources[index].activate();
            return;
        }
    }
}

