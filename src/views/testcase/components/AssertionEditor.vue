<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { AssertionRule, AssertionType } from "@/api/testcase";

defineOptions({
  name: "AssertionEditor"
});

const props = defineProps<{
  assertions: AssertionRule[];
}>();

const emit = defineEmits<{
  change: [value: AssertionRule[]];
}>();

const localAssertions = ref<AssertionRule[]>([]);

const operators = [
  { label: "等于", value: "eq" },
  { label: "不等于", value: "ne" },
  { label: "大于", value: "gt" },
  { label: "小于", value: "lt" },
  { label: "大于等于", value: "gte" },
  { label: "小于等于", value: "lte" },
  { label: "包含", value: "contains" },
  { label: "匹配", value: "regex" }
];

const typeOptions = [
  { label: "JSON 路径", value: "json_path" },
  { label: "响应时间 (ms)", value: "response_time" },
  { label: "响应头", value: "header" },
  { label: "内容包含", value: "body_contains" }
];

watch(
  () => props.assertions,
  val => {
    localAssertions.value = [...val];
  },
  { immediate: true }
);

const addAssertion = () => {
  localAssertions.value.push({
    type: "json_path",
    path: "",
    operator: "eq",
    expected: "",
    description: ""
  });
  emitChange();
};

const removeAssertion = (index: number) => {
  localAssertions.value.splice(index, 1);
  emitChange();
};

const emitChange = () => {
  emit("change", localAssertions.value);
};

const needsPath = computed(() => {
  return (type: AssertionType) => type === "json_path" || type === "header";
});
</script>

<template>
  <div class="assertion-editor">
    <el-button type="primary" size="small" @click="addAssertion">
      <el-icon><Plus /></el-icon>
      添加断言
    </el-button>

    <div v-if="localAssertions.length === 0" class="mt-4">
      <el-empty description="暂无断言规则" :image-size="60" />
    </div>

    <div
      v-for="(assertion, index) in localAssertions"
      :key="index"
      class="assertion-item mt-3"
    >
      <el-card shadow="never">
        <el-row :gutter="12">
          <el-col :span="4">
            <el-select
              v-model="assertion.type"
              size="default"
              @change="emitChange"
            >
              <el-option
                v-for="opt in typeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-col>
          <el-col v-if="needsPath(assertion.type)" :span="4">
            <el-input
              v-model="assertion.path"
              size="default"
              placeholder="路径/名称"
              @change="emitChange"
            />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="assertion.operator"
              size="default"
              @change="emitChange"
            >
              <el-option
                v-for="opt in operators"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="assertion.expected"
              size="default"
              placeholder="预期值"
              @change="emitChange"
            />
          </el-col>
          <el-col :span="5">
            <el-input
              v-model="assertion.description"
              size="default"
              placeholder="描述（可选）"
              @change="emitChange"
            />
          </el-col>
          <el-col :span="3">
            <el-button
              type="danger"
              size="small"
              link
              @click="removeAssertion(index)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.assertion-editor {
  width: 100%;
}

.assertion-item :deep(.el-card__body) {
  padding: 12px;
}
</style>
