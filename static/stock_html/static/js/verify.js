var $current_tr = null; /* 当前审核对象 */

$(document).ready(function() {
    $('.btn-accept').click(verify_handler);
    $('.btn-reject').click(verify_handler);
});

/* 提出审核意见 */
function verify_handler()
{
    var $tr = $(this).closest('tr');

    $current_tr = $tr;

    if ($(this).hasClass('btn-accept')) {
        $('#action').val('accept');
    } else {
        $('#action').val('reject');
    }

    $('#sql-str').val($tr.find('.sql-str').text());
    $('#verify-msg-id').val($tr.find('.msg-id').text());

    $('#verify-advice-modal').modal();
}

/* 处理审核 */
$(document).ready(function() {
    $('.btn-verify').click(function(){
        var action = $('#action').val();
        var sql_str = $('#sql-str').val();
        var msg_id = $('#verify-msg-id').val();
        var verify_advice = $('#verify-advice').val();

        var data = {
            sql_str:sql_str, 
            msg_id:msg_id, 
            action:action,
            verify_advice:verify_advice
        };
        $.ajax({
            url: '/verify/verify',
            global:false,
            type:'post',
            data:data,
            error: function(response){
				console.info(response);
                show_notice('ajax请求出错');
            },
            success: function(response){ 
                response = JSON.parse(response);
                if (response['result'] == 'success') {
					show_notice('操作成功');
                    location.reload();
                } else {
                    show_notice(response['error_msg']);
                }
            }
        });
    });
});

/* 关于checkbox */
$(document).ready(function() {
    /* 全选checkbox */
	$('.select-all').click(function() {
        var parents = $(this).parentsUntil('table');
        var $table = $(parents[parents.length-1]).parent();
		if($(this).attr("checked")) {   /* 用户选中了全选 */
			$table.find('input[type=checkbox]').attr({checked:'true'});			
		} else {        /* 用户没有选中全选 */
			$table.find('input[type=checkbox]').removeAttr('checked');	
		}
	});

    /* 连续选中checkbox */
    $('table tbody tr input[type=checkbox]').click(function(e){
        //如果用户用shift键选中一个checkbox，则选中它上面连续的checkbox
        var $checkbox = $(this);
        var parents = $(this).parentsUntil('tr');
        var $tr = $(parents[parents.length-1]).parent();
        if (e.shiftKey && $checkbox.attr('checked')) {
            console.info('连续选中');
            while ($checkbox) {
                console.info('选中一个...');
                $checkbox.attr({checked: 'true'});
                $tr = $tr.prev();
                //到达最顶端的checkbox,就停止
                if (!$tr || $tr.get(0).tagName != 'TR') {
                    break;
                }
                //到达一个选中了的checkbox，就停止
                $checkbox = $tr.find('input[type=checkbox]');
                if ($checkbox.attr('checked')) {
                    break;
                }
            }
        }
    });
});

/* 在UI中显示导出表的信息 */
function show_export_tables(json_data)
{
    var data = JSON.parse(json_data);
    var tables = data['items'];
    var previous_cursor = data['previous_cursor'];
    var next_cursor = data['next_cursor'];
    var total_count = data['total_count'];
    var count = tables.length;

    console.info('count:' + count);
    if (count == 0) {
        $('#table-export-list').hide();
        $('.table-export-pager').hide();
        $('.no-table-tip').show();
        return;
    } else {
        $('#table-export-list').show();
        $('.table-export-pager').show();
        $('.no-table-tip').hide();
    }

    var i = 0;
    $('#table-export-list tbody tr').each(function() {
        if (i < count) {
            var table = tables[i];
            var $this = $(this);
            $this.find('.table-link').attr({href: '/table/view?table_id=' + table['_id']});
            $this.find('.table-name').text(table['table_name']);
            $this.find('.brief').text(table['brief']);
            $this.find('.creator').text(table['creator']);
            $this.find('.create-time').text(table['create_time']);
            $this.find('.table-id').val(table['_id']);

            $(this).show();
        } else {
            $(this).hide();
        }
        i++;
    });

    setup_pager($('.table-export-pager'), previous_cursor, next_cursor, count, total_count)
}

/* 用于处理添加表的事件 */
$(document).ready(function() {
    $('.table-create').click(function() {
        var tableId = $(this).parent().parent().find('.table-id').val();

        var tableName = $(this).parent().parent().find('.table-name').text();
        $('#t_mod_tableName').val(tableName);		

        //处理表点击了创建表的按钮
        $('.btn-addtable').click( function() {
            $.get("/verify/createTable2Udw", {
                table_id:tableId,
                product:$('#t_product').val(),
                owner: $('#t_owner').val()
            }, function(response, status) {
                console.info(response);    		
                var read = $('#t_secretAuthority1').attr('checked');
                var write = $('#t_secretAuthority2').attr('checked');
                if( read == "checked")
                console.info(read);

                $.get("/verify/alterTableAuth2Udw", {
                    table_id:tableId,
                    table_name:tableName,
                    userName: $('#t_writeusers').val(),
                    readCheck:read == "checked"?true:false,
                    writeCheck:write == "checked"?true:false,
                    expireTime : "2099-01-01"
                }, function(response, status){
                    show_notice(response);
                });
            });
        });
    });

    $('.table-del').click( function() {
        var tableId = $(this).parent().parent().find('.table-id').val();
        console.info(tableId);
        var delVerify = window.confirm("是否确定删除已经线上表");
        if( delVerify == true ){



            $.get("/verify/deleteTable2Udw", {
                table_id:tableId
            }, function(response, status){
                console.info(response);
                show_notice(response);
            });
        }
        return false;

    });
    $('.table-alt').click( function() {

        var tableId = $(this).parent().parent().find('.table-id').val();
        console.info(tableId);
        var altVerify = window.confirm("是否确定修改已经线上表");
        if( altVerify == true ){

            $.get("/verify/alterTable2Udw", {
                table_id:tableId
            }, function(response, status){
                console.info(response);
                show_notice(response);
            });	
        }

    });


    //处理修改权限点击事件
    $('.add-auth').click( function() {
        var tableId = $(this).parent().parent().find('.table-id').val();
        var tableName = $(this).parent().parent().find('.table-name').text();
        $('#mod_tableName').val(tableName);		

        $('.btn-altauth').click( function(){
            console.info("test");
            var read = $('#secretAuthority1').attr('checked');
            var write = $('#secretAuthority2').attr('checked');
            if( read == "checked")
            console.info(read);

            $.get("/verify/alterTableAuth2Udw", {
                table_id:tableId,
                userName:$('#writeusers').val(),
                table_name:tableName,
                readCheck:read == "checked"?true:false,
                writeCheck:write == "checked"?true:false,
                expireTime : "2099-01-01"
            }, function(response, status){
                console.info(response);
                show_notice(response);
            });
        });


    });
});

/* 导出表的上一页和下一页 */
$(document).ready(function() {
    $('.table-export-pager li a').click(function () {
        var dir = $(this).attr('href').slice(1);
        var cursor = $(this).attr('cursor');
        $('.table-export-pager .action').val(dir);

        $.get("/table/doSearch", {
            cursor:cursor,
            dir:dir,
            reverse:'true',
            action:'search_table',
            status:'RELEASE_OK'
        }, function(response, status) {
            show_export_tables(response);
        });

        return false;
    });
});

/* 页面初始化的时候，显示导出表的信息 */
$(document).ready(function() {
    refresh_table();
});

/* 刷新表 */
function refresh_table()
{
    $.get("/table/doSearch", {
        tags: '',
        keyword:'',
        cursor:2147483648,    /* 因为按照表的id倒序排列，
        所以第1页的id最大 */
       dir:'next',
       reverse:'true',
       action:'search_table',
       status:'RELEASE_OK'
   }, function(response, status) {
       console.info(response);
       show_export_tables(response);
   });
}

/* 下载xml文件 */
$(document).ready(function() {
    $('.btn-download').click(function(){
        var table_ids = '';
        $('#table-export-list tbody tr:visible .table-id').each(function(){
            var $tr = $(this).closest('tr');
            if ($tr.find('input[type=checkbox]').attr('checked')) {
                var table_id = $(this).val();
                table_ids += ',' + table_id;
            }
        });
        table_ids = table_ids.slice(1);
        console.info(table_ids);
        if (table_ids == '') {
            show_notice('选择至少一张表');
            return false;
        }
        show_notice('正在下载，请稍候...');
        location.href = location.protocol + '//' + location.hostname + ':' + 
        location.port + '/verify/downloadXML?table_ids=' + table_ids;
    }); 
});

$(document).ready(function() {
    $('.table-done-link').click(function(){
        var $tr = $(this).closest('tr'),
        table_id = $tr.find('.table-id').val();

        $.post('/verify/createDone', {
            table_id:table_id
        }, function (response, status) {
            if (response == 'ok') {
                show_notice('操作成功');
                location.reload();
            } else {
                show_notice(response);
            }
        });

        return false;
    }); 
});

$(document).ready(function() {
    $('.btn-table-all-done').click(function(){
        if (confirm('确认把所有表都标记为创建完成吗？')) {
            $.post('/verify/allCreateDone', {}, function (response, status) {
                if (response == 'ok') {
                    refresh_table();
                } else {
                    show_notice(response);
                }
            });
        }

        return false;
    }); 
});
