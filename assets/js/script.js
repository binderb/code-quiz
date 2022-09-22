var high_scores = {
  "initials" : [],
  "scores" : []
}

var main_el = document.querySelector('main');
const ready_countdown_limit = 3;
const time_limit = 60;
var qid_array = [];
var ready_countdown_left;
var time_left;
var correct_count = 0;
var quiz_timer;

function initialize_ui () {
  // Add event listeners to the buttons that are hard-coded
  // into the page when it's loaded.
  document.querySelector('#header-restart').addEventListener('click', display_start_screen);
}

function display_start_screen () {
  // If the user returns here by clicking the "start over" button in the header,
  // need to clear the quiz timer to prevent errors.
  clearInterval(quiz_timer);
  // Wipe the main element and display instructions for the quiz.
  main_el.innerHTML = '';
  document.querySelector('header').classList.add('ui-hidden');
  const intro_text_el = document.createElement('section');
  intro_text_el.setAttribute('id','info')
  intro_text_el.innerHTML = "<h1>Code Quiz</h1>Try to answer the following code-related questions within the time limit. Keep in mind that incorrect answers will penalize your score/time by ten seconds!";
  const start_button_el = document.createElement('button');
  start_button_el.setAttribute('class','std-button');
  start_button_el.setAttribute('id','start-quiz');
  start_button_el.innerHTML = 'Start Quiz';
  main_el.appendChild(intro_text_el);
  main_el.appendChild(start_button_el);
  start_button_el.addEventListener("click",start_quiz_ready_countdown);
}

function start_quiz_ready_countdown () {
  // Extra feature to allow the user to prepare for the quiz.
  // Wipe the main element and display an animated countdown timer.
  main_el.innerHTML = "";
  // Clear any residual animations on the header elements
  // before showing them.
  document.querySelector('#time-left').setAttribute('style','animation-name: none');
  document.querySelector('header').classList.remove('ui-hidden');
  time_left = time_limit;
  document.querySelector('#time-left').textContent = time_left;
  document.querySelector('#time-bar').style.width = '100%';
  const countdown_el = document.createElement('div');
  countdown_el.setAttribute('id','ready-countdown');
  main_el.appendChild(countdown_el);
  ready_countdown_left = ready_countdown_limit;
  document.querySelector('#ready-countdown').textContent = ready_countdown_left;
  document.querySelector('#ready-countdown').setAttribute('style','animation-name: ready-countdown-flash');
  quiz_timer = setInterval(update_ready_countdown, 1000);
}

function start_quiz () {
  // To display the questions in random order, we can fill an
  // array with question id's and randomly shuffle it.
  qid_array = [];
  for (var i = 0; i < window.quiz_questions.length; i++) qid_array.push(i);
  shuffle(qid_array);
  correct_count = 0;
  display_question(qid_array.pop());
  quiz_timer = setInterval(update_timer,1000);
  shrink_time_bar();
}

function display_question (question_index) {
  main_el.innerHTML = "";
  var question_block = document.createElement('div');
  question_block.setAttribute('id','question-block');
  question_block.setAttribute('data-qid',question_index);
  main_el.appendChild(question_block);
  var question_prompt = document.createElement('div');
  question_prompt.setAttribute('id','question-prompt');
  question_prompt.textContent = window.quiz_questions[question_index].prompt;
  question_block.appendChild(question_prompt);
  // To display the answers in random order, we can fill an
  // array with question id's and randomly shuffle it.
  // Only do this if the question data object indicates that 
  // shuffling is ok.
  var aid_array = [];
  for (var i = 0; i < window.quiz_questions[question_index].answers.length; i++) aid_array.push(i);
  if (window.quiz_questions[question_index].shuffle) shuffle(aid_array);
  for (var i=0; i<aid_array.length; i++) {
    var question_answer_i = document.createElement('button');
    question_answer_i.setAttribute('class','question-answer');
    question_answer_i.setAttribute('id','answer_'+aid_array[i]);
    question_answer_i.textContent = window.quiz_questions[question_index].answers[aid_array[i]];
    question_block.appendChild(question_answer_i);
    question_answer_i.addEventListener('click', check_answer);
  }
}

function check_answer () {
  const question_id = parseInt(this.parentElement.getAttribute('data-qid'));
  const answer_id = parseInt(this.getAttribute('id').split('_')[1]);
  if (window.quiz_questions[question_id].correct == answer_id) {
    correct_count++;
    display_correct();
  } else {
    if (qid_array.length > 0) {
      time_left = time_left - 10;
      display_incorrect();
      if (time_left <= 0) {
        time_left = 0;
        finish_quiz('expired');
        return;
      }
    }
  }
  if (qid_array.length > 0) display_question(qid_array.pop());
  else finish_quiz("completed");
}

function display_correct () {
  const correct_card = document.createElement('div');
  correct_card.setAttribute('class','correct-card');
  correct_card.textContent = "Correct!";
  document.querySelector('header').appendChild(correct_card);
  setTimeout(function () {
    correct_card.remove();
  }, 300);
}

function display_incorrect () {
  document.querySelector('#time-bar').style.transitionDuration = '0s';
  document.querySelector('#time-left').setAttribute('style','animation-name: none');
  shrink_time_bar();
  // Need to force the DOM to recalculate in order to
  // get the abrupt shrinking of the time bar to work,
  // as well as the removal/adding of the pulse animation
  // to the time-left element.
  var x = main_el.offsetLeft;
  document.querySelector('#time-left').setAttribute('style','animation-name: incorrect-pulse');
  document.querySelector('#time-left').textContent = time_left;
  document.querySelector('#time-bar').style.transitionDuration = '1s';
}

function finish_quiz (status) {
  main_el.innerHTML = '';
  clearInterval(quiz_timer);
  document.querySelector('header').classList.add('ui-hidden');
  const info_text_el = document.createElement('section');
  info_text_el.setAttribute('id','info');
  const button_box = document.createElement('div');
  const score_button_el = document.createElement('button');
  score_button_el.setAttribute('class','std-button');
  score_button_el.setAttribute('id','submit-score');
  score_button_el.innerHTML = 'Submit Score';
  const restart_button_el = document.createElement('button');
  restart_button_el.setAttribute('class','std-button');
  restart_button_el.setAttribute('id','restart');
  restart_button_el.innerHTML = 'Restart';
  switch (status) {
    case "completed":
      info_text_el.innerHTML = '<h1>Quiz Completed!</h1>You finished the quiz before time ran out!<br/>You scored '+correct_count+'/'+window.quiz_questions.length+'<br/>with '+time_left+' seconds remaining!';
      break;
    case "expired":
      info_text_el.innerHTML = '<h1>Timer Expired!</h1>Time ran out before you had a chance to finish the quiz!<br/>You scored '+correct_count+'/'+window.quiz_questions.length+'<br/>before the timer expired.';
      break;
    default:
      break;
  }
  main_el.appendChild(info_text_el);
  button_box.appendChild(score_button_el);
  button_box.appendChild(restart_button_el);
  main_el.appendChild(button_box);
  score_button_el.addEventListener("click",display_hiscore_entry);
  restart_button_el.addEventListener("click",display_start_screen);
}

function display_hiscore_entry () {

}

function update_timer () {
  time_left--;
  if (time_left <= 0) {
    clearInterval(quiz_timer);
    time_left = 0;
    document.querySelector('#time-left').textContent = time_left;
    document.querySelector('#time-bar').style.width = '0%';
    finish_quiz("expired");
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
    const x = main_el.offsetLeft;
    document.querySelector('#ready-countdown').setAttribute('style','animation-name: ready-countdown-flash');


  }
}

function shrink_time_bar () {
  var time_percentage = (time_left-1) / time_limit * 100;
  document.querySelector('#time-bar').style.width = time_percentage+'%';
}

function shuffle (array) {
  for (var i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

initialize_ui();
display_start_screen();