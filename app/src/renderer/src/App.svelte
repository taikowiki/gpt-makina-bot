<script lang="ts">
    let apiKey = $state("");
    let message = $state("");

    const roomId = crypto.randomUUID();

    async function setApiKey(){
        if(await window.api.setApiKey(apiKey)){
            alert("성공")
        }
        else{
            alert("실패");
        }
    }

    async function sendMessage(){
        const response = await window.api.sendMessage({
            roomId,
            message,
            type: 'dark'
        });

        console.log(response);
    }
</script>

<input type="text" bind:value={apiKey}/>
<button onclick={setApiKey}>
    key
</button>
<input type="text" bind:value={message}/>
<button onclick={sendMessage}>
    보내기
</button>