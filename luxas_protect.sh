#!/bin/bash

# Luxas OS 系统保护脚本
# 用于隐藏和保护系统文件

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo "Luxas OS 系统保护工具"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  hide     - 隐藏系统文件（将核心文件移入隐藏目录）"
    echo "  show     - 显示系统文件（从隐藏目录恢复）"
    echo "  protect  - 保护系统文件（设置不可变属性）"
    echo "  unprotect - 解除保护（移除不可变属性）"
    echo "  status   - 查看当前保护状态"
    echo "  backup   - 创建备份"
    echo "  restore  - 从备份恢复"
    echo "  help     - 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 hide      # 隐藏系统文件"
    echo "  $0 protect   # 保护系统文件"
    echo ""
}

# 检查是否在正确目录
check_directory() {
    if [ ! -f "Makefile" ]; then
        echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
        exit 1
    fi
}

# 隐藏系统文件
hide_system_files() {
    check_directory

    echo -e "${YELLOW}正在隐藏系统文件...${NC}"

    # 创建隐藏目录
    mkdir -p .luxas_os_hidden

    # 移动核心文件到隐藏目录
    mv kernel_lite kernel_lite.bin kernel_lite.elf .luxas_os_hidden/ 2>/dev/null || true
    mv luxas_shell luxas_shell.bin luxas_shell.elf .luxas_os_hidden/ 2>/dev/null || true
    mv windows_subsystem windows_subsystem.bin windows_subsystem.elf .luxas_os_hidden/ 2>/dev/null || true
    mv ai_module ai_module.bin ai_module.elf .luxas_os_hidden/ 2>/dev/null || true
    mv build.sh start.sh clean.sh .luxas_os_hidden/ 2>/dev/null || true
    mv Makefile .luxas_os_hidden/ 2>/dev/null || true
    mv config system_config.yaml .luxas_os_hidden/ 2>/dev/null || true

    # 移动隐藏目录下的文件到主目录
    mv .luxas_os_hidden/*.bin .luxas_os_hidden/*.elf .luxas_os_hidden/*.sh .luxas_os_hidden/Makefile .luxas_os_hidden/ 2>/dev/null || true

    # 隐藏目录本身
    mv .luxas_os_hidden .luxas_os

    echo -e "${GREEN}系统文件已隐藏！${NC}"
    echo -e "${YELLOW}隐藏目录: .luxas_os${NC}"
}

# 显示系统文件
show_system_files() {
    check_directory

    echo -e "${YELLOW}正在显示系统文件...${NC}"

    # 检查隐藏目录是否存在
    if [ ! -d ".luxas_os" ]; then
        echo -e "${RED}未找到隐藏的系统文件${NC}"
        exit 1
    fi

    # 恢复文件
    mv .luxas_os/* .luxas_os/..* 2>/dev/null || true
    rmdir .luxas_os

    echo -e "${GREEN}系统文件已显示！${NC}"
}

# 保护系统文件
protect_system_files() {
    check_directory

    echo -e "${YELLOW}正在保护系统文件...${NC}"

    # 设置不可变属性
    chattr +i kernel_lite kernel_lite.bin kernel_lite.elf 2>/dev/null || true
    chattr +i luxas_shell luxas_shell.bin luxas_shell.elf 2>/dev/null || true
    chattr +i windows_subsystem windows_subsystem.bin windows_subsystem.elf 2>/dev/null || true
    chattr +i ai_module ai_module.bin ai_module.elf 2>/dev/null || true
    chattr +i build.sh start.sh clean.sh Makefile 2>/dev/null || true
    chattr +i config system_config.yaml 2>/dev/null || true

    echo -e "${GREEN}系统文件已保护（不可修改）！${NC}"
    echo -e "${YELLOW}使用 '$0 unprotect' 可以解除保护${NC}"
}

# 解除保护
unprotect_system_files() {
    check_directory

    echo -e "${YELLOW}正在解除保护...${NC}"

    # 移除不可变属性
    chattr -i kernel_lite kernel_lite.bin kernel_lite.elf 2>/dev/null || true
    chattr -i luxas_shell luxas_shell.bin luxas_shell.elf 2>/dev/null || true
    chattr -i windows_subsystem windows_subsystem.bin windows_subsystem.elf 2>/dev/null || true
    chattr -i ai_module ai_module.bin ai_module.elf 2>/dev/null || true
    chattr -i build.sh start.sh clean.sh Makefile 2>/dev/null || true
    chattr -i config system_config.yaml 2>/dev/null || true

    echo -e "${GREEN}保护已解除！${NC}"
}

# 查看保护状态
show_status() {
    check_directory

    echo -e "${YELLOW}=== 系统保护状态 ===${NC}"
    echo ""

    # 检查隐藏状态
    if [ -d ".luxas_os" ]; then
        echo -e "${GREEN}状态: 隐藏${NC}"
        echo -e "  隐藏目录: ${YELLOW}.luxas_os${NC}"
    else
        echo -e "${YELLOW}状态: 显示${NC}"
    fi
    echo ""

    # 检查不可变属性
    local has_protected=false

    for file in kernel_lite kernel_lite.bin luxas_shell luxas_shell.bin windows_subsystem windows_subsystem.bin ai_module ai_module.bin build.sh start.sh clean.sh Makefile config system_config.yaml; do
        if [ -f "$file" ]; then
            if lsattr -d "$file" 2>/dev/null | grep -q "i"; then
                has_protected=true
                echo -e "${GREEN}  ✓ $file${NC} (已保护)"
            else
                echo -e "${YELLOW}  ○ $file${NC} (未保护)"
            fi
        fi
    done

    if [ "$has_protected" = false ]; then
        echo -e "${YELLOW}  ○ 无文件受保护${NC}"
    fi
    echo ""

    # 显示隐藏的文件列表
    if [ -d ".luxas_os" ]; then
        echo -e "${YELLOW}隐藏的文件:${NC}"
        ls -la .luxas_os/ 2>/dev/null | tail -n +2
    fi
}

# 创建备份
create_backup() {
    check_directory

    local backup_dir="backups"
    local backup_name="luxas_os_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$backup_dir/$backup_name"

    echo -e "${YELLOW}正在创建备份...${NC}"

    # 创建备份目录
    mkdir -p "$backup_dir"

    # 创建备份
    tar -czf "$backup_path.tar.gz" \
        kernel_lite luxas_shell windows_subsystem ai_module \
        build.sh start.sh clean.sh Makefile \
        config system_config.yaml \
        docs/ README.md 2>/dev/null || true

    echo -e "${GREEN}备份已创建: $backup_path.tar.gz${NC}"
    echo -e "${YELLOW}备份大小: $(du -h "$backup_path.tar.gz" | cut -f1)${NC}"
}

# 从备份恢复
restore_from_backup() {
    check_directory

    echo -e "${YELLOW}=== 可用备份 ===${NC}"

    local backup_dir="backups"

    if [ ! -d "$backup_dir" ]; then
        echo -e "${RED}未找到备份目录${NC}"
        exit 1
    fi

    # 列出所有备份
    local backups=($(ls -t "$backup_dir"/*.tar.gz 2>/dev/null))
    local count=${#backups[@]}

    if [ $count -eq 0 ]; then
        echo -e "${RED}未找到备份文件${NC}"
        exit 1
    fi

    for i in "${!backups[@]}"; do
        local backup_name=$(basename "${backups[$i]}")
        local backup_time=$(stat -c %y "${backups[$i]}" | cut -d'.' -f1)
        echo -e "${GREEN}  [$((i+1))] $backup_name${NC}"
        echo -e "       时间: $backup_time"
    done
    echo ""

    # 选择备份
    read -p "请选择要恢复的备份 (1-$count): " choice

    if [ $choice -lt 1 ] || [ $choice -gt $count ]; then
        echo -e "${RED}无效的选择${NC}"
        exit 1
    fi

    local selected_backup="${backups[$((choice-1))]}"
    echo -e "${YELLOW}正在恢复: $selected_backup${NC}"

    # 解压备份
    tar -xzf "$selected_backup" -C .

    echo -e "${GREEN}恢复完成！${NC}"
}

# 主程序
main() {
    local command=${1:-help}

    case $command in
        hide)
            hide_system_files
            ;;
        show)
            show_system_files
            ;;
        protect)
            protect_system_files
            ;;
        unprotect)
            unprotect_system_files
            ;;
        status)
            show_status
            ;;
        backup)
            create_backup
            ;;
        restore)
            restore_from_backup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}未知命令: $command${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
