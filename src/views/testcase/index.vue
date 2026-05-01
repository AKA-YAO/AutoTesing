<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  getTestCaseList,
  deleteTestCase,
  toggleTestCase,
  type TestCase,
  type TestCaseListParams,
  type HttpMethod
} from "@/api/testcase";
import TestCaseForm from "./components/TestCaseForm.vue";
import TestCaseDetail from "./components/TestCaseDetail.vue";

defineOptions({
  name: "TestCaseList"
});

const loading = ref(false);
const tableData = ref<TestCase[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const filters = reactive<TestCaseListParams>({
  name: "",
  category: "",
  method: undefined,
  enabled: undefined
});

const formVisible = ref(false);
const detailVisible = ref(false);
const currentTestCase = ref<TestCase | null>(null);
const isEdit = ref(false);

const methodOptions: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const getMethodTagType = (method: string) => {
  const typeMap: Record<string, string> = {
    GET: "success",
    POST: "",
    PUT: "warning",
    DELETE: "danger",
    PATCH: "info"
  };
  return typeMap[method] || "info";
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getTestCaseList({
      page: currentPage.value,
      page_size: pageSize.value,
      ...filters
    });
    tableData.value = res.items;
    total.value = res.total;
  } catch (error) {
    message("获取数据失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchData();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchData();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleReset = () => {
  filters.name = "";
  filters.category = "";
  filters.method = undefined;
  filters.enabled = undefined;
  currentPage.value = 1;
  fetchData();
};

const handleCreate = () => {
  currentTestCase.value = null;
  isEdit.value = false;
  formVisible.value = true;
};

const handleEdit = (row: TestCase) => {
  currentTestCase.value = row;
  isEdit.value = true;
  formVisible.value = true;
};

const handleDetail = (row: TestCase) => {
  currentTestCase.value = row;
  detailVisible.value = true;
};

const handleToggle = async (row: TestCase) => {
  try {
    await toggleTestCase(row.id);
    row.enabled = !row.enabled;
    message(`已${row.enabled ? "启用" : "禁用"}`, { type: "success" });
  } catch (error) {
    message("操作失败", { type: "error" });
  }
};

const handleDelete = async (row: TestCase) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用例 "${row.name}" 吗？`,
      "删除确认",
      {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }
    );
    await deleteTestCase(row.id);
    message("删除成功", { type: "success" });
    fetchData();
  } catch (error) {
    if (error !== "cancel") {
      message("删除失败", { type: "error" });
    }
  }
};

const handleFormSuccess = () => {
  formVisible.value = false;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main-content">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="filters">
        <el-form-item label="用例名称">
          <el-input
            v-model="filters.name"
            placeholder="模糊搜索"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-input
            v-model="filters.category"
            placeholder="精确匹配"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-select
            v-model="filters.method"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="m in methodOptions"
              :key="m"
              :label="m"
              :value="m"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.enabled"
            placeholder="全部"
            clearable
            style="width: 100px"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格卡片 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-bold">测试用例列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增用例
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" fixed="left" />
        <el-table-column
          prop="name"
          label="用例名称"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            {{ row.category || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="method" label="请求方法" width="100">
          <template #default="{ row }">
            <el-tag :type="getMethodTagType(row.method)" size="small">
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="url"
          label="请求地址"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="expected_status"
          label="预期状态码"
          width="100"
        />
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="handleToggle(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.updated_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleDetail(row)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 表单弹窗 -->
    <TestCaseForm
      v-model:visible="formVisible"
      :test-case="currentTestCase"
      :is-edit="isEdit"
      @success="handleFormSuccess"
    />

    <!-- 详情弹窗 -->
    <TestCaseDetail
      v-model:visible="detailVisible"
      :test-case="currentTestCase"
    />
  </div>
</template>

<style scoped>
.main-content {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
