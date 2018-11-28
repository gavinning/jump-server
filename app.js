
const fs = require('fs')
const path = require('path')
const lab = require('linco.lab')
const chalk = require('chalk')
const inquirer = require('inquirer')
const align = require('align-string')
const yaml = require('yaml')
const ssh = require('node-ssh-shell')
const conf = path.join(process.env.HOME, '.jumpserver.yml')
const example = path.join(__dirname, './config/jumpserver.yml')
const { CHARSET, SPACE, SPACE2, SPACE3, ENTER, STARTMESSAGE, ERRMSG, ERRMSG2 } = require('./config')

class JumpServer {
    constructor(number) {
        this.conf = this.config
        this.auth = this.conf.auth
        this.server = this.conf.server
        this.serverList = this.makeServerList()
        this.serverAlignList = this.alignString()
        this.login(number)
    }

    login(number) {
        const servers = this.parse()
        console.log(servers)
        this.prompt()
    }

    init() {
        fs.writeFileSync(conf, fs.readFileSync(example, CHARSET), CHARSET)
    }

    get config() {
        try {
            return yaml.parse(this.getConfig())
        }
        catch(err) {
            throw new Error('配置文件不存在，请检查配置文件是否存在 ~/.jumpserver.yml')
        }
    }

    getConfig() {
        if (lab.isFile(conf)) {
            return fs.readFileSync(conf, CHARSET)
        }
        this.init()
        return this.getConfig()
    }

    makeServerList() {
        return Object.keys(this.server).map((host, index) => {
            return Object.assign({index: ++index, host}, this.server[host])
        })
    }

    alignString() {
        return align(
            this.serverList.map(server => {
                return [SPACE3, server.index, server.host, `[${server.username}]`, server.name, server.desc]
            })
        )
    }

    parse() {
        return [
            SPACE2,
            chalk.green(STARTMESSAGE),
            SPACE2,
            this.serverAlignList.map(server => server.join(SPACE2)).join(ENTER),
            SPACE2
        ].join(ENTER)
    }

    prompt() {
        const q = {
            type: 'input',
            name: 'server',
            message: "Please input the server's number:"
        }
        inquirer.prompt(q).then(res => {
            // 退出逻辑
            if (res.server === 'exit') {
                return process.exit(0)
            }

            // 非数字参数警告
            if (isNaN(res.server)) {
                console.log(chalk.red(ERRMSG2))
                return this.prompt()
            }

            const index = Number(res.server) - 1
            
            // 超出范围警告
            if (index < 0 || index >= this.serverList.length) {
                console.error(chalk.red(ERRMSG))
                return this.prompt()
            }

            const server = this.serverList[index]
            const options = this.makeSSHOptions(server)
            return ssh(options)
        })
    }

    // make ssh2 client.connect options
    makeSSHOptions(server) {
        const options = Object.assign({}, this.auth, server)

        // 清理非ssh2.Client.connect参数
        delete options.name
        delete options.desc
        delete options.index

        // 转换passphrase为字符串类型，ssh2官方定义为字符串类型，其他类型会报错
        options.passphrase = String(options.passphrase)

        if (options.privateKey) {
            try {
                options.privateKey = fs.readFileSync(options.privateKey)
            }
            catch(err) {
                throw new Error('privateKey读取异常，请检查路径是否正确')
            }
        }
        return options
    }

    static create() {
        return new JumpServer(...arguments)
    }
}

module.exports = args => {
    JumpServer.create(...args)
}
