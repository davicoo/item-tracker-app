<template>
  <div class="fixed bottom-0 right-0 w-48 h-48 md:w-72 md:h-72 pointer-events-none z-10">
    <Renderer orbit-ctrl>
      <PerspectiveCamera :position="[0, 0, 5]" />
      <Scene>
        <AmbientLight :intensity="0.8" />
        <PointLight :position="[10, 10, 10]" />
        <Sphere :args="[1, 32, 32]">
          <meshStandardMaterial
            color="#7C3AED"
            roughness="0.2"
            metalness="0.6"
          />
        </Sphere>
      </Scene>
    </Renderer>
  </div>
</template>

<script setup>
import {
  Renderer,
  PerspectiveCamera,
  Scene,
  AmbientLight,
  PointLight,
  Sphere
} from 'troisjs'
</script>
