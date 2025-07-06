<script lang="ts">
    import { asideManager } from '../module/asideManager.svelte'
    import { browserState } from '../module/browserState.svelte'
    import { settingManager } from '../module/settingManager.svelte'
    import AsideFooter from './aside/AsideFooter.svelte'
    import AsideHeader from './aside/AsideHeader.svelte'
    import RoomList from './aside/RoomList.svelte'
</script>

<aside
    class:opened={asideManager.isOpened}
    class:isMobile={browserState.isMobile}
    data-mode={settingManager.mode}
>
    <AsideHeader />
    <RoomList />
    <AsideFooter />
</aside>

<style>
    aside {
        height: 100%;

        display: flex;
        flex-direction: column;

        &.isMobile {
            width: 100%;
            position: absolute;
            top: 0;

            transition: transform 0.2s;

            z-index: 5;

            &.opened {
                left: 0;
            }
            &:not(.opened) {
                transform: translateX(-100%);
            }
        }
        &:not(.isMobile) {
            width: 250px;
        }

        &[data-mode='normal'] {
            background-color: #a8d9d3;
        }
        &[data-mode='dark'] {
            background-color: #d5aad1;
        }
    }
</style>
