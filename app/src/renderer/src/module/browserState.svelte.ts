class BrowserState{
    isMobile = $state(false);

    constructor(){
        window.addEventListener('resize', () => {
            if(window.innerWidth < 600){
                this.isMobile = true;
            }
            else{
                this.isMobile = false;
            }
        })
    }
}

export const browserState = new BrowserState();