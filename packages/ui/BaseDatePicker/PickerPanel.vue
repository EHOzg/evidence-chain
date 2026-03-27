<template>
  <div class="picker-panel-content">
    <div class="panel-header">
      <div class="header-btns"><slot name="header-left"></slot></div>
      <div class="header-title">{{ title }}</div>
      <div class="header-btns"><slot name="header-right"></slot></div>
    </div>
    <div class="panel-body">
      <div class="week-bar">
        <span v-for="w in weekList" :key="w">{{ w }}</span>
      </div>
      <div class="days-grid">
        <div
          v-for="item in days"
          :key="item.timestamp"
          class="day-cell"
          :class="getCellClass(item)"
          @click="$emit('select', item.date)"
          @mouseenter="$emit('hover', item.date)">
          <slot name="cell" :date="item.date">{{ item.date.getDate() }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  days: any[]
  weekList: string[]
  getCellClass: (item: any) => any
}>()
defineEmits(['select', 'hover'])
</script>
