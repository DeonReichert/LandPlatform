# 🧪 交易测试指南 - Transaction Test Guide

## ✅ 已修复的问题

### 1. Gas Limit 错误 - 已修复 ✅
- **之前**: Gas limit 21,000,000（超过 Sepolia 上限 16,777,216）
- **现在**: Gas limit 5,000,000（安全范围内）
- **文件**: `src/components/RegisterZoneForm.tsx:49`
- **修复内容**: 添加 `gas: BigInt(5000000)`

### 2. WalletConnect 403 错误 - 不影响功能 ⚠️
- **错误信息**: `Origin http://localhost:1272 not found on Allowlist`
- **影响**: WalletConnect 配置获取失败，但应用使用本地默认值继续运行
- **结果**: **不影响 MetaMask 连接和交易提交**
- **说明**: 这是 WalletConnect v2 的域名白名单要求，需要在 cloud.reown.com 配置

---

## 🧪 测试步骤

### 第一步：连接 MetaMask 钱包

1. **打开应用**
   ```
   http://localhost:1272
   ```

2. **点击 "Connect Wallet" 按钮**
   - 应该看到钱包选择弹窗
   - 选择 **MetaMask**（不要选 WalletConnect）

3. **确认连接**
   - MetaMask 会弹出连接请求
   - 点击 "Connect" 确认
   - 页面应显示您的钱包地址

**预期结果**: ✅ 钱包连接成功，页面显示您的地址

---

### 第二步：注册 Land Zone（测试交易）

1. **填写表单**
   ```
   Land Area: 5000
   Population Density: 1200
   Land Value: 850
   Zoning Type: Residential
   Public Description: Test Zone for Gas Limit Testing
   ```

2. **点击 "🔒 Register Confidential Zone" 按钮**

3. **查看 MetaMask 弹窗**
   - MetaMask 应该弹出交易确认窗口
   - **关键检查**: Gas Limit 应该显示 **5,000,000** 左右
   - **不应该**: 看到 "gas limit too high" 错误
   - **不应该**: Gas Limit 显示为 21,000,000

4. **确认交易**
   - 点击 "Confirm" 提交交易
   - 等待交易确认（Sepolia 测试网约需 15-30 秒）

**预期结果**: ✅ 交易成功提交并确认

---

## 📊 错误对照表

### Gas Limit 错误（已修复）

**修复前**:
```
❌ MetaMask - RPC Error: transaction gas limit too high
   (cap: 16777216, tx: 21000000)
❌ ContractFunctionExecutionError: The contract function "registerLandZone" reverted
```

**修复后**:
```
✅ MetaMask 显示 Gas Limit: 5,000,000
✅ 交易成功提交
✅ 无 "gas limit too high" 错误
```

---

### WalletConnect 403 错误（不影响功能）

**错误信息**（可以忽略）:
```
⚠️ api.web3modal.org - 403 ()
⚠️ [Reown Config] Failed to fetch remote project configuration.
   Using local/default values.
```

**说明**:
- 这个错误**不会导致交易失败**
- 只影响 WalletConnect（二维码扫码连接）功能
- **MetaMask 浏览器扩展连接不受影响**
- 应用会使用本地默认配置继续工作

---

## 🔍 问题排查

### 如果交易仍然失败

1. **检查 MetaMask 网络**
   - 确保连接到 **Sepolia Testnet**
   - 不是 Mainnet 或其他测试网

2. **检查 Sepolia ETH 余额**
   - 需要至少 0.01 Sepolia ETH 用于 gas 费用
   - 获取测试 ETH: https://sepoliafaucet.com

3. **检查合约地址**
   - 合约是否已部署到 Sepolia？
   - `src/lib/contract.ts` 中的 CONTRACT_ADDRESS 是否正确？

4. **查看完整错误信息**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签页
   - 复制完整错误信息

5. **检查 Gas Limit 是否生效**
   - 在 MetaMask 确认窗口中
   - 点击 "View full transaction details"
   - 查看 "Gas Limit" 是否为 5,000,000

---

## 📝 测试记录模板

请按照以下格式记录测试结果：

### 测试环境
- 浏览器: Chrome / Firefox / Edge
- MetaMask 版本: _______
- 网络: Sepolia Testnet
- 钱包地址: 0x...
- 余额: _____ Sepolia ETH

### 测试步骤 1: 连接钱包
- [ ] 点击 "Connect Wallet"
- [ ] 选择 MetaMask
- [ ] 连接成功
- [ ] 页面显示地址

**结果**: ✅ 成功 / ❌ 失败

**错误信息**（如果失败）:
```
（在这里粘贴错误信息）
```

---

### 测试步骤 2: 提交交易
- [ ] 填写表单
- [ ] 点击 "Register Zone"
- [ ] MetaMask 弹窗出现
- [ ] Gas Limit 显示为 5,000,000
- [ ] 点击 "Confirm"
- [ ] 交易提交成功
- [ ] 交易确认（链上）

**结果**: ✅ 成功 / ❌ 失败

**Gas Limit 显示**: ___________

**Transaction Hash**: 0x...

**错误信息**（如果失败）:
```
（在这里粘贴错误信息）
```

---

## 🎯 预期行为总结

### ✅ 应该正常工作的功能
1. MetaMask 钱包连接
2. 注册 Land Zone 表单提交
3. Gas Limit 设置为 5,000,000
4. 交易成功提交到 Sepolia 测试网
5. 交易确认并显示成功消息

### ⚠️ 已知警告（不影响功能）
1. WalletConnect 403 错误（控制台显示）
2. "Failed to fetch remote project configuration"
3. Chrome 第三方 Cookie 警告

### ❌ 不应该出现的错误
1. "gas limit too high" 错误
2. Gas Limit 显示为 21,000,000
3. MetaMask 连接失败
4. 交易提交失败（如果有足够的 ETH）

---

## 🚀 后续步骤

### 如果测试成功
- ✅ Gas limit 问题已完全修复
- ✅ 应用可以正常使用
- 🎉 可以开始实际使用或部署

### 如果仍有问题
请提供以下信息：
1. 完整的浏览器控制台错误信息（F12 → Console）
2. MetaMask 显示的错误截图
3. 在哪一步失败了（连接钱包？还是提交交易？）
4. Gas Limit 在 MetaMask 中显示的实际值
5. Sepolia ETH 余额

---

## 📚 相关文档
- [ERROR_FIXES.md](./ERROR_FIXES.md) - 详细错误修复说明
- [LANGUAGE_CONFIG.md](./LANGUAGE_CONFIG.md) - 语言配置说明
- [WALLET_FIX.md](./WALLET_FIX.md) - 钱包连接优化说明

---

**创建日期**: 2025-10-20
**最后更新**: 2025-10-20 20:20 UTC
**状态**: ✅ Gas Limit 已修复，等待用户测试确认
