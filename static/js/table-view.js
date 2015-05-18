/* 在UI显示字段数据 */
function show_columns(json_data)
{
	console.info(json_data);
    var data = JSON.parse(json_data)
        ,columns = data['items']
        ,previous_cursor = data['previous_cursor']
        ,next_cursor = data['next_cursor']
        ,total_count = data['total_count']
        ,column_count = columns.length
        ,column
        ,brief
        ,alias
        ,description
        ,extra
        ,i = 0
    ;

    if (column_count == 0) {
        show_notice('没有找到相关字段...');
        return;
    }

    $('#table-column-info tbody tr').each(function() {
        if (i < column_count) {
            $(this).show();
            column = columns[i];
            $(this).find('.column-id').text(column['cid']);
            $(this).find('.column-nameE').text(column['column_name']);
            $(this).find('.data-type').text(column['data_type']);
            $(this).find('.calc-logic').text(column['calc_logic']);
            $(this).find('.value-meaning').text(column['value_meaning']);
            $(this).find('.validate-rule').text(column['validate_rule']);
            $(this).find('.test-rule').text(column['test_rule']);
			console.info(column['column_num']+"aaaaaaaaaaaaaa");
			$(this).find('.column-num').text(column['column_num']);
            brief = generate_comment_tooltip(column['brief']);
            description = generate_comment_tooltip(column['description']);

            $(this).find('.brief').html(brief);
            $(this).find('.description').html(description);


            $(this).find('.input-column-nameE').val(column['column_name']);
            $(this).find('.input-brief').val(column['brief']);
            $(this).find('.input-description').val(column['description']);
            $(this).find('.input-data-type').val(column['data_type']);
            $(this).find('.input-calc-logic').val(column['calc_logic']);
            $(this).find('.input-value-meaning').val(column['value_meaning']);
            $(this).find('.input-validate-rule').val(column['validate_rule']);
            $(this).find('.input-test-rule').val(column['test_rule']);
        } else if( i < 50){
            $(this).hide();
        }
        i++; 
    });

    setup_pager($('.column-pager'), previous_cursor, next_cursor, column_count, total_count)
}

function list_columns(table_id, cursor, dir, keyword) 
{
    var data = null;

    $.get('/table/getColumn', {
        table_id:table_id,
        cursor:cursor,
        dir:dir,
        keyword:keyword
    }, function(response, status) {
        show_columns(response);
   });
}

/* 在UI显示历史数据 */
function show_histories(json_data)
{
    var data = JSON.parse(json_data);

    var histories = data['items'];
    var previous_cursor = data['previous_cursor'];
    var next_cursor = data['next_cursor'];
    var total_count = data['total_count'];
    var count = histories.length;

    if (count == 0) {
        return;
    }

    var i = 0;
    $('#table-history-info tbody tr').each(function() {
        if (i < count) {
            var history = histories[i];
            $(this).find('.history-id').text(history['_id']);
            $(this).find('.data-size').text(history['data_size']);
            $(this).find('.data-rows').text(history['data_rows']);
            $(this).find('.collect-time').text(history['collect_time']);
            $(this).find('.status').text(history['status']);

            $(this).find('.input-data-size').val(history['data_size']);
            $(this).find('.input-data-rows').val(history['data_rows']);
            $(this).find('.input-collect-time').val(history['collect_time']);
            $(this).show();
        } else if (i < 20){
            $(this).hide();
        }
        i++;
    });

    setup_pager($('.history-pager'), previous_cursor, next_cursor, count, total_count);
}

function list_histories(table_id, cursor, dir)
{
    var data = null;

    $.get('/table/getHistories', {
        table_id:table_id,
        cursor:cursor,
        dir:dir
    }, function(response, status) {
        show_histories(response); 
    });
}

/* 页面初始化的时候，显示字段信息和历史数据信息 */
$(document).ready(function() {
       var table_id = $('#table-id').text();

        list_columns(table_id, 0, 'next', '');
        list_histories(table_id, 0, 'next');
});

/* 字段的上一页和下一页 */
$(document).ready(function() {
    $('.column-pager li a').click(function () {
       var table_id = $('#table-id').text();
        var dir = $(this).attr('href').slice(1);
        var cursor = $(this).attr('cursor');
        var keyword = $('#keyword').val();

        $('.column-pager .action').val(dir);
        list_columns(table_id, cursor, dir, keyword);

        return false;
    });
});

/* 搜索字段 */
$(document).ready(function() {
    // 回车触发
    $('#keyword').bind('keyup', function(event) {
        if (event.keyCode == 13) {
            var keyword = $('#keyword').val();
            var table_id = $('#table-id').text();

            list_columns(table_id, 0, 'next', keyword);
        }
    });


    $('.search-table-column-btn').click(function() {
        var keyword = $('#keyword').val();
        var table_id = $('#table-id').text();

        list_columns(table_id, 0, 'next', keyword);
    });
});

/* 历史数据的上一页和下一页 */
$(document).ready(function() {
    $('.history-pager li a').click(function () {
       var table_id = $('#table-id').text();
        var dir = $(this).attr('href').slice(1);
        var cursor = $(this).attr('cursor');

        $('.history-pager .action').val(dir);
        list_histories(table_id, cursor, dir);

        return false;
    });
});


/* 切换表的模式 */
$(document).ready(function() {
    $('#table-info .btn-edit-table').click(function() {
        $('#table-info .edit-mode').show();
        $('#table-info .view-mode').hide();

        return false;
    });
    $('#table-info .btn-cancel-table').click(function() {
        $('#table-info .view-mode').show();
        $('#table-info .edit-mode').hide();

        return false;
    });
});

/* 更新表的基本信息 */
$(document).ready(function() {
    $('#table-info .btn-update-table').click(function() {
       var table_id = $('#table-id').text();
       var table_name = $('#table-info .input-table-name').val();
       var brief = $('#table-info .input-brief').val();
       var description = $('#table-info .input-description').val();
       var data_freq = $('#table-info .input-data-freq').val();
       var data_life = $('#table-info .input-data-life').val();
       var creator = $('#table-info .input-creator').val();
       var partition = $('#table-info .input-partition').val();
       var properties = $('#table-info .input-properties').val();
       var data_granularity = $('#table-info .input-data-granularity').val();
       var parent_tables = $('#table-info .input-parent-tables').val();
	   var description_filter = $('#table-info .input-description_filter').val();
	   var computer  =  $('#table-info .input-computer').val();
	   var svn_address = $('#table-info .input-svn-address').val(); 	
		console.info(computer + " xy");
		console.info(svn_address + "xy");

       $.post('/table/update', {
            table_id:table_id,
            table_name:table_name,
            brief:brief,
            description:description,
            data_granularity:data_granularity,
            parent_tables:parent_tables,
            data_freq:data_freq,
            creator:creator,
            partition:partition,
            properties:properties,
            data_life:data_life,
			description_filter:description_filter,
			computer : computer,
			svn_address : svn_address
       }, function(response, status) {
            console.info('更新表后的response:');
            console.info(response);
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                // 如果更新成功，显示更新后的数据
                $('#table-info .table-name').text(table_name);
                $('#table-info .brief').text(brief);
                $('#table-info .description').text(description);
                $('#table-info .data-granularity').text(data_granularity);
                $('#table-info .parent-tables').text(parent_tables);
                $('#table-info .data-freq').text(data_freq);
                $('#table-info .data-life').text(data_life);
                $('#table-info .creator').text(creator);
                $('#table-info .partition').text(partition);
                $('#table-info .properties').text(properties);
				$('#table-info .computer').text(computer);
			    $('#table-info .svn-address').text(svn_address);
				$('#table-info .description_filter').text(description_filter);
                show_notice("操作成功");
                // 切换到查看模式
                $('#table-info .view-mode').show();
                $('#table-info .edit-mode').hide();

			    $('#table-info .view-modeE').show();
                $('#table-info .edit-modeE').hide();

            } else {
                show_notice(response['error_msg']);
            }
       });

       return false;
    });
});

/* 删除表 */
$(document).ready(function() {
    $('.btn-delete-table').click(function(){
       var msg = "确认删除？";
       if (confirm(msg) == false) {
            return false;
       }

        if ($(this).attr('disabled')) {
            return;
        }

        var table_id = $('#table-id').text();
        var $btn = $(this);

        $.post('/table/delete', {
            table_id:table_id
        }, function(response, status){
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                show_notice('删除成功');
            } else {
                show_notice(response['error_msg']);
            }
        });
    });
});

var status_index={
		DESIGNING:1,
		DESIGN_VERIFYING:2,
		RULING :3,
		RULE_VERIFYING:4,
		RULE_OK:5,
		RELEASING:6,
		RELEASE_VERIFYING:7,
		RELEASE_OK:8,
		OK:22
	};
	
//控制是否能修改字段顺序
	
$(document).ready( function( ){
	
	var n_status = $('#table-status').val();
	console.info(n_status+"abc");
	if( status_index[n_status] > 1 ){
		$('.btn_up_column').hide();
		$('.btn_down_column').hide();	
	}
	
});




/* 审核对话框 */
$(document).ready(function() {
    $('#new-table-option').click(function () {
        $('#verify-table-advice').hide();
    });

    $('#old-table-option').click(function () {
        $('#verify-table-advice').show();
    });

    var verify_table = function (content, action) {
        var table_id = $('#table-id').text();

        $.post('/table/verify', {
            table_id:table_id,
            content: content,
            action: action
        }, function(response, status){
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                show_notice('操作成功');
                location.reload();
            } else {
                show_notice(response['error_msg']);
            }
        });
    };
	

	


	
    /* 结构审核 */
    $('.btn-design-verify').click(function () {


		//当前的状态
		var n_status = $('#table-status').val();
		if (status_index[n_status] >= 1 && status_index[n_status] != 2 && status_index[n_status] != 22)
        	verify_table('', 'design');
		else
		{
			console.info(n_status);
			if( n_status == 'DESIGN_VERIFYING')
			{
				var cancelVerify = window.confirm("您的表正在审核中,是否取消审核");
				console.info(cancelVerify);
				if( cancelVerify == true )
					 verify_table('', 'design_c');
			}
		    if( n_status == 'OK' )
			{
				var verify  = window.confirm("你的表已经上线，是否确定修改表结构");
				console.info(verify);
				if ( verify == true )
					verify_table('','design');
			}		
		}
    });


    /* 规则审核 */
    $('.btn-rule-verify').click(function () {
		var n_status =  $('#table-status').val();
		if (status_index[n_status] >=3 && status_index[n_status] != 4 && status_index[n_status] != 22 )
        {
			verify_table('', 'rule');
		}
		else
		{
			console.info(n_status);
			if( n_status == 'RULE_VERIFYING')
			{
				var cancelVerify = window.confirm("您的表正在审核中,是否取消审核");
				if( cancelVerify == true){
					verify_table('','rule_c');

				}	
			}else if (n_status == 'OK'){
				var verify  = window.confirm("你的表已经上线，是否确定修改表结构");
				if ( verify == true )
					verify_table('','rule');
	
				
			} 
			else{
				show_notice("请先完成结构审核操作");
			} 
			

		}
		
    });
	
	$('.btn-rule-verify-cancle').click(function () {
		var n_status =  $('#table-status').val();
		if (status_index[n_status] >=3 && status_index[n_status] != 4 && status_index[n_status] != 22 )
        {
			verify_table('', 'rule');
		}
		else
		{
			console.info(n_status);
			if( n_status == 'RULE_VERIFYING')
			{
				var cancelVerify = window.confirm("您的表正在审核中,是否取消审核");
				console.info(cancelVerify);
				if( cancelVerify == true){
					verify_table('','rule_c');

				}	
			}else if (n_status == 'OK'){
				var verify  = window.confirm("你的表已经上线，是否确定修改表结构");
				if ( verify == true )
					verify_table('','rule');
	
				
			} 
			else{
				show_notice("请先完成结构审核操作");
			} 
			

		}
		
    });

	
	/*  上线前审核   */
	$('.btn-create-verify').click( function(){
		//data-toggle="modal" 
		var n_status =  $('#table-status').val();
		var index  =  status_index[n_status];
		if (status_index[n_status] >=5 && status_index[n_status] != 7 && index != 22){
			$('.btn-create-verify').attr('data-toggle','modal');

		}else{
			if (index == 22)
				show_notice("表已经上线，请勿重复操作！");
			else{
			if (index != 7)
				show_notice("请先通过前面的审核才能进行上线");
			else
				if(index != 22)
					show_notice("本表已经上线请等待审核");
			}
		}
		

	});
	
    /* 上线 */
    $('.btn-verify').click(function(){
		var n_status =  $('#table-status').val();
		verify_table('', 'release');
    });
});

/* 更新字段 */
$(document).ready(function() {
    $('.btn-update-column').click(function() {

	   var columns = new Array();
	   $('#table-column-info tbody tr').each(function(){
            var column_num = $(this).find('.column-num').text();
			console.info(column_num);	
			
			var column_id = $(this).find('.column-id').text();
			var table_id = $('#table-id').text();
    		if(column_id != ""){        
	   			columns.push({
					column_num:column_num,
					column_id:column_id,
					table_id:table_id
				});
		    }
	   });
	   
		


       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();
       var column_id = $tr.find('.column-id').text();
	   console.info($tr.find('.column-num').text());
       var column_name = $tr.find('.input-column-nameE').val();
       console.info('column_name:'+column_name);
       var data_type = $tr.find('.input-data-type').val();
       var brief = $tr.find('.input-brief').val();
       var description = $tr.find('.input-description').val();
       var calc_logic = $tr.find('.input-calc-logic').val();
       var value_meaning = $tr.find('.input-value-meaning').val();
       var validate_rule = $tr.find('.input-validate-rule').val();
       var test_rule = $tr.find('.input-test-rule').val();
       
		// 收集字段的基本信息
        var column_info = {
			table_id : $('#table-id').text(),
            column_id : column_id,
            column_name:column_name,
			data_type:data_type,
			brief:brief,
			description:description,
			calc_logic:calc_logic,
			value_meaning:value_meaning,
			validate_rule:validate_rule,
			test_rule:test_rule
        };
		

	   // 把数据编码为json，并发送ajax请求
       var data = JSON.stringify({column_info:column_info, columns:columns});
       console.info('修改字段的json数据');
       console.info(data);

       $.post('/table/updateColumnEx', {
       		data:data
	   }, function(response, status){
			console.info(response);
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                // 如果更新成功，显示更新后的数据
                $tr.find('.column-nameE').text(column_name);
                $tr.find('.brief').html(generate_comment_tooltip(brief));
                $tr.find('.description').html(generate_comment_tooltip(description));
                $tr.find('.data-type').text(data_type);
                $tr.find('.calc-logic').text(calc_logic);
                $tr.find('.value-meaning').text(value_meaning);
                $tr.find('.validate-rule').text(validate_rule);
                $tr.find('.test-rule').text(test_rule);
                // 切换到查看模式
                $tr.find('.view_mode').show();
                $tr.find('.edit_mode').hide();

				$tr.find('.view_modeE').show();
                $tr.find('.edit_modeE').hide();

                show_notice('更新成功!');
            } else {
                show_notice(response['error_msg']);
            }
       });

       return false;
    });
});

/* 删除字段 */
$(document).ready(function() {
   $('.btn-delete-column').click(function() {
       var msg = "确认删除？";
       if (confirm(msg) == false) {
            return false;
       }

       var table_id = $('#table-id').text();
       var $tr = $(this).closest('tr');
       var column_id = $tr.find('.column-id').text();
       var column_name = $tr.find('.column-name').text();
       var partition = $('#table-info .partition').text();

       //不能删除partitioin字段
       /*
       if (partition.indexOf(column_name) != -1) {
            alert('不能删除partition字段');
            return false;
       }
       */

        $.post('/table/deleteColumn', {
            column_id:column_id,
            table_id:table_id
        }, function(response, status) {
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                $tr.remove();
                show_notice('删除成功!');
            } else {
                show_notice(response['error_msg']);
            }
        });

        return false;
   }); 
});





/* 更新历史数据 */
$(document).ready(function() {
    $('.btn-update-history').click(function() {
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();
       var history_id = $tr.find('.history-id').text();
       var data_size = $tr.find('.input-data-size').val();
       var data_rows = $tr.find('.input-data-rows').val();
       var collect_time = $tr.find('.input-collect-time').val();

       $.post('/table/updateHistory', {
            history_id:history_id,
            data_size:data_size,
            data_rows:data_rows,
            collect_time:collect_time
       }, function(response, status) {
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                // 如果更新成功，显示更新后的数据
                $tr.find('.data-size').text(data_size);
                $tr.find('.data-rows').text(data_rows);
                $tr.find('.collect-time').text(collect_time);
                // 切换到查看模式
                $tr.find('.view_mode').show();
                $tr.find('.edit_mode').hide();
                show_notice('更新成功');
            } else {
                show_notice(response['error_msg']);
            }
       });

       return false;
    });
});

/* 删除历史数据 */
$(document).ready(function() {
   $('.btn-delete-history').click(function() {
       var msg = "确认删除？";
       if (confirm(msg) == false) {
            return false;
       }
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();
       var history_id = $tr.find('.history-id').text();
        $.post('/table/deleteHistory', {
            history_id:history_id
        }, function(response, status) {
            response = JSON.parse(response);
            if (response['result'] == 'success') {
              $tr.find('.status').text('DELETED');
              show_notice('删除成功!');
            } else {
                show_notice(response['error_msg']);
            }
        });

        return false;
   }); 
});

/* 显示添加输入框 */
$(document).ready(function() {
    $('.btn-create').click(function() {
        $(this).hide();
        $(this).parent().parent().find('div').show();
        return false;
    });
});

/* 取消添加 */
$(document).ready(function() {
    $('.btn-cancel-create').click(function() {
        $tr = $(this).parent().parent().parent();
        $tr.find('div').hide();
        $tr.find('.btn-create').show();
        
        return fales;
    });
});

/* 添加历史数据 */
$(document).ready(function() {
    $('.btn-save-history').click(function() {
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();
       var table_id = $('#table-id').text();
       var data_size = $tr.find('.input-data-size').val();
       var data_rows = $tr.find('.input-data-rows').val();
       var collect_time = $tr.find('.input-collect-time').val();

       $.post('/table/createHistory', {
            table_id:table_id,
            data_size:data_size,
            data_rows:data_rows,
            collect_time:collect_time
        }, function(response, status) {
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                $tr.find('div').hide();
                $tr.find('.btn-create').show();
                show_notice('添加成功!');
            } else {
                show_notice(response['error_msg']);
            }
        });

        return false;
    });
});

/* 添加字段 */
$(document).ready(function() {
    $('.btn-save-column').click(function() {
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();
       var table_id = $('#table-id').text();
       var column_name = $tr.find('.input-column-name').val();
       var brief = $tr.find('.input-brief').val();
       var description = $tr.find('.input-description').val();
       var data_type = $tr.find('.input-data-type').val();
       var calc_logic = $tr.find('.input-calc-logic').val();
       var value_meaning = $tr.find('.input-value-meaning').val();
       var validate_rule = $tr.find('.input-validate-rule').val();
       var test_rule = $tr.find('.input-test-rule').val();

       $.post('/table/createColumn', {
            table_id:table_id,
            column_name:column_name,
            data_type:data_type,
            brief:brief,
            description:description,
            calc_logic: calc_logic,
            value_meaning: value_meaning,
            validate_rule: validate_rule,
            test_rule: test_rule
        }, function(response, status) {
            //console.info(response);
	    response = JSON.parse(response);
            if (response['result'] == 'success') {
                $tr.find('.input-column-name').val('');
                $tr.find('.input-column-name').focus();
                $tr.find('.input-brief').val('');
                $tr.find('.input-description').val('');
                $tr.find('.input-calc-logic').val('');
                $tr.find('.input-value-meaning').val('');
                $tr.find('.input-validate-rule').val('');
                $tr.find('.input-test-rule').val('');
                $tr.find('.input-data-type').val('');
                show_notice('添加字段功!请刷新页面查看');
            } else {
                show_notice(response['error_msg']);
            }
        });

       return false;
    });
});

/* 保存标签 */
$(document).ready(function() {
    $('.btn-save-tag').click(function() {
         $.post('/table/updateTag', {
            tags: $('#input-tags').val(),
            table_id: $('#table-id').text()
         }, function(response, status) {
            if (response == 'success') {
                show_notice('操作成功!');
                location.href = location.href;
            } else {
                show_notice('操作失败!');
            }
         });
    });
});

$(document).ready(function() {
    $('').click(function() {
    });
});

/* 自动选择计算频率 */
$(document).ready(function() {
       var freq = $('.data-freq').text();
       console.info('freq: ' + freq);
       $('.input-data-freq').children('option').each(function () {
           var option_freq = $(this).val();
           console.info('option_freq: ' + option_freq);
           if (option_freq == freq) {
                $(this).attr({selected:'true'});
           }
       });
});

/* 字段的自动提示 */
$(document).ready(function(){
    var data = null;
    $.get('/table/listColumn', {}, function(response, status){
        // 获取所有字段
        data = JSON.parse(response);
        $(".input-column-name").autocomplete(data, {scroll:true,scrollHeight:300,width:220})
        .result(function (event, item) {
            //用户选中后触发result()函数
            var parents = $(this).parentsUntil('tr');
            var $tr = $(parents[parents.length-1]).parent();

            //查询选中字段的详细信u
            $.ajax({
                url: '/table/viewColumn?column_name='+item,
                type: 'GET',
                global:false,
                error: function() {
                    show_notice('ajax loading data error');
                },
                success: function(response) {
                    //将字段信息填充到输入框
                    var column = JSON.parse(response);
                    $tr.find('.input-data-type').val(column['data_type']);
                    $tr.find('.input-brief').val(column['brief']);
                    $tr.find('.input-description').val(column['description']);
                    $tr.find('.input-calc-logic').val(column['calc_logic']);
                    $tr.find('.input-value-meaning').val(column['value_meaning']);
                    $tr.find('.input-validate-rule').val(column['validate_rule']);
                    $tr.find('.input-test-rule').val(column['test_rule']);
                }
            });
        });
    });
});

/* 编辑tag */
$(document).ready(function() {
    $('#btn-edit-tag').toggle(function(){
        $(this).text('取消');
        $('.tag-info .edit_mode').removeClass('hide');
        $('.tag-info .selected-tag a').each(function(){
            $(this).removeAttr('disabled');
        });
    }, function(){
        $(this).text('编辑');
        $('.tag-info .edit_mode').addClass('hide');
        $('.tag-info .selected-tag a').each(function(){
            $(this).attr({disabled:'true'});
        });
    });
});

/* 数据预览 */
$(document).ready(function() {
    $('.btn-table-preview').click(function () {
        var table_id = $('#table-id').text();
        var $table_preview = $('#table-preview');
        var $this = $(this);

        if ($this.text() === '查看示例数据') {
            $.get('/table/preview', {
                table_id: table_id
            }, function(response, status){
                $table_preview.html(response);
                $table_preview.show();
                $this.text('收起示例数据');
            });
        } else {
            $table_preview.hide();
            $this.text('查看示例数据');
        }
    });
});

var _length = function(x, y)
{
	return Math.sqrt(x*x + y*y); 
}

/* 表关系图 */
$(document).ready(function() {
    $('.btn-table-relation').click(function () {
        var table_id = $('#table-id').text();
        var $table_relation = $('#table-relation');
        var $this = $(this);

        if ($this.text() === '查看表关系') {
            $this.text('收起表关系');
            $table_relation.show();
        } else {
            $table_relation.hide();
            $this.text('查看表关系');
        }
    });

	$.get('/table/tableRelation?table_name=' + $('.table-name').text(), function (response, status) {
        console.info(response);
        var data = JSON.parse(response);
		var nodes =  data['nodes'];
	  $.get('/table/tableRelationChilds?table_name=' + $('.table-name').text(), function (responses, status) {
		
		console.info(responses);
		var k = 0;
		//上游节点信息
		for (var i = 0; i < nodes.length; i++) {
			var level_nodes = nodes[i];
			for ( var j = 0; j< level_nodes.length; j++){
				var node = level_nodes[j];	
				if( k%6 == 0)
					$('<br/>').appendTo('.relation-table-list');
                $('<a href="/table/view?table_name=' + node + '">' + node + '</a>').appendTo('.relation-table-list');
				k++;
			}
		}
		//$("canvas").clearCanvas();
        draw_relation_tree(data,0,0,true);

		//下游节点信息
		
		var data_childs = JSON.parse(responses);
		nodes = data_childs['nodes'];
		k = 1;	
		for (var i = 1; i < nodes.length; i++) {
			var level_nodes = nodes[i];
			for ( var j = 0; j< level_nodes.length; j++){
				var node = level_nodes[j];
				if( k%6 == 0)
					$('<br/>').appendTo('.relation-table-list');	
                $('<a href="/table/view?table_name=' + node + '">' + node + '</a>').appendTo('.relation-table-list');
				k++;
			}
		}

				
		draw_relation_tree(data_childs,0,0,false);
		$('canvas').drawLayers();
      });
    });

});


//绘制详细信息的对话框
//key为 table_name ,x,y,为初始化坐标
//
//
var _layer = null;
var _DrawRectEx = function (key, x, y)
{
   var data = new Array();
   var lineLength = 25;
   $canvas = $("canvas");
   $.get('/table/tableInfo?table_name=' + key, function(response,status) {
    if(response.indexOf("找") == -1 )
		data = JSON.parse(response);
    	
	var filterStr = "";
	var description = "\n";
	var computer = "";
	var i = 0;
	if ( data['description'] != null){
		for( i = 0; i < data['description'].length; )
		{
			description += data['description'].substring(i,i+lineLength);
			description += '\n';
			i += lineLength;
		
		}
	}
	
	if ( data['description_filter'] != null){
		for( i = 0; i < data['description_filter'].length; )
		{
			filterStr += data['description_filter'].substring(i,i+lineLength);
			filterStr += '\n';
			i += lineLength;
		
		}	
	
	}

	if ( data['computer'] != null){
		for( i = 0; i < data['computer'].length; )
		{
			computer += data['computer'].substring(i,i+lineLength);
			computer += '\n';
			i += lineLength;
		
		}
	}


		
	$canvas.drawText({
		type : 'text',
		strokeStyle: "FFF",
		align: "left",
		x:x,y:y,
		groups : "rect",
  		name : 'tbl_info' + key,
		layer : true,
		fontSize: 13,
  		fontFamily: "宋体",
  		text: //"table_name: "+key+"\n"+
		      //"author: "+data['creator'] +"\n" +
			  //"数据粒度: "+data['data_granularity']+"\n"+
			  //"生成频率: "+data['data_freq']  +"时 生命周期: "+data['data_life']+"天"+"\n"+
			  "基本描述: "+description +"\n" +
			  "过滤规则: \n"+filterStr +
			  "统一计算逻辑: \n"+ computer


	});
						
	var height =  $canvas.measureText('tbl_info'+key).height;
	$canvas.drawRect({
		fillStyle: "#FFF",
 		strokeStyle: '#000',
		layer: true,
		groups:"rect",
		name: 'rect' + key,
		x:x , y: y + height / 2 + 10,
  		width: $canvas.measureText('tbl_info'+key).width + 10,
  	    height: $canvas.measureText('tbl_info'+key).height + 5
	});
	//_DrawText(key, x, y + height/2 + 10); 
		
	$canvas.drawText({
		strokeStyle: "#25a",
		align: "left",
		layer:true,
		groups: "rect",
		name: 'textRect'+key,
  		x:x , y: y+height/2 + 10,
		fontSize: 13,
  		fontFamily: "宋体",
  		mouseover: function(layer){
			;		
		},/*
		mouseout : function(layer){
			var nameLayer = layer.name.substr(8);
			var ellispeLayer = $canvas.getLayer(nameLayer);
		
			$canvas.animateLayer( nameLayer, {
				fillStyle: ellispeLayer.o_color
			},100);
					//将不显示的移除画布
			var rect = $canvas.getLayer('rect'+ellispeLayer.name);
			rect.fillStyle = 'transparent';
			rect.y = -10000;
			rect.strokeStyle = 'transparent';
			var tr = $canvas.getLayer('textRect'+ellispeLayer.name);
			tr.fillStyle = 'transparent';
			tr.y = -10000;
			tr.strokeStyle = 'transparent';
			$canvas.drawLayers();

		},*/
		text: //"table_name: "+key+"\n"+
		      //"author: "+data['creator'] +"\n" +
			  //"数据粒度: "+data['data_granularity']+"\n"+
			  //"生成频率: "+data['data_freq']  +"时 生命周期: "+data['data_life']+"天"+"\n"+
			  "基本描述: "+description +
			  "过滤规则: \n"+filterStr +
			  "统一计算逻辑: \n"+ computer
	});
	
	
	
	});
}



var draw_relation_tree = function (data,x,y,b_lr) {
        var nodes = data['nodes'];
        var relation = data['relation'];
        var $canvas = $('canvas');
        var canvas_nodes = {};
        var gap_x = 100;
        var gap_y = 150;
        var height = 1000;
		var width  = 1000;

        
        for (var i = 0; i < nodes.length; i++) {
            var level_nodes = nodes[i];
            var start_y = height/2 - parseInt(level_nodes.length/2) * gap_y;

			if (level_nodes.length % 2 === 0) {
                start_y += gap_y / 2;
            }
            for (var j = 0; j < level_nodes.length; j++) {
                var node = level_nodes[j];
                //$('<a href="/table/view?table_name=' + node + '">' + node + '</a>').appendTo('.relation-table-list');
                canvas_nodes[node] = {
                    x: (b_lr?-i:i) *gap_x + 110 + width / 4 ,
                    y: start_y + j * gap_y,
                    is_start: i === 0
                };
            }
        }


		//添加背景拖动画布
		//只画一次，画在最底层
		if( b_lr){
			$canvas.drawRect({
				fillStyle  :  "#FFF",
				strokeStyle:  "#FFF",
				x:0,y:0,
				width:10000,height:10000,
				layer : true,
				groups: ["shapes"],
  				dragGroups: ["shapes"],
				draggable: true,
				mouseover: function(layer){
					$canvas.clearCanvas();
					layer = $canvas.getLayer(_layer);
					//将不显示的移除画布
					$canvas.animateLayer( layer.name, {
						fillStyle: layer.o_color
					},100);

					var rect = $canvas.getLayer('rect'+layer.name);
					rect.fillStyle = 'transparent';
					rect.y = -10000;
					rect.strokeStyle = 'transparent';
					var tr = $canvas.getLayer('textRect'+layer.name);
					tr.fillStyle = 'transparent';
					tr.y = -10000;
					tr.strokeStyle = 'transparent';
					$canvas.drawLayers();

				}
			});
		}
		for (var i = 0; i < relation.length; i++) {
            var node1 = canvas_nodes[relation[i][0]];
            var node2 = canvas_nodes[relation[i][1]];

            $canvas.drawLine({
                strokeStyle: "#bbb",
                strokeWidth: 1,
                y1: node1.x - x, x1: node1.y - y,
                y2: node2.x - x, x2: node2.y - y,
				layer: true,
				groups: ["shapes"],
  				dragGroups: ["shapes"],	
				draggable: true,
				name: 'line'+i,
				mouseover: function(layer){
					layer = $canvas.getLayer(_layer);

					//将不显示的移除画布
					$canvas.animateLayer( layer.name, {
						fillStyle: layer.o_color
					},100);

					var rect = $canvas.getLayer('rect'+layer.name);
					rect.fillStyle = 'transparent';
					rect.y = -10000;
					rect.strokeStyle = 'transparent';
					var tr = $canvas.getLayer('textRect'+layer.name);
					tr.fillStyle = 'transparent';
					tr.y = -10000;
					tr.strokeStyle = 'transparent';
					$canvas.drawLayers();

				}
            });
        }
		var i = 0;
        for (var key in canvas_nodes) {
			i++;
			_DrawRectEx(key, -10000, -10000);
			var canvas_node = canvas_nodes[key];
            var is_start = canvas_node.is_start;
			var show_detail_flag =  false;
			$canvas.drawLayers();
       		var k = (i % 2) ==0 ? 12 : -18;
            $canvas.drawText({ 
                y:canvas_node.x - x + k, x : canvas_node.y - (is_start ? 20 : 15) - y,
                strokeStyle: "#111", 
                font: "normal 10pt Verdana",
                text: key,
				layer: true,
				groups: ["shapes"],
  				dragGroups: ["shapes"],	
				draggable: true,
				name: 'text'+key,
                align: "center", 
                baseline: "middle",
				mouseover: function(layer){
					layer = $canvas.getLayer(_layer);

					//将不显示的移除画布
					$canvas.animateLayer( layer.name, {
						fillStyle: layer.o_color
					},100);

					var rect = $canvas.getLayer('rect'+layer.name);
					rect.fillStyle = 'transparent';
					rect.y = -10000;
					rect.strokeStyle = 'transparent';
					var tr = $canvas.getLayer('textRect'+layer.name);
					tr.fillStyle = 'transparent';
					tr.y = -10000;
					tr.strokeStyle = 'transparent';
					$canvas.drawLayers();

				}
            });
			$canvas.drawEllipse({
                fillStyle: is_start ? 'red' : "#3FC4EF",
                y:canvas_node.x - x, x : canvas_node.y - y,
                width:is_start ? 23 : 18, height: is_start ? 23: 18,
				layer : true,
			    groups: ["shapes"],
  				dragGroups: ["shapes"],
				draggable: true,	
				name  : key,
				o_color : is_start ? 'red' : '#3FC4EF',
				//处理点击进入svn地址的事件
				click: function (layer){
					var href= '/table/view?table_name='+layer.name;	
					window.open(href,'','height=400,width=600,top=200,left=200,toolbar=yes,menubar=yes,scrollbars=yes,resizable=yes,location=yes,status=yes'); 
				},
				mouseover : function (layer){
					console.info("test mouse over");
					_layer = layer.name;
					this.style.cursor = 'pointer';
					//将所需要显示的信息移动到正确位置
			
					$canvas.animateLayer(layer.name,{
					   fillStyle: "black"
					},100);
					
					var	rect = $canvas.getLayer('rect'+layer.name);
					rect.fillStyle = '#FFF';
					rect.strokeStyle = "#000";
					rect.x = layer.x;
					rect.y = layer.y + rect.height/2 + 10;
					var tr = $canvas.getLayer('textRect'+layer.name);
					tr.strokeStyle='#25a';
					tr.x = layer.x ;
					tr.y = layer.y + tr.height/2 + 17;
					$canvas.drawLayers();
				},
			            });

        }

    
		return canvas_nodes;
}

/*处理字段上下关系的函数*/

$(document).ready(function() {
    $('.btn_up_column').live('click', function(){
        console.info('up column');
        var parents = $(this).parentsUntil('tr');
        var $tr = $(parents[parents.length-1]).parent();
        $tr.fadeTo('slow',0.5, function(){
			$tr.prev().before($tr);
			$tr.fadeTo('slow',1);
            total_column = 0;
		  if($tr.find('.column-num').text() != "null"){
            	$('#table-column-info tbody tr').each(function(){
                	$(this).find('.column-num').text(++total_column);
            	});
			//修改数据的操作
			var columns = new Array();
	   		$('#table-column-info tbody tr').each(function(){
            	var column_num = $(this).find('.column-num').text();
				console.info(column_num);	
			
				var column_id = $(this).find('.column-id').text();
				var table_id = $('#table-id').text();
    			if(column_id != ""){        
	   				columns.push({
						column_num:column_num,
						column_id:column_id,
						table_id:table_id
					});
		    	}
	   		});
			var data = JSON.stringify({columns:columns});
			$.post('/table/updateColumnNum', {
       			data:data
	   		}, function(response, status) {
				console.info(response);
			});
		  }
        });
    });
});

$(document).ready(function() {
    $('.btn_down_column').live('click', function(){
        console.info('up column');
        var parents = $(this).parentsUntil('tr');
        var $tr = $(parents[parents.length-1]).parent();
        $tr.fadeTo('slow',0.5, function(){
            $tr.next().after($tr);
			$tr.fadeTo('slow',1);
            total_column = 0;
			var txt = $tr.find('.column-num').text();
			if(txt != "null"){
            	$('#table-column-info tbody tr').each(function(){
               		//向下移动时修改数据库的column-num顺序
					$(this).find('.column-num').text(++total_column);
            	});
				var columns = new Array();
	   			$('#table-column-info tbody tr').each(function(){
            		var column_num = $(this).find('.column-num').text();
					console.info(column_num);	
			
					var column_id = $(this).find('.column-id').text();
					var table_id = $('#table-id').text();
    				if(column_id != ""){        
	   					columns.push({
							column_num:column_num,
							column_id:column_id,
							table_id:table_id
						});
		    		}
	   			});
				var data = JSON.stringify({columns:columns});
				$.post('/table/updateColumnNum', {
       				data:data
	   			}, function(response, status) {
					console.info(response);
				
				});
			}
        });
    });

});


/* 收藏 */
$(document).ready(function() {
    $('.btn-favorite-table').click(function () {
        var $this = $(this);
        var text = $this.attr('title');
        $.ajax({
            url: text === '收藏表' ? '/table/favorite' : '/table/unfavorite',
            data: {
                table_id : $('#table-id').text()
            },
            type: 'POST',
            global:false,
            error: function() {
                show_notice('ajax loading data error');
            },
            success: function(response) {
                if (text === '收藏表') {
                    show_notice('收藏成功');
                    $('i', $this).removeClass().addClass('icon-star');
                    $this.addClass('btn-unfavorite-table')
                    .removeClass('btn-favorite-table')
                    .attr('title', '取消收藏');
                } else {
                    show_notice('取消收藏成功');
                    $('i', $this).removeClass().addClass('icon-star-empty');
                    $this.addClass('btn-favorite-table')
                    .removeClass('btn-unfavorite-table')
                    .attr('title', '收藏表');
                }
            }
        });
    });
});

/* 编辑标签 */
$(document).ready(function() {
    $('.btn-edit-tag').click(function () {
        var $this = $(this);

        if ($this.text() === '编辑') {
            $('.div-edit-tag').show();
            $(this).text('取消编辑');
        } else {
            $('.div-edit-tag').hide();
            $(this).text('编辑');
        }

        return false;
    });
});

/* 进度 */
$(document).ready(function() {
    var table_status = $('#table-status').val();

    $('ul.table-progress-bar > li').each(function () {
        if ($(this).attr('status') === table_status) {
            $(this).addClass('actived');
            return false;
        } else {
            $(this).addClass('done');
        }
    });
});
