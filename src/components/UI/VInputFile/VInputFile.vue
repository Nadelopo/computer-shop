<script setup lang="ts">
import { computed, ref } from 'vue'
import { supabase } from '@/db/supabase'
import {
  StorageError,
  insertInStorage,
  removeFromStorage,
  type Folder
} from '@/db/queries/storage'

type Props = {
  folder: Folder
  fileUrl: string | string[] | undefined
  required?: boolean
  placeholder?: string
  showImgs?: boolean
  multiple?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: true,
  placeholder: 'File input',
  showImgs: true
})

const emit = defineEmits<{
  update: [Event]
  delete: []
}>()

const files = ref<File[]>([])
const isFilesNotEmpty = computed(() => files.value.length)
const onUpdate = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  files.value = Array.from(target.files)
  emit('update', e)
}

const onSave = async () => {
  const filesValue = files.value
  if (!filesValue.length) {
    return { url: props.fileUrl }
  }
  let url: string | string[] | null = null
  if (Array.isArray(props.fileUrl)) {
    url = filesValue.map((f) => URL.createObjectURL(f))
  } else {
    url = URL.createObjectURL(filesValue[0])
  }
  const insertFiles: ReturnType<typeof insertInStorage>[] = []

  let error: StorageError | null = null
  if (Array.isArray(url)) {
    url.forEach((_, i) => {
      insertFiles.push(insertInStorage(props.folder, filesValue[i]))
    })
    const data = await Promise.all(insertFiles)
    error = data.find((e) => e.error !== null)?.error ?? null
    const removeImsage: ReturnType<typeof removeFromStorage>[] = []
    data.forEach(async (d, i) => {
      if (d.error?.statusCode === '409') {
        const {
          data: { publicUrl }
        } = supabase.storage
          .from('storage')
          .getPublicUrl(`${props.folder}/${filesValue[i].name}`)
        d.url = publicUrl
      }
    })
    await Promise.all(removeImsage)
    url = data.map((e) => e.url).filter((e): e is string => e !== null)
  } else {
    const { error: errorImg, url: urlImg } = await insertInStorage(
      props.folder,
      filesValue[0]
    )
    url = urlImg
    error = errorImg
    if (errorImg?.statusCode === '409') {
      const {
        data: { publicUrl }
      } = supabase.storage
        .from('storage')
        .getPublicUrl(`${props.folder}/${filesValue[0].name}`)
      url = publicUrl
    }
  }
  if (error && error.statusCode !== '409') {
    return { error }
  }
  if (Array.isArray(props.fileUrl)) {
    props.fileUrl.forEach((url) => {
      if (Array.isArray(url) && url.find((u) => u !== url)) {
        removeFromStorage(props.folder, url)
      }
    })
  } else if (props.fileUrl !== undefined) {
    if (url !== props.fileUrl) {
      removeFromStorage(props.folder, props.fileUrl)
    }
  }
  if (!url?.length) return
  return { url }
}

const id = props.id ?? self.crypto.randomUUID()

const inputRef = ref<HTMLInputElement>()
const clear = () => {
  files.value = []
  inputRef.value!.value = ''
  emit('delete')
}

defineExpose({
  clear,
  onSave
})

const generateImage = (file: File) => {
  return URL.createObjectURL(file)
}

const isRequired = computed(() => {
  if (!props.required) return false
  if (Array.isArray(props.fileUrl)) {
    return props.fileUrl.length === 0 || !props.fileUrl[0]
  } else {
    return !props.fileUrl
  }
})
</script>

<template>
  <div class="overflow-hidden">
    <span
      class="wrapper"
      :class="{ not__empty: isFilesNotEmpty }"
    >
      <label
        class="placeholder"
        :class="{ top: isFilesNotEmpty }"
      >
        {{ placeholder }}
      </label>
      <div class="files">
        <label
          v-for="file in files"
          :key="file.name"
          class="file"
        >
          {{ file.name }}
        </label>
      </div>
      <input
        :id="id"
        ref="inputRef"
        type="file"
        class="input input__hidden"
        :required="isRequired"
        :multiple="multiple"
        @input="onUpdate"
      />
      <input
        tabindex="-1"
        type="text"
        class="input input__custom"
      />
      <span
        class="clear"
        :class="{ visible: isFilesNotEmpty }"
      >
        <button
          tabindex="-1"
          class="remove__btn"
          @click.prevent="clear"
        >
          <div class="line line-1"></div>
          <div class="line line-2"></div>
        </button>
      </span>
    </span>
    <!-- <Transition
      v-if="showImgs"
      name="images"
    > -->
    <div
      v-if="showImgs && isFilesNotEmpty"
      class="images"
    >
      <div>
        <img
          v-for="file in files"
          :key="file.size"
          :src="generateImage(file)"
          alt="картинка"
        />
      </div>
    </div>
    <!-- </Transition> -->
  </div>
</template>

<style scoped lang="sass">
.wrapper
  position: relative
  overflow: hidden
  display: block
  min-height: 56px
  // margin-bottom: 6px
  &::after
    content: ''
    width: 110%
    height: 2px
    position: absolute
    bottom: 0px
    left: -16px
    background: var(--main)
    transition: 0.4s
    transform: scaleX(0)
  &:focus-within::after
    transform: scaleX(1)
  &:hover .clear.visible
    translate: 0
  &.not__empty
    .files
      padding-top: 26px
      padding-bottom: 10px

.input
  outline: none
  width: 100%
  height: 30px
  border-bottom: 1px solid #9e9e9e
  transition: 0.4s
  cursor: pointer
  min-height: 56px
  top: 0
  position: absolute
  height: 100%
  &::-webkit-file-upload-button
    display: none
  &__hidden
    opacity: 0
    position: absolute
  &__custom
    background: initial
    display: flex
    pointer-events: none

.placeholder
  transition: .3s
  position: absolute
  color: rgba(0, 0, 0, 0.6)
  transform: translateY(50%)
  &.top
    transform: translateY(0)
    font-size: 14px

.clear
  position: absolute
  right: 6px
  top: 26px
  transition: .3s
  translate: 100px

.files
  height: 100%
  width: 100%
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(1px, 160px))
  gap: 4px
  align-items: end
  .file
    border-radius: 4px
    background: var(--main)
    color: #fff
    padding: 0 10px

.remove__btn
  background: red
  width: 24px
  height: 24px
  border-radius: 4px
  display: flex
  justify-content: center
  align-items: center
  position: relative
  transition: .3s
  &:active
    transform: scale(0.9)
  .line
    position: absolute
    background: #fff
    width: 70%
    height: 3px
    border-radius: 20px
    &-1
      transform: rotate(45deg)
    &-2
      transform: rotate(-45deg)

.images
  display: flex
  gap: 8px
  overflow-y: auto
  padding-top: 6px
  &::-webkit-scrollbar
    height: 8px
  &::-webkit-scrollbar-thumb
    background: #7b7b7b
    border-radius: 2px
  img
    height: 156px
    width: 100%
    border-radius: 4px

// .images-enter-from
//   height: 0
//   // padding-top: 0
// .images-enter-to
//   height: 156px
//   // padding-top: 6px
//   transition: height .3s
// .images-leave-from
//   height: 156px
//   // padding-top: 6px
// .images-leave-to
//   height: 0
//   // padding-top: 0
//   transition: height .3s
</style>
