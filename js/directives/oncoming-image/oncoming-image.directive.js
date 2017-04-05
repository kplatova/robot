(function () {
    'use strict';

    angular.module('angie').directive('oncomingImage', oncomingImage);

    oncomingImage.$inject = [];

    function oncomingImage() {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element) {
            var ONCOMING_IMAGE_ATTRIBUTE = 'oncoming-image-target';

            var targetImage = element.find('[' + ONCOMING_IMAGE_ATTRIBUTE + ']');
            var newWidth = 0;

            function setNewWidthForTargetImage(event) {
                newWidth = event.pageX;
                targetImage.css('width', newWidth);
            }

            element.on('mousemove', setNewWidthForTargetImage);
        }
    }
})();