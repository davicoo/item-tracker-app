<template>
  <div class="fixed bottom-0 right-0 w-full h-full z-0 pointer-events-none">
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
        <group>
          <template
            v-for="i in 8"
            :key="i"
          >
            <Mesh :position="[(i - 4.5) * 0.7, slicePositions[i - 1], 0]">
              <PlaneGeometry :args="[0.6, 1.2]" />
              <BasicMaterial
                :map="textures[i - 1]"
                :alphaMap="maskTexture"
                transparent
                :side="2"
              />
            </Mesh>
          </template>
        </group>
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
  BasicMaterial,
  PlaneGeometry
} from 'troisjs'
import { TextureLoader, type Texture } from 'three'

const textures = ref<Texture[]>([])
const maskTexture = ref<Texture | null>(null)
const slicePositions = ref<number[]>(new Array(8).fill(0))

onMounted(() => {
  const loader = new TextureLoader()
  loader.setCrossOrigin('anonymous')
  loader.load(
    'https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//uglysmall.png',
    (base) => {
      const arr: Texture[] = []
      for (let i = 0; i < 8; i++) {
        const tex = base.clone()
        tex.needsUpdate = true
        tex.offset.set(i * 0.125, 0)
        tex.repeat.set(0.125, 1)
        arr.push(tex)
      }
      textures.value = arr
    }
  )
  loader.load(
    'https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images//oval_mask.png',
    (tex) => {
      maskTexture.value = tex
      tex.needsUpdate = true
    }
  )

  const start = performance.now()
  function animate() {
    const t = (performance.now() - start) / 1000
    slicePositions.value = slicePositions.value.map((_, idx) => Math.sin(t + idx) * 0.05)
    requestAnimationFrame(animate)
  }
  animate()
})
</script>
