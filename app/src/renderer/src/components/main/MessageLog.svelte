<script lang="ts">
    import type { MessageData } from '../../../../types/chat'
    import { chatManager } from '../../module/chatManager.svelte'
    import { roomManager } from '../../module/roomManager.svelte'
    import makinaNormalIcon from '../../assets/img/makina-normal.webp'
    import makinaDarkIcon from '../../assets/img/makina-dark.webp'
    import { marked } from 'marked'
    import { onMount } from 'svelte'

    let messageLog = $state<MessageData[]>([])
    $effect(() => {
        chatManager.getMessageLog(roomManager.currentRoomId)
        .then((log) => {
            messageLog = log
        })
    })

    let container = $state<HTMLDivElement>()
    onMount(() => {
        const observer = new MutationObserver((entries) => {
            entries.forEach((entry) => {
                const lastChild = Array.from((entry.target as HTMLElement).querySelectorAll('.message')).at(-1) as
                    | HTMLElement
                    | undefined;
                if (lastChild && lastChild.nodeType !== Node.TEXT_NODE) {
                    lastChild.scrollIntoView()
                }
            })
        })

        observer.observe(container, { childList: true })
    })

    function getMakinaIcon(mode: MessageData['mode']) {
        if (mode === 'normal') {
            return makinaNormalIcon
        } else if (mode === 'dark') {
            return makinaDarkIcon
        } else {
            return ''
        }
    }
</script>

{#snippet messageView(data: MessageData)}
    <div class="message" class:user={data.message.role === 'user'}>
        {#if data.message.role === 'assistant'}
            <img class="makina-icon" src={getMakinaIcon(data.mode)} alt="makina-icon" />
        {/if}
        <div class={`message-content ${data.message.role} ${data.mode}`}>
            <div>
                {#if data.message.role === 'assistant'}
                    {#if data.message.content}
                        {@html marked.parse(data.message.content)}
                    {:else}
                        <span class={`err`}>🛈 오류가 발생했습니다.</span>
                    {/if}
                {:else}
                    {data.message.content}
                {/if}
            </div>
        </div>
    </div>
{/snippet}

<div class="container" bind:this={container}>
    {#each messageLog as data}
        {@render messageView(data)}
    {/each}
    {#if chatManager.sendingState}
        {@render messageView({
            message: { role: 'assistant', content: '...' },
            mode: chatManager.sendingState.mode,
            time: new Date()
        })}
    {/if}
</div>

<style>
    .container {
        width: 100%;
        height: calc(100% - 100px);

        display: flex;
        flex-direction: column;
        row-gap: 8px;

        overflow-y: auto;

        box-sizing: border-box;
        padding-inline: 15px;
        padding-bottom: 30px;
    }

    .message {
        display: flex;
        flex-direction: row;
        align-items: flex-start;

        &.user {
            flex-direction: row-reverse;
        }
    }

    .makina-icon {
        width: 40px;
        height: auto;

        border-radius: 50%;
    }

    .message-content {
        min-height: 30px;
        border-radius: 10px;
        position: relative;
        box-sizing: border-box;
        padding-inline: 5px;
        padding-block: 8px;

        display: flex;
        align-items: center;

        &.assistant {
            max-width: calc(100% - 50px);
            margin-left: 10px;
            &:after {
                content: '';
                position: absolute;
                left: 1px;
                top: 15px;
                width: 0;
                height: 0;
                border: 14px solid transparent;
                border-left: 0;
                border-top: 0;
                margin-top: -7px;
                margin-left: -14px;
            }

            &.normal {
                background-color: rgb(208, 235, 226);
                &:after {
                    border-right-color: rgb(208, 235, 226);
                }
            }

            &.dark {
                background-color: #ebdef1;
                &:after {
                    border-right-color: #ebdef1;
                }
            }
        }

        &.user {
            background-color: white;
            max-width: calc(100% - 50px);
            margin-right: 10px;
            &:after {
                content: '';
                position: absolute;
                right: 1px;
                top: 15px;
                width: 0;
                height: 0;
                border: 14px solid transparent;
                border-left-color: white;
                border-right: 0;
                border-top: 0;
                margin-top: -7px;
                margin-right: -14px;
            }
        }

        & :global(p) {
            margin: 0;
        }

        & > div {
            transform: translateY(-1px);
        }

        & :global(img) {
            max-width: 100%;
        }
    }

    .err {
        color: red;
    }
</style>
