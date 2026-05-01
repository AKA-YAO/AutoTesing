<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { message } from "@/utils/message";
import {
  createTestCase,
  updateTestCase,
  type TestCase,
  type TestCaseCreate,
  type HttpMethod,
  type AssertionRule
} from "@/api/testcase";
import AssertionEditor from "./AssertionEditor.vue";

defineOptions({
  name: "TestCaseForm"
});

const props = defineProps<{
  visible: boolean;
  testCase: TestCase | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = ref<TestCaseCreate>({
  name: "",
  description: "",
  category: "",
  method: "GET",
  url: "",
  headers: {},
  params: {},
  body: {},
  expected_status: 200,
  assertions: [],
  enabled: true
});

const methodOptions: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const rules: FormRules = {
  name: [{ required: true, message: "请输入用例名称", trigger: "blur" }],
  url: [{ required: true, message: "请输入请求地址", trigger: "blur" }],
  expected_status: [
    { required: true, message: "请输入预期状态码", trigger: "blur" }
  ]
};

const showBody = computed(() => {
  return ["POST", "PUT", "PATCH"].includes(formData.value.method);
});

const showParams = computed(() => {
  return formData.value.method === "GET";
});

watch(
  () => props.visible,
  val => {
    if (val) {
      if (props.testCase && props.isEdit) {
        formData.value = {
          name: props.testCase.name,
          description: props.testCase.description || "",
          category: props.testCase.category || "",
          method: props.testCase.method,
          url: props.testCase.url,
          headers: props.testCase.headers || {},
          params: props.testCase.params || {},
          body: props.testCase.body || {},
          expected_status: props.testCase.expected_status,
          assertions: props.testCase.assertions || [],
          enabled: props.testCase.enabled
        };
      } else {
        resetForm();
      }
    }
  }
);

const resetForm = () => {
  formData.value = {
    name: "",
    description: "",
    category: "",
    method: "GET",
    url: "",
    headers: {},
    params: {},
    body: {},
    expected_status: 200,
    assertions: [],
    enabled: true
  };
};

const handleClose = () => {
  emit("update:visible", false);
  resetForm();
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();

  loading.value = true;
  try {
    if (props.isEdit && props.testCase) {
      await updateTestCase(props.testCase.id, formData.value);
      message("更新成功", { type: "success" });
    } else {
      await createTestCase(formData.value);
      message("创建成功", { type: "success" });
    }
    emit("success");
  } catch (error) {
    message("操作失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

const handleAssertionsChange = (assertions: AssertionRule[]) => {
  formData.value.assertions = assertions;
};

const jsonInputPlaceholder = computed(() => {
  if (showBody.value) {
    return '{"key": "value"}';
  }
  return '{"key": "value"}';
});
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑用例' : '新增用例'"
    width="800px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <!-- 基本信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用例名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入用例名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类">
            <el-input v-model="formData.category" placeholder="如：用户模块" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="请输入用例描述"
        />
      </el-form-item>

      <!-- 请求配置 -->
      <el-divider content-position="left">请求配置</el-divider>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="请求方法" prop="method">
            <el-select v-model="formData.method">
              <el-option
                v-for="m in methodOptions"
                :key="m"
                :label="m"
                :value="m"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="18">
          <el-form-item label="请求地址" prop="url">
            <el-input
              v-model="formData.url"
              placeholder="http://example.com/api"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="请求头">
        <el-input
          v-model="formData.headers"
          type="textarea"
          :rows="3"
          :placeholder="{ 'Content-Type': 'application/json' }"
        />
      </el-form-item>

      <el-form-item v-if="showParams" label="URL 参数">
        <el-input
          v-model="formData.params"
          type="textarea"
          :rows="3"
          :placeholder="{ key: 'value' }"
        />
      </el-form-item>

      <el-form-item v-if="showBody" label="请求体">
        <el-input
          v-model="formData.body"
          type="textarea"
          :rows="5"
          :placeholder="{ key: 'value' }"
        />
      </el-form-item>

      <!-- 断言配置 -->
      <el-divider content-position="left">断言配置</el-divider>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="预期状态码" prop="expected_status">
            <el-input-number
              v-model="formData.expected_status"
              :min="100"
              :max="599"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否启用">
            <el-switch v-model="formData.enabled" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="断言规则">
        <AssertionEditor
          :assertions="formData.assertions"
          @change="handleAssertionsChange"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? "更新" : "创建" }}
      </el-button>
    </template>
  </el-dialog>
</template>
