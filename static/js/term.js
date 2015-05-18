/* 显示添加输入框 */
$(document).ready(function() {
    $('.btn-create').click(function() {
        $(this).hide();
        $(this).parent().parent().find('div').show();
    });
});

/* 取消添加 */
$(document).ready(function() {
    $('.btn-cancel-create').click(function() {
        $tr = $(this).parent().parent().parent();
        $tr.find('div').hide();
        $tr.find('.btn-create').show();
        
        return false;
    });
});

/* 添加术语 */
$(document).ready(function() {
    $('.btn-save-term').click(function() {
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();

       var term_name = $tr.find('.input-term-name').val();
       var term_detail = $tr.find('.input-term-detail').val();
       var extra = $tr.find('.input-extra').val();
       var use_for = $tr.find('.input-use-for').val();

       $.post('/term/create', {
            term_name:term_name,
            term_detail:term_detail,
            extra:extra,
            use_for:use_for
        }, function(response, status) {
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                $tr.find('div').hide();
                $tr.find('.btn-create').show();
                $tr.find('.input-term-name').val('');
                $tr.find('.input-term-detail').val('');
                $tr.find('.input-extra').val('');
                $tr.find('.input-use-for').val('');
                show_notice('添加成功!');
            } else {
                show_notice(response['error_msg']);
            }
        });

       return false;
    });
});

/* 删除术语 */
$(document).ready(function() {
   $('.btn-delete-term').click(function() {
       var msg = "确认删除？";
       if (confirm(msg) == false) {
            return false;
       }

       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();

       var term_id = $tr.find('.term-id').text();
        $.post('/term/delete', {
            term_id:term_id
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

/* 更新术语 */
$(document).ready(function() {
    $('.btn-update-term').click(function() {
       var parents = $(this).parentsUntil('tr');
       var $tr = $(parents[parents.length-1]).parent();

       var term_id = $tr.find('.term-id').text();
       var term_name = $tr.find('.input-term-name').val();
       var term_detail = $tr.find('.input-term-detail').val();
       var extra = $tr.find('.input-extra').val();
       var use_for = $tr.find('.input-use-for').val();

       $.post('/term/update', {
            term_id:term_id,
            term_name:term_name,
            term_detail:term_detail,
            extra:extra,
            use_for:use_for
       }, function(response, status) {
            // 切换到查看模式
            $tr.find('.view_mode').show();
            $tr.find('.edit_mode').hide();
            console.info(status);
            response = JSON.parse(response);
            if (response['result'] == 'success') {
                // 如果更新成功，显示更新后的数据
                $tr.find('.term-name').text(term_name);
                $tr.find('.term-detail').text(term_detail);
                $tr.find('.extra').text(extra);
                $tr.find('.use-for').text(use_for);
                show_notice('更新成功!');
            } else {
                show_notice(response['error_msg']);
            }
       });

       return false;
    });
});

/* 设置hash */
$(document).ready(function() {
    setup_hash();
    $(window).bind('hashchange', setup_hash);
});

/* 以动画的方式跳转到hash */
function setup_hash()
{
    /* 根据url获取锚点元素 */
    var $target = $('#' + location.hash.slice(1));
    if ($target && $target.length) {
        /* 开始滚动啦 */
        var targetOffset = $target.offset().top;
        $('html,body').animate({
            scrollTop: targetOffset - 100   /* 减去100，是因为顶部导航栏会遮挡 */
        }, 1000);

        /* 将锚点所在的行标红 */
        var $tr = $target.closest('tr');
        $tr.attr('style', 'color:red;');

        /* 重置上次锚点的样式 */
        if (arguments.callee.prevTerm) {
            arguments.callee.prevTerm.attr('style', '');
        }

        /* 保存当前行，下次重置它 */
        arguments.callee.prevTerm = $tr;
    }
}
