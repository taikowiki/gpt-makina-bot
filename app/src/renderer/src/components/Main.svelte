<script lang="ts">
    import { asideManager } from '../module/asideManager.svelte'
    import { browserState } from '../module/browserState.svelte'
    import { chatManager } from '../module/chatManager.svelte'
    import { roomManager } from '../module/roomManager.svelte'
    import { settingManager } from '../module/settingManager.svelte'
    import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

    let message = $state('')
    let messageLog = $state<
        {
            message: ChatCompletionMessageParam
            time: Date
        }[]
    >([])
    $effect(() => {
        chatManager.getMessageLog(roomManager.currentRoomId).then((log) => (messageLog = log))
    })
</script>

<main
    data-mode={settingManager.mode}
    class:isAsideOpened={asideManager.isOpened}
    class:isMobile={browserState.isMobile}
>
    <button
        onclick={() => {
            asideManager.toggle()
        }}
    >
        토글
    </button>
    <input type="text" bind:value={message} />
    <button
        onclick={async () => {
            const response = await chatManager.sendMessage(message)
            console.log(response)
        }}
    >
        보내기
    </button>
    {#each messageLog.toReversed() as log}
        <div style="margin-bottom: 10px;">
            {log.message.content}
        </div>
    {/each}
</main>

<style>
    main {
        height: 100%;

        &:not(.isMobile) {
            width: calc(100% - 250px);
        }

        &[data-mode='normal'] {
            background-color: #f1f9f7;
        }
        &[data-mode='dark'] {
            background-color: #f6f0f9;
        }
    }

    div {
        word-break: break-word;
        overflow-wrap: break-word;
    }
</style>
