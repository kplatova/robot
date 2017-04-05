(function () {
    'use strict';
    angular.module('angie').factory('humanRobotModel', humanRobotModel);

    humanRobotModel.$inject = [];

    function humanRobotModel() {
        function sigmoid(coordinate) {
            // Формула сигмоиды может быть обнаружена по следующему адресу:
            // https://ru.wikipedia.org/wiki/%D0%A1%D0%B8%D0%B3%D0%BC%D0%BE%D0%B8%D0%B4%D0%B0
            var sigmoidValue = 1 / (1 + Math.pow(Math.E, coordinate));

            return sigmoidValue;
        }

        function getTwoDotsScalarProduct(firstDot, secondDot) {
            var scalarProduct = 0;

            function accumulateMatchingCoordinatesProduct(totalProduct, firstDotCoordinate, coordinateIndex) {
                var secondDotCoordinate = secondDot[coordinateIndex];

                return totalProduct + (firstDotCoordinate * secondDotCoordinate);
            }
            scalarProduct = firstDot.reduce(accumulateMatchingCoordinatesProduct, scalarProduct);

            return scalarProduct;
        }

        // Веса ответов в модели.
        var ANSWERS_WEIGHTS = [0, 0, -1.13280722, -2.26112801, 2.74906085, -0.77261008, -0.55084753, -0.74103185, -2.73450671, 1.83750101];

        /**
         * Функция, возвращающая доли, отражающие человечность и роботизированность проходящего тест.
         * @param {array} secondDot - массив ответов на все вопросы из 10 элементов. Если ответа на какой-либо вопрос ещё нет, ожидается 0.
         * @return {{human: number, robot: number}} - доля человечности и роботизированности проходящего тест.
         */
        function getHumanRobotFractions(secondDot) {
            var dotsProduct = getTwoDotsScalarProduct(ANSWERS_WEIGHTS, secondDot);
            var humanicFraction = sigmoid(dotsProduct);
            var humanRobot = {
                human: humanicFraction,
                robot: 1 - humanicFraction
            };

            return humanRobot;
        }

        return {
            getHumanRobotFractions: getHumanRobotFractions
        };
    }
})();