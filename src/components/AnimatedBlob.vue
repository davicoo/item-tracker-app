<template>
  <div class="fixed bottom-0 right-0 w-48 h-48 md:w-72 md:h-72 pointer-events-none z-10">
    <Canvas>
      <PerspectiveCamera :position="[0, 0, 5]" />
      <AmbientLight :intensity="0.8" />
      <PointLight :position="[10, 10, 10]" />
      <OrbitControls
        :enable-zoom="false"
        :enable-pan="false"
        :auto-rotate="true"
      />
      <Sphere :args="[1, 32, 32]">
        <meshStandardMaterial
          color="#7C3AED"
          roughness="0.2"
          metalness="0.6"
        />
      </Sphere>
    </Canvas>
  </div>
</template>

<script setup>
import {
  Canvas,
  PerspectiveCamera,
  AmbientLight,
  PointLight,
  OrbitControls,
  Sphere
} from 'troisjs'
</script>
