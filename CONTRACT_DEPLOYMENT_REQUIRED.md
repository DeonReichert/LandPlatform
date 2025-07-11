# 🚨 合约未部署 - Contract Not Deployed

## ❌ 交易失败的真正原因

**合约地址 `0xba4FB3D706a6754FFbcF9B01Cc3176F003343d11` 在 Sepolia 测试网上不存在！**

您正在尝试调用一个**未部署的合约**，这就是交易失败的根本原因。

- ✅ Gas limit 已修复（5,000,000）
- ⚠️ WalletConnect 403 错误不影响功能
- ❌ **合约未部署** ← 这是真正的问题！

---

## ✅ 解决方案：部署智能合约

您需要先将智能合约部署到 Sepolia 测试网。

### 步骤 1：准备部署环境

1. **检查 `.env` 文件配置**

   需要的环境变量：
   ```env
   # Sepolia 测试网 RPC URL
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

   # 部署账户私钥（需要有 Sepolia ETH）
   PRIVATE_KEY=your_private_key_here

   # Pauser 配置（至少需要 1 个）
   NUM_PAUSERS=1
   PAUSER_ADDRESS_0=0xYourPauserAddress

   # KMS Generation（可选，默认为 1）
   INITIAL_KMS_GENERATION=1
   ```

2. **获取 Sepolia ETH**

   您的部署账户需要至少 **0.1 Sepolia ETH** 用于部署费用。

   免费水龙头：
   - https://sepoliafaucet.com
   - https://sepolia-faucet.pk910.de
   - https://faucet.quicknode.com/ethereum/sepolia

### 步骤 2：部署合约

运行以下命令：

```bash
cd /d/ConfidentialLandPlatform-main

# 方式 1：使用 npm 脚本
npm run deploy

# 或方式 2：直接使用 hardhat
npx hardhat run scripts/deploy.cjs --network sepolia
```

### 步骤 3：更新前端配置

部署成功后，您会看到新的合约地址，类似于：

```
✅ Deployment Successful!

📄 CONTRACT INFORMATION
   Contract Address: 0xABCD1234...5678
   Deployer: 0xYourAddress...
   Network: sepolia
```

**复制新的合约地址**，然后更新 `src/lib/contract.ts`:

```typescript
// 更新这一行：
export const CONTRACT_ADDRESS = '0xYOUR_NEW_CONTRACT_ADDRESS_HERE';
```

### 步骤 4：重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤 5：测试交易

现在您可以：
1. 打开 http://localhost:1272
2. 连接 MetaMask
3. 注册 Land Zone
4. 交易应该成功提交！

---

## 📋 部署前检查清单

在部署之前，请确认：

- [ ] `.env` 文件已配置
- [ ] SEPOLIA_RPC_URL 已设置（Infura/Alchemy/QuickNode）
- [ ] PRIVATE_KEY 已设置（部署账户私钥）
- [ ] NUM_PAUSERS 至少为 1
- [ ] PAUSER_ADDRESS_0 已设置（有效的以太坊地址）
- [ ] 部署账户有足够的 Sepolia ETH（至少 0.1 ETH）
- [ ] MetaMask 连接到 Sepolia 测试网

---

## 🔍 验证合约是否已部署

### 方法 1：Etherscan

访问：
```
https://sepolia.etherscan.io/address/0xba4FB3D706a6754FFbcF9B01Cc3176F003343d11
```

- 如果显示 "Contract"，合约已部署 ✅
- 如果显示 "Address"，合约未部署 ❌

### 方法 2：使用 curl

```bash
curl -s "https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=0xba4FB3D706a6754FFbcF9B01Cc3176F003343d11"
```

- `"status":"1"` = 合约已部署 ✅
- `"status":"0"` = 合约未部署 ❌

### 方法 3：Hardhat 控制台

```bash
npx hardhat console --network sepolia

# 在控制台中：
const code = await ethers.provider.getCode('0xba4FB3D706a6754FFbcF9B01Cc3176F003343d11');
console.log(code);

# 如果返回 "0x"，合约未部署 ❌
# 如果返回长字符串，合约已部署 ✅
```

---

## ⚠️ 常见问题

### Q1: 部署失败 "NUM_PAUSERS must be set"

**原因**：`.env` 文件中未设置 NUM_PAUSERS

**解决**：
```env
NUM_PAUSERS=1
PAUSER_ADDRESS_0=0xYourAddress
```

### Q2: 部署失败 "insufficient funds"

**原因**：部署账户 Sepolia ETH 不足

**解决**：从水龙头获取更多 Sepolia ETH

### Q3: 部署失败 "invalid address"

**原因**：PAUSER_ADDRESS_0 格式不正确

**解决**：确保地址：
- 以 `0x` 开头
- 总共 42 个字符
- 只包含十六进制字符（0-9, a-f, A-F）

### Q4: RPC 连接失败

**原因**：SEPOLIA_RPC_URL 无效或配额用尽

**解决**：
- 使用免费的公共 RPC：
  ```env
  SEPOLIA_RPC_URL=https://sepolia.drpc.org
  ```
- 或注册 Infura/Alchemy 获取免费 API key

---

##标准部署流程

### 完整的 .env 示例

```env
# ============================================
# 网络配置
# ============================================
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# ============================================
# 部署账户
# ============================================
# ⚠️  警告：不要提交真实私钥到 Git！
# 这应该是测试账户，不要使用主账户
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# ============================================
# 合约配置
# ============================================
# Pauser 数量（至少 1 个）
NUM_PAUSERS=1

# Pauser 地址列表
PAUSER_ADDRESS_0=0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# 可选：添加更多 pausers
# PAUSER_ADDRESS_1=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
# PAUSER_ADDRESS_2=0x90F79bf6EB2c4f870365E785982E1f101E93b906

# KMS Generation（默认为 1）
INITIAL_KMS_GENERATION=1

# ============================================
# 前端配置（部署后更新）
# ============================================
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

---

## 🎯 部署后验证

部署成功后，验证合约功能：

### 1. 查看合约信息

```bash
npx hardhat console --network sepolia

# 获取合约实例
const Contract = await ethers.getContractFactory("ConfidentialLandPlatform");
const contract = await Contract.attach("0xYourContractAddress");

# 检查状态
console.log("Total Zones:", await contract.getTotalZones());
console.log("Total Projects:", await contract.getTotalProjects());
console.log("Is Paused:", await contract.isContractPaused());
```

### 2. 在 Etherscan 上验证

部署脚本会输出验证命令：

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS "[\"0xPauserAddress\"]" 1
```

验证后，合约代码将在 Etherscan 上公开可读。

### 3. 测试前端连接

1. 更新 `src/lib/contract.ts` 中的地址
2. 重启开发服务器
3. 连接 MetaMask
4. 尝试注册 Land Zone
5. 检查交易是否成功

---

## 📚 相关文档

- [ERROR_FIXES.md](./ERROR_FIXES.md) - Gas Limit 和 WalletConnect 错误修复
- [TRANSACTION_TEST_GUIDE.md](./TRANSACTION_TEST_GUIDE.md) - 交易测试指南
- [Hardhat 部署文档](https://hardhat.org/guides/deploying.html)
- [Sepolia 测试网文档](https://sepolia.dev/)

---

## 📝 总结

**交易失败的三个原因及状态**：

| 问题 | 状态 | 说明 |
|------|------|------|
| WalletConnect 403 错误 | ⚠️ 不影响 | 配置获取失败，使用本地默认值 |
| Gas Limit 太高 | ✅ 已修复 | 从 21M 降低到 5M |
| **合约未部署** | ❌ **当前问题** | **需要先部署合约** |

**下一步**：
1. 配置 `.env` 文件
2. 获取 Sepolia ETH
3. 运行 `npm run deploy`
4. 更新 `src/lib/contract.ts` 中的合约地址
5. 测试交易

---

**创建日期**: 2025-10-20
**最后更新**: 2025-10-20 20:30 UTC
**状态**: ⚠️ **等待合约部署**
