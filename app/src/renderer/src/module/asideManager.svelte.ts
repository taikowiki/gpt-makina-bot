class AsideManager{
    isOpened = $state(true);

    toggle(){
        this.isOpened = !this.isOpened;
    }
}

export const asideManager = new AsideManager();