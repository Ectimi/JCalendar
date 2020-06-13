# JCalendar

这是一个使用原生js实现的日历插件，可用于vue或react

### 使用方法
1. 引入 css 
2. 引入 js
3. 调用构造函数 new JCalendar() 


### 具体使用如下：（也可下载直接运行html查看具体例子）
```javascript
let calendar = new JCalendar({
    container: '.container',  //container 容器，值为css选择器，不填默认添加到body
    immediately：false, //是否立即显示，默认为true，值为false时需要实例调用 show才显示
    showExtra:false, //是否显示额外补充的日期，默认为true,为true时会显示上月和下个月的部分日期填充显示，为false时仅显示当月日期
})

//显示
calendar.show()

//隐藏
calendar.hide()

//销毁 调用后如需重新显示 ，需要实例依次调用 init  ,  show方法
calendar.destroy()

//插件是否存在 如果调用了 hide或destroy则返回false ,
calendar.isShow()

 //选择日期时触发 可获取当前选择的 年 月 日
calendar.dateOnchange = ({ year, month, date }) => {
    console.log(year, month, date);
}
//选择月份时触发 可获取当前选择的 年 月
calendar.monthOnchange = ({ year, month }) => {
    console.log(year, month)
}
//选择年份时触发 获取当前选择的 年
calendar.yearOnchange = ({ year }) => {
    console.log(year)
}
```

若要修改样式，直接使用css选择器选中修改即可，注意选择器前加上 #JCalendar 以防止权重不够