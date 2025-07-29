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
              <PlaneGeometry :args="[0.6, 1.2]" />
              <BasicMaterial
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
              </BasicMaterial>
            </Mesh>
          </template>
        </Group>
      </Scene>
    </Renderer>
    <!-- simple debug indicator -->
    <div
      v-if="DEBUG"
      class="absolute top-0 left-0 text-xs bg-white/70 p-1"
    >

      Playing: {{ isPlaying }} Loaded: {{ textureLoaded }} Renderer: {{ rendererReady }}
      <span v-if="loadError"> Error: {{ loadError }} </span>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import {
  Renderer,
  PerspectiveCamera,
  Scene,
  AmbientLight,
  PointLight,
  Mesh,
  Group,
  PlaneGeometry,
  BasicMaterial
} from 'troisjs'
import { TextureLoader, type Texture } from 'three'

const texture = ref<Texture | null>(null)
const textureLoaded = ref(false)

const loadError = ref('')
const logoGroup = ref<any>(null)
const renderer = ref<any>(null)
const rendererReady = ref(false)

const isPlaying = ref(false)
const DEBUG = true


onMounted(() => {
  const loader = new TextureLoader()
  loader.setCrossOrigin('anonymous') // modern method

  loader.load(
    'https://ielukqallxtceqmobmvp.supabase.co/storage/v1/object/public/images/uglysmall.png',
    (tex) => {
      texture.value = tex
      tex.needsUpdate = true
      textureLoaded.value = true
      if (DEBUG) console.log('Texture loaded')
    },
    undefined,
    (err) => {
      loadError.value = err?.message || 'Failed to load texture'
      if (DEBUG) console.error('Texture load failed', err)
    }
  )

  nextTick(() => {
    renderer.value?.onMounted?.(() => {
      rendererReady.value = true
      renderer.value?.onBeforeRender(() => {
        if (logoGroup.value) {
          logoGroup.value.rotation.y += 0.01
          isPlaying.value = true
        }
      })
    })
  })
})

  // rotate using renderer's render loop

  nextTick(() => {
    renderer.value?.onMounted?.(() => {
      rendererReady.value = true
      renderer.value?.onBeforeRender(() => {
        if (logoGroup.value) {
          logoGroup.value.rotation.y += 0.01
          isPlaying.value = true
        }
      })
    })
  })
})
</script>
