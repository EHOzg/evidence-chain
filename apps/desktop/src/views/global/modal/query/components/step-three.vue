<template>
  <div class="step-three-wrapper">
    <BaseForm ref="formRef" :model="extInfo" layout="vertical">
      <!-- 调证基本信息 -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">调证基本信息</div>
        </div>
        <div class="section-content">
          <!-- 第一行：申请人三个字段（只读禁用） -->
          <div class="form-row grid-3">
            <BaseFormItem
              label="申请人单位"
              field="applyUnitName"
              hide-asterisk
              :rules="[{ required: true, message: '必填', trigger: 'submit' }]">
              <BaseInput
                v-model="extInfo.applyUnitName"
                disabled
                placeholder="—" />
            </BaseFormItem>
            <BaseFormItem
              label="申请人姓名"
              field="applyUserName"
              hide-asterisk
              :rules="[{ required: true, message: '必填', trigger: 'submit' }]">
              <BaseInput
                v-model="extInfo.applyUserName"
                disabled
                placeholder="—" />
            </BaseFormItem>
            <BaseFormItem
              label="申请人电话"
              field="applyPhone"
              hide-asterisk
              :rules="[{ required: true, message: '必填', trigger: 'submit' }]">
              <BaseInput
                v-model="extInfo.applyPhone"
                disabled
                placeholder="—" />
            </BaseFormItem>
          </div>

          <!-- 第二行：资质名称（只读）+ 日期范围（可编辑） -->
          <div class="form-row grid-2-date">
            <BaseFormItem
              label="资质名称"
              hide-asterisk>
              <BaseInput
                :model-value="serviceInfo?.name || ''"
                disabled
                placeholder="—" />
            </BaseFormItem>

            <BaseFormItem
              label="日期范围"
              field="dateRange"
              hide-asterisk
              :rules="[{ required: true, message: '请选择日期范围', trigger: 'submit' }]">
              <div class="date-range-box">
                <BaseDatePicker
                  v-model="dateRange"
                  mode="range"
                  style="width: 280px"
                  @change="handleDateChange" />
                <div class="quick-btns">
                  <BaseButton
                    v-for="item in quickDateOptions"
                    :key="item.value"
                    size="small"
                    @click="setQuickDate(item.value)">
                    {{ item.label }}
                  </BaseButton>
                </div>
              </div>
            </BaseFormItem>
          </div>
        </div>
      </div>

      <!-- 案件信息 -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">案件信息</div>
        </div>
        <div class="section-content">
          <div class="form-row grid-3">
            <BaseFormItem
              field="caseName"
              hide-asterisk
              label="案件名称"
              :rules="[{ required: true, message: '请输入案件名称', trigger: 'submit' }]">
              <BaseInput v-model="extInfo.caseName" placeholder="请输入" />
            </BaseFormItem>
            <BaseFormItem
              field="caseNo"
              hide-asterisk
              label="案件编号"
              :rules="[{ required: true, message: '请输入案件编号', trigger: 'submit' }]">
              <BaseInput v-model="extInfo.caseNo" placeholder="请输入" />
            </BaseFormItem>
            <BaseFormItem
              field="caseReason"
              hide-asterisk
              label="案件事由"
              :rules="[{ required: true, message: '请输入案件事由', trigger: 'submit' }]">
              <BaseInput v-model="extInfo.caseReason" placeholder="请输入" />
            </BaseFormItem>
          </div>
          <div class="form-row">
            <BaseFormItem
              field="specialRequire"
              hide-asterisk
              label="概要说明"
              :rules="[{ required: true, message: '请输入概要说明', trigger: 'submit' }]">
              <BaseInput
                v-model="extInfo.specialRequire"
                type="textarea"
                :rows="2"
                placeholder="请输入" />
            </BaseFormItem>
          </div>
        </div>
      </div>

      <!-- 手续文书 -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">手续文书</div>
        </div>
        <div class="section-content">
          <div class="document-item">
            <div class="doc-label required">调证通知书</div>
            <div class="doc-content">
              <div class="notice-prefix-group">
                <BaseFormItem field="noticePre" hide-label hide-asterisk :rules="[{ required: true, message: '必填', trigger: 'submit' }]" style="margin-bottom: 0">
                  <BaseInput
                    v-model="extInfo.noticePre"
                    placeholder="文书前缀标识"
                    style="width: 160px" />
                </BaseFormItem>
                <span class="symbol">(</span>
                <BaseFormItem field="noticeMain" hide-label hide-asterisk :rules="[{ required: true, message: '必填', trigger: 'submit' }]" style="margin-bottom: 0">
                  <BaseInput
                    v-model="extInfo.noticeMain"
                    placeholder="通知书主体"
                    style="width: 140px" />
                </BaseFormItem>
                <span class="symbol">)</span>
                <BaseFormItem field="noticeNo" hide-label hide-asterisk :rules="[{ required: true, message: '必填', trigger: 'submit' }]" style="flex: 1; margin-bottom: 0">
                  <BaseInput
                    v-model="extInfo.noticeNo"
                    placeholder="通知书编号"
                    style="width: 100%" />
                </BaseFormItem>
                <span class="unit">号</span>
              </div>
              <div class="upload-tip">
                上限5张，大小不超过10M，支持.jpg .png .bmp .pdf
              </div>
              <BaseFormItem
                field="verifyNotice"
                hide-label
                hide-asterisk
                :rules="[{ required: true, validator: (v: any, cb: any) => { if (!v || !v.length) cb('请上传文件') }, trigger: 'submit' }]"
                style="margin-bottom: 0">
                <div class="upload-actions">
                  <BaseButton variant="primary" size="small">
                    系统生成
                  </BaseButton>
                  <BaseUpload
                    v-model:fileList="extInfo.verifyNotice"
                    :limit="5"
                    accept=".jpg,.png,.bmp,.pdf">
                    <BaseButton variant="primary" size="small" icon="upload">
                      上传文件
                    </BaseButton>
                  </BaseUpload>
                </div>
              </BaseFormItem>
            </div>
          </div>

          <div class="document-item" style="margin-top: 24px">
            <div class="doc-label required">调取证据清单</div>
            <div class="doc-content">
              <div class="upload-tip">
                上限10张，大小不超过10M，支持.jpg .png .bmp .pdf
              </div>
              <BaseFormItem
                field="verifyList"
                hide-label
                hide-asterisk
                :rules="[{ required: true, validator: (v: any, cb: any) => { if (!v || !v.length) cb('请上传文件') }, trigger: 'submit' }]"
                style="margin-bottom: 0">
                <div class="upload-actions">
                  <BaseButton variant="primary" size="small">
                    系统生成
                  </BaseButton>
                  <BaseUpload
                    v-model:fileList="extInfo.verifyList"
                    :limit="10"
                    accept=".jpg,.png,.bmp,.pdf">
                    <BaseButton variant="primary" size="small" icon="upload">
                      上传文件
                    </BaseButton>
                  </BaseUpload>
                </div>
              </BaseFormItem>
            </div>
          </div>
        </div>
      </div>

      <!-- 民警信息 -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">民警信息</div>
        </div>
        <div class="section-content">
          <div
            v-for="(police, index) in extInfo.policeInfo"
            :key="index"
            class="police-block">
            <div class="police-label required">民警身份证证明</div>
            <div class="police-fields">
              <div class="form-row grid-3">
                <BaseFormItem
                  :field="`policeInfo.${index}.policeName`"
                  label="民警姓名"
                  hide-asterisk
                  :rules="[{ required: true, message: '请输入姓名', trigger: 'submit' }]">
                  <BaseInput v-model="police.policeName" placeholder="请输入" />
                </BaseFormItem>
                <BaseFormItem
                  :field="`policeInfo.${index}.policeNum`"
                  label="民警警号"
                  hide-asterisk
                  :rules="[{ required: true, message: '请输入警号', trigger: 'submit' }]">
                  <BaseInput v-model="police.policeNum" placeholder="请输入" />
                </BaseFormItem>
                <BaseFormItem
                  :field="`policeInfo.${index}.policePhone`"
                  label="民警电话"
                  hide-asterisk
                  :rules="[{ required: true, message: '请输入电话', trigger: 'submit' }]">
                  <BaseInput
                    v-model="police.policePhone"
                    placeholder="请输入" />
                </BaseFormItem>
              </div>
              <div class="upload-area">
                <div class="upload-tip">
                  警官照片附件：文件格式要求PDF或者OFD，需上传正反面
                </div>
                <BaseFormItem
                  :field="`policeInfo.${index}.cardFiles`"
                  hide-label
                  hide-asterisk
                  :rules="[{ required: true, validator: (v: any, cb: any) => { if (!v || !v.length) cb('请上传文件') }, trigger: 'submit' }]"
                  style="margin-bottom: 0">
                  <div class="upload-actions">
                    <BaseButton variant="primary" size="small">
                      系统生成
                    </BaseButton>
                    <BaseUpload
                      v-model:fileList="police.cardFiles"
                      :limit="2"
                      accept=".jpg,.png,.jpeg,.pdf,.ofd">
                      <BaseButton variant="primary" size="small" icon="upload">
                        上传文件
                      </BaseButton>
                    </BaseUpload>
                  </div>
                </BaseFormItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  formData: any
  serviceInfo?: any
}>()

const formRef = ref<any>(null)
const dateRange = ref<[string, string] | []>([])

// 响应式数据快捷引用
const extInfo = props.formData.extInfo

onMounted(() => {
  // 初始化验证相关文件数组
  if (!extInfo.verifyNotice) extInfo.verifyNotice = []
  if (!extInfo.verifyList) extInfo.verifyList = []

  if (!extInfo.policeInfo || extInfo.policeInfo.length === 0) {
    extInfo.policeInfo = [
      {
        policeName: '',
        policeNum: '',
        policePhone: '',
        cardFiles: [],
      },
      {
        policeName: '',
        policeNum: '',
        policePhone: '',
        cardFiles: [],
      },
    ]
  }

  // 默认值回显 (模拟测试数据)
  if (!extInfo.caseNo) extInfo.caseNo = 'test26030503'
  if (!extInfo.applyUnitName) extInfo.applyUnitName = '广东'
  if (!extInfo.applyUserName) extInfo.applyUserName = '陈思2号'
  if (!extInfo.applyPhone) extInfo.applyPhone = '15241112121'
})

const quickDateOptions = [
  { label: '近三个月', value: 3 },
  { label: '近半年', value: 6 },
  { label: '近一年', value: 12 },
  { label: '近两年', value: 24 },
]

const setQuickDate = (months: number) => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - months)

  const formatDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const range: [string, string] = [formatDate(start), formatDate(end)]
  dateRange.value = range
  handleDateChange(range)
}

const handleDateChange = (val: [string, string] | []) => {
  if (val && val.length === 2) {
    extInfo.startDate = val[0]
    extInfo.endDate = val[1]
  } else {
    extInfo.startDate = ''
    extInfo.endDate = ''
  }
}

// 暴露校验方法
const validate = async () => {
  if (!formRef.value) return true
  const res = await formRef.value.validate()
  // BaseForm 的 validate 返回 errors 对象，如果没有错误则返回 undefined
  return !res
}

defineExpose({ validate })
</script>

<style scoped lang="scss">
.step-three-wrapper {
  padding: 8px 0;
  height: 100%;
}

.form-section {
  margin-bottom: 32px;

  .section-header {
    margin-bottom: 20px;
    border-bottom: 1px solid $b-1;
    padding-bottom: 8px;

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: $t-1;
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 14px;
        background-color: $p;
        border-radius: 2px;
      }
    }
  }

  .section-content {
    padding: 0 12px;
  }
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 4px;

  &.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  &.grid-2-date {
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: start;
    gap: 24px;
  }
}

.date-range-box {
  display: flex;
  align-items: center;
  gap: 12px;

  .quick-btns {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

/* 禁用输入框只读外观 */
:deep(.base-input.is-disabled),
:deep(.base-input[disabled]) {
  background-color: $bg-3 !important;
  color: $t-1;
  cursor: default;
  opacity: 1;
}

/* 手续文书样式 */
.document-item {
  display: flex;
  gap: 16px;

  .doc-label {
    width: 100px;
    font-size: 14px;
    color: $t-1;
    font-weight: 500;
    padding-top: 8px;

    &.required::before {
      content: '*';
      color: $danger;
      margin-right: 4px;
    }
  }

  .doc-content {
    flex: 1;
  }
}

.notice-prefix-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .symbol {
    font-size: 18px;
    color: $t-3;
  }
  .unit {
    font-size: 14px;
    color: $t-1;
    margin-left: 4px;
  }
}

.upload-tip {
  font-size: 12px;
  color: $t-3;
  margin-bottom: 12px;
}

.upload-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 民警信息样式 */
.police-block {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  .police-label {
    width: 100px;
    font-size: 14px;
    color: $t-1;
    font-weight: 500;
    padding-top: 8px;

    &.required::before {
      content: '*';
      color: $danger;
      margin-right: 4px;
    }
  }

  .police-fields {
    flex: 1;

    .upload-area {
      margin-top: 12px;
    }
  }
}

:deep(.base-form-item) {
  margin-bottom: 18px;
  .base-form-item-label {
    font-size: 13px;
    color: $t-2;
    margin-bottom: 6px;
    &::before {
      color: $danger;
    }
  }
}

:deep(.base-input) {
  background-color: $bg-3;
  border-color: $b-1;
  &:hover {
    border-color: $p;
  }
}
</style>
