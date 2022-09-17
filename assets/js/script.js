var high_scores = {
  "initials" : [],
  "scores" : []
}

var main_el = document.querySelector('main');
const ready_countdown_limit = 3;
const time_limit = 60;
var ready_countdown_left;
var time_left;
var quiz_timer;

function display_start_screen () {
  document.querySelector('header').classList.add('ui-hidden');
  var intro_text_el = document.createElement('section');
  intro_text_el.setAttribute('id','instructions')
  intro_text_el.innerHTML = "<h1>Code Quiz</h1>Try to answer the following code-related questions within the time limit. Keep in mind that incorrect answers will penalize your score/time by ten seconds!";
  var start_button_el = document.createElement('button');
  start_button_el.setAttribute('class','std-button');
  start_button_el.setAttribute('id','start-quiz');
  start_button_el.innerHTML = 'Start Quiz';
  main_el.appendChild(intro_text_el);
  main_el.appendChild(start_button_el);
  start_button_el.addEventListener("click",start_quiz_ready_countdown);
}

function start_quiz_ready_countdown () {
  main_el.innerHTML = "";
  document.querySelector('header').classList.remove('ui-hidden');
  time_left = time_limit;
  document.querySelector('#time-left').textContent = time_left;
  document.querySelector('#time-bar').setAttribute('style','width: 100%;');
  var countdown_el = document.createElement('div');
  countdown_el.setAttribute('id','ready-countdown');
  main_el.appendChild(countdown_el);
  ready_countdown_left = ready_countdown_limit;
  document.querySelector('#ready-countdown').textContent = ready_countdown_left;
  document.querySelector('#ready-countdown').setAttribute('style','animation-name: ready-countdown-flash');
  quiz_timer = setInterval(update_ready_countdown, 1000);
}

function start_quiz () {
  display_question(0);
  quiz_timer = setInterval(update_timer,1000);
  shrink_time_bar();
}

function display_question (question_index) {
  main_el.innerHTML = "";
  var question_block = document.createElement('div');
  question_block.setAttribute('id','question-block_'+question_index);
  main_el.appendChild(question_block);
  var question_prompt = document.createElement('div');
  question_prompt.setAttribute('id','question-prompt');
  question_prompt.textContent = window.quiz_questions[question_index].prompt;
  question_block.appendChild(question_prompt);
  for (var i=0; i<quiz_questions[question_index].answers.length; i++) {
    var question_answer_i = document.createElement('button');
    question_answer_i.setAttribute('class','question-answer');
    question_answer_i.setAttribute('id','answer_'+i);
    question_answer_i.textContent = window.quiz_questions[question_index].answers[i];
    question_block.appendChild(question_answer_i);
  }


}

function update_timer () {
  time_left--;
  if (time_left <= 0) {
    clearInterval(quiz_timer);
    time_left = 0;
    document.querySelector('#time-left').textContent = time_left;
    document.querySelector('#time-bar').setAttribute('style','width: 0%;');

    // end session
  } else {
    document.querySelector('#time-left').textContent = time_left;
    shrink_time_bar();
  }
}

function update_ready_countdown () {
  ready_countdown_left--;
  if (ready_countdown_left <= 0) {
    clearInterval(quiz_timer);
    document.querySelector('#ready-countdown').remove();
    start_quiz();
  } else {
    document.querySelector('#ready-countdown').textContent = ready_countdown_left;
    document.querySelector('#ready-countdown').setAttribute('style','animation-name: none');
    // Need to force the DOM to recalculate in order to
    // get this animation to play again after being removed/added again.
    var x = main_el.offsetLeft;
    document.querySelector('#ready-countdown').setAttribute('style','animation-name: ready-countdown-flash');


  }
}

function shrink_time_bar () {
  var time_percentage = (time_left-1) / time_limit * 100;
  document.querySelector('#time-bar').setAttribute('style','width: '+time_percentage+'%;');
}

display_start_screen();