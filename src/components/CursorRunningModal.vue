<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { NModal, NSpace, NButton } from 'naive-ui'

  /**
   * 定义组件属性
   */
  const props = defineProps({
    // 是否显示模态框
    show: {
      type: Boolean,
      required: true,
    },
    // Modal title
    title: {
      type: String,
      default: 'Cursor is Running',
    },
    // Modal content
    content: {
      type: String,
      default:
        'Cursor is running, please save your work before continuing! Not saving will cause Cursor errors! If errors occur, do not contact customer service!',
    },
    // Confirm button text
    confirmButtonText: {
      type: String,
      default: 'I have saved, force close',
    },
    // 确认按钮类型
    confirmButtonType: {
      type: String as () =>
        | 'default'
        | 'tertiary'
        | 'primary'
        | 'info'
        | 'success'
        | 'warning'
        | 'error',
      default: 'warning',
    },
  })

  /**
   * 定义组件事件
   */
  const emit = defineEmits([
    // 关闭模态框事件
    'update:show',
    // 确认操作事件
    'confirm',
    // 取消操作事件
    'cancel',
  ])

  // 内部模态框状态
  const modalVisible = ref(props.show)

  // 监听props.show的变化，更新内部状态
  watch(
    () => props.show,
    (newValue) => {
      modalVisible.value = newValue
    },
  )

  // 监听内部状态变化，更新父组件状态
  watch(modalVisible, (newValue) => {
    if (newValue !== props.show) {
      emit('update:show', newValue)
    }
  })

  /**
   * 处理关闭模态框
   */
  const handleClose = () => {
    modalVisible.value = false
    emit('cancel')
  }

  /**
   * 处理确认按钮点击
   */
  const handleConfirm = () => {
    emit('confirm')
    modalVisible.value = false
  }
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    preset="dialog"
    :title="title"
    :closable="true"
    :mask-closable="false"
    @close="handleClose"
  >
    <template #default>
      {{ content }}
    </template>
    <template #action>
      <n-space justify="end">
        <n-button
          :type="confirmButtonType"
          @click="handleConfirm"
        >
          {{ confirmButtonText }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
