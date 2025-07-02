class SettingManager{
    mode: 'normal' | 'dark' | 'custom' = $state('normal');

    setMode(mode: 'normal' | 'dark' | 'custom'){
        this.mode = mode;
    }
}

export const settingManager = new SettingManager();