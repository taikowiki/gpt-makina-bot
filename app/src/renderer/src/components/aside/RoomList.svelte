<script lang="ts">
    import { asideManager } from '../../module/asideManager.svelte'
    import { browserState } from '../../module/browserState.svelte'
    import { roomManager } from '../../module/roomManager.svelte'
</script>

<div class="room-list">
    {#each roomManager.roomIds.toReversed() as roomId}
        <div
            class="room"
            class:selected={roomManager.currentRoomId === roomId}
            role="presentation"
            onclick={() => {
                roomManager.setCurrentRoom(roomId);
                if(browserState.isMobile){
                    asideManager.toggle();
                }
            }}
        >
            <div>
                {roomManager.roomMap[roomId].subject}
            </div>
            <button class="remove" onclick={(event) => {
                event.stopPropagation();
                roomManager.deleteRoom(roomId);
            }}>
                🗑
            </button>
        </div>
    {/each}
</div>

<style>
    .room-list {
        height: calc(100% - 80px);

        display:flex;
        flex-direction: column;
        row-gap: 3px;

        box-sizing: border-box;
        padding: 5px;

        overflow-y: auto;
    }

    .room {
        width: 100%;
        min-height: 25px;

        box-sizing: border-box;
        padding-inline: 2px;
        
        cursor: pointer;

        border-radius: 5px;

        display:flex;
        align-items: center;
        justify-content: space-between;

        &:hover {
            background-color: rgba(148, 148, 148, 0.306);
        }
        &.selected {
            font-weight: bold;
        }
    }

    .remove{
        width: 25px;
        height: 25px;

        display:flex;
        justify-content: center;
        align-items: center;

        color: red;

        font-size: 20px;
    }
</style>
