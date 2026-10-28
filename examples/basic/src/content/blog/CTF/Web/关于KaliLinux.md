---
title: 关于 Kali Linux
pubDate: 2026-04-10
updatedDate: 2026-04-13
pinned: false
description: Kali Linux到底怎么用啊……
tags:
  - CTF
  - Linux
category: CTF
licenseName: CC BY-NC-SA 4.0
draft: false
---

## 安装

因为我使用的系统是 MacOS ，所以选择的是 UTM + Kali Linux 的方案。  
访问 [UTM官网](https://mac.getutm.app/) 获取UTM。  
访问 [Kali Linux官网](https://www.kali.org/get-kali/) 获取 Apple Silicon (ARM64) 镜像。  

启动 UTM 配置一个新的虚拟机。  
加载镜像之后，启动虚拟机之前，需要在虚拟机“编辑”页面的“设备”列表中创建一个串行设备，这样才能正常显示安装界面。  
启动虚拟机，按照 Kali 的指引完成安装。  
安装完成之后，在终端输入以下命令可以解决剪贴板共享和窗口自适应的问题：  

```bash
sudo apt update
sudo apt install spice-vdagent -y
```

重启虚拟机。  
现在，在 mac 上使用 command + c/v，在 kali 上使用 control + shift + c/v 可以正常的复制粘贴。

## 挂载

在 UTM 启动界面，右键虚拟机，在 “共享” 页面，共享目录模式选择 “VirtFS” 。  
创建一个文件夹作为共享文件夹，命名为 “share” ，添加到 “共享” 的路径。  
进入 kali 终端，输入 `sudo mkdir -p /mnt/share` ，这会创建一个挂载点。注意，挂载点的名字必须和 UTM 中添加的共享文件夹的名字相同。  
输入 `sudo mount -t 9p -o trans=virtio,version=9p2000.L share /mnt/share` ，这会把 mac 的共享文件夹挂载到 kali 的挂载点，然后我们就能在 kali 访问 mac 的文件。  
输入`ln -s /mnt/share ~/Desktop/share` ，这会在桌面创建一个快捷方式，指向我们刚刚创建的挂载点。

关闭虚拟机的时候， kali 会自动卸载，挂载点会变成一个普通空目录。  
可以通过配置 /etc/fstab 实现开机自动挂载。  
终端输入 `echo "share /mnt/share 9p trans=virtio,version=9p2000.L,defaults 0 0" | sudo tee -a /etc/fstab` ，会在 fstab 文件末尾追加 `share /mnt/share 9p trans=virtio,version=9p2000.L,defaults 0 0`  
现在虚拟机启动的时候会自动挂载了。
