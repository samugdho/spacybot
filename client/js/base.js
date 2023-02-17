import {ImageViewer} from './image-viewer.js';
function BaseStart() {
    var ON = 'on', OFF = 'off', STATUS = 'status', TITLE = 'title', TOGGLE = 'toggle';
    $('button').each(function (_i, el) {
        var $el = $(el);
        $el.attr(TITLE, $el.text());
    });
    $('img').each(function (_i, el) {
        var $el = $(el);
        var alt = $el.attr('alt');
        $el.attr(TITLE, alt);
    });
    ImageViewer.init();
    $('icon').addClass('material-symbols-rounded');
    $('switch').on('click', function (e) {
        var $switch = $(e.currentTarget);
        $switch.attr(STATUS, function (_, attr) { return attr == ON ? OFF : ON; }).trigger(TOGGLE);
    });
    //
}
export {BaseStart};


