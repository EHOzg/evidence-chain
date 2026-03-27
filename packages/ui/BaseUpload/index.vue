<template>
  <div class="base-upload" :class="{ 'is-disabled': disabled }">
    <!-- 上传触发区域 -->
    <div
      class="upload-trigger"
      :class="{ 'is-dragover': isDragOver, 'is-draggable': draggable }"
      @click="triggerSelect"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop">
      <!-- 隐藏的原生输入框 -->
      <input
        ref="inputRef"
        type="file"
        class="upload-input"
        :name="name"
        :multiple="multiple"
        :accept="accept"
        :webkitdirectory="directory"
        @change="handleFileChange" />

      <!-- 插槽自定义触发区，或者使用默认的拖拽/点击区块 -->
      <slot>
        <div class="upload-trigger-default">
          <svg
            class="upload-icon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="16 16 12 12 8 16"></polyline>
            <line x1="12" y1="12" x2="12" y2="21"></line>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
            <polyline points="16 16 12 12 8 16"></polyline>
          </svg>
          <div class="upload-text">
            <span v-if="draggable">点击或拖拽文件到此处上传</span>
            <span v-else>点击上传文件</span>
          </div>
        </div>
      </slot>
    </div>

    <!-- 独立上传列表区 -->
    <transition-group
      name="upload-list"
      tag="ul"
      class="upload-list"
      v-if="showFileList && currentFileList.length > 0">
      <li
        v-for="file in currentFileList"
        :key="file.uid"
        class="upload-list-item"
        :class="[`is-${file.status}`]">
        <div class="file-info">
          <svg
            class="file-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            stroke="currentColor"
            stroke-width="2"
            fill="none">
            <path
              d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          <span class="file-name" :title="file.name">{{ file.name }}</span>

          <div class="file-status">
            <svg
              v-if="file.status === 'success'"
              class="status-icon success"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              fill="none">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <svg
              v-else-if="file.status === 'error'"
              class="status-icon error"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span v-else-if="file.status === 'uploading'" class="status-text"
              >{{ Math.floor(file.percent || 0) }}%</span
            >

            <svg
              class="remove-icon"
              @click.stop="handleRemove(file)"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="file.status === 'uploading'" class="upload-progress">
          <div
            class="upload-progress-bar"
            :style="{ width: `${file.percent || 0}%` }"></div>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

defineOptions({ name: 'BaseUpload' })

export interface FileItem {
  uid: string
  status?: 'init' | 'uploading' | 'success' | 'error' | 'done'
  name: string
  size?: number
  percent?: number
  file?: File
  url?: string
  response?: any
}

const props = withDefaults(
  defineProps<{
    action?: string
    headers?: Record<string, string>
    data?: Record<string, any>
    name?: string
    multiple?: boolean
    accept?: string
    autoUpload?: boolean
    directory?: boolean
    draggable?: boolean
    fileList?: FileItem[]
    defaultFileList?: FileItem[]
    limit?: number
    disabled?: boolean
    showFileList?: boolean
    // 钩子函数
    beforeUpload?: (file: File) => boolean | Promise<boolean | File>
    customRequest?: (options: any) => any // 自定义上传行为
  }>(),
  {
    name: 'file',
    autoUpload: true,
    showFileList: true,
  },
)

const emit = defineEmits<{
  (e: 'update:fileList', val: FileItem[]): void
  (e: 'change', fileList: FileItem[], fileItem: FileItem): void
  (e: 'progress', fileItem: FileItem, event: any): void
  (e: 'success', fileItem: FileItem, response: any): void
  (e: 'error', fileItem: FileItem, error: any): void
  (e: 'remove', fileItem: FileItem): void
  (e: 'exceed', files: File[], fileList: FileItem[]): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const innerFileList = ref<FileItem[]>([...(props.defaultFileList || [])])

// 受控模式与非受控模式结合
const currentFileList = ref<FileItem[]>([])
watch(
  () => props.fileList,
  (val) => {
    if (val) {
      currentFileList.value = val
    }
  },
  { immediate: true, deep: true },
)
watch(
  innerFileList,
  (val) => {
    if (!props.fileList) {
      currentFileList.value = val
    }
  },
  { deep: true, immediate: true },
)

const triggerSelect = () => {
  if (props.disabled) return
  inputRef.value?.click()
}

const handleDragOver = (_e: DragEvent) => {
  if (props.disabled || !props.draggable) return
  isDragOver.value = true
}

const handleDragLeave = (_e: DragEvent) => {
  if (props.disabled || !props.draggable) return
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  if (props.disabled || !props.draggable) return
  isDragOver.value = false
  if (e.dataTransfer && e.dataTransfer.files) {
    processFiles(Array.from(e.dataTransfer.files))
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
  target.value = '' // 清空以便同名文件可二次选择
}

const processFiles = async (rawFiles: File[]) => {
  let filesToUpload = rawFiles

  // 处理限制数量
  if (props.limit) {
    const spaceLeft = props.limit - currentFileList.value.length
    if (filesToUpload.length > spaceLeft) {
      emit('exceed', filesToUpload, currentFileList.value)
      filesToUpload = filesToUpload.slice(0, Math.max(0, spaceLeft))
    }
  }

  for (const file of filesToUpload) {
    const fileItem: FileItem = {
      uid: String(Date.now() + Math.random()),
      name: file.name,
      size: file.size,
      status: 'init',
      percent: 0,
      file: file,
    }

    // 生命周期 - beforeUpload
    let canUpload: boolean | File = true
    if (props.beforeUpload) {
      try {
        const result = await props.beforeUpload(file)
        if (result === false) {
          canUpload = false
        } else if (result instanceof File) {
          canUpload = result
          fileItem.file = result
          fileItem.name = result.name
        }
      } catch (e) {
        canUpload = false
      }
    }

    if (canUpload === false) continue

    const updatedList = [...currentFileList.value, fileItem]
    updateList(updatedList, fileItem)

    if (props.autoUpload) {
      uploadFile(fileItem)
    }
  }
}

const updateList = (newList: FileItem[], fileItem: FileItem) => {
  if (!props.fileList) {
    innerFileList.value = newList
  }
  emit('update:fileList', newList)
  emit('change', newList, fileItem)
}

const handleRemove = (fileItem: FileItem) => {
  if (props.disabled) return
  const newList = currentFileList.value.filter((i) => i.uid !== fileItem.uid)
  updateList(newList, fileItem)
  emit('remove', fileItem)
}

// 核心上传逻辑
const uploadFile = async (fileItem: FileItem) => {
  fileItem.status = 'uploading'
  fileItem.percent = 0

  if (props.customRequest) {
    // 允许通过 customRequest 覆盖原生上传
    props.customRequest({
      fileItem,
      onProgress: (percent: number) => {
        fileItem.percent = percent
        emit('progress', fileItem, percent)
      },
      onSuccess: (res: any) => {
        fileItem.status = 'success'
        fileItem.percent = 100
        fileItem.response = res
        emit('success', fileItem, res)
      },
      onError: (err: any) => {
        fileItem.status = 'error'
        emit('error', fileItem, err)
      },
    })
    return
  }

  if (!props.action) {
    console.warn('[BaseUpload] 缺少 action 地址')
    fileItem.status = 'error'
    return
  }

  const formData = new FormData()
  formData.append(props.name || 'file', fileItem.file!)
  if (props.data) {
    for (const [key, val] of Object.entries(props.data)) {
      formData.append(key, val)
    }
  }

  const xhr = new XMLHttpRequest()
  xhr.open('POST', props.action, true)

  if (props.headers) {
    for (const [key, val] of Object.entries(props.headers)) {
      xhr.setRequestHeader(key, val)
    }
  }

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.floor((e.loaded / e.total) * 100)
      fileItem.percent = percent
      emit('progress', fileItem, e)
    }
  }

  xhr.onload = () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      fileItem.status = 'error'
      emit('error', fileItem, xhr.responseText)
      return
    }
    const res = xhr.responseText
    try {
      fileItem.response = JSON.parse(res)
    } catch {
      fileItem.response = res
    }
    fileItem.status = 'success'
    fileItem.percent = 100
    emit('success', fileItem, fileItem.response)
  }

  xhr.onerror = (e) => {
    fileItem.status = 'error'
    emit('error', fileItem, e)
  }

  xhr.send(formData)
}

// 提供手动触发接口
const submit = () => {
  currentFileList.value.forEach((file) => {
    if (file.status === 'init') {
      uploadFile(file)
    }
  })
}

defineExpose({ submit })
</script>

<style scoped lang="scss">
.base-upload {
  width: 100%;

  &.is-disabled {
    .upload-trigger {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
}

.upload-input {
  display: none; // 隐藏物理节点
}

.upload-trigger {
  width: 100%;
  cursor: pointer;
  border-radius: $radius-m;
  transition: all 0.2s;

  &-default {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    padding: 24px;
    background-color: $bg-3;
    border: 1px dashed $b-2;
    border-radius: $radius-m;
    transition:
      background-color 0.2s,
      border-color 0.2s;

    .upload-icon {
      color: $t-3;
      margin-bottom: 12px;
      transition: color 0.2s;
    }

    .upload-text {
      font-size: 14px;
      color: $t-1;
    }
  }

  &:hover:not(.is-disabled) .upload-trigger-default {
    border-color: $p;
    background-color: color-mix(in srgb, var(--primary) 4%, transparent);

    .upload-icon {
      color: $p;
    }
  }

  &.is-dragover:not(.is-disabled) .upload-trigger-default {
    border-color: $p;
    background-color: color-mix(in srgb, var(--primary) 10%, transparent);
  }
}

.upload-list {
  margin: 16px 0 0 0;
  padding: 0;
  list-style: none;

  .upload-list-item {
    position: relative;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: $radius-s;
    background-color: $bg-3;
    border: 1px solid transparent;
    transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);

    &:hover {
      background-color: $bg-h;

      .file-status {
        .status-icon,
        .status-text {
          display: none; // 悬浮时隐藏状态，展示删除图标
        }
        .remove-icon {
          display: block; // 悬浮时展示删除图标
        }
      }
    }

    &.is-error {
      border-color: rgba($danger, 0.3);
      background-color: color-mix(in srgb, var(--danger) 4%, transparent);

      .file-name {
        color: $danger;
      }
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .file-icon {
        color: $t-3;
        flex-shrink: 0;
      }

      .file-name {
        flex: 1;
        font-size: 14px;
        color: $t-1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.2s;
      }
    }

    .file-status {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;

      .status-icon {
        &.success {
          color: $success;
        }
        &.error {
          color: $danger;
        }
      }

      .status-text {
        font-size: 12px;
        color: $p;
        font-weight: bold;
      }

      .remove-icon {
        display: none; // 默认隐藏
        color: $t-3;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: $danger;
        }
      }
    }

    .upload-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: transparent;
      overflow: hidden;
      border-radius: 0 0 $radius-s $radius-s;

      &-bar {
        height: 100%;
        background-color: $p;
        transition: width 0.3s cubic-bezier(0.34, 0.69, 0.1, 1);
      }
    }
  }
}

// 列表过渡动画
.upload-list-enter-active,
.upload-list-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 0.69, 0.1, 1);
}
.upload-list-enter-from,
.upload-list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
