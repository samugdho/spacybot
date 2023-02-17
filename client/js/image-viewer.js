var TITLE = 'title', SRC = 'src', IMG = 'img', CLICK = 'click';
var ImageViewer = {
    init: function () {
        // call in onload
        var $image_viewer = $('ImageViewer');
        $(".".concat(IMG)).on('click', function (e) {
            var $el = $(e.currentTarget);
            var $img = $el.find(IMG);
            var title = $img.attr(TITLE);
            var src = $img.attr(SRC);
            var $viewer_img = $image_viewer.find(IMG);
            $viewer_img.attr(TITLE, title);
            $viewer_img.attr(SRC, src);
            $viewer_img.on('load', { $image_viewer: $image_viewer }, function (e) {
                var $image_viewer = e.data.$image_viewer;
                $image_viewer.removeClass('hide');
            });
        });
        $image_viewer.find('.close').on(CLICK, function (_e) {
            $image_viewer.addClass('hide');
        });
    }
};
export {ImageViewer};
