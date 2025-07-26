<template>
  <div class="fixed inset-0 z-0 pointer-events-none">
    <Renderer
      ref="renderer"
      :alpha="true"
      :orbit-ctrl="{ enableZoom: false, enablePan: false, autoRotate: false }"
      class="w-full h-full"
    >
      <PerspectiveCamera :position="[0, 0, 5]" />
      <Scene>
        <AmbientLight :intensity="0.8" />
        <PointLight :position="[10, 10, 10]" />
        <Group ref="logoGroup">
          <template
            v-for="i in 8"
            :key="i"
          >
            <Mesh :position="[(i - 4.5) * 0.7, 0, 0]">
              <planeGeometry :args="[0.6, 1.2]" />
              <meshBasicMaterial
                :map="texture"

                transparent
                :side="2"
              >
                <vector2
                  name="offset"
                  :args="[(i - 1) * 0.125, 0]"
                />
                <vector2
                  name="repeat"
                  :args="[0.125, 1]"
                />
              </meshBasicMaterial>
            </Mesh>
          </template>
        </Group>
      </Scene>
    </Renderer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Renderer,
  PerspectiveCamera,
  Scene,
  AmbientLight,
  PointLight,
  Mesh,
  Group
} from 'troisjs'
import { TextureLoader, type Texture } from 'three'

const texture = ref<Texture | null>(null)
const logoGroup = ref<any>(null)


onMounted(() => {
  const loader = new TextureLoader()
  loader.load(
    'https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images/uglysmall.png',
    (tex) => {
      texture.value = tex
      tex.needsUpdate = true
    }
  )

  // simple rotation loop to verify the canvas is active
  const animate = () => {
    if (logoGroup.value) {
      logoGroup.value.rotation.y += 0.01
    }
    requestAnimationFrame(animate)
  }
  animate()
})
</script>
