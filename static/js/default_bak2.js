/* Javascript获取url参数方法 */
var getQueryString = function (name)
{
    // 如果链接没有参数，或者链接中不存在我们要获取的参数，直接返回空
    if(location.href.indexOf("?")==-1 || location.href.indexOf(name+'=')==-1){
        return '';
    }
 
    // 获取链接中参数部分
    var queryString = location.href.substring(location.href.indexOf("?")+1);
 
    // 分离参数对 ?key=value&key2=value2
    var parameters = queryString.split("&");
 
    var pos, paraName, paraValue;
    for(var i=0; i<parameters.length; i++) {
        // 获取等号位置
        pos = parameters[i].indexOf('=');
        if(pos == -1) { 
            continue; 
        }
 
        // 获取name 和 value
        paraName = parameters[i].substring(0, pos);
        paraValue = parameters[i].substring(pos + 1);
 
        // 如果查询的name等于当前name，就返回当前值，同时，将链接中的+号还原成空格
        if(paraName == name) {
            return decodeURI(paraValue.replace(/\+/g, " "));
        }
    }
    return '';
};

function add_required_label($me)
{
    $('<span style="margin-left:4px;vertical-align:middle;font-size:20px;color:red;">*<span>').insertAfter($me);
}
var term_names;
$(document).ready(function() {
	
   	$.get("/term/getAllTerm", {
    },function(response, status) {
		term_names = JSON.parse(response);
	
		$('.required').each(function() {
       	 	add_required_label($(this));
		});
	});
});

/* 把注释中的术语替换为tooltip链接 */
function generate_comment_tooltip(comment)
{
    return comment.replace(/{([\w\W\u4e00-\u9fa5]+?)}/g, '<a href="/term/index#$1" rel="tooltip">$1</a>')
}

/*

function generate_comment_tooltip(comment)
{
	console.info("----------------------------------------xx");
	
	var responses=term_names;
	
     
	var temp;	
	for (var i = 0;i<responses.length ; i++)
	{
		//console.info(responses[i]);
		var temp  = KMP(comment, responses[i]);
		if( temp[0] )
		{
				comment = comment.replace("{"+responses[i]+"}", responses[i]);
				comment = comment.replace(responses[i], '<a href="/term/index#'+responses[i]+'" rel="tooltip">'+responses[i]+'</a>');

		}

	}
	
	console.info(comment+"          --");
	return comment;

//	return comment.replace(/{([\w\W\u4e00-\u9fa5]+?)}/g, '<a href="/term/index#$1" rel="tooltip">$1</a>')
}*/

/**
 *  * 生成部分匹配表
 *   */
function kmpGetPartMatchTable(targetStr){
    var aPartMatchTable = [];
    var tmpCompareLen = 0;
    var tmpPartMatchVal = 0;
    var prefix,suffix;//匹配串前缀,后缀
    for (var i = 0, j = targetStr.length; i < j; i++){
        if (i == 0){
            aPartMatchTable[i] = 0;
            continue;
        }
        tmpCompareLen = i; //匹配串前缀,后缀最大长度
        tmpPartMatchVal = 0;
        for (;tmpCompareLen > 0; tmpCompareLen--){
            prefix = targetStr.substr(0,tmpCompareLen);
            suffix = targetStr.substr(i-tmpCompareLen+1,tmpCompareLen);
            if (prefix == suffix){ //找到匹配串前缀,后缀最长的共有元素
                tmpPartMatchVal = prefix.length; //部分匹配值为:匹配串前缀,后缀最长的共有元素的长度
                break;
            }
        }
        aPartMatchTable[i] = tmpPartMatchVal;
    }
    return aPartMatchTable;
}

/**
 *  * KMP算法 查找字符串
 *   */
function KMP(sourceStr,targetStr){
    var partMatchValue = kmpGetPartMatchTable(targetStr); //部分匹配表
    var result = false;
    var i,j,m,n;
    n = targetStr.length;
    for(i=0,j=sourceStr.length;i<j;i++){
        for(var m=0;m<n;m++){
            if(targetStr.charAt(m) != sourceStr.charAt(i+m)){
                if ( (m > 0) && (partMatchValue[m-1] > 0) ){
                    i += (m-partMatchValue[m-1]-1); //设置外层循环开始位置
                }
                break;
            }
        }
        if (m == n){
            
            result = true;
            break;
        }
    }
    return [result,i];
}


/* 切换编辑模式和查看模式 */
$(document).ready(function() {
	$("a[id^='a_table_']").toggle(function() {
		var table = $(this).attr('id').slice(2);
		$('#' + table + ' .view_mode').hide();
		$('#' + table + ' .edit_mode').show();
		$(this).text('查看');
	}, function() {
		var table = $(this).attr('id').slice(2);
		$('#' + table + ' .edit_mode').hide();
		$('#' + table + ' .view_mode').show();
		$(this).text('编辑');
	});
});

/* 显示或者隐藏hive表的信息 */
$(document).ready(function() {
	$('.more-detail').toggle(function() {
		$('.inner-detail').removeClass('hide');
		$icon = $(this).children('i');
		$icon.removeClass('icon-forward');
		$icon.addClass('icon-backward');
	}, function() {
		$('.inner-detail').addClass('hide');
		$icon = $(this).children('i');
		$icon.removeClass('icon-backward');
		$icon.addClass('icon-forward');		
	});
});

/* 状态提醒条 */
$(document).ready(function() {
	$('.div_info_bar').click(function() {
		$(this).addClass('hide');
	});
});

/* 切换编辑模式和查看模式 */
$(document).ready(function() {
	$(".a_edit_table").live('click', function() {
    	var parents = $(this).parentsUntil('tr');
   		var $tr = $(parents[parents.length-1]).parent();
    	$tr.find('.view_mode').hide();
    	$tr.find('.edit_mode').show();
		$.get('/table/findCanAlter',{
			column_id : $tr.find('.column-id').text()
		},function(respones , status){
			console.info(respones);
			if( respones === 'yes'){
				console.info("here");
				$tr.find('.view_modeE').hide();
				$tr.find('.edit_modeE').show();
			
			}
		});	
	});
});

/* 取消编辑 */
$(document).ready(function() {
	$('.a_cancel_edit').live('click', function() {
    var parents = $(this).parentsUntil('tr');
    var $tr = $(parents[parents.length-1]).parent();
		$tr.find('.view_mode').show();
		$tr.find('.edit_mode').hide();
	});
});

/* 显示分页信息 */
function setup_pager(pager, previous_cursor, next_cursor, count, total_count)
{
    var action = pager.find('.action').val();

    if (action == '') {
        // 不是用户主动翻页，将页面重置为第1页
        pager.find('.total-count').text(total_count);
        if (total_count > 0) {
            pager.find('.page-start').text('1');
        } else {
            pager.find('.page-start').text('0');
        }
        pager.find('.page-end').text(count);
        console.info('不是主动翻页');
    } else {
        console.info('主动翻页');
        // 用户主动翻页
        if (action == 'next') {
            // 后页
            console.info('后页');
            var old_page_end = parseInt(pager.find('.page-end').text());
            pager.find('.page-start').text(old_page_end + 1);
            pager.find('.page-end').text(old_page_end + count);
        } else if (action == 'prev') {
            // 前页
            console.info('前页');
            var old_page_start = parseInt(pager.find('.page-start').text());
            pager.find('.page-start').text(old_page_start - count);
            pager.find('.page-end').text(old_page_start - 1);
        }
    }

    var page_end = parseInt(pager.find('.page-end').text());
    var real_total_count = parseInt(pager.find('.total-count').text());
    var page_start = parseInt(pager.find('.page-start').text());

    console.info('page-start:' + page_start);
    console.info('page-end:' + page_end);

    // 如果到达第一页，禁止向前翻页
    if (page_start == 1) {
        pager.find('li a:eq(0)').addClass('btn-disabled');
    } else {
        pager.find('li a:eq(0)').removeClass('btn-disabled');
    }

    // 如果到达最后一页，禁止向后翻页
    if (page_end == real_total_count) {
        pager.find('li a:eq(1)').addClass('btn-disabled');
    } else {
        pager.find('li a:eq(1)').removeClass('btn-disabled');
    }

    console.info('previous_cursor: '+previous_cursor);
    console.info('next_cursor: ' + next_cursor);
    // 设置游标记录
    pager.find('li a:eq(0)').attr({cursor:previous_cursor});
    pager.find('li a:eq(1)').attr({cursor:next_cursor});

    pager.find('.action').val('');
}

/* 在UI中显示表的信息 */
function show_tables(json_data)
{
	console.info(json_data);
    var data = JSON.parse(json_data);
    var tables = data['items'];
    var previous_cursor = data['previous_cursor'];
    var next_cursor = data['next_cursor'];
    var total_count = data['total_count'];
    var count = tables.length;
    var i = 0;

    $('#table-list-content .content-div').each(function() {
        var $this = $(this);
        if (i < count) {
            var table = tables[i];

            //显示表的基本信息
            $this.find('.table-id').text(table['_id']);
            $this.find('.table-link').attr({href: '/table/view?table_id=' + table['_id']});
            $this.find('.table-name').text(table['table_name']);
            $this.find('.table-comment-brief').text(table['brief']);
            $this.find('.table-comment-description').text(table['description']);
            $this.find('.creator').text(table['creator']);
            $this.find('.data-granularity').text(table['data_granularity']);
            $this.find('.create-time').text(table['create_time']);
            $this.show();
            console.info('隐藏字段信息');
            $this.find('.show-table-column').addClass('hide-table-column').removeClass('show-table-column');	
            $this.find('.column-info').hide();

            //显示表的tag
            $.get('/table/getTableTag?table_id=' + table['_id'], function (response) {
                var tags = response.split(' ');
                var $table_tags = $this.find('.table-tags');
                $table_tags.empty();
                for (var i = 0; i < tags.length; i++) {
                    console.info(tags[i]);
                    $('<span class="tagbtn">' + tags[i] + '</span>').appendTo($table_tags);
                }
            });

            //如果是搜索字段，直接展开字段
            if ($('#action').text() == 'search_column') {
                list_column($this, table['_id'], 0, 'next');
                $this.find('.hide-table-column').addClass('show-table-column').removeClass('hide-table-column');	
            }
        } else {
            $this.hide();
        }
        i++;
    });

    setup_pager($('.table-pager'), previous_cursor, next_cursor, count, total_count)
}

/* 异步搜索表 */
function search_table(cursor, dir)
{
    // 只有在搜索页面才发起ajax请求
    if (location.href.indexOf("/table/search") < 0) {
        return;
    }

    var tags = getQueryString('tags');

    var keyword = $('#keyword').val();

    var action = $('#action').text();
    var reverse = null;
    if (action == 'search_table') {
        reverse = 'true';
    } else {
        reverse = 'false';
    }

    // 发送Ajax请求过滤结果
    $.get("/table/doSearch", {
        tags: tags,
        cursor:cursor,
        dir:dir,
        keyword:keyword,
        reverse:'true',
        action:action
    }, function(response, status) {
        console.info(response);
        show_tables(response);
    });
}

/* 表的上一页和下一页 */
$(document).ready(function() {
    $('.table-pager li a').click(function () {
        var dir = $(this).attr('href').slice(1);
        var cursor = $(this).attr('cursor');
        $('.table-pager .action').val(dir);
        search_table(cursor, dir);

        return false;
    });
});

/* 页面初始化的时候，显示表的信息 */
$(document).ready(function() {
    var action = $('#action').text();
    var tags = getQueryString('tags');
    var keyword = getQueryString('keyword');

    if (!action) return;

    if (!tags && !keyword) {
        $('.div-favorite').show();
        $('.result-label').text('最新上架');
    } else {
        $('.div-favorite').hide();
        $('.result-label').text('结果数据');
    }

    $.get("/table/doSearch", {
        tags: tags,
        keyword: keyword,
        cursor:1000000000,
        reverse:'true',
        dir:'next',
        action:action
    }, function(response, status) {
		console.info(response);
        show_tables(response);
    });
});


/* 在UI中显示字段数据 */
function show_column(container, json_data) 
{
    console.info(json_data);

    var data = JSON.parse(json_data);
    var columns = data['items'];
    var previous_cursor = data['previous_cursor'];
    var next_cursor = data['next_cursor'];
    var total_count = data['total_count'];
    var column_count = columns.length;

    var i = 0;
    container.find('tbody tr').each(function() {
        if (i < column_count) {
            $(this).show();
            var column = columns[i];
            $(this).find('.column-id').text(column['_id']);
            $(this).find('.column-name').text(column['column_name']);
            $(this).find('.data-type').text(column['data_type']);
            $(this).find('.others').text(column['others']);

            $(this).find('.calc-logic').text(column['calc_logic']);
            $(this).find('.value-meaning').text(column['value_meaning']);
            $(this).find('.validate-rule').text(column['validate_rule']);
            $(this).find('.test-rule').text(column['test_rule']);

            var brief = generate_comment_tooltip(column['brief']);
            $(this).find('.column-comment-brief').html(brief);
            var description = generate_comment_tooltip(column['description']);
            $(this).find('.column-comment-description').html(description);
        } else {
            $(this).hide();
        }
        i++; 
    });

    $pager = container.find('.column-list-pager');
    setup_pager($pager, previous_cursor, next_cursor, column_count, total_count)

    container.children('.column-info').fadeIn('fast');
}

/* 异步请求表的字段信息 */
function list_column(container, table_id, cursor, dir)
{
    var keyword = $('#keyword').val();
    
    //如果使搜索表，列出全部字段,否则，列出满足关键词的字段
    if ($('#action').text() == 'search_table') {
        keyword = '';
    }

    $.get('/table/getColumn', {
        keyword:keyword,
        table_id:table_id,
        cursor:cursor,
        dir:dir,
    }, function(response, status) {
        show_column(container, response);
   });
}

/* 字段的上一页和下一页 */
$(document).ready(function() {
    $('.column-list-pager li a').click(function () {
        var parents = $(this).parentsUntil('.content-div');
        var content_div = $(parents[parents.length-1]).parent();
        var table_id = content_div.find('.table-id').text();
        var dir = $(this).attr('href').slice(1);
        var cursor = $(this).attr('cursor');
        $('.column-list-pager .action').val(dir);
        list_column(content_div, table_id, cursor, dir);

        return false;
    });
})

/* 显示或者隐藏表的字段 */
$(document).ready(function() {
	$('.table-info a[class*="-table-column"]').live('click',function(e) {
        var content_div = $(this).parent().parent();

        if ($(this).attr('class') == "hide-table-column") {
            // 显示表的字段
            $(this).addClass('show-table-column').removeClass('hide-table-column');
            var table_id = $(this).parent().children('.table-id').text();
            list_column(content_div, table_id, 0, 'next');
        }
	    else {
            // 隐藏表的字段
            $(this).addClass('hide-table-column').removeClass('show-table-column');	
           content_div.children('.column-info').fadeOut('fast');
       }
        
       return false;
	});
});

/* 搜索表 */
$(document).ready(function() {
    // 回车触发
    $('#keyword').bind('keyup', function(event) {
        if (event.keyCode == 13) {
            var action = $('#action').text();
            if (action == 'search_table') {
                $('.search-table-btn').addClass('btn-primary');
                $('.search-column-btn').removeClass('btn-primary');
                search_table(2147483648, 'next');   /* 逆序显示，所以cursor最大 */
                $('.div-favorite').hide();
                $('.result-label').text('结果数据');
            } else if (action == 'search_column'){
                $('.search-table-btn').removeClass('btn-primary');
                $('.search-column-btn').addClass('btn-primary');
                search_table(2147483648, 'next');   /* 逆序显示，所以cursor最大 */
                $('.div-favorite').hide();
                $('.result-label').text('结果数据');
            }
        }
    });

    // 点击按钮触发搜索表
	$('.search-table-btn').click(function() {
        $('#action').text('search_table');
        $('.search-table-btn').addClass('btn-primary');
        $('.search-column-btn').removeClass('btn-primary');
        search_table(2147483648, 'next');   /* 逆序显示，所以cursor最大 */
        $('.div-favorite').hide();
        $('.result-label').text('结果数据');
	});

    // 点击按钮触发搜索字段
	$('.search-column-btn').click(function() {
        $('#action').text('search_column');
        $('.search-table-btn').removeClass('btn-primary');
        $('.search-column-btn').addClass('btn-primary');
        search_table(2147483648, 'next');   /* 逆序显示，所以cursor最大 */
        $('.div-favorite').hide();
        $('.result-label').text('结果数据');
	});
});



/* 根据url激活左边导航菜单 */
$(document).ready(function() {
   var url = window.location.href;
   $('.menu-list li a').each(function() {
       var route = $(this).attr('href');
       if (url.indexOf(route) > 0) {
            $(this).addClass('a_menu_actived');
       }
   });
});

/* 显示提示消息 */
function show_notice(text, callback) {
    $('.notice-bar').text(text);
    $('.notice-bar').fadeIn().delay(2000).fadeOut('slow', callback);
};

/* 全局Ajax事件 */
$(document).ready(function() {
    $('.notice-bar').ajaxStart(function () {
        $(this).text('Loading...');
        $(this).fadeIn('fast');
    }).ajaxStop(function () {
        $(this).fadeOut(1000);
    });
});

var mouse_leaved = false;

/* 显示tooltip */
$(document).ready(function() {
    $('a[rel=tooltip]').live('hover', function (e) {
        console.info(e.type);
        if (e.type == 'mouseenter') {
            mouse_leaved = false;
            var term_name = $(this).text();
            var alink = $(this);

            if (alink.attr('data-original-title') != undefined) {
                console.info('已获得过注释###');
                $(this).tooltip('show');
                return false;
            }

            $.ajax({
                url: '/term/getTermDetail?term_name='+term_name,
                type: 'GET',
                global:false,
                error: function() {
                    show_notice('ajax loading data error');
                },
                success: function(response) {
                    alink.attr('data-original-title', response);
                    if (mouse_leaved == false) {
                        console.info('鼠标已离开');
                        alink.tooltip('show');
                    }
                }
            });
            return false;
        } else {
           mouse_leaved = true;
           console.info('隐藏tooltip');
           $('.tooltip').hide();
           return false;
        }
    });
});

$(document).ready(function() {
  refresh_verify_table_count();
  refresh_new_table_count();
});

/* 更新待审核的表的数量 */
function refresh_verify_table_count() {
  $.get('/table/getVerifyTableCount', {}, function(response, status){
        count = parseInt(response);
        if (count) {
          $('#verify-table-count').text(count); 
        } else {
          $('#verify-table-count').text('0'); 
        }
  });
}

/* 更新用户新建表的数量 */
function refresh_new_table_count() {
  $.get('/table/getNewTableCount', {}, function(response, status){
        count = parseInt(response);
        if (count) {
          $('#new-table-count').text(count); 
        } else {
          $('#new-table-count').text('0'); 
        }
  });
}

/* 选择标签 */
$(document).ready(function(){
    $('.tagbtn').click(function () {
        var tag_name = $.trim($(this).text());
        var $input_tag = $('#input-tags');
        var current_tag = $.trim($input_tag.val());

        if (current_tag.indexOf(tag_name) > -1) {
            return false;
        }

        $input_tag.val(current_tag + ' ' + tag_name);

        return false;
    });
});

//根据URL参数判断是否激活左边导航
$(function () {
      var url_tag_list = getQueryString('tags');
      var tag_list;

      console.info(url_tag_list);

      $('.nav-menu a').each(function () {
        url = $(this).attr('href');
        matches = url.match(/tags=([\w_%=\d\u4e00-\u9fa5]+)/i);
        tag_list = matches ? matches[1] : '-------';
        console.info(tag_list);
        console.info(tag_list);
        if (url_tag_list.indexOf(tag_list) > -1) {
          $(this).addClass('actived');
        }
      });
});
