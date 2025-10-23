# 按钮使用指南 / Button Usage Guide

## 按钮启用/禁用条件说明

### Analysis Tools（分析工具）标签

#### 1. 🔬 Request Analysis（请求分析）
**启用条件：**
- ✅ 已连接钱包
- ✅ Zone ID 大于 0（默认值为 1，可以直接使用）

**无法点击的原因：**
- ❌ 未连接钱包
- ❌ Zone ID 为 0 或负数
- ❌ 正在处理其他交易（isPending = true）

**使用方法：**
1. 连接您的钱包
2. 输入要分析的 Zone ID（默认为 1）
3. 点击 "🔬 Request Analysis" 按钮

---

#### 2. 🔄 Compare Values（比较区域值）
**启用条件：**
- ✅ 已连接钱包
- ✅ Zone 1 ID 大于 0（默认值为 1）
- ✅ Zone 2 ID 大于 0（默认值为 2）

**无法点击的原因：**
- ❌ 未连接钱包
- ❌ Zone 1 或 Zone 2 的 ID 为 0 或负数
- ❌ 正在比较中（isComparing = true）
- ❌ 正在处理其他交易（isPending = true）

**使用方法：**
1. 连接您的钱包
2. 输入 Zone 1 ID（默认为 1）
3. 输入 Zone 2 ID（默认为 2）
4. 点击 "🔄 Compare Values" 按钮

**注意：** 按钮默认应该是**可以点击**的，因为有默认值 1 和 2

---

#### 3. 📊 Calculate Potential（计算发展潜力）
**启用条件：**
- ✅ 已连接钱包
- ✅ Zone ID 大于 0（默认值为 1）

**无法点击的原因：**
- ❌ 未连接钱包
- ❌ Zone ID 为 0 或负数
- ❌ 正在计算中（isCalculating = true）
- ❌ 正在处理其他交易（isPending = true）

**使用方法：**
1. 连接您的钱包
2. 输入 Zone ID（默认为 1）
3. 点击 "📊 Calculate Potential" 按钮

**注意：** 按钮默认应该是**可以点击**的，因为有默认值 1

---

### Management（管理）标签

#### 4. 👥 Authorize Planner（授权规划师）
**启用条件：**
- ✅ 已连接钱包
- ✅ 输入了规划师地址（完整的 0x... 地址）
- ✅ 您必须是 Planning Authority（规划管理机构）

**无法点击的原因：**
- ❌ 未连接钱包
- ❌ 未输入规划师地址（plannerAddress 为空）
- ❌ 正在处理交易（isLoading = true）

**使用方法：**
1. 连接您的钱包（必须是 Authority 账户）
2. 输入要授权的规划师地址（0x...）
3. 点击 "👥 Authorize Planner" 按钮

**注意：** 按钮默认是**禁用**的，需要先输入地址

---

#### 5. ✓ Approve Project（批准项目）
**启用条件：**
- ✅ 已连接钱包
- ✅ Project ID 大于 0（默认值为 1）
- ✅ 您必须是 Planning Authority（规划管理机构）

**无法点击的原因：**
- ❌ 未连接钱包
- ❌ Project ID 为 0 或负数
- ❌ 正在处理交易（isLoading = true）

**使用方法：**
1. 连接您的钱包（必须是 Authority 账户）
2. 输入要批准的 Project ID（默认为 1）
3. 点击 "✓ Approve Project" 按钮

**注意：** 按钮默认应该是**可以点击**的，因为有默认值 1

---

#### 6. ⊗ Revoke Authorization（撤销授权）
**启用条件：**
- ✅ 已连接钱包
- ✅ 输入了完整的规划师地址（42个字符的以太坊地址）
- ✅ 您必须是 Planning Authority（规划管理机构）

**无法点击的原因：**
- ❌ 未连接钱包
- ❌ 未输入地址或地址长度不足 42 个字符
- ❌ 正在处理交易（isLoading = true）
- ❌ 正在撤销中（isRevoking = true）

**使用方法：**
1. 连接您的钱包（必须是 Authority 账户）
2. 输入要撤销授权的规划师地址（0x... 完整地址）
3. 点击 "⊗ Revoke Authorization" 按钮

**注意：** 按钮默认是**禁用**的，需要先输入完整地址（42个字符）

---

## 常见问题排查

### 问题 1: 所有按钮都无法点击
**可能原因：**
- 未连接钱包 → **解决方法：** 点击页面右上角的 "Connect Wallet" 按钮

### 问题 2: Compare Values / Calculate Potential / Approve Project 无法点击
**可能原因：**
- 输入框中的值为 0 或未填写
- **解决方法：**
  - 检查输入框中是否有值
  - 默认值应该是 1 或 2，如果没有，请手动输入
  - 如果输入框显示为空，请刷新页面

### 问题 3: Revoke Authorization 无法点击
**可能原因：**
- 未输入地址或地址不完整
- **解决方法：** 输入完整的以太坊地址（42个字符，包括 0x）
- 例如：`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### 问题 4: 点击按钮后提示权限错误
**可能原因：**
- 您的账户没有所需的权限
- **解决方法：**
  - **Authorize/Revoke/Approve**: 需要 Authority 账户
  - **Request Analysis**: 需要是 Zone 所有者或授权的规划师
  - **Update Metrics**: 需要是授权的规划师
  - **Submit Project**: 需要先注册 Land Zone

---

## 技术细节

### 按钮禁用逻辑

```typescript
// Compare Values
disabled={isComparing || isPending || compareZones.zone1 <= 0 || compareZones.zone2 <= 0}

// Calculate Potential
disabled={isCalculating || isPending || potentialZoneId <= 0}

// Approve Project
disabled={isLoading || projectId <= 0}

// Revoke Authorization
disabled={isLoading || isRevoking || !revokeAddress || revokeAddress.length < 42}
```

### 默认值
- `compareZones.zone1`: 1
- `compareZones.zone2`: 2
- `potentialZoneId`: 1
- `projectId`: 1
- `plannerAddress`: ""（空）
- `revokeAddress`: ""（空）

---

## 更新日志

### 2025-01-21
- ✅ 修复了 Compare Values 按钮的禁用逻辑
- ✅ 修复了 Calculate Potential 按钮的禁用逻辑
- ✅ 修复了 Approve Project 按钮的禁用逻辑
- ✅ 修复了 Revoke Authorization 按钮的禁用逻辑
- ✅ 添加了 `revokePlannerAuthorization` 函数到 ABI
- ✅ 改进了所有按钮的验证逻辑（使用 `<= 0` 替代 `!value`）
