JumpServer
---
跳板机，推荐配合``oh-my-zsh``服用

![](demo.png)

### Requirements
* nodejs 8.x+  
* npm 6.x+  

### Install
```sh
npm i @gavinning/jump-server -g
```

### Usage
```sh
j2
# or
jumpserver
```

### yaml配置文件
配置文件路径``~/.jumpserver.yml``  
```yaml
# 统一授权
auth:
    port: 22
    password: 123
    # 默认privateKey优先
    privateKey: '/root/.ssh/your-private-key'
    passphrase: 123
    # 连接超时时间
    readyTimeout: 5000

server:
    centos.shared:
        name: hostname1
        desc: 测试机12
        username: root
        
    192.168.1.222:
        name: hostname21
        desc: 测试机234
        username: work

    192.168.1.31:
        name: hostname3
        desc: 测试机3342
        port: 22
        username: super
        password: 123
        privateKey: '/root/.ssh/your-private-key'
        passphrase: 123
```