#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const program = require('commander')
const package = path.join(__dirname, '../package.json')
const app = require('../app')

program
    .version(require(package).version, '-v, --version')
    .description('jump server')
    .action((...args) => app(args))
    .parse(process.argv)
