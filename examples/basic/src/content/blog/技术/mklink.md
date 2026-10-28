---
title: 使用 mklink 释放 C 盘
published: 2026-06-19
pinned: false
description: 解决 C 盘空间不足的一个可行办法
tags: [技术]
category: 技术
licenseName: "CC BY-NC-SA 4.0"
draft: false
---

如果 C 盘的空间不足，而其他磁盘的空间尚有余裕，很容易想到的一个办法是把 C 盘的文件移动到其他磁盘。  
大部分情况下， C 盘的数据中，会出现一个名为 `AppData` 的占用巨大的文件夹。这个文件夹是大部分应用存放日志、缓存等应用数据的默认地址。  
通常，随着时间的推移， `AppData` 占用的空间会越来越大。

然而，如果直接剪切 `AppData` 的文件夹，有很大的概率会出现各种各样的问题。  
因为大部分应用默认把数据存放在 C 盘的 `AppData` ，直接把文件夹剪切到其他位置，应用程序就无法找到对应的位置。

这里提供一个方法：迁移文件夹之后，删除原文件夹，在同样的地方通过 `mklink` 命令创建一个目录链接，指向新的文件夹位置。  
目录链接看起来就像是一个文件夹，但它本身无占用，而是指向了另一个文件夹。  
当系统访问目录链接时，系统不会感知到这个变化，它依然认为自己在操作 C 盘的数据，而事实上，所有的操作都通过目录链接指向了另一个位置。

建议迁移的数据是 `C:\Users\\...\AppData` 的数据。同时， **不建议直接移动整个 `AppData` 文件夹** ，更加 **建议以单个应用文件夹作为单位迁移** 。

需要注意的是：

- 移动文件夹之前，应当确保相应的应用是关闭的。避免迁移时发生 **文件被占用** 的问题。
- `mklink` 是 `cmd` 的内置命令，而不是 `PowerShell` 的命令，请使用正确的终端，并且给予管理员权限。
- 即使 `mklink` 创建的目录链接几乎不会被系统感知，依然 **不建议轻易的对系统文件进行操作** 。

以下是一个例子：将 `C:\Users\12345\AppData\Local\file` 迁移到 `D:\AppDataLinks\file`  

创建目标文件夹：

```powershell
mkdir D:\AppDataLinks\file
```

复制原文件夹的文件到目标文件夹：

```powershell
robocopy "C:\Users\12345\AppData\Local\file" "D:\AppDataLinks\file" /MIR /COPYALL
```

验证文件数量是否一致：

```powershell
(Get-ChildItem "C:\Users\12345\AppData\Local\file" -Recurse -File).Count
(Get-ChildItem "D:\AppDataLinks\file" -Recurse -File).Count
```

如果两个文件夹的文件数量一致，删除原文件夹：

```powershell
Remove-Item "C:\Users\12345\AppData\Local\file" -Recurse -Force
```

在源文件夹的位置创建一个同名的目录链接，链接到目标文件夹：

```cmd
mklink /J "C:\Users\12345\AppData\Local\file" "D:\AppDataLinks\file"
```

验证链接：

```cmd
cmd /c dir "C:\Users\12345\AppData\Local\file"
```
