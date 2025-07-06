<script lang="ts">
    import { asideManager } from "../../module/asideManager.svelte"
    import { roomManager } from "../../module/roomManager.svelte"
</script>

<div class="header">
    <button
        onclick={() => {
            roomManager.newRoom()
        }}
    >
        새 대화
    </button>
    <button
        class="toggle"
        aria-label="toggle"
        disabled={!asideManager.isOpened}
        onclick={() => {
            asideManager.toggle()
        }}
    >
        ◀
    </button>
</div>

<style>
    .header {
        height: 30px;

        display: flex;
        justify-content: space-between;

        padding: 5px;
    }
</style>
