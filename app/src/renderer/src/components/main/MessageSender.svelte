<script lang="ts">
    import { chatManager } from '../../module/chatManager.svelte'

    let message = $state('')

    let isSending = $state(false)
    let canSend = $derived(message && !isSending)
    let textarea = $state<HTMLTextAreaElement>()

    async function send() {
        if(!canSend) return;
        isSending = true
        if (textarea) textarea.style.height = '70px'
        try {
            const res = chatManager.sendMessage(message)
            message = ''
            await res
        } finally {
            isSending = false
        }
    }

    function resizeHeight(textarea: HTMLTextAreaElement) {
        function resize() {
            if (textarea.scrollHeight > textarea.clientHeight) {
                textarea.style.height = textarea.scrollHeight + 'px'
            }
        }

        textarea.addEventListener('input', resize)
        textarea.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                if (!event.shiftKey) {
                    event.preventDefault();
                    send();
                }
            }
        })

        return {
            destroy() {
                textarea.removeEventListener('input', resize)
            }
        }
    }
</script>

<div class="container">
    <textarea bind:value={message} use:resizeHeight bind:this={textarea}></textarea>
    <div class="second-floor">
        <button onclick={send} disabled={!canSend}>보내기</button>
    </div>
</div>

<style>
    .container {
        width: calc(100% - 20px);
        height: 100px;

        display: flex;
        flex-direction: column;

        box-sizing: border-box;
        margin-left: 10px;

        position: relative;

        background-color: white;

        border-radius: 8px;
    }

    textarea {
        resize: none;
        overflow: hidden;
        font-family: inherit;
        border: 0;

        position: absolute;
        bottom: 30px;

        width: 100%;
        height: 70px;

        box-sizing: border-box;
        padding: 10px;

        border-radius: 8px 8px 0px 0px;
    }
    textarea:focus {
        outline: 0;
    }

    .second-floor {
        margin-top: 70px;
        height: 30px;

        display:flex;
        flex-direction: row-reverse;

        & button{
            background-color: white;
            height: 100%;
        }
    }
</style>
