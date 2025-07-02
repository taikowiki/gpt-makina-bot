<script lang="ts">
    import Aside from './components/Aside.svelte'
    import Main from './components/Main.svelte'
    import ApiKeyModal from './components/modal/ApiKeyModal.svelte'
    import { asideManager } from './module/asideManager.svelte'
    import { browserState } from './module/browserState.svelte'
    import { settingManager } from './module/settingManager.svelte'

    const initialData = window.api.ready();
    let isApiKeySet = $state(initialData.isApiKeySet);

    window.api.setBaseURL("https://factchat-cloud.mindlogic.ai/v1/api/openai");
</script>

<div
    class="container"
    class:isAsideOpened={asideManager.isOpened}
    class:isMobile={browserState.isMobile}
    data-mode={settingManager.mode}
>
    {#if !isApiKeySet}
        <ApiKeyModal bind:isApiKeySet />
    {/if}
    <Aside />
    <Main />
</div>

<style>
    .container {
        display: flex;
        height: 100%;

        transition: transform 0.2s, width 0.2s;

        position: relative;
        z-index: 10;

        &:not(.isMobile) {
            &.isAsideOpened {
                width: 100%;
            }
            &:not(.isAsideOpened) {
                width: calc(100% + 250px);
                transform: translateX(-250px);
            }
        }
        &.isMobile {
            width: 100%;
        }
    }
</style>
