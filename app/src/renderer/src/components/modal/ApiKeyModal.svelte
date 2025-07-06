<script lang="ts">
    import { onMount } from 'svelte'
    import { settingManager } from '../../module/settingManager.svelte'

    let dialog = $state<HTMLDialogElement>()
    let apiKeyInputValue = $state("");
    let errorMsg = $state("");

    onMount(() => {
        dialog.showModal()
    })

    async function setApiKey(){
        if(!apiKeyInputValue){
            errorMsg = "API Key를 입력해주세요.";
            return;
        };

        const result = await settingManager.setApiKey(apiKeyInputValue);

        if(!result){
            errorMsg = "오류가 발생했습니다.";
            return;
        }
    }
</script>

<dialog bind:this={dialog}>
    <div class="container">
        <span> API Key가 설정되지 않았습니다. </span>
        {#if errorMsg}
            <span class="error">{errorMsg}</span>
        {/if}
        <input bind:value={apiKeyInputValue} placeholder="API Key" />
        <button onclick={setApiKey}> 저장 </button>
    </div>
</dialog>

<style>
    dialog {
        width: 100%;
        max-width: 300px;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 10px;

        width: 100%;
    }

    input {
        width: 100%;
        max-width: 250px;
        height: 25px;
    }

    .error{
        color: red;
    }
</style>
