<h1>I call it cappuchino :coffee:</h1>

<script>
    let count = 0;

    function increment() {
        count += 1;
    }
</script>

<button on:click={ increment }>
    Pressed { count }
    { count === 1 ? 'time' : 'times' }.
</button>

{#if count > 10}
    <p>Chill out son!</p>
{/if}
