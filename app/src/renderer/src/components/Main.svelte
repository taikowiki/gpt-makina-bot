<script lang="ts">
    import { asideManager } from '../module/asideManager.svelte'
    import { browserState } from '../module/browserState.svelte'
    import { settingManager } from '../module/settingManager.svelte'
    import MessageLog from './main/MessageLog.svelte'
    import MessageSender from './main/MessageSender.svelte'
</script>

<main
    data-mode={settingManager.mode}
    class:isAsideOpened={asideManager.isOpened}
    class:isMobile={browserState.isMobile}
>
    <button
        class="toggle"
        aria-label="toggle"
        disabled={asideManager.isOpened}
        onclick={() => {
            asideManager.toggle()
        }}
    >
        ▶
    </button>
    <MessageLog />
    <MessageSender />
</main>

<style>
    main {
        height: 100%;

        box-sizing: border-box;
        padding-block: 10px;

        position: relative;

        &:not(.isMobile) {
            width: calc(100% - 250px);
        }
        &.isMobile {
            width: 100%;
        }

        &[data-mode='normal'] {
            background-color: #e9f3f0;
        }
        &[data-mode='dark'] {
            background-color: #f6f0f9;
        }
    }

    .toggle {
        width: 30px;
        height: 30px;

        position: absolute;
        left: 15px;

        &:disabled {
            display: none;
        }
    }
</style>
