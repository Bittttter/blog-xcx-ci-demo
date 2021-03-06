const ci = require('miniprogram-ci');
const fs = require('fs');

/* 项目配置 */
const projectConfig = require('./project.config.json');
const versionConfig = require('./version.config.json');


/** 增加版本号 */
function versionNext(array, idx) {
    let arr = [].concat(array); ++arr[idx];
    arr = arr.map((v, i) => i > idx ? 0 : v);
    // 当最后一位是0的时候, 删除
    if (!parseInt(arr[arr.length - 1]))  arr.pop();
    return arr.join('.');
}
/** 获取版本选项 */
function getVersionChoices(version) {
    // 描述数组
    const vArrsDesc = ['raise major: ', 'raise minor: ', 'raise patch: ', 'raise alter: '];
    // 版本号(数组形态)
    let vArrs = version.split('.');
    // 版本号选项
    let choices = vArrsDesc.map((item, index, array) => {
        // 当配置文件内的版本号，位数不够时补0
        array.length > vArrs.length ? vArrs.push(0) : '';
        // 版本号拼接
        return vArrsDesc[index] + versionNext(vArrs, index)
    }).reverse();
    // 添加选项
    choices.unshift('no change');
    return choices;
}


// new ci实例
const project = new ci.Project({
    appid: projectConfig.appid,
    type: 'miniProgram',
    projectPath: projectConfig.miniprogramRoot,
    privateKeyPath: './ci-private.key',
    ignores: ['node_modules/**/*'],
});

/** 上传 */
async function upload({version = '0.0.0', versionDesc ='test'}) {
    await ci.upload({
        project,
        version,
        desc: versionDesc,
        setting: {
            es7: true,
            minify: true,
            autoPrefixWXSS: true
        },
        onProgressUpdate: console.log,
      })
}



/** 入口函数 */
async function init() {
    // 上传
    await upload(versionConfig);
    // 修改本地版本文件
    fs.writeFileSync('./version.config.json', JSON.stringify(versionConfig), err => {
        if(err) {
            console.log('自动写入app.json文件失败，请手动填写，并检查错误');
        }
    });
}

init();