# frontend

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

