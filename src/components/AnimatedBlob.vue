<template>
  <div class="fixed bottom-0 right-0 w-48 h-48 md:w-72 md:h-72 pointer-events-none z-10">
    <Renderer
      ref="renderer"
      :orbit-ctrl="{ enableZoom: false, enablePan: false }"
      class="w-full h-full"
    >
      <PerspectiveCamera :position="[0, 0, 5]" />
      <Scene>
        <AmbientLight :intensity="1.2" />
        <PointLight
          :position="[10, 10, 10]"
          :intensity="1.5"
        />
        <PointLight
          :position="[-10, -10, -10]"
          :intensity="0.5"
        />
        <Sphere
          ref="blob"
          :args="[1, 32, 32]"
        >
          <meshStandardMaterial
            color="#7C3AED"
            roughness="0.2"
            metalness="0.1"
          />
        </Sphere>
      </Scene>
    </Renderer>
  </div>
</template>


<script setup lang="ts">

import { ref, nextTick } from 'vue'
import {
  Renderer,
  PerspectiveCamera,
  Scene,
  AmbientLight,
  PointLight,
  Sphere
} from 'troisjs'

const blob = ref<any>(null)
const renderer = ref<any>(null)

nextTick(() => {
  renderer.value?.onMounted(() => {
    renderer.value?.onBeforeRender(() => {
      if (blob.value) {
        blob.value.rotation.x += 0.01
        blob.value.rotation.y += 0.01
      }
    })
  })
})
</script>
