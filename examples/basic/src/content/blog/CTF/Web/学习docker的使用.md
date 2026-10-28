---
title: 学习Docker的使用
pubDate: 2026-04-07
updatedDate: 2026-04-15
pinned: false
description: Docker到底是什么……
tags: [CTF, Web, Docker]
category: CTF
licenseName: "CC BY-NC-SA 4.0"
draft: false
---

## 安装Docker Desktop

访问 [Docker官网](https://www.docker.com/) 下载 Docker Desktop ，不需要复杂的配置即可搭建 docker 环境。  

## 尝试打包

我准备了一个python编写的图片隐写检查脚本，尝试 Docker 打包这个服务。

### 编写 requirements.txt

`requirements.txt` 是 Python 项目的依赖清单文件，告诉 pip 需要安装哪些第三方库。

```txt
Pillow
```

### 编写 Dockerfile

`Dockerfile` Docker 镜像的构建说明书，告诉 Docker 打包服务。  

```Dockerfile
# 基础镜像：一个精简版 Linux + Python 3.11
FROM python:3.11-slim

# 安装系统工具（脚本依赖的命令：file、exiftool、pngcheck、zsteg 等）
RUN apt-get update && apt-get install -y \
    file \
    exiftool \
    pngcheck \
    binwalk \
    binutils \
    ruby \
    ruby-dev \
    build-essential \
    && gem install zsteg \
    && apt-get remove -y ruby-dev build-essential \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# 在容器中创建工作目录
WORKDIR /app

# 复制依赖清单并安装 Python 包
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制脚本文件
COPY main.py .

# 容器启动时执行的命令
CMD ["python", "main.py"]
```

| 指令 | 作用 |
| :--- | :--- |
| `FROM` | 指定基础镜像 |
| `RUN` | 在构建过程中执行命令 |
| `WORKDIR` | 设置容器内的工作目录 |
| `COPY` | 将本地文件复制到镜像中 |
| `CMD` | 容器启动时默认执行的命令 |

`FROM` 指定了一个模版作为 docker 构建容器的基础环境。  
`RUN apt-get update` 可以理解为 `sudo apt update` ，`RUN` 在构建阶段逐个执行，配置环境需要的依赖或组件。  
`WORKDIR` 为容器设置了一个工作目录。  
`COPY` 告诉 docker 在构建的时候要把什么文件复制到容器中。  
`CMD` 是容器启动时的默认命令，如果有多个 `CMD` ，一般只会执行最后一个。  
如果在启动容器的时候，`docker run` 后面指定了其他命令，则会覆盖设置的命令。

## 构建镜像

准备好 `Dockerfile` 之后就可以构建镜像了。  
构建命令：`docker build`  
在终端输入 `docker build -t img-check .`  
`docker build` 是构建命令。  
`-t` 是 tag， `-t img-check` 是给镜像命名为 `img-check`  
`.` 使用当前目录作为构建上下文，即 `Dockerfile` 等文件的路径。 

构建失败了。在日志中可以找到这一条：

> <u>FROM python:3.11-slim</u>  
> failed to fetch oauth token: Post "https://auth.docker.io/token": dial tcp 103.230.123.190:443: i/o timeout  

这个 `i/o timeout` 错误是一个网络连接问题，根源在于无法稳定地访问 Docker Hub 的认证服务器（auth.docker.io）  
我一开始尝试配置 docker desktop 的 Proxies 解决这个问题，但构建的时候似乎不会走 docker desktop 设置的代理，怎么改都没有用。  
多次尝试之后我发现，启动代理软件的 `虚拟网卡` 选项，可以正常的完成构建。如果你使用的代理软件没有这个选项，启动 `TUN` 或许也可以解决这个问题。

Some time later...  
构建十多分钟都没构完是怎样啊……  
虽然可以连上服务器了，但是似乎不是很稳定，构建日志多次出现

> Err:404 http://deb.debian.org/debian trixie/main arm64 pyqt6-dev-tools all 6.9.0-2

> 502 Bad Gateway [IP: 28.0.0.11 80]

配置国内镜像源或许可以解决这个问题。  
在 `Docker Engine` 中编辑：

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.xuanyuan.me",
    "https://docker.1ms.run"
  ]
}
```

终于构建成功了……

## 运行容器

运行命令：`docker run`  
输入 `docker run --rm -v $(pwd):/app img-check` 运行容器。  
从输出看应该是没有问题了。

`docker run` 启动一个新的容器。  
`--rm` 容器停止后自动删除。  
`-v $(pwd):/app` 将当前目录映射到容器内的 /app 目录。 `$(pwd)` 在执行的时候会被替换为当前目录的绝对路径。  
`img-check` 指定要运行的镜像名称。

## 推送镜像

### 标签

标签命令：`docker tag`  
输入 `docker tag img-check kesazake/img-check:latest`  
`img-check` 是要打标签的镜像源。  
`kesazake/img-check:latest` 是目标，也就是要打的标签。  
docker 推送到仓库时，镜像名必须包含仓库地址和用户名，否则 docker 不知道推送到哪里。  
一个完整的镜像标签(tag)应该类似这样：`[仓库地址/]用户名/镜像名:版本号`  
仓库名可以省略，默认 `docker.io`  
版本号可以省略，默认 `latest`  
`docker tag` 不会复制源镜像，只是给同一个镜像起了一个别名。

### 推送

推送命令：`docker push kesazake/img-check:latest`  
在推送的时候我遇到了多次失败，主要的错误有两个：

> write tcp 192.168.65.3:65168->192.168.65.1:3128: write: broken pipe

> failed to do request: Post "https://registry-1.docker.io/v2/kesazake/img-check/blobs/uploads/": EOF

我尝试了一些办法，最后发现代理节点改到香港就行了（）

## 如何使用

从 docker hub 拉取镜像，或者使用 `docker build` 构建镜像。  
在当前文件夹放入需要检查的图片，重命名为 `challenge.png`  
输入 `docker run --rm -v $(pwd):/app img-check` 运行容器。

## 为什么有两个 `RUN`

Docker 镜像是由一系列只读的层堆叠起来的，每一层记录了对文件系统的一次改动。容器就是启动的时候添加在镜像最上层的可写的层。  

```Dockerfile
FROM python:3.11-slim      # 层 1：基础镜像（本身也由多层组成）
RUN apt-get update ...     # 层 2：安装系统工具
RUN pip install ...        # 层 3：安装 Pillow
COPY main.py .             # 层 4：复制脚本
CMD ["python", "main.py"]  # 层 5：设置启动命令（不产生文件改动，是元数据）
```

实际上的容器环境类似这样：

```text
┌─────────────────────────────────────┐
│           容器可写层（运行时可写）     │  ← 容器运行时加的
├─────────────────────────────────────┤
│ 层 5: CMD ["python", "main.py"]      │  ← 元数据，不改变文件
├─────────────────────────────────────┤
│ 层 4: COPY main.py .                 │  ← 添加了 main.py 文件
├─────────────────────────────────────┤
│ 层 3: RUN pip install Pillow         │  ← 添加了 Pillow 库文件
├─────────────────────────────────────┤
│ 层 2: RUN apt-get install ...        │  ← 添加了 file/exiftool 等命令
├─────────────────────────────────────┤
│ 层 1: FROM python:3.11-slim          │  ← Debian + Python 基础文件
└─────────────────────────────────────┘
```

Docker 在构建镜像时，每一层都有缓存。如果某一层没有变化，Docker 就直接复用之前的缓存结果，不会重新执行。  
将 系统依赖 和 python依赖 分开，用两个 `RUN` 分别安装，可以避免只有其中一个更新时重新安装所有依赖。
