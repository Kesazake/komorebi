---
title: AstrBot 的部署和配置
pubDate: 2026-06-19
pinned: false
description: 在服务器上部署配置一个 24 小时运行的 bot
tags:
  - 技术
category: 技术
licenseName: CC BY-NC-SA 4.0
draft: false
---

最近对聊天机器人很感兴趣。简单的搜索了一下，发现 AstrBot 似乎是一个比较成熟的方案。  
AstrBot 是一个跨平台 AI 助手，让 AI 直接工作在你的聊天软件中，实现自动化任务与智能协作，同时提供灵活的 Agent 编排能力。  
[AstrBot 官方文档](https://astrbot.app/)

我尝试在我的服务器上部署配置 AstrBot 。

## 安装 Docker

> 通过 Docker 可以方便地将 AstrBot 部署到 Windows, Mac, Linux 上。

官方文档提供了非常丰富的部署方式，这里我选择 Docker 部署。

首先，更新系统的软件包列表，安装 HTTPS 根证书包和 `curl` 命令。

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

从 Docker 官网获取安装脚本，用管理员权限运行。

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

如果一切顺利，应该可以看到这样的输出：

```bash
Client: Docker Engine - Community
 Version:           29.6.0
 API version:       1.55
 Go version:        go1.26.4
 Git commit:        fb59821
 Built:             Thu Jun 18 19:57:31 2026
 OS/Arch:           linux/amd64
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          29.6.0
  API version:      1.55 (minimum version 1.40)
  Go version:       go1.26.4
  Git commit:       70eaf5e
  Built:            Thu Jun 18 19:57:31 2026
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          v2.2.5
  GitCommit:        e53c7c1516c3b2bff98eb76f1f4117477e6f4e66
 runc:
  Version:          1.3.6
  GitCommit:        v1.3.6-0-g491b69ba
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0

================================================================================

To run Docker as a non-privileged user, consider setting up the
Docker daemon in rootless mode for your user:

    dockerd-rootless-setuptool.sh install

Visit https://docs.docker.com/go/rootless/ to learn about rootless mode.


To run the Docker daemon as a fully privileged service, but granting non-root
users access, refer to https://docs.docker.com/go/daemon-access/

WARNING: Access to the remote API on a privileged Docker daemon is equivalent
         to root access on the host. Refer to the 'Docker daemon attack surface'
         documentation for details: https://docs.docker.com/go/attack-surface/

================================================================================
```

删除安装脚本。

```bash
rm get-docker.sh
```

可以通过 `docker --version` 和 `docker compose version` 查看版本号以检查是否正常安装了 `docker` 和 `docker compose` 。

```bash
docker --version
docker compose version
```

通常， `docke` 命令需要 root 权限。如果你不是 root 用户，请在命令前添加 `sudo` 。

## 部署 AstrBot

克隆项目到当前目录下。

```bash
git clone https://github.com/AstrBotDevs/AstrBot
```

运行 Compose ，启动项目的所有容器服务。第一次运行此命令时， Docker 会自动从 Docker Hub 下载 AstrBot 的镜像文件。

```bash
sudo docker compose up -d
```

如果一切顺利，大概会看以下信息。

```bash
 ✔ Image soulter/astrbot:latest Pulled                                                                                                                                      44.7s
 ✔ Network astrbot_default      Created                                                                                                                                      0.1s
 ✔ Container astrbot            Started   
```

查看日志。

```bash
docker compose logs
```

在日志中找到以下信息：

```bash
astrbot  |  ✨✨✨
astrbot  |   AstrBot v4.25.5 WebUI is ready
astrbot  | 
astrbot  |    ➜  Local: (本机地址)
astrbot  |    ➜  Network: (本机回环地址)
astrbot  |    ➜  Network: (容器内部 IP 地址)
astrbot  |    ➜  Initial username: (初始用户名)
astrbot  |    ➜  Initial password: (初始密码)
astrbot  |    ➜  Change it after logging
```

如果是在本机运行的 AstrBot 服务，可以直接访问 Local 显示的地址。但如果是在服务器启动的 AstrBot 服务，则需要通过服务器的 IP 访问。  
通过 IP 访问服务器时，需要注意服务器的防火墙是否开放了对应端口。

## 配置 AstrBot

打开 WebUI 之后就可以开始配置 AstrBot 。  
WebUI 界面本身也有非常丰富的引导。

### 配置 AI 模型

我使用 DeepSeek API，模型是 DeepSeek-V4-Flash 。在 DeepSeek API 开放平台新建 API ，在商源列表中选择 DeepSeek ，填入 API ，获取模型列表并且选择模型。  
其他商源获取的 API 也是类似的操作。如果商源列表没有需要的商源，可以选择 OpenAl Compatible 或者 Anthropic 这样的通用格式。

### 配置平台机器人

#### [配置 OneBot v11](https://docs.astrbot.app/platform/aiocqhttp.html)

AstrBot 支持扫码一键创建 QQ 机器人，但这种方式只能把机器人拉入自己是群主的群聊。  
或者申请一个 QQ 机器人，这需要提交审核。

OneBot 是一个聊天机器人应用接口标准，NapCat 通过接入 OneBot v11 协议实现连接到 QQ ，可以将个人账号作为机器人，更加灵活。  
新建机器人，消息平台类别选择 OneBot v11 并填写表单：

- 机器人名称：随意填写，仅用于区分不同的消息平台实例。
- 启用(enable): 勾选。
- 反向 WebSocket 主机地址：请填写你的机器的 IP 地址，一般情况下请直接填写 0.0.0.0
- 反向 WebSocket 端口：填写一个端口，默认为 6199。
- 反向 Websocket Token：只有当 NapCat 网络配置中配置了 token 才需填写。

如果不配置反向 Websocket Token ，会提示安全风险。你可以随便想一个字符串作为 token ，或者在终端生成一个随机字符串：

```bash
openssl rand -hex 64
```

配置 token 之后，只有持有相同 token 的 NapCat 客户端可以连接到对应的 OneBot ，可以提高连接的安全性。

### 部署 NapCat

AstrBot 的文档附录了 [NapCat 部署文档](https://napneko.github.io/guide/boot/Shell#napcat-installer-linux-%E4%B8%80%E9%94%AE%E4%BD%BF%E7%94%A8%E8%84%9A%E6%9C%AC-%E6%94%AF%E6%8C%81ubuntu-20-debian-10-centos9) 。我们使用 Docker 安装：

```bash
curl -o \
napcat.sh \
https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.sh \
&& bash napcat.sh \
--docker y \
--qq "123456789" \
--mode ws \
--proxy 1 \
--confirm
```

需要注意的是，参数 `--qq` 需要修改为账号的真实 QQ 号。  
看到这样的信息，就说明一切顺利：

```bash
[2026-06-20 15:01:50]: 安装成功 
[2026-06-20 15:01:50]: Docker 安装流程完成。
```

删除安装脚本。

```bash
rm napcat.sh
```

登录 NapCat ：

```bash
docker logs napcat
```

在输出的日志中可以找到 NapCat 的 WebUI 地址：

```bash
06-20 15:01:55 [info] [NapCat] [WebUi] WebUi Token: ()
06-20 15:01:55 [info] [NapCat] [WebUi] WebUi User Panel Url: ()
06-20 15:01:55 [info] [NapCat] [WebUi] WebUi User Panel Url: ()
```

同样的，如果是在本机运行，可以直接访问 URL 。但如果是在服务器上运行的服务，请通过服务器 IP 访问，并且要放行对应端口。

第一次登录通常会失败。终端会输出一个可以扫描的二维码，用 QQ 的账号扫描登录即可。如果终端无法显示出可以扫描的二维码，也可以复制解码 URL 到二维码生成网站生成二维码后扫描登录。这里提供一个或许可行的在线二维码生成网站： [草料二维码](https://cli.im/url)

### 配置 NapCat

Docker 容器在创建的时候默认容器和容器之间相互隔离。我们创建一个自定义网络，然后将 astrbot 和 napcat 这两个容器加入网络，就可以实现容器之间的通信。

创建网络：

```bash
docker network create astrbot-napcat
```

成功创建的话会返回一个十六进制字符串（网络 ID ）。可以用命令查看当前存在的网络：

```bash
docker network ls
```

列表中应该会出现刚刚创建的网络名称。接下来需要将两个容器加入这个网络。

```bash
docker network connect astrbot-napcat astrbot
docker network connect astrbot-napcat napcat
```

可以用以下命令查询加入网络的容器：

```bash
docker network inspect astrbot-napcat | grep -E "astrbot|napcat"
```

如果返回的信息出现了网络名称和两个容器的名称，证明一切正常。为了让配置更加稳定，可以重启两个容器。

```bash
docker restart astrbot
docker restart napcat
```

重启之后重新进入 AstrBot 和 NapCat 的 WebUI 。在 NapCat 的 WebUI 左侧，寻找 “网络配置” ，新建 “WebSocket 客户端” 。  
名称可以随意填写，建议和 AstrBot 的名称保持一致。  
URL 的格式是 `ws://<你的IP地址>:<你在 AstrBot WeUI 设置的端口>/ws` 。端口默认是 6199 ，并且我之前将两个容器加入了同一个网络，因此我填写的是 `ws://astrbot:6199/ws` 。  
Token 需要填写在 AstrBot 的 WebUI 中创建的机器人的 Token 。或者把此处默认生成的 Token 填入 AstrBot 的 WebUI 中创建的机器人。  
保存并且启用。回到 AstrBot 的 WebUI ，选择刚刚创建的机器人，如果在 “平台日志” 中看见了 “···适配器已连接。” ，证明一切顺利。

到这里为止，机器人已经具备最基本的聊天功能。可以用另一个账号向机器人发送一条私聊信息，理论上机器人会自动回复。

## 插件相关

AstrBot 的社区非常活跃，有非常多的开发者提供了各式各样的插件。这些插件可以为机器人提供更加丰富的属性。

### meme_manager

meme_manager 是一个表情包管理器。提供 WebUI 管理，但我的部署方式是 Docker Compose 部署，需要添加端口映射。

首先，停止并删除旧的的 astrbot 容器。

```bash
docker stop astrbot
docker rm astrbot
```

添加端口映射的参数，启动一个新的容器。

```bash
docker run -d \
  --name astrbot \
  --network astrbot-napcat \
  --restart always \
  -p 6185:6185 \
  -p 6199:6199 \
  -p 5000:5000 \
  -v /root/AstrBot/data:/AstrBot/data \
  soulter/astrbot:latest
```

添加端口映射之后，可以给机器人发送指令来开启或关闭 WebUI 。  
指令可以直接通过私聊发送。可能会提示没有权限。按照提示获取用户 ID 然后在 AstrBot 的 WebUI 中添加管理员。  
具体路径是 “配置文件 - 普通配置 - 平台配置 - 管理员 ID - 添加更多” 。
