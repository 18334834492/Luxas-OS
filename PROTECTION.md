# Luxas OS 系统保护说明

## 概述

Luxas OS 提供了一套完整的系统文件保护机制，可以隐藏系统文件并防止未授权修改。

## 功能特性

1. **文件隐藏** - 将核心系统文件移入隐藏目录
2. **不可变保护** - 设置文件为不可修改状态
3. **备份恢复** - 创建备份并在需要时恢复
4. **状态查询** - 查看当前保护状态

## 使用方法

### 1. 隐藏系统文件
```bash
./luxas_protect.sh hide
```
这将把核心系统文件移入 `.luxas_os` 隐藏目录。

### 2. 保护系统文件
```bash
./luxas_protect.sh protect
```
这将设置文件为不可修改状态（使用 `chattr +i`）。

### 3. 显示系统文件
```bash
./luxas_protect.sh show
```
将从隐藏目录恢复所有系统文件。

### 4. 解除保护
```bash
./luxas_protect.sh unprotect
```
移除不可变属性，允许修改文件。

### 5. 查看状态
```bash
./luxas_protect.sh status
```
显示当前隐藏状态和保护状态。

### 6. 创建备份
```bash
./luxas_protect.sh backup
```
创建当前系统状态的备份。

### 7. 恢复备份
```bash
./luxas_protect.sh restore
```
从备份中恢复系统文件。

## 命令详解

### hide - 隐藏系统文件
- 将核心文件移入 `.luxas_os` 隐藏目录
- 包括：内核、桌面服务、Windows子系统、AI模块、脚本、配置
- 适合演示或保护项目结构

### protect - 保护系统文件
- 使用 Linux 属性（`chattr +i`）设置文件为不可修改
- 防止意外删除或修改
- 需要管理员权限

### show - 显示系统文件
- 从 `.luxas_os` 恢复所有文件到主目录
- 恢复后可以正常编译和运行

### unprotect - 解除保护
- 移除不可变属性（`chattr -i`）
- 允许修改文件

### status - 查看状态
- 显示文件隐藏状态
- 显示哪些文件已设置保护
- 列出隐藏的文件

### backup - 创建备份
- 创建压缩备份文件
- 位置：`backups/luxas_os_backup_YYYYMMDD_HHMMSS.tar.gz`
- 包含所有核心文件和文档

### restore - 恢复备份
- 列出所有可用备份
- 选择并恢复指定备份

## 快速使用场景

### 场景1：保护项目不被他人查看
```bash
./luxas_protect.sh hide
./luxas_protect.sh protect
```

### 场景2：需要修改系统文件
```bash
./luxas_protect.sh unprotect
./luxas_protect.sh show  # 先显示文件
# 修改文件
./luxas_protect.sh protect  # 再次保护
```

### 场景3：项目备份
```bash
./luxas_protect.sh backup
# 定期备份，防止误删
```

### 场景4：快速启动（隐藏模式下）
```bash
./run.sh  # 自动显示并启动
```

## 注意事项

1. **权限要求**：`protect` 和 `unprotect` 需要管理员权限
2. **备份建议**：在进行大规模修改前，先创建备份
3. **隐藏目录**：`.luxas_os` 是隐藏目录，普通 `ls` 不会显示
4. **显示隐藏目录**：
   ```bash
   ls -la  # 显示所有文件，包括隐藏文件
   ```

## 安全机制

### 隐藏机制
- 使用 `.luxas_os` 隐藏目录
- `.gitignore` 已配置忽略此目录
- 文件属性保护

### 保护机制
- Linux `chattr +i` 不可变属性
- 防止删除、修改、重命名
- 即使 root 用户也无法修改

### 备份机制
- 定期备份
- 时间戳命名
- 压缩存储

## 故障排除

### 问题1：无法设置不可变属性
```bash
sudo ./luxas_protect.sh protect
```

### 问题2：忘记隐藏目录在哪里
```bash
ls -la | grep luxas_os
# 或
find . -name ".luxas_os" -type d
```

### 问题3：需要恢复备份但找不到备份
```bash
ls -la backups/
```

### 问题4：隐藏后无法编译
```bash
./run.sh  # 自动显示并编译
```

## 相关文件

- `luxas_protect.sh` - 保护脚本主程序
- `run.sh` - 快速启动脚本
- `.gitignore` - Git忽略配置
- `backups/` - 备份目录

## 技术细节

### 隐藏原理
- 使用点号开头的目录名（`.luxas_os`）
- Unix系统默认不显示隐藏文件
- 除非使用 `ls -a` 或 `ls -la`

### 保护原理
- 使用 Linux 文件属性 `chattr`
- `+i` 设置不可变属性
- `i` 属性：
  - 不能删除
  - 不能重命名
  - 不能修改
  - 不能创建硬链接
  - 只能 root 用户修改

### 备份原理
- 使用 `tar -czf` 创建压缩包
- 包含所有核心文件
- 时间戳命名便于管理
