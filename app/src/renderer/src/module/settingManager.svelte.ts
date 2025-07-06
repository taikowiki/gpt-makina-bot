class SettingManager{
    mode: 'normal' | 'dark' | 'custom' = $state('normal');

    setMode(mode: 'normal' | 'dark' | 'custom'){
        this.mode = mode;
    }

    async setCustomPrompt(prompt: string | string[]){
        
    }
}

export const settingManager = new SettingManager();