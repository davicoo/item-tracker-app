<template>
  <svg
    viewBox="0 0 600 600"
    class="blob-svg"
  >
    <defs>
      <filter id="goo">
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation="12"
          result="blur"
        />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  
                  0 1 0 0 0  
                  0 0 1 0 0  
                  0 0 0 20 -10"
          result="goo"
        />
        <feBlend
          in="SourceGraphic"
          in2="goo"
        />
      </filter>
    </defs>

    <g filter="url(#goo)">
      <path
        ref="blob"
        :d="blobPaths[0]"
        fill="#6A00FF"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import gsap from 'gsap'

const blob = ref<SVGPathElement | null>(null)

// These two paths must have the same number of points
const blobPaths = [
  // State 1
  'M421,318Q414,386,349,416Q284,446,220,420Q156,394,122,337Q88,280,108,210Q128,140,197,118Q266,96,319,130Q372,164,406,222Q440,280,421,318Z',

  // State 2
  'M400,300Q390,370,330,400Q270,430,210,400Q150,370,130,300Q110,230,160,180Q210,130,270,160Q330,190,370,240Q410,290,400,300Z'
]

onMounted(() => {
  const tl = gsap.timeline({ repeat: -1, yoyo: true })

  tl.to(blob.value, {
    duration: 5,
    attr: { d: blobPaths[1] },
    ease: 'sine.inOut'
  })
})
</script>

<style scoped>
.blob-svg {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 400px;
  height: auto;
  z-index: -1;
}
</style>

