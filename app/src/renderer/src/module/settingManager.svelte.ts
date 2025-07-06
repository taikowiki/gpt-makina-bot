class SettingManager{
    mode: 'normal' | 'dark' | 'custom' = $state('normal');
    customPrompt = $state('');
    baseURL = $state('');
    isApiKeySet = $state(false);

    setMode(mode: 'normal' | 'dark' | 'custom'){
        this.mode = mode;
    }

    async setCustomPrompt(prompt: string){
        const result = await window.api.setCustomPrompt(prompt);
        if(result){
            this.customPrompt = prompt;
        }
        return result;
    }

    async setBaseURL(baseURL: string){
        const result = await window.api.setBaseURL(baseURL);
        if(result){
            this.baseURL = baseURL;
        }
        return result;
    }

    async setApiKey(apiKey: string){
        const result = await window.api.setApiKey(apiKey);
        if(result){
            this.isApiKeySet = true;
        }
        return result;
    }
}

export const settingManager = new SettingManager();