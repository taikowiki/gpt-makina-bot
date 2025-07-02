<script lang="ts">
    import { asideManager } from '../module/asideManager.svelte'
    import { browserState } from '../module/browserState.svelte'
    import { roomManager } from '../module/roomManager.svelte'
    import { settingManager } from '../module/settingManager.svelte'
</script>

<aside
    class:opened={asideManager.isOpened}
    class:isMobile={browserState.isMobile}
    data-mode={settingManager.mode}
>
    <div class="header">
        <button
            onclick={() => {
                if(settingManager.mode === 'normal'){
                    settingManager.setMode('dark')
                }
                else{
                    settingManager.setMode('normal')
                }
            }}
        >
            토글
        </button>
    </div>
    <div class="rooms">
        {#each roomManager.roomIds.toReversed() as roomId}
            <div class="room" role='presentation' onclick={() => {
                roomManager.setCurrentRoom(roomId)
            }}>
                {roomManager.roomMap[roomId].subject}
            </div>
        {/each}
    </div>
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

        &[data-mode="normal"]{
            background-color: #a8d9d3;
        }
        &[data-mode="dark"]{
            background-color: #d5aad1;
        }
    }
</style>
