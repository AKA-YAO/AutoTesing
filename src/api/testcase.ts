import { http } from "@/utils/http";

/** HTTP 方法类型 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** 断言类型 */
export type AssertionType =
  | "json_path"
  | "response_time"
  | "header"
  | "body_contains";

/** 断言规则 */
export interface AssertionRule {
  type: AssertionType;
  path?: string;
  operator: string;
  expected: string | number | boolean;
  description?: string;
}

/** 测试用例 */
export interface TestCase {
  id: number;
  name: string;
  description?: string;
  category?: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  params: Record<string, any>;
  body: Record<string, any>;
  expected_status: number;
  assertions: AssertionRule[];
  created_at: string;
  updated_at: string;
  enabled: boolean;
}

/** 创建测试用例参数 */
export interface TestCaseCreate {
  name: string;
  description?: string;
  category?: string;
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: Record<string, any>;
  expected_status?: number;
  assertions?: AssertionRule[];
  enabled?: boolean;
}

/** 更新测试用例参数 */
export interface TestCaseUpdate {
  name?: string;
  description?: string;
  category?: string;
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: Record<string, any>;
  expected_status?: number;
  assertions?: AssertionRule[];
  enabled?: boolean;
}

/** 分页列表响应 */
export interface TestCaseListResponse {
  items: TestCase[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** 列表查询参数 */
export interface TestCaseListParams {
  page?: number;
  page_size?: number;
  name?: string;
  category?: string;
  method?: HttpMethod;
  enabled?: boolean;
}

const BASE_URL = "/api/v1/test-cases";

/** 获取测试用例列表 */
export const getTestCaseList = (params?: TestCaseListParams) => {
  return http.request<TestCaseListResponse>("get", BASE_URL, { params });
};

/** 获取单个测试用例 */
export const getTestCase = (id: number) => {
  return http.request<TestCase>("get", `${BASE_URL}/${id}`);
};

/** 创建测试用例 */
export const createTestCase = (data: TestCaseCreate) => {
  return http.request<TestCase>("post", BASE_URL, { data });
};

/** 更新测试用例 */
export const updateTestCase = (id: number, data: TestCaseUpdate) => {
  return http.request<TestCase>("put", `${BASE_URL}/${id}`, { data });
};

/** 删除测试用例 */
export const deleteTestCase = (id: number) => {
  return http.request<void>("delete", `${BASE_URL}/${id}`);
};

/** 切换启用状态 */
export const toggleTestCase = (id: number) => {
  return http.request<TestCase>("patch", `${BASE_URL}/${id}/toggle`);
};

/** 获取分类列表 */
export const getCategories = () => {
  return http.request<string[]>("get", `${BASE_URL}/categories`);
};
