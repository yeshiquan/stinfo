function is_table_exist(table_name)
{
    if (table_name == '') {
        return false;
    }

    var is_exist = null;

    $.ajax({
            url: '/table/getTableByName?table_name='+table_name,
            type: 'GET',
            global:false,
            async:false,    /* 同步请求 */
            error: function() {
                show_notice('ajax loading data error');
            },
            success: function(response) {
                console.info('table-data:' + response);
                var data = JSON.parse(response);
		console.info('test'+data);
		console.info(data['table_name'] );
                if (data['table_name'] != null) {
                    is_exist = true;
                } else {
                    is_exist = false;
                }
            }
    });

    return is_exist;
}
/* 添加数据库 */
$(document).ready(function() {
    $('.btn-save-db').click(function() {
        $modal = $('#database-modal');
        var db_type_id = $('#select-db-type').val();
        var db_name = $modal.find('.input-db-name').val();
        var username = $modal.find('.input-username').val();
        var password = $modal.find('.input-password').val();
        var confirm_password = $modal.find('.input-confirm-password').val();
        var host = $modal.find('.input-host').val();
        var port = $modal.find('.input-port').val();
        
        if (password != confirm_password) {
            alert('两次密码不一致!');
            return false;
        }

        $.post('/table/createDb', {
            db_type_id:db_type_id,
            db_name:db_name,
            username:username,
            password:password,
            host:host,
            port:port
        }, function(response, status) {
            var data = JSON.parse(response);
            var db_id = data['id'];
            var html = '<option selected value="' + db_id + '">' + db_name + '</option>';
            console.info(html);
            $(html).appendTo('#select-db');
        });
    });
});

/* 设置数据库类行的下拉框，根据数据库类型显示和隐藏相关属性 */
function setup_db_type(db_type)
{
    /* 是否显示hive表的属性 */
    if (db_type == 'HIVE') {
        $('.mysql-staff').hide();
        $('.hive-staff').show();
    } else {
        $('.hive-staff').hide();
        $('.mysql-staff').show();
    }
    
    $('#select-db-type option').each(function () {
        $(this).removeAttr('selected');
       if ($(this).text() == db_type) {
            $(this).attr({selected:'true'});
       }
    });

    /* 数据库类型和数据库的联动下拉框 */
    $.get('/table/getdbs', {
        db_type_name : db_type,
    }, function(data, status) {
        $('#select-db').html(data);
    });
}

/* 第一次初始化数据库下拉框 */
$(document).ready(function() {
    var db_type = $('#select-db-type').children('option:selected').text();
    
    setup_db_type(db_type);
});

/* 用户改变了数据库类型 */
$(document).ready(function() {
	$('#select-db-type').live('change', function() {
		var db_type = $(this).children('option:selected').text();

        setup_db_type(db_type);
	});
});

/* ============= 解析hive建表语句 START =================== */
/* 跨浏览器的xml parse函数 */
var parseXml;

if (typeof window.DOMParser != "undefined") {
    parseXml = function(xmlStr) {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof window.ActiveXObject != "undefined" &&
       new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
} else {
    throw new Error("No XML parser found");
}

/* 提取comment节点的注释信息 */
function extract_words(node)
{
    var str = '';

    if (node == undefined) {
        return str;
    }

    var word_node = node.getElementsByTagName('word');
    for (var i = 0; i < word_node.length; i++) {
        if (word_node[i].getAttribute('type') == 'term') {
            str += "{" + word_node[i].getAttribute('content') + "}";
        } else {
            str +=  word_node[i].getAttribute('content');
        }
    }

    return str;
}

/* 从hive导入 */
function import_from_hive(xml_text)
{        
    var xml = parseXml(xml_text);

    // 解析表的基本信息
    var event_node = xml.documentElement;
    var table_name =  event_node.getAttribute('name');
    var db_name =  event_node.getAttribute('database');
    var properties =  event_node.getAttribute('properties');

    console.info('table_name:' + table_name);

    $('#table-name').val(table_name);
    $('#properties').val(properties);

    // 解析表的字段信息
    var attribute_nodes = xml.getElementsByTagName("Attribute");
    var len = attribute_nodes.length;
    for (var i = 0; i < len; i++) {
        var attribute_node = attribute_nodes[i];
        // 字段名
        var column_name = attribute_node.getAttribute('colname');
        // 类型
        var type = attribute_node.getAttribute('type');
        // 注释-brief
        var brief_node = attribute_node.getElementsByTagName('brief')[0];
        var brief = extract_words(brief_node);

        // 注释-desription
        var description_node = attribute_node.getElementsByTagName('description')[0];
        var description = extract_words(description_node);

        // 注释-alias
        var alias_node = attribute_node.getElementsByTagName('alias')[0];
        var alias = extract_words(alias_node);
        // 注释-extra
        var extra_node = attribute_node.getElementsByTagName('extra')[0];
        var extra = extract_words(extra_node);

        //填充partition字段
        if (attribute_node.getAttribute('partition') == 'true') {
            var partition = $.trim($('#partition').val());
            partition = partition == ''? column_name : (partition + ',' + column_name);
            $('#partition').val(partition);
        }

        var $column_inputs = $('.column-inputs');
        $column_inputs.find('.column-name').val(column_name);
        $column_inputs.find('.column-data-type').val(type);
        $column_inputs.find('.others').val('');
        $column_inputs.find('.comment-brief').val(brief);
        $column_inputs.find('.comment-description').val(description);
        $column_inputs.find('.comment-extra').val(extra);
        $column_inputs.find('.comment-alias').val(alias);

        add_column(true);
    }
}
/* ============= 解析hive建表语句 END =================== */

/* ============= 解析MySQL建表语句 START =================== */
/* sql词法分析 */
function sql_lexer(sql)
{
    this.sql = sql;
    this.j = 0;
    this.i = 0;
    this.n = sql.length;

    /* 返回一个token */
    this.next_token = function() {
        var token = '';
        this.j = this.i;
        while (this.i < this.n) {
            var ch = sql.charAt(this.i);
            this.i++;
            if (ch == ' ' || ch == '\t' || ch == '\n') {
                if (token == '') {
                    continue;
                }
                break;
            } else if (ch == '(' || ch == ')' || ch == ',' || ch == '.' || ch == '=') {
                if (token == '') {
                    token += ch;
                } else {
                    this.i--;
                }
                break;
            } else {
                token += ch;
            }
        }

        return token;
    };

    /* 回退一个token */
    this.back = function() {
        this.i = this.j;
    };
}

/* sql语法分析 */
function sql_parser(lexer)
{
    /* 解析数据库名和表名 */
    this.parse_db_table = function () {
        if (lexer.next_token().toLowerCase() != 'create') {
            alert('error, expect create');
            return;
        }
        if (lexer.next_token().toLowerCase() != 'table') {
            alert('error, expect table');
            return;
        }
        db = lexer.next_token();
        console.info(db);
        if (lexer.next_token() != '.') {
            alert('error, expect .');
            return;
        }
        table_name = lexer.next_token();
        $('#table-name').val(table_name);
        console.info(table_name);
        if (lexer.next_token() != '(') {
            alert('error, expect (');
            return;
        }
    };

    /* 解析数据类型 */
    this.parse_type = function () {
        var type = lexer.next_token();

        var token;
        if ((token = lexer.next_token()) == '(') {
            type += token;
            type += lexer.next_token();
            if ((token = lexer.next_token()) != ')') {
                alert('error, expect )');
                return '';
            } else {
                type += token;
            }
        } else {
            lexer.back();
        }

        return type;
    };

    /* 解析字段 */
    this.parse_column = function () {
        var column_name = lexer.next_token();

        // 字段名
        if (column_name.toLowerCase() == 'primary') {
            if (lexer.next_token().toLowerCase() != 'key') {
                alert('error, expect key');
                return false;
            }
            if (lexer.next_token() != '(') {
                alert('error, expect (');
                return false;
            }
            var primary_key =  lexer.next_token();
            $('#partition').val(primary_key);
            return false;
        }

        // 数据类型
        var data_type = this.parse_type();

        // 其他属性
        var extra = '';
        var token = lexer.next_token();
        while (token != '' && token != ',') {
            extra += ' ' + token;
            token = lexer.next_token();
        }
        extra = extra.slice(1);

        if (token != ',') {
            alert('error, expect,');
            return false;
        }

        var $column_inputs = $('.column-inputs');
        $column_inputs.find('.column-name').val(column_name);
        $column_inputs.find('.column-data-type').val(data_type);
        $column_inputs.find('.others').val(extra);

        add_column(true);

        return true;
    };

    this.run = function () {
        this.parse_db_table();
        while(this.parse_column());
    };
}

function import_from_mysql(sql)
{
    // mysql-administrator导出的sql语句包含字符`，解析之前去掉
    sql = sql.replace(/`/g, "");
    var lexer = new sql_lexer(sql);
    var parser = new sql_parser(lexer);
    parser.run();
}
/* ============= 解析MySQL建表语句 END =================== */

/* 导入表 */
$(document).ready(function () {
    $('#import-table-name').change(function () {
		var table_name = $('#import-table-name').children('option:selected').text();
        $.ajax({
                url: '/table/exportHiveEx?table_name='+table_name,
                type: 'GET',
                global:false,
                error: function() {
					$('#table-text').val("");
                    //show_notice('ajax loading data error');
                },
                success: function(response) {
                    $('#table-text').val(response);
                }
            });
	



	});
    $('.btn-import').click(function () {
		var db_type = $('#import-db-type').children('option:selected').text();
        var text = $('#table-text').val();

        if (db_type == 'HIVE') {
            import_from_hive(text);
			
        } else {
            import_from_mysql(text);
        }

        setup_db_type(db_type);
    });
});

var total_column = 0;
function add_column_html() {
    var html = '\
        <tr class="">\
            <td class="center">\
                <span class="column-id"></span>\
            </td>\
            <td class="center">\
            <span class="view_mode column-name"></span>\
                <div class="edit_mode hide">\
                    <input type="text" class="input-small input-column-name" value="" />\
                </div>\
            </td>\
            <td class="center">\
                <span class="view_mode brief"></span>\
                <div class="edit_mode hide">\
                    <input type="text" class="input-small input-brief" value="" />\
                </div>\
            </td>\
            <td class="center">\
                <span class="view_mode description"></span>\
                <div class="edit_mode hide">\
                    <input type="text" class="input-large input-description" value="" />\
                </div>\
            </td>\
            <td class="center">\
                <span class="view_mode data-type"></span>\
                <div class="edit_mode hide">\
                    <input type="text" class="input-small input-data-type" value="" />\
                </div>\
            </td>\
            <td>\
                <div class="view_mode">\
                  <a class="btn a_edit_table"><i class="icon-edit"></i></a>\
                  <a class="btn btn-delete-column"><i class="icon-trash"></i></a>\
                  <a class="btn btn_up_column"><i class="icon-arrow-up"></i></a>\
				  <a class="btn btn_down_column"><i class="icon-arrow-down"></i></a>\
				</div>\
                <div class="edit_mode hide">\
                  <a class="btn btn-update-column btn-primary"><i class="icon-ok"></i></a>\
                  <a class="btn a_cancel_edit "><i class="icon-off"></i></a>\
   	     		</div>\
            </td>\
        </tr>';
    return html;
}

$(document).ready(function() {
    $('.btn_up_column').live('click', function(){
        console.info('up column');
        var parents = $(this).parentsUntil('tr');
        var $tr = $(parents[parents.length-1]).parent();
        $tr.fadeTo('slow',0.5, function(){
			$tr.prev().before($tr);
			$tr.fadeTo('slow',1);
            total_column = 0;
            $('#table-column-info tbody tr').each(function(){
                console.info('reset column id');
                $(this).find('.column-id').text(++total_column);
            });
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
            $('#table-column-info tbody tr').each(function(){
                console.info('reset column id');
                $(this).find('.column-id').text(++total_column);
            });
        });
    });

});


/*
 * 建表添加一个字段
 * is_import bool 是否从xml导入 
 * */
function add_column(is_import)
{
  var $column_inputs = $('.column-inputs');

         //检查是否输入必填信息
         var pass = true;
         $column_inputs.find('.required').each(function() {
             console.info('input: ' + $(this).val());
             if ($.trim($(this).val()) == '') {
                console.info('error-input');
                $(this).addClass('error-input');
                pass = false;
             } else {
                $(this).removeClass('error-input');
                console.info('success-input');
             }
         });
         if (!pass) {
            show_notice('请输入必填信息...');
            return false;
         }
         
        var column_name = $column_inputs.find(".column-name").val();
        var others = $column_inputs.find(".others").val();
        var data_type = $column_inputs.find(".column-data-type").val();
        var brief = $column_inputs.find(".comment-brief").val();
        var description = $column_inputs.find(".comment-description").val();

        /*
        var calc_logic = $column_inputs.find(".calc-logic").val();
        var value_meaning = $column_inputs.find(".value-meaning").val();
        var validate_rule = $column_inputs.find(".validate-rule").val();
        var test_rule = $column_inputs.find(".test-rule").val();
        */

        //检查是否存在重复字段
        var repeat = false;
        $('#table-column-info tr').each(function(){
            var a_column_name = $(this).find('.column-name').text();
            console.info('column-name: ' + a_column_name);
            if (a_column_name == column_name) {
                repeat = true;
            }
        });
        if (repeat) {
            show_notice('字段重复！');
            return false;
        }
        
        //在界面上添加到表中
        var html = add_column_html();
        $(html).appendTo($('#table-column-info tbody'));
        var $tr = $('#table-column-info tbody tr:last');
        $tr.find('.column-id').text(++total_column);
        $tr.find('.column-name').text(column_name);
        $tr.find('.input-column-name').val(column_name);
        $tr.find('.brief').text(brief);
        $tr.find('.input-brief').val(brief);
        $tr.find('.description').text(description);
        $tr.find('.input-description').val(description);
        $tr.find('.data-type').text(data_type);
        $tr.find('.input-data-type').val(data_type);

        /*
        $tr.find('.calc-logic').text(calc_logic);
        $tr.find('.input-calc-logic').val(calc_logic);
        $tr.find('.value-meaning').text(value_meaning);
        $tr.find('.input-value-meaning').val(value_meaning);
        $tr.find('.validate-rule').text(validate_rule);
        $tr.find('.input-validate-rule').val(validate_rule);
        $tr.find('.test-rule').text(test_rule);
        $tr.find('.input-test-rule').val(test_rule);
        */

        //清空字段各属性的输入框
        $column_inputs.find(".column-name").val('');
        $column_inputs.find(".column-name").focus();
        $column_inputs.find(".others").val('');
        $column_inputs.find(".column-data-type").val('');
        $column_inputs.find(".comment-brief").val('');
        $column_inputs.find(".comment-description").val('');

        /*
        $column_inputs.find(".calc-logic").val('');
        $column_inputs.find(".value-meaning").val('');
        $column_inputs.find(".validate-rule").val('');
        $column_inputs.find(".test-rule").val('');
        */

        //如果不是导入，就自动滚动到底部
        if (is_import == false) {
            $tr.hide().fadeIn('normal', function() {
                $("body").animate({
                    scrollTop: $("body").height()
                }, 1000);
            });
        }
}

/* 添加字段 */
$(document).ready(function() {
    $('.btn-add-column').click(function() {
        add_column(false);      
        return false;
    });
});

/* 删除已添加的字段 */
$(document).ready(function() {
    $('.btn-delete-column').live('click', function(){
        console.info('delete column');
        var parents = $(this).parentsUntil('tr');
        var $tr = $(parents[parents.length-1]).parent();
        $tr.fadeOut('slow', function(){
            $tr.remove();
            total_column = 0;
            $('#table-column-info tbody tr').each(function(){
                console.info('reset column id');
                $(this).find('.column-id').text(++total_column);
            });
        });
    });

});

/* 修改字段 */
$(document).ready(function() {
    $('.btn-update-column').live('click', function(){
        console.info('update columns');
        var parents = $(this).parentsUntil('tr');
        var $tr = $(parents[parents.length-1]).parent();

        var column_name = $tr.find('.input-column-name').val();
        $tr.find('.column-name').text(column_name);

        var brief = $tr.find('.input-brief').val();
        $tr.find('.brief').text(brief);

        var description = $tr.find('.input-description').val();
        $tr.find('.description').text(description);

        var data_type = $tr.find('.input-data-type').val();
        $tr.find('.data-type').text(data_type);

        /*
        var others = $tr.find('.input-others').val();
        $tr.find('.others').text(data_type);

        var calc_logic = $tr.find('.input-calc-logic').val();
        $tr.find('.calc-logic').text(calc_logic);

        var value_meaning = $tr.find('.input-value-meaning').val();
        $tr.find('.value-meaning').text(value_meaning);

        var validate_rule = $tr.find('.input-validate-rule').val();
        $tr.find('.validate-rule').text(validate_rule);

        var test_rule = $tr.find('.input-test-rule').val();
        $tr.find('.test-rule').text(test_rule);
        */

        // 切换到查看模式
        $tr.find('.view_mode').show();
        $tr.find('.edit_mode').hide();
    });
});

/* 保存表的基本信息 */
$(document).ready(function() {
    $('.btn-submit').live('click', function() {
         var pass = true;
         $('.table-basic-info .required').each(function() {
             console.info('input: ' + $(this).val());
             if ($.trim($(this).val()) == '') {
                console.info('error-input');
                $(this).addClass('error-input');
                pass = false;
             } else {
                $(this).removeClass('error-input');
                console.info('success-input');
             }
         });
         if (!pass) {
            show_notice('请输入必填信息...');
            return false;
         }
         
         // 获取表的tag信息
         var tags = $('#input-tags').val();
         if (tags === '') {
            show_notice('请选择标签...');
            return false;
         }

        // 检查保存期限是否为空
        var data_life = parseInt($('#data-life').val());
        if (isNaN(data_life) || data_life === 0) {
            show_notice('生命周期必须是数字，而且不能为0');
            return;
        }

         //检查partition字段是否为空
         var partition = $('#partition').val();
         console.info('partition: ' + partition);
         if ($.trim(partition) == '') {
            if (!confirm('没有 partition 字段，确定保存？')) {
                $('#partition').focus();
                return false;
            }
         }

         //检查partition字段是否存在
         if (partition != '') {
             var partition_list = partition.split(',');
             var len = partition_list.length;
             for (var i = 0; i < len; i++) {
                 var found = false;
                 //遍历已添加的字段名,看是否存在partition
                 $('#table-column-info tbody tr').each(function(){
                    var column_name = $(this).find('.column-name').text();
                    console.info('column_name: ' + column_name);
                    console.info('partition_list ###' + partition_list[i] + '###');
                    if (partition_list[i] == column_name) {
                        found = true;
                        return false;   /* 在each中return false相当于break */
                    }
                 });
                 //没有找到
                 if (!found) {
                    alert('partition字段(' + partition_list[i] + ')没有添加到表中!');
                    $('#partition').focus();
                    return false;
                } 
             }
         }

         //检查表的长度
         if ($('#table-name').val().length > 64) {
             show_notice('表名长度不能超过64个字符');
             return false;
         }
		var table_name = $('#table-name').val();
        // 检查表名是否存在
	console.info(table_name);
        if ( is_table_exist( table_name ) ) {
            show_notice('表名已存在');
            $('#table-name').addClass('error-input');
			return false;
        }//else{

         // 收集表的基本信息
         var table = {
            table_name : $('#table-name').val(),
            data_freq : $('#data-freq').val(),
            data_life : parseFloat($('#data-life').val()),
            properties : $('#properties').val(),
            parent_tables : $('#parent-tables').val(),
            data_granularity : $('#data-granularity').val(),
            db_id: $('#select-db').val(),
            brief: $('#table-brief').val(),
            description: $('#table-description').val(),
			filter: $('#table-filter').val(),
			computer: $('#table-computer').val(),
			svn_address:$('#svn-address').val(),
            extra: $('#table-extra').val(),
            alias: $('#table-alias').val(),
            partition:partition,
            tags:tags
        };

        // 收集表的字段信息
        var columns = new Array();
        $('#table-column-info tbody tr').each(function() {
            var column_name = $(this).find('.column-name').text();
            var data_type = $(this).find('.data-type').text();
            var others = $(this).find('.others').text();
            var brief = $(this).find('.brief').text();
            var description = $(this).find('.description').text();
			var column_num = $(this).find('.column-id').text();			


            /* 结构设计阶段不填写规则
            var calc_logic = $(this).find('.calc-logic').text();
            var value_meaning = $(this).find('.value-meaning').text();
            var validate_rule = $(this).find('.validate-rule').text();
            var test_rule = $(this).find('.test-rule').text();
            */

            columns.push({
                column_name: column_name,
                data_type: data_type,
                others: others,
                brief: brief,
                description: description,
				column_num: column_num
                /* 结构设计阶段不填写规则
                calc_logic: calc_logic,
                value_meaning: value_meaning,
                validate_rule: validate_rule,
                test_rule: test_rule
                */
            });
        });

        if (columns.length < 1) {
            show_notice("至少添加一个字段...");
            return false;
        }

        // 把数据编码为json，并发送ajax请求
        var data = JSON.stringify({table:table, columns:columns});
        console.info('建表的json数据');
        console.info(data);

        $.post('/table/createTable', {
            data:data
        }, function(response, status){
            var response = JSON.parse(response);
            if (response['result'] == 'success') {
                show_notice('创建表成功...');
                location.href = location.protocol + '//' + location.host + '/table/view?table_id=' + response['id'];
            } else {
                show_notice(response['error_msg']);
            }
        });
		//}

        return false;
    });;
});

$(document).ready(function() {
    $('.column-inputs').bind('keydown', function(event) {
        if (event.keyCode == 13) {
            add_column(false);
        }
    });
});

/* 字段的自动提示 */
$(document).ready(function(){
    var data = null;
    $.get('/table/listColumn', {}, function(response, status){
        // 获取所有字段
        data = JSON.parse(response);
        $("#input-column-name").autocomplete(data, {scroll:true,scrollHeight:300,width:220})
        .result(function (event, item) {
            //用户选中后触发result()函数
            var $column_inputs = $('.column-inputs');

            //查询选中字段的详细信息
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
                    $column_inputs.find('.others').val(column['others']);
                    $column_inputs.find('.column-data-type').val(column['data_type']);
                    $column_inputs.find('.comment-brief').val(column['brief']);
                    $column_inputs.find('.comment-description').val(column['description']);
                    /* 结构设计阶段不填写规则
                    $column_inputs.find('.calc-logic').val(column['calc_logic']);
                    $column_inputs.find('.value-meaning').val(column['value_meaning']);
                    $column_inputs.find('.validate-rule').val(column['validate_rule']);
                    $column_inputs.find('.test-rule').val(column['test_rule']);
                    */
                }
            });

            $column_inputs.find('.column-name').focus();
        });
    });
});

/* 检查表名是否存在 */
$(document).ready(function(){
    $('#table-name').bind('blur', function(){
        var table_name = $(this).val();
        if (table_name == '') return;

        if (is_table_exist(table_name)) {
            show_notice('表名已存在');
            $('#table-name').addClass('error-input');
        } else {
            $('#table-name').removeClass('error-input');
        }

    });
});

/* 自动提示表名 */
$(document).ready(function(){
    var data = null;
    $.get('/table/listTableName', {}, function(response, status){
        // 获取所有表名
        console.info(response);
        data = JSON.parse(response);
        $("#table-name").autocomplete(data, {scroll:true,scrollHeight:300,width:240})
        .result(function (event, item) {
            //用户选中后触发result()函数
            $('#table-name').val(item);
        });
    });
});
