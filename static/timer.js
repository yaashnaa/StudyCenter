let workTittle = document.getElementById('work');
let breakTittle = document.getElementById('break');

let workTime = 25;
let breakTime = 5;

let seconds = "00";
let breakCount = 0;

// Declare global interval IDs
let timerInterval;
let breakInterval;

// Declare initial values
let initialWorkTime;
let initialBreakTime;

// display
window.onload = () => {
    // Store initial values when the page loads

  
    document.getElementById('minutes').innerHTML = workTime;
    document.getElementById('seconds').innerHTML = seconds;
    initialWorkTime = workTime;
    initialBreakTime = breakTime;
    workTittle.classList.add('active');
}


// Function to update the display
function updateDisplay(minutes, seconds) {
  document.getElementById('minutes').innerHTML = minutes;
  document.getElementById('seconds').innerHTML = seconds;
}
function start() {
    workTittle.classList.add('active');
    // Clear existing intervals
    clearInterval(timerInterval);
    clearInterval(breakInterval);
  
    // Change button
    workTime = parseInt(document.getElementById('workTimeInput').value);
    let breakTime = parseInt(document.getElementById('breakTimeInput').value);

    document.getElementById('start').style.display = "none";
    document.getElementById('reset').style.display = "block";
  
    // Change the time
    seconds = 59;
  
    let workMinutes = workTime - 1;
    let breakMinutes = breakTime - 1;
  
    breakCount = 0;
  
    // Countdown
    timerInterval = setInterval(() => {
      // Change the display
      updateDisplay(workMinutes, seconds);
  
      // Start
      if (workMinutes === 0 && seconds === 0) {
        startBreak(breakMinutes);
        workTittle.classList.remove('active');
        breakTittle.classList.add('active');
        breakCount++;
      } else {
        seconds = seconds - 1;
        if (seconds < 0 && workMinutes > 0) {
          workMinutes = workMinutes - 1;
          seconds = 59;
        }
      }
    }, 100); // 1000 = 1s
}



function startBreak(breakMinutes) {
    // Display the initial break time

    updateDisplay(breakMinutes, "00");

    breakInterval = setInterval(() => {
        // Change the display
        updateDisplay(breakMinutes, seconds);
        console.log(breakMinutes) + "***";

        // Start
        if (breakMinutes === 0 && seconds === 0) {
            start()
            // clearInterval(breakInterval);
            // You might want to add additional logic here for what happens after the break
        } else {
            seconds = seconds - 1;
            if (seconds < 0 && breakMinutes > 0) {
                breakMinutes = breakMinutes - 1;
                seconds = 59;
            }
        }
    }, 1000); // 1000 = 1s
}



  
  function resetTimer() {
    // Clear existing intervals
    clearInterval(timerInterval);
    clearInterval(breakInterval);
  
    // Reset the display
    workTittle.classList.add('active');
    updateDisplay(workTime, "00");
  
    // Reset the timer variables to initial values
    workCount = 0;
    seconds = "00";
  
    // Display the start button
    document.getElementById('start').style.display = "block";
    document.getElementById('reset').style.display = "none";
}
