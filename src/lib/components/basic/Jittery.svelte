<script lang="ts">
  export let text: string;
	export let onhover: boolean = false;
</script>

<span class="jittery{onhover ? '-sel' : ''}">
  {#each text as c, i}
    {#if c != ' '}
      <span style="animation-delay: -{i}70ms;">{c}</span>
    {:else}
      <span>&nbsp;</span>
    {/if}
  {/each}
</span>

<style lang="scss">
  .jittery span {
    animation: jitter 600ms linear infinite;
  	// color: white;
    white-space: nowrap;
  	display: inline-block
  }

	.jittery-sel {
		span {
			// color: white;
    	white-space: nowrap;
  		display: inline-block
		}
    &:hover {
			span {
				animation: jitter 600ms linear infinite;
			}
		}
  }

  @mixin t($tl, $tr, $rot, $col: #663399) {
  	transform:
  		translate(#{$tl}px, #{$tr}px)
  		rotate(#{$rot}deg);
  	color: $col;
  }

  @keyframes jitter {
  	0%   { @include t(0, 1, 0,		#f06f59); }
	  10%  { @include t(1, 2, 1,		#f06f59); }
	  20%  { @include t(0, 1, 0,		#eb9e3b); }
	  30%  { @include t(-1, -1, -1, #eb9e3b); }
	  40%  { @include t(0, -2, 0,		#e2f538); }
	  50%  { @include t(1, -1, 1,		#e2f538); }
	  60%  { @include t(0, 1, 0,		#bada55); }
	  70%  { @include t(1, 2, 1,		#bada55); }
	  80%  { @include t(0, 1, 0,		#4f63e3); }
	  90%  { @include t(-1, -1, -1, #4f63e3); }
	  100% { @include t(0, -2, 0,		#bf85cc); }
  }
</style>
