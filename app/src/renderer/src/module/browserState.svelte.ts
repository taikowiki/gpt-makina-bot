import { asideManager } from "./asideManager.svelte";

class BrowserState {
    isMobile = $state(false);

    constructor() {
        this.setIsMobile();
        window.addEventListener('resize', () => {
            this.setIsMobile();
        })
    }

    private setIsMobile() {
        if (window.innerWidth < 600) {
            this.isMobile = true;
            asideManager.isOpened = false;
        }
        else {
            this.isMobile = false;
            asideManager.isOpened = true;
        }
    }
}

export const browserState = new BrowserState();