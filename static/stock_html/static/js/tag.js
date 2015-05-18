/* 自动选择分类 */
$(document).ready(function() {
   $('.category').each(function() {
       var category = $(this).text();
       $(this).next().children('option').each(function () {
           var select_category = $(this).text();
           if (select_category == category) {
                $(this).attr({selected:'true'});
           }
       });
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
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();

        $tr.find('div').hide();
        $tr.find('.btn-create').show();
        
        return fales;
    });
});

/* 添加标签 */
$(document).ready(function() {
    $('.btn-save-tag').click(function() {
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();

       var category = $tr.find('.input-category').val();
       var tag_name = $tr.find('.input-tag-name').val();

       $.post('/tag/create', {
            category:category,
            tag_name:tag_name
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

/* 删除标签 */
$(document).ready(function() {
   $('.btn-delete-tag').click(function() {
       var msg = "确认删除？";
       if (confirm(msg) == false) {
            return false;
       }
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();

       var tag_id = $tr.find('.tag-id').text();
        $.post('/tag/delete', {
            tag_id:tag_id
        }, function(response, status) {
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                show_notice('删除成功!');
                $tr.remove();
            } else {
                show_notice(response['error_msg']);
            }
        });

        return false;
   }); 
});

/* 更新标签 */
$(document).ready(function() {
    $('.btn-update-tag').click(function() {
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();

       var tag_id = $tr.find('.tag-id').text();
       var category = $tr.find('.input-category').val();
       var tag_name = $tr.find('.input-tag-name').val();

       $.post('/tag/update', {
            tag_id:tag_id,
            category:category,
            tag_name:tag_name
       }, function(response, status) {
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                // 如果更新成功，显示更新后的数据
                $tr.find('.tag-name').text(tag_name);
                $tr.find('option').each(function () {
                   var select_category = $(this).text();
                   if (select_category == category) {
                        $(this).attr({selected:'true'});
                   }
                });
                // 切换到查看模式
                $tr.find('.view_mode').show();
                $tr.find('.edit_mode').hide();
                show_notice('更新成功!');
            } else {
                show_notice(response['error_msg']);
            }
       });

       return false;
    });
});
