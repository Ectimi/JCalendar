class JCalendar {
    constructor({ container }) {
        this.container = container;
        this.length = 42;//日期显示长度 最多是显示 6*7 = 42个
        this.weeks = ['日', '一', '二', '三', '四', '五', '六'];
        this.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

        //需要填充的日期，包含上个月，当月，下个月的
        this.dates = {
            prev: [],
            current: [],
            next: []
        }

        //保存当前选择的年、月、日，默认为系统日期
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth() + 1;
        this.date = new Date().getDate();

        //年份选择器的选择显示范围
        this.startYear = this.year - 4;
        this.endYear = this.year + 4;
        
        //选择具体日期的钩子函数 返回 年 月 日
        this.dateOnchange = () => { }
        //选择月份的钩子函数  返回 年 月
        this.monthOnchange = ()=>{}
        //选择年份的钩子函数 返回 年 
        this.yearOnchange = ()=>{}

        this.init();
    }

    $(selector) {
        return document.querySelector(selector);
    }

    createEl(type, properties) {
        let el = document.createElement(type);
        for (let key in properties) {
            el[key] = properties[key];
        }
        return el;
    }

    /**
     * @description 根据传入的年月获取月份的最后一天，即获取当月有多少天.
     * 如果不传，则默认为当年和当月
     * date:格式为 '2020-6'
     * @param {String} date 
     */
    getCountDays(date) {
        let d = date || new Date().getFullYear + '-' + (new Date().getMonth() + 1)
        let curDate = new Date(d);
        curDate.setMonth(curDate.getMonth() + 1);
        curDate.setDate(0);
        return curDate.getDate();
    }

    /**
     * @description 根据日期判断是星期几
     * @param {String} date 
     */
    getWeek(date) {
        return this.weeks[new Date(date).getDay()];
    }

    setYearRange() {
        this.startYear = Number(this.year) - 4;
        this.endYear = Number(this.year) + 4;
    }

    reset(){
        let d = new Date();
        this.year = d.getFullYear();
        this.month = d.getMonth() + 1;
        this.date = d.getDate();
        this.startYear = this.year - 4;
        this.endYear = this.year + 4;
        this.refreshHead();
        this.refreshYear();
        this.refreshDate();
    }

    //获取要填充的日期
    fillDates() {
        this.dates.prev = [];
        this.dates.current = [];
        this.dates.next = [];

        let date = new Date();
        let prevAllDatesCount = this.getCountDays(`${date.getFullYear()}-${date.getMonth()}`);//上月总天数
        let currentAllDatesCount = this.getCountDays(); //当月总天数
        let startWeek = this.getWeek(`${this.year}-${this.month}`); //当月开始的星期

        /*
        * 获取需要补充显示的上个月的日期个数。
        * 如果 gaps=0 说明当月是从星期天开始，则不需要补充显示上个月
        * 否则 获取的结果就是所需要补充显示的个数 
        */
        let gaps = this.weeks.indexOf(startWeek)

        for (let i = 0; i < gaps; i++) {
            this.dates.prev.unshift(prevAllDatesCount - i);
        }

        for (let i = 1; i <= currentAllDatesCount; i++) {
            this.dates.current.push(i);
        }

        for (let i = 1, len = this.length - gaps - currentAllDatesCount; i <= len; i++) {
            this.dates.next.push(i);
        }
    }

    //创建日历头部
    createHead() {
        let head = this.createEl('div', { className: 'year-month' });
        let prevBtn = this.createEl('div', { className: 'arrow prev-year-btn' });
        let text = this.createEl('div', { className: 'text', innerText: `${this.year}年${this.month}月` });
        let nextBtn = this.createEl('div', { className: 'arrow next-year-btn' });

        prevBtn.addEventListener('click', () => {
            this.year -= 1;
            this.refreshHead();
            this.refreshDate();
        })

        nextBtn.addEventListener('click', () => {
            this.year += 1;
            this.refreshHead();
            this.refreshDate();
        })
        text.addEventListener('click', () => {
            this.$('.month-select').style.display = 'block'
            this.heightLightCurrentMonth();
        })
        head.append(prevBtn);
        head.append(text);
        head.append(nextBtn);

        return head;
    }

    //创建星期
    createWeek() {
        let week = this.createEl('div', { className: 'week' });
        for (let i = 0, len = this.weeks.length; i < len; i++) {
            let weekItem = this.createEl('div', { className: 'week-item', innerText: this.weeks[i] });
            week.append(weekItem);
        }
        return week;
    }

    //创建显示日期
    createDate() {
        let date = this.createEl('div', { className: 'date' });
        for (let key in this.dates) {
            if (key == 'prev') {
                this.dates[key].map(value => {
                    let dateItem = this.createEl('div', { className: 'date-item gray', innerText: value });
                    date.append(dateItem);
                })
            } else if (key == 'current') {
                this.dates[key].map(value => {
                    let dateItem
                    if (value == this.date) {
                        dateItem = this.createEl('div', { className: 'date-item cy current', innerText: value });
                    } else {
                        dateItem = this.createEl('div', { className: 'date-item cy', innerText: value });
                    }
                    date.append(dateItem);
                })
            } else if (key == 'next') {
                let len = this.dates.prev.length + this.dates.current.length;
                if (len <= 35) {
                    for (let i = 1; i <= 35 - len; i++) {
                        let dateItem = this.createEl('div', { className: 'date-item gray', innerText: i });
                        date.append(dateItem);
                    }
                } else {
                    this.dates[key].map(value => {
                        let dateItem = this.createEl('div', { className: 'date-item gray', innerText: value });
                        date.append(dateItem);
                    })
                }
            }
        }

        date.addEventListener('click', e => {
            if (e.target.classList.contains('cy')) {
                // if (e.target.classList.contains('current')) return;
                this.date = e.target.innerText;
                this.heightLightCurrentDate();

                this.dateOnchange({
                    year: Number(this.year),
                    month: Number(this.month),
                    date: Number(this.date),
                })
            }
        })
        return date;
    }

    //创建月分选择器
    createMonthSelect() {
        let monthSelect = this.createEl('div', { className: 'month-select' })
        let head = this.createEl('div', { className: 'year' })
        let prevBtn = this.createEl('div', { className: 'arrow prev-year-btn' })
        let text = this.createEl('div', { className: 'text', innerText: `${this.year}` })
        let nextBtn = this.createEl('div', { className: 'arrow next-year-btn' })

        text.addEventListener('click', () => {
            this.$('.year-select').style.display = 'block'
        })

        prevBtn.addEventListener('click', () => {
            this.year -= 1;
            this.refreshHead()
            this.heightLightCurrentMonth()
        })

        nextBtn.addEventListener('click', () => {
            this.year += 1;
            this.refreshHead()
            this.heightLightCurrentMonth()
        })

        head.append(prevBtn);
        head.append(text)
        head.append(nextBtn)

        let monthsBox = this.createEl('div', { className: 'months-box' })
        for (let i = 0, len = this.months.length; i < len; i++) {
            let div = this.createEl('div', { className: 'month' })
            let span = this.createEl('span', { innerText: this.months[i] })
            span.setAttribute('data-month', i + 1)

            if (i == this.month - 1) {
                span.classList.add('currentMonth')
            }
            div.append(span)
            monthsBox.append(div)
        }

        monthsBox.addEventListener('click', e => {
            if (!e.target.classList.contains('month-select')) {
                this.month = this.months.indexOf(e.target.innerText) + 1;
                this.heightLightCurrentMonth();
                this.$('.month-select').style.display = 'none';
                this.refreshHead()
                this.refreshDate()

                this.monthOnchange({
                    year: Number(this.year),
                    month: Number(this.month),
                })
            }
        })

        monthSelect.append(head)
        monthSelect.append(monthsBox)

        return monthSelect;
    }

    //创建年分选择器
    createYearSelect() {
        let yearSelect = this.createEl('div', { className: 'year-select' });
        let head = this.createEl('div', { className: 'year' });
        let prevBtn = this.createEl('div', { className: 'arrow prev-year-btn' });
        let text = this.createEl('div', { className: 'text', innerText: `${this.startYear}-${this.endYear}` });
        let nextBtn = this.createEl('div', { className: 'arrow next-year-btn' });

        prevBtn.addEventListener('click', () => {
            this.startYear -= 9;
            this.endYear = this.startYear + 8;
            this.refreshHead();
            this.refreshYear();
        })

        nextBtn.addEventListener('click', () => {
            this.startYear = this.endYear + 1;
            this.endYear = this.endYear + 9;
            this.refreshHead();
            this.refreshYear();
        })

        text.addEventListener('click', () => {
            this.$('#JCalendar .month-select').style.display = 'none';
            this.$('#JCalendar .year-select').style.display = 'none';
        })

        head.append(prevBtn);
        head.append(text);
        head.append(nextBtn);

        let yearsBox = this.createEl('div', { className: 'years-box' });
        for (let i = this.startYear; i <= this.endYear; i++) {
            let div = this.createEl('div', { className: 'year' });
            let span = this.createEl('span', { innerText: i });

            if (i == this.year) {
                span.classList.add('currentYear');
            }
            div.append(span);
            yearsBox.append(div);
        }

        yearsBox.onclick = e => {
            if (!e.target.classList.contains('years-box')) {
                this.year = e.target.innerText;
                this.$('#JCalendar .year-select').style.display = 'none';
                this.setYearRange();
                this.refreshHead();
                this.refreshYear();

                this.yearOnchange({
                    year: Number(this.year),
                })
            }
        }

        yearSelect.append(head);
        yearSelect.append(yearsBox);

        return yearSelect;
    }

    //高亮当前日期
    heightLightCurrentDate(){
        this.$('#JCalendar .current').classList.remove('current');
        let dateList = document.querySelectorAll('#JCalendar .cy');
        for(let i=0,len = dateList.length;i<len;i++){
            if(dateList[i].innerText == this.date){
                dateList[i].classList.add('current');
                return;
            }
        }
    }

    //高亮当前月份
    heightLightCurrentMonth() {
        this.$('.currentMonth').classList.remove('currentMonth');
        document.querySelectorAll('.month span')[this.month - 1].classList.add('currentMonth');
    }

    //高亮当前年份
    heightLightCurrentYear() {
        if (this.$('.currentYear')) {
            this.$('.currentYear').classList.remove('currentYear');
        }

        let yearList = document.querySelectorAll('#JCalendar .years-box .year span');
        for (let i = 0, len = yearList.length; i < len; i++) {
            if (yearList[i].innerText == this.year) {
                yearList[i].classList.add('currentYear');
                return;
            }
        }
    }

    //刷新头部显示
    refreshHead() {
        this.$('#JCalendar .year-month .text').innerText = `${this.year}年${this.month}月`;
        this.$('#JCalendar .month-select .text').innerText = `${this.year}`;
        this.$('#JCalendar .year-select .text').innerText = `${this.startYear}-${this.endYear}`;
    }

    refreshYear() {
        let yearList = document.querySelectorAll('#JCalendar .years-box .year span');
        for (let i = 0, len = yearList.length; i < len; i++) {
            yearList[i].innerText = this.startYear + i;
        }
        this.heightLightCurrentYear();
    }


    //年月变化时刷新日期
    refreshDate() {
        this.$('#JCalendar .date').remove();
        this.fillDates();
        let date = this.createDate();
        this.$('#JCalendar').append(date);
    }

    //首次渲染
    render() {
        let frag = document.createDocumentFragment();
        let parent = this.createEl('div', { id: 'JCalendar' });
        let head = this.createHead();
        let week = this.createWeek();
        let date = this.createDate();
        let monthSelect = this.createMonthSelect();
        let yearSelect = this.createYearSelect();

        parent.append(head);
        parent.append(week);
        parent.append(date);
        parent.append(monthSelect);
        parent.append(yearSelect);
        frag.append(parent);

        if (!this.container) {
            document.body.append(frag);
        } else {
            document.querySelector(this.container).append(frag);
        }

        this.$('#JCalendar').style.display = 'none'
    }

    isShow(){
        return this.$('#JCalendar') && this.$('#JCalendar').style.display != 'none';
    }

    //显示 
    show(){
        this.$('#JCalendar').style.display = 'block'
    }

    //隐藏
    hide(){
        this.$('#JCalendar').style.display = 'none'
    }

    //销毁
    destroy() {
        this.$('#JCalendar').remove();
    }

    //初始化
    init() {
        this.fillDates();
        this.render();
        this.reset();
    }
}