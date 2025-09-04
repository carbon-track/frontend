# frontend

## API 基础地址配置（重要）

前端通过环境变量 `VITE_API_URL` 指定后端 API 基础地址（baseURL）。请在根目录创建或更新 `.env`：

```
VITE_API_URL=https://dev-api.carbontrackapp.com/api/v1
```

说明：
- 后端主要在版本化前缀下提供接口，即 `/api/v1/...`。
- 为了兼容历史调用，后端提供少量 `/api/...` 的别名路由；但为了避免未来的不一致，强烈建议始终使用 `/api/v1` 作为前缀。
- 本地开发默认值为 `http://localhost:8000/api/v1`，与后端 Slim 内置服务器一致。
 - 前端会对 `VITE_API_URL` 做一次轻量规范化：如果你误将其配置为以 `/api` 结尾（如 `https://example.com/api`），前端会自动补全为 `https://example.com/api/v1`，以避免在未开启别名路由的环境出现 404。为清晰与稳定，仍建议显式配置到 `/api/v1`。

## Cloudflare Turnstile 验证码

本前端已内置 Turnstile 组件并接入登录与注册表单。

- 环境变量：在项目根目录下创建 `.env` 并配置：

```
VITE_TURNSTILE_SITE_KEY=你的_site_key
```

- 开发模式：若未配置 `VITE_TURNSTILE_SITE_KEY`，组件会展示提示且不渲染验证码（允许继续调试表单）。
- 生产模式：请务必配置真实的 `VITE_TURNSTILE_SITE_KEY`，否则按钮会被禁用，无法提交。

前端文件：
- `src/components/common/Turnstile.jsx` 负责脚本加载与渲染；提供 `onVerify` 回调以获取 token。
- `src/components/auth/LoginForm.jsx`、`RegisterForm.jsx` 已集成 Turnstile，并在提交请求时携带 `cf_turnstile_response` 字段。

后端约定：
- 接口接受 `cf_turnstile_response` 字段（或 `X-Turnstile-Token` 头）进行校验。

## Onboarding（入门引导）行为说明

- 当用户已登录但缺少 `school_id` 或 `class_name` 时，受保护路由将引导至 `/onboarding` 完善资料。
- 用户可点击“暂时跳过”，本次会话内将设置 `sessionStorage.onboarding_skipped = '1'`，从而允许继续访问其它页面；成功保存资料后会清除此标记。
- 登录与退出登录会清理该标记，避免在新会话延续跳过状态。
- 学校创建与班级创建接口需要登录态（携带 `Authorization: Bearer <token>`），否则会返回 401；获取学校列表与班级列表为公开接口。

