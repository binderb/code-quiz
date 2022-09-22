
var main_el = document.querySelector('main');
const ready_countdown_limit = 3;
const time_limit = 60;
var qid_array = [];
var ready_countdown_left;
var time_left;
var correct_count = 0;
var quiz_timer;

// Add event listeners to the buttons that are hard-coded
// into the page when it's loaded.
function initialize_ui () {
  document.querySelector('#header-restart').addEventListener('click', display_start_screen);
  document.querySelector('#header-hiscores').addEventListener('click', display_hiscore_table);
}

// This function presents the first screen that the user will
// see and the one they will return to if taking the quiz again.
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

// Extra feature to allow the user to prepare for the quiz.
// Display an animated countdown timer before starting the quiz.
function start_quiz_ready_countdown () {
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

// Once the countdown is complete, initialize the order
// that questions will be displayed and start the quiz.
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

// Build the interface for a quiz question, including
// the prompt and the answer buttons.
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

// This function will be called whenever a user
// clicks one of the answer buttons on a question.
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

// Helper function to handle the visual elements
// indicating a correct answer was chosen.
function display_correct () {
  const correct_card = document.createElement('div');
  correct_card.setAttribute('class','correct-card');
  correct_card.textContent = "Correct!";
  document.querySelector('header').appendChild(correct_card);
  setTimeout(function () {
    correct_card.remove();
  }, 300);
}

// Helper function to handle the visual elements
// indicating an incorrect answer was chosen.
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

// When the user finishes the quiz or the timer expires,
// this function displays an end screen.
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

// If the user elects to submit their score, this function
// will display the entry screen. 
function display_hiscore_entry () {
  main_el.innerHTML = '';
  const info_text_el = document.createElement('section');
  info_text_el.setAttribute('id','info');
  info_text_el.innerHTML = '<h1>Submit Your Score</h1>You scored '+correct_count+'/'+window.quiz_questions.length+'<br/>with '+time_left+' seconds remaining.';
  const initial_form_el = document.createElement('form');
  initial_form_el.setAttribute('id','initial-form');
  const initial_form_label_el = document.createElement('div');
  initial_form_label_el.textContent = "Enter Initials:";
  const initial_form_field_el = document.createElement('input');
  initial_form_field_el.setAttribute('type','text');
  initial_form_field_el.setAttribute('id','initial-field');
  const initial_form_submit_el = document.createElement('button');
  initial_form_submit_el.setAttribute('type','submit');
  initial_form_submit_el.setAttribute('class','std-button');
  initial_form_submit_el.innerHTML = "Submit";
  const initial_form_validation_el = document.createElement('div');
  initial_form_validation_el.textContent = "Please type at least one character!";
  initial_form_validation_el.setAttribute('id','initial-validation-alert');
  initial_form_validation_el.classList.add('ui-hidden');
  initial_form_el.appendChild(initial_form_label_el);
  initial_form_el.appendChild(initial_form_field_el);
  initial_form_el.appendChild(initial_form_submit_el);
  initial_form_el.appendChild(initial_form_validation_el);
  main_el.appendChild(info_text_el);
  main_el.appendChild(initial_form_el);
  initial_form_el.addEventListener('submit',add_highscore);
  initial_form_field_el.focus();
}

function add_highscore (e) {
  e.preventDefault();
  if (document.querySelector('#initial-field').value.trim() === '') {
    document.querySelector('#initial-validation-alert').classList.remove('ui-hidden');
  } else {
    var new_score_item = {
      "initials" : document.querySelector('#initial-field').value,
      "correct" : correct_count,
      "time" : time_left
    }
    var hiscores;
    if (localStorage.getItem('hiscores')) {
      hiscores = JSON.parse(localStorage.getItem('hiscores'));
      hiscores.push(new_score_item);
    } else hiscores = [new_score_item];
    localStorage.setItem("hiscores",JSON.stringify(hiscores));
    display_hiscore_table();
  }
}

function display_hiscore_table () {
  main_el.innerHTML = '';
  // If the user visits the table from within a quiz session,
  // their quiz timer needs to be cleared and the header hidden.
  clearInterval(quiz_timer);
  document.querySelector('header').classList.add('ui-hidden');
  const info_text_el = document.createElement('section');
  info_text_el.setAttribute('id','info');
  info_text_el.innerHTML = '<h1>High Scores</h1>';
  main_el.appendChild(info_text_el);
  if (localStorage.getItem('hiscores')) {
    // If there is data in the 'hiscores' item in LocalStorage,
    // use it to generate a table of high scores.
    var hiscores = JSON.parse(localStorage.getItem('hiscores'));
    // Sort the high scores first by number correct,
    // and then by the amount of time left.
    hiscores.sort(function (a,b) {
      if (a.correct > b.correct) return -1;
      if (b.correct > a.correct) return 1;
      if (a.time > b.time) return -1;
      if (b.time > a.time) return 1;
    });
    const score_table = document.createElement('table');
    score_table.setAttribute('id','hiscore-table');
    const score_thead = document.createElement('thead');
    var thead_content = '';
    thead_content += '<tr>';
    thead_content += '<th>Rank</th>';
    thead_content += '<th>Initials</th>';
    thead_content += '<th>Score</th>';
    thead_content += '<th>Time</th>';
    thead_content += '</tr>';
    score_thead.innerHTML = thead_content;
    score_table.appendChild(score_thead);
    const score_tbody = document.createElement('tbody');
    var tbody_content = '';
    for (var i=0; i < hiscores.length; i++) {
      tbody_content += '<tr>';
      tbody_content += '<td>' + (i+1) + '</td>';
      tbody_content += '<td>' + hiscores[i].initials + '</td>';
      tbody_content += '<td>' + hiscores[i].correct + '</td>';
      tbody_content += '<td>' + hiscores[i].time + '</td>';
      tbody_content += '</tr>';
    }
    score_tbody.innerHTML = tbody_content;
    score_table.appendChild(score_tbody);
    main_el.appendChild(score_table);
  } else {
    info_text_el.innerHTML = '<h1>High Scores</h1>No scores to display yet.';
  }
  const button_box = document.createElement('div');
  button_box.setAttribute('id','button-box');
  const clear_button_el = document.createElement('button');
  clear_button_el.setAttribute('class','std-button');
  clear_button_el.setAttribute('id','clear-hiscores');
  clear_button_el.innerHTML = 'Clear High Scores';
  const return_button_el = document.createElement('button');
  return_button_el.setAttribute('class','std-button');
  return_button_el.setAttribute('id','return-to-start');
  return_button_el.innerHTML = 'Return to Start';
  button_box.appendChild(clear_button_el);
  button_box.appendChild(return_button_el);
  main_el.appendChild(button_box);
  clear_button_el.addEventListener('click',clear_hiscores);
  return_button_el.addEventListener('click',display_start_screen);
}

function clear_hiscores () {
  if (localStorage.getItem('hiscores')) {
    localStorage.removeItem('hiscores');
  }
  display_hiscore_table();
}


// Interval function to handle the
// main quiz countdown timer.
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

// Interval function to handle the pre-quiz
// countdown timer.
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

// Helper function to calculate and apply the appropriate
// length to the time bar element.
function shrink_time_bar () {
  var time_percentage = (time_left-1) / time_limit * 100;
  document.querySelector('#time-bar').style.width = time_percentage+'%';
}

// Helper function to randomize the order of
// an array, used for shuffling questions and answers.
function shuffle (array) {
  for (var i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

initialize_ui();
display_start_screen();