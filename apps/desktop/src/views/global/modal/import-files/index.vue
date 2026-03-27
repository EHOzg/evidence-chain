<template>
  <BaseModal
    v-model:visible="visible"
    title="批量导入实体"
    :width="800"
    :simple="true"
    @cancel="visible = false"></BaseModal>
</template>

<script setup lang="ts">
const visible = defineModel<boolean>('visible', {
  default: false,
})
</script>
<style scoped></style>
