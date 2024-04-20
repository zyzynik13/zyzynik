const { Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const { openBrowser } = require('./request')

main()

async function main() {
  const openRes = await openBrowser('2c9c29a2806fd77201806febb0350004')
  if (openRes.success) {
    let options = new chrome.Options()
    const service = new chrome.ServiceBuilder('./chromedriver.exe')
    options.options_['debuggerAddress'] = openRes.data.http
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).setChromeService(service).build()

    await driver.get('https://image.baidu.com/')
  }
}
