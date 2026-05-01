<script setup lang="ts">
import type { TestCase, AssertionRule } from "@/api/testcase";

defineOptions({
  name: "TestCaseDetail"
});

defineProps<{
  visible: boolean;
  testCase: TestCase | null;
}>();

defineEmits<{
  "update:visible": [value: boolean];
}>();

const getMethodTagType = (method: string) => {
  const typeMap: Record<string, string> = {
    GET: "success",
    POST: "primary",
    PUT: "warning",
    DELETE: "danger",
    PATCH: "info"
  };
  return typeMap[method] || "info";
};

const formatJson = (data: Record<string, any>) => {
  if (!data || Object.keys(data).length === 0) {
    return "{}";
  }
  return JSON.stringify(data, null, 2);
};

const operatorLabel = (op: string) => {
  const labelMap: Record<string, string> = {
    eq: "等于",
    ne: "不等于",
    gt: "大于",
    lt: "小于",
    gte: "大于等于",
    lte: "小于等于",
    contains: "包含",
    regex: "匹配"
  };
  return labelMap[op] || op;
};

const assertionTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    json_path: "JSON路径",
    response_time: "响应时间",
    header: "响应头",
    body_contains: "内容包含"
  };
  return labelMap[type] || type;
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="用例详情"
    width="650px"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-descriptions v-if="testCase" :column="2" border>
      <el-descriptions-item label="ID">{{ testCase.id }}</el-descriptions-item>
      <el-descriptions-item label="用例名称">{{
        testCase.name
      }}</el-descriptions-item>
      <el-descriptions-item label="分类">{{
        testCase.category || "-"
      }}</el-descriptions-item>
      <el-descriptions-item label="请求方法">
        <el-tag :type="getMethodTagType(testCase.method)" size="small">
          {{ testCase.method }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="请求地址" :span="2">{{
        testCase.url
      }}</el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">
        {{ testCase.description || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="请求头" :span="2">
        <pre class="json-display">{{ formatJson(testCase.headers) }}</pre>
      </el-descriptions-item>
      <el-descriptions-item label="URL参数" :span="2">
        <pre class="json-display">{{ formatJson(testCase.params) }}</pre>
      </el-descriptions-item>
      <el-descriptions-item label="请求体" :span="2">
        <pre class="json-display">{{ formatJson(testCase.body) }}</pre>
      </el-descriptions-item>

      <el-descriptions-item label="预期状态码">{{
        testCase.expected_status
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="testCase.enabled ? 'success' : 'danger'" size="small">
          {{ testCase.enabled ? "启用" : "禁用" }}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="断言规则" :span="2">
        <div v-if="testCase.assertions && testCase.assertions.length > 0">
          <div
            v-for="(rule, index) in testCase.assertions"
            :key="index"
            class="assertion-row"
          >
            <el-tag size="small" type="info">{{
              assertionTypeLabel(rule.type)
            }}</el-tag>
            <span v-if="rule.path" class="ml-2 text-gray-500">{{
              rule.path
            }}</span>
            <span class="ml-2 font-medium">{{
              operatorLabel(rule.operator)
            }}</span>
            <span class="ml-2 text-blue-600">{{ rule.expected }}</span>
            <span v-if="rule.description" class="ml-2 text-gray-400"
              >({{ rule.description }})</span
            >
          </div>
        </div>
        <span v-else class="text-gray-400">无</span>
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        {{ new Date(testCase.created_at).toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ new Date(testCase.updated_at).toLocaleString() }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.json-display {
  max-height: 120px;
  padding: 8px 12px;
  margin: 0;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.assertion-row {
  padding: 4px 0;
  border-bottom: 1px dashed #eee;
}

.assertion-row:last-child {
  border-bottom: none;
}
</style>
