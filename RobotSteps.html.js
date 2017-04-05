/* eslint-disable no-continue */
(function () {
    'use strict';

    angular.module('angie').controller('RobotStepsController', RobotStepsController);

    RobotStepsController.$inject = ['$window', 'localStorage', 'humanRobotModel', 'questionsAmount', 'currentQuestionId', 'nextQuestionUrl', 'answersStorageName', 'balanceValueStorageName'];

    function RobotStepsController($window, localStorage, humanRobotModel, questionsAmount, currentQuestionId, nextQuestionUrl, answersStorageName, balanceValueStorageName) {
        var vm = this;

        vm.answerText = '';
        // Значение в процентах для величины прогресса.
        vm.progressMade = 0.0;
        // Значение в процентах для величины человечности.
        vm.humanness = 0.0;

        vm.confirmAnswer = confirmAnswer;

        // Инициализация контроллера.
        var humanRobotTestAnswers = {};
        var numberOfAnswersGiven = 0;

        var DEFAULT_BALANCE_VALUE = '50.0';
        var PERCENTS_MULTIPLIER = 100;
        init();

        // Реализация методов

        function init() {
            restoreLocalStorage();
            // Если число сохранённых ответов совпадает с числом вопросов в тесте, значит это повторное
            // его прохождение. Очищаем все сохранённые ответы.
            countNumberOfAnswersGiven();
            clearLocalStorageIfTryingAgain();
            setAnswerTemplate();
            setProgressLineValue();
            setHumanRobotBalance();
        }

        function restoreLocalStorage() {
            // Необходимо добавить объект вопроса в общий массив вопросов в localStorage.
            // Проверяем, существует ли на данный момент массив, содержащий вопросы.
            var answersStorage = localStorage.getItem(answersStorageName);
            var answersStorageExists = Boolean(answersStorage);
            if (answersStorageExists) {
                // Восстанавливаем хранилище ответов, если оно уже существовало.
                humanRobotTestAnswers = JSON.parse(answersStorage);
            } else {
                // Создаём хранилище ответов, если его ещё не было.
                localStorage.setItem(answersStorageName, JSON.stringify(humanRobotTestAnswers));
            }
        }

        function countNumberOfAnswersGiven() {
            for (var answerId in humanRobotTestAnswers) {
                if (!humanRobotTestAnswers.hasOwnProperty(answerId)) {
                    continue;
                }

                numberOfAnswersGiven++;
            }
        }

        function clearLocalStorageIfTryingAgain() {
            var firstQuestion = currentQuestionId === 1;
            if (numberOfAnswersGiven >= questionsAmount && firstQuestion) {
                humanRobotTestAnswers = {};
                localStorage.setItem(answersStorageName, JSON.stringify(humanRobotTestAnswers));
                localStorage.setItem(balanceValueStorageName, DEFAULT_BALANCE_VALUE);
                numberOfAnswersGiven = 0;
            }
        }

        function setAnswerTemplate() {
            // Проверяем, нет ли среди элементов хранилища элемента с таким же уникальным ключом.
            var idString = currentQuestionId.toString();
            var givenAnswer = humanRobotTestAnswers[idString];
            var isNewQuestion = typeof givenAnswer === 'undefined';

            var DEFAULT_ANSWER_TEXT = '';
            var DEFAULT_WEIGHT = 0;
            if (isNewQuestion) {
                // Создаём новый объект ответа. Он будет добавлен в localStorage только тогда, когда пользователь
                // выберет какой-либо вариант ответа.
                var answer = {
                    id: currentQuestionId,
                    text: DEFAULT_ANSWER_TEXT,
                    weight: DEFAULT_WEIGHT
                };

                // Тем не менее, объект ответа необходимо иметь в промежуточном хранилище.
                humanRobotTestAnswers[idString] = answer;
            }
        }

        function setProgressLineValue() {

            vm.progressMade = PERCENTS_MULTIPLIER * numberOfAnswersGiven / questionsAmount;
        }

        function setHumanRobotBalance() {
            var humannessString = localStorage.getItem(balanceValueStorageName) || DEFAULT_BALANCE_VALUE;

            vm.humanness = Number(humannessString);
        }

        function calculateAndSaveHumanRobotBalance() {
            var answeredQuestionsIds = Object.keys(humanRobotTestAnswers);
            var firstAnswerId = Math.min.apply(null, answeredQuestionsIds);
            var weights = [];

            // Здесь неявно предполагается, что максимально возможный Id вопроса совпадает с числом вопросов.
            for (var answerIndex = firstAnswerId; answerIndex <= questionsAmount; answerIndex++) {
                // Нужно получить значение веса для определённого ответа, если он дан.
                // Если ответ на вопрос не дан, его вес равен 0.
                var answer = humanRobotTestAnswers[answerIndex];

                if (answer) {
                    weights.push(answer.weight);
                } else {
                    weights.push(0);
                }
            }

            var humanRobotFractions = humanRobotModel.getHumanRobotFractions(weights);
            var humanness = PERCENTS_MULTIPLIER * humanRobotFractions.human;
            localStorage.setItem(balanceValueStorageName, humanness.toString());
        }

        var TYPE_UNDEFINED = 'undefined';

        function goToNextQuestion() {
            $window.location.href = nextQuestionUrl;
        }

        function saveCurrentAnswerData(text, weight) {
            if (text) {
                humanRobotTestAnswers[currentQuestionId].text = text;
            }
            humanRobotTestAnswers[currentQuestionId].weight = weight;

            localStorage.setItem(answersStorageName, JSON.stringify(humanRobotTestAnswers));
        }

        // Так как вариантов ответа очень много, то обработчик клика добавляется к контейнеру,
        // содержащему все варианты ответа.
        // То, что элемент является ответом, определяется по наличию атрибута data-weight.
        function confirmAnswer(event) {
            var answerText = angular.element(event.target).data('text');
            var answerWeight = angular.element(event.target).data('weight');

            // Если у элемента, на который произошёл клик, есть аттрибут data-weight,
            // то это один из вариантов ответа.
            var isAnswer = typeof answerWeight !== TYPE_UNDEFINED;

            if (isAnswer) {
                saveCurrentAnswerData(answerText, answerWeight);
                calculateAndSaveHumanRobotBalance();
                goToNextQuestion();
            }
        }
    }
})();