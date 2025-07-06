<script lang="ts">
    import { onMount } from 'svelte'
    import { settingManager } from '../../module/settingManager.svelte'

    let dialog = $state<HTMLDialogElement>();

    let mode = $state(settingManager.mode);
    let customPrompt = $state(settingManager.customPrompt);
    let baseURL = $state(settingManager.baseURL);
    let apiKey = $state('');
    let model = $state(settingManager.model);

    onMount(() => {
        if (!dialog) return
        dialog.addEventListener('click', (e) => {
            const rect = dialog.getBoundingClientRect()
            const isInDialog =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom

            if (!isInDialog) {
                dialog.close()
            }
        })
    })

    async function save(){
        settingManager.setMode(mode);
        await settingManager.setModel(model);
        await settingManager.setBaseURL(baseURL);
        if(apiKey){
            await settingManager.setApiKey(apiKey);
        }
        dialog.close();
    }
</script>

<div class="footer">
    <button
        class="setting"
        onclick={() => {
            dialog.showModal()
        }}>⚙</button
    >
</div>

<dialog bind:this={dialog}>
    <div>
        <div class="section">
            <div class="section-title">
                모드
            </div>
            <div class="section-content">
                <label>
                    <input type="radio" value="normal" bind:group={mode}>
                    마키나
                </label>
                <label>
                    <input type="radio" value="dark" bind:group={mode}>
                    마키나 the DARK
                </label>
                <label>
                    <input type="radio" value="custom" bind:group={mode}>
                    커스텀
                </label>
                {#if mode==='custom'}
                    <div>
                        <textarea bind:value={customPrompt}></textarea>
                    </div>
                {/if}
            </div>
        </div>
        <div class="section">
            <div class="section-title">
                모델
            </div>
            <div class="section-content">
                <select bind:value={model}>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-4.1">gpt-4.1</option>
                    <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                    <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                </select>
            </div>
        </div>
        <div class="section">
            <div class="section-title">
                Base URL
            </div>
            <div class="section-content">
                <input type="text" bind:value={baseURL}/>
            </div>
        </div>
        <div class="section">
            <div class="section-title">
                Api Key
            </div>
            <div class="section-content">
                <input type="text" bind:value={apiKey}/>
            </div>
        </div>
        <button onclick={save}>
            저장
        </button>
    </div>
</dialog>

<style>
    .footer {
        height: 30px;

        box-sizing: border-box;
        padding: 5px;

        display: flex;
        flex-direction: row-reverse;
    }

    button.setting {
        width: 30px;
        height: 30px;

        display: flex;
        justify-content: center;
        align-items: center;

        font-size: 20px;
        font-weight: bold;
    }

    dialog{
        border: 2px solid black;
        border-radius: 10px;

        max-width: 400px;

        & > div{
            width: 100%;
            height: 100%;

            display:flex;
            flex-direction: column;
            align-items: center;

            row-gap: 10px;
        }
    }

    .section{
        width: 100%;
    }

    .section-title{
        width: 100%;
        font-weight: bold;
        font-size: 20px;
    }

    textarea{
        width: 100%;
        resize:vertical
    }

    input[type="text"]{
        width: 100%;
        height: 25px;
    }
</style>
