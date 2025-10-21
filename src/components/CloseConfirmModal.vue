<script setup lang="ts">
  import { NModal, NRadioGroup, NRadio, NSpace, NFormItem, useMessage, NCheckbox } from 'naive-ui'
  import { useAppCloseStore } from '@/stores'
  import { useI18n } from '../locales'

  const message = useMessage()
  const appCloseStore = useAppCloseStore()
  const { t } = useI18n()

  // Handle confirm button click
  const handleConfirm = async () => {
    try {
      await appCloseStore.confirmClose()
    } catch (error) {
      message.error(t('closeConfirm.operationFailed'))
    }
  }
</script>

<template>
  <n-modal
    v-model:show="appCloseStore.showConfirmModal"
    preset="dialog"
    :title="t('closeConfirm.title')"
    :positive-text="t('closeConfirm.confirmButton')"
    :negative-text="t('closeConfirm.cancelButton')"
    :mask-closable="false"
    @positive-click="handleConfirm"
    @negative-click="appCloseStore.cancelClose"
  >
    <div style="margin-bottom: 12px">{{ t('closeConfirm.selectCloseMethod') }}</div>

    <n-form-item>
      <n-radio-group v-model:value="appCloseStore.closeType">
        <n-space vertical>
          <n-radio value="minimize">{{ t('closeConfirm.minimizeToTray') }}</n-radio>
          <n-radio value="exit">{{ t('closeConfirm.exitProgram') }}</n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>

    <n-form-item>
      <n-checkbox v-model:checked="appCloseStore.savePreference">{{
        t('closeConfirm.rememberChoice')
      }}</n-checkbox>
    </n-form-item>
  </n-modal>
</template>
