---
title: HTTP协议
pubDate: 2026-04-06
updatedDate: 2026-04-06
pinned: false
description: HTTP协议到底是什么……
tags: [CTF, Web, HTTP]
category: CTF
licenseName: "CC BY-NC-SA 4.0"
draft: true
---

[MDN-HTTP指南](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/Overview)

## HTTP请求

HTTP 请求是由客户端发出的消息，使服务器执行动作。  
请求包括起始行，标头和主体。  

### 起始行  

起始行包含三个元素：  

1. [方法](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Methods)，描述要执行的动作。
2. 目标，通常是一个URL，或者是协议、端口和域名的绝对路径。
3. HTTP 版本

### 请求的标头（Header）

[标头](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers)是不区分大小写的字符串，紧跟着冒号和值。  
整个标头（包括值）由一行组成，这一行可以相当长。

### 请求的主体（Body）

请求的最后一部分是它的主体。  
不是所有的请求都有一个主体，例如获取资源的请求。  
像 GET、HEAD、DELETE 和 OPTIONS，通常它们不需要主体。  
有些请求将数据发送到服务器以便更新数据，常见的情况是 POST 请求（包含 HTML 表单数据）。  

主体大致可分为两类：

- 单一资源（Single-resource）主体，由一个单文件组成。该类型的主体由两个标头定义：Content-Type 和 Content-Length。
- 多资源（Multiple-resource）主体，由多部分主体组成，每一部分包含不同的信息位。通常是和 HTML 表单连系在一起。

## HTTP响应（status line）

### 状态行

HTTP 响应的起始行被称作状态行（status line），包含以下信息：

1. 协议版本，通常为 HTTP/1.1
2. 状态码（status code），表明请求是成功或失败。
3. 状态文本（status text）。一个简短的，纯粹的信息，帮助人们理解该 HTTP 消息。

一个典型的状态行看起来像这样：HTTP/1.1 404 Not Found。

### 响应的标头（Header）

响应的 [HTTP 标头](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers)遵循和任何其他标头相同的结构：不区分大小写的字符串，紧跟着冒号和值。 整个标头（包括其值）表现为单行形式。

### 响应的主体（Body）

响应的最后一部分是主体。不是所有的响应都有主体。具有状态码（如 201 或 204）的响应，通常不会有主体。  
许多不同的标头可能会出现在响应中。这些可以分为几组：

- 通用标头（General header），例如 Via，适用于整个消息。
- 响应标头（Response header），例如 Vary 和 Accept-Ranges，提供有关服务器的其他信息，这些信息不适合状态行。
- 表示标头（Representation header），例如 Content-Type 描述了消息数据的原始格式和应用的任意编码（仅在消息有主体时才存在）。
