const {
    openBrowser,
    closeBrowser,
    updateBrowser,
    deleteBrowser,
    getBrowserDetail,
    getBrowserList,
    addGroup,
    editGroup,
    deleteGroup,
    getGroupDetail,
    getGroupList,
    request,
    windowbounds
  } = require('./request')
  const puppeteer = require('puppeteer')
  const xlsx=require("node-xlsx");
  const fs=require("fs")
  async function awaitNameChange(node,value,npage){
    return new Promise(async (resolve,reject)=>{
       var stepNode=await npage.waitForSelector("li.wt-subway__stop--active .wt-subway__stop__title");
       for(var i=0;i<10;i++){
         await delay(1000);
         var selectName= await npage.evaluate(()=>{
             var txt=document.querySelector("li.wt-subway__stop--active .wt-subway__stop__title").innerText;
             return txt;
          })
          console.log("检测节点是否发生变化",selectName);
          if(selectName==value){
             resolve("success");
             break;
          }
       }
       resolve("failed");
 
    });
 }
  async  function delay(n){
    return new Promise((resolve, reject)=>{
        setTimeout( async() => {
            resolve();
      }, n);
    })
}
function  readInfo(){
  var infos= xlsx.parse("./twitter/c1.xlsx");
  var datas=infos[0].data;
  console.log(datas);
  var t=[];
  for(var i=0;i<datas.length;i++){
           var content=datas[i][0];
           var carr=content.split("-");
           if(carr.length==2){
            t.push(carr[0]);
           }else{
            t.push(content);
           } 
       
  }
  console.log(t);
  return t; 
}

function writeLog(id,log){
    if(!fs.existsSync("logs/")){
      fs.mkdirSync("logs/");
  }
  var options = { encoding: 'utf8' };
  fs.appendFileSync("logs/"+id+".txt", log+"\n", 'utf8');
}

/**
 * 向smm 平台创建刷流量订单
 */
async function addSmmOrder(link,num,eventname){
  return new Promise(async(resolve,reject)=>{
    try{
      var dataInfos={
        key:"***",
        action:"add",
        service:"7117",
        link:link,
        quantity:num
      };
     console.log("刷流量数量:",num);
      try{
        var orderInfo=await request({method:'post',url:"https://smmstone.com/api/v2",data:dataInfos});
        console.log(orderInfo);
        writeLog(eventname,link+"发送刷粉请求成功,对应订单号:"+JSON.stringify(orderInfo));
        resolve(true);
      }catch(e){
          console.log("发送请求失败，在尝试一次");
          writeLog(eventname,link+"发送刷粉请求失败，准备重试");
          try{
            var orderInfo=await request({method:'post',url:"https://smmstone.com/api/v2",data:dataInfos});
            console.log(orderInfo);
            writeLog(eventname,link+"2次发送刷粉请求成功,对应订单号:"+JSON.stringify(orderInfo));
            resolve(true);
          }catch(e){
            console.log("发送请求失败");
          }
          
      }
      
    }catch(err){
      reject(false)
    }


  })

}


/**
 * 检测是否已经打开 home页面
 */
async function checkExitPage(browser,key){
  var mpages=await browser.pages();
  var npage=null;
  for(var i=0;i<mpages.length;i++){
    var  tmpurl=mpages[i].url();
    console.log(tmpurl);
    if(tmpurl.indexOf(key)>=0){
     cururl=tmpurl;
     npage=mpages[i];
     
    } 
   
 }
 return npage;
}

function getEmoji(emojis){
  var mindex=rand(0,emojis.length-1);
        var em=emojis[mindex];
        return em;
}

/**
 * 发布twitter
 */
async function writeTwitter(twittercontent,npage){
   
   return new Promise(async (resolve,reject)=>{
    var emojis=["😀","😃","😄","😁","😉","😊","🙂","🙃","☺️","😋","😌","🥰","😘","🤑","😶","🤫","🤭","🫢","😐","🫡","🤗","🤥","😳","😞","😎","🤓","🥸","🧐","🤠","🥳","😂","🤣","😇"];
        var randomIndex=rand(0,5);
        var randomshare=rand(0,1);
        var tweetnode= await npage.waitForSelector(".DraftEditor-root",{timeout:5000});
        await tweetnode.click();
        await delay(5000);
        await npage.keyboard.press("Enter");
        await delay(5000);
        await npage.keyboard.press('Backspace');
            
        await npage.keyboard.type(twittercontent);
        if(randomIndex==1){
          var em1=getEmoji(emojis);
          await npage.keyboard.type(em1);
        }
        await delay(1000);
        await npage.keyboard.press("Space");  
        await npage.keyboard.type(" @AINNLayer2");
        await delay(1100);
        await npage.keyboard.press("Space");

        if(randomIndex==2){
          var em1=getEmoji(emojis);
          await npage.keyboard.type(em1);
        }

        await delay(1200);
        await npage.keyboard.type("#AIL2");
        await delay(1500);
        await npage.keyboard.press("Space");
        if(randomIndex==3){
          var em1=getEmoji(emojis);
          await npage.keyboard.type(em1);
        }
        await delay(1500);
     //   await npage.keyboard.type("#Port3 ");// @Portalcoin
      //  await delay(1500);
       // await npage.keyboard.type(" $wom");// @Portalcoin
        if(randomIndex==4){
          var em1=getEmoji(emojis);
          await npage.keyboard.type(em1);
        }
        await delay(1500);
        // tweetnode= await npage.waitForSelector(".DraftEditor-root",{timeout:5000});
        // await tweetnode.click();
        // await delay(2000);
        
        var em=getEmoji(emojis);

        await npage.keyboard.type(em);

        await delay(2000);
        for(var i=0;i<2;i++){
          var tweetbtnnode= await npage.waitForSelector("[data-testid='tweetButtonInline']",{timeout:5000});
          await delay(1500);
          if(tweetbtnnode){
            tweetbtnnode.click();
          }
          console.log("检测 aria-disabled节点是否存在");
           try{
            await npage.waitForSelector(["[role='button'][data-testid='tweetButtonInline'][aria-disabled='true']"],{timeout:5000})
            break;
          }catch(e){
            console.log("检测点击未生效再次d点击");
           }
        }
    
        


        resolve(true);
   })
 

}
function rand(m, n)  {
  return Math.ceil(Math.random() * (n-m+1) + m-1)
}

function getRandomTwittrer(contents){
    var rindex=rand(0,contents.length-1);
    return contents[rindex];
}


async function resize(seqlist){
  return new Promise(async(resolve,reject)=>{
    var options={
      "type": "box", // 排列方式，宫格 box ， 对角线 diagonal
      "startX": 0, // 起始X位置
      "startY": 0, // 起始Y位置
      "width": 500, // 宽度
      "height": 700, // 高度
      "col": 7, // 宫格排列时，每行列数
      "spaceX": 0, // 宫格横向间距
      "spaceY": 0, // 宫格纵向间距
      "offsetX": 50, // 对角线横向偏移量
      "offsetY": 50, // 对角线纵向偏移量
      "seqlist": seqlist //序号数组
    }
   await windowbounds(options);
   resolve(true);
  })

}


/**
 * 启动事件
 */
async function startEvent(eventname,openRes,contents,todaylimit){
       console.log("do startEvent");
  function eventRun(eventname,param,process,contents){
    return (async function(){
      //  console.log("this is "+eventname);
         
         if(!processFlag){//表示线程还未运行

          if(runtime>todaylimit){
            console.log("今日推文发布次数已达到限制");
            return;
          }

           //是否已达到下次 发送时间
           if(nextTime>0){
            var nowTime=new Date().getTime();
             var distance=(nowTime-prevtime)/1000;
             if(distance<nextTime){
            //  console.log(distance);
            //  console.log("请等待,还剩"+(nextTime-distance)+"s 将会发帖");
              return;
             }
           }
           
           console.log(eventname,"当前推文已发布次数:"+runtime);

          processFlag=true;   ///线程开始运行，调度器忽略

          //检测是否达到 home 页面
          var mpages=await browser.pages();
          var npage=await checkExitPage(browser,"twitter.com/home");
          if(npage==null){
             console.log("检测到home页面还未开启");
             npage=await browser.newPage();
             npage.setDefaultNavigationTimeout(0)
             const navigationPromise = npage.waitForNavigation().catch(err=>{
                console.log("navigationPromise 异常");
              })
             await npage.goto("https://twitter.com",{timeout: 0,waitUntil:['load']});
             await navigationPromise ;

          }
          console.log("跳转标识已结束,可能已经到达页面");
          console.log("检测是否到达 home页");
          await delay(1000)
          ///检测是否已经加载完数据

         var loadedData= await npage.waitForSelector("[data-testid='cellInnerDiv']",{timeout:30000});
          if(loadedData!=null){
            var wtime=rand(10000,12000);
            console.log("已经加载完数据,等待"+wtime/1000+"秒");
            await delay(wtime);
          }

          ///此处看要不要加随机滚动啥的，先忽略

          ///获取随机twitter

        

          var twittercontent=getRandomTwittrer(contents);
          console.log("当前获取到的twitter:"+twittercontent);
     
          //检测输入框节点 
          var issend= await writeTwitter(twittercontent,npage);
          await delay(5000);
           if(issend){

            ///获取发帖的链接

            ///获取第一个帖子
            await npage.evaluate(()=>{
              document.querySelectorAll("[data-testid='tweet']")[0].click();
            })
            await delay(5000);
            var pageUrl=npage.url();
            console.log("获取当前页面url"+pageUrl);
            await delay(3000);
            await npage.goBack();
   
            processFlag=false;
            prevtime=new Date().getTime();
             ///随机设置下次 twitter 发布时间
             var randomtime=rand(50,100); //150s ~300秒后再次发送twitter
             nextTime=randomtime;
             console.log("下次twitter 发送,将在"+nextTime+"s后发送");

             console.log("准备发送刷流量请求,请检查数据是否正确,如果异常，请按 ctrl+c暂停程序运行，否则 10s 后将发送请求");
             await delay(10000);
             var num=rand(8020,12050);
             await addSmmOrder(pageUrl,num,eventname);
             runtime++;

           }

         }
       



    })
  }
   ////在这边先链接好浏览器，将浏览器对象 交给线程执行
    const browser = await puppeteer.connect({
      browserWSEndpoint:openRes.data.ws,
      defaultViewport: null
  });
   let processFlag=false;
   let nextTime=0;
   let prevtime=0;
   var runtime=0;




  var eventinstance=eventRun(eventname,browser,processFlag,contents);
  setInterval(eventinstance,1000);

}

var mevent={
  getInstanceInfo:function(id){
         //获取当前实例的用户数据
         if(!fs.existsSync("instance/"+id)){
           return false;
        }
        var dataStr=fs.readFileSync("instance/"+id+"/config.txt", "utf-8");
        return JSON.parse(dataStr);
  }
}
function waitNode(npage,node){
  console.log("等待节点:",node);
  return new Promise(async (resolve,reject)=>{
      try{
          var node1=await npage.waitForSelector(node,{ timeout: 10000 });
          node1.click();
           resolve(true);
      }catch($e){
             console.log(node+" 失败",$e);
            reject(false);
      }
  })
}
var running={
  index:0
}
  main();
  async function main() {

   
   
   var toaylimit=3; //今天要发布的 推文数量，这个仅单次 运行发布推文，重新运行 会重新计算

    var contents= readInfo();
    //,33,34,35,36,37
    var browseIds=[4];//要启动的浏览器窗口序列号
    //var browseIds=[33,34,35,36,37];
    // var browseIds=[21];//要启动的浏览器窗口序列号
    var browses=[];
    var res= await getBrowserList({page:0,pageSize:100,sortDirection:"asc"}); 
    res.data.list.forEach(function(item){
        if(browseIds.includes(item.seq)){
          browses.push(item);
          console.log(item.seq+"存在");
        }
     
    }) 
    console.log("启动浏览器,并启动线程",browses.length);
    for(var i=0;i<browses.length;i++){
      var mitem=browses[i];
      console.log(mitem.id);
     // const openRes = await openBrowser(mitem.id,true); 
     var id=mitem.id;
      const openRes = await openBrowser({
        id,
        args: [],
        loadExtensions: false,
        extractIp: false
      })
      if (openRes.success){
        startEvent("event"+mitem.seq,openRes,contents,toaylimit);
      }
      
    }
    await resize(browseIds)


    
          
          
  }
