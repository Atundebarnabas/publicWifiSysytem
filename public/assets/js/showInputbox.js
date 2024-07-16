// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP
// REDUNDANT CODING HERE!!!!! ------- CLEAN IT UP

  import { handleSubmit } from '../js/modules/formHandler.js';

  document.addEventListener('DOMContentLoaded', function() {

    let inputBoxes = document.querySelectorAll('.input_field input');

    // inputboxes[0] -- loginId input box
    // inputboxes[1] -- passkey input box
    for(let i=0; i<inputBoxes.length; i++)
    {
      inputBoxes[i].addEventListener('keypress', function() {

        // console.log("Next Sibling: ", nextSibling); // Debugging statement
        if(inputBoxes[i].value.length >= 5)
        {
          showNextSibling(i);
        }
      });

      inputBoxes[i].addEventListener('input', function() {
        // if(inputBoxes[0].value === "")
        // {
        //   let pwdBodParent = inputBoxes[1].parentElement;
        //   pwdBodParent.classList.remove("active");
        // }
        if(inputBoxes[i].value.length >= 5)
        {
          showNextSibling(i);
        }

        let previousIndex = i - 1;
        let nextIndex = i + 1;


        if(inputBoxes[i].value.length < 5)
        {
          let elementParent = inputBoxes[i].parentElement;
          let nextElementSibling = elementParent.nextElementSibling;
          // console.log(nextElementSibling);
          nextElementSibling.classList.remove("active");
        }

        if(inputBoxes[i].value.length < 5)
        {
          let elementParent, nextElementSibling;
          elementParent = inputBoxes[i].parentElement;
          nextElementSibling = elementParent.nextElementSibling;
          nextElementSibling.classList.remove("active");
        }

      });
      inputBoxes[i].addEventListener('keypress', function(e) {
        if(e.keyCode === 13)
        {
          e.preventDefault();
          let nextIndex = i + 1; // Move focus to the next input field
          if(nextIndex < inputBoxes.length && inputBoxes[i].value.length >= 5)
          {
            inputBoxes[nextIndex].focus(); // Focus on the next input field
            console.log("Nextty: ", inputBoxes[nextIndex]);
          }
          else if (inputBoxes[i].value.length < 5)
          {
            let elementParent, nextElementSibling;
            elementParent = (inputBoxes[i] === inputBoxes[0]) ? inputBoxes[i+1].parentElement : document.activeElement.parentElement; // Check the input box, which of them to show either
            nextElementSibling = elementParent.nextElementSibling;
            console.log("Nextlu: ", nextElementSibling);
            nextElementSibling.classList.remove("active");
          }
          else // Last field, submit the form
          {
            if(inputBoxes[i].value.length >= 5)
            {
              inputBoxes[i].blur(); // Remove focus from the current input field
              handleSubmit(e); // Call the submit handler
            }
            else
            {
              let elementParent, nextElementSibling;
              elementParent = (inputBoxes[i] === inputBoxes[0]) ? inputBoxes[i+1].parentElement : document.activeElement.parentElement; // Check the input box, which of them to show either
              nextElementSibling = elementParent.nextElementSibling;
              // console.log("Next: ", nextElementSibling);
              nextElementSibling.classList.remove("active");
            }
          }
        }
      })

      inputBoxes[i].addEventListener('input', function() {
        if(inputBoxes[i].value.length < 5)
        {
          let elementParent, nextElementSibling;
          elementParent = (inputBoxes[i] === inputBoxes[0]) ? inputBoxes[i+1].parentElement : document.activeElement.parentElement; // Check the input box, which of them to show either
          nextElementSibling = elementParent.nextElementSibling;
          console.log("Next: ", nextElementSibling);
          nextElementSibling.classList.remove("active");
        }
      });
    }

    function showNextSibling(index) {
      let activeElement = inputBoxes[index];
      let activeElementParent = activeElement.parentElement;
  
      let nextSibling = activeElementParent.nextElementSibling;
      if (nextSibling) {
        nextSibling.classList.add('active');
      }
  
      if (index === 0) {
        if (inputBoxes[index + 1] && inputBoxes[index + 1].value !== "") {
          let nextElementParent = inputBoxes[index + 1].parentElement;
          let next2Sibling = nextElementParent.nextElementSibling;
          if (next2Sibling) {
            next2Sibling.classList.add('active');
          }
        }
      }
    }
  

  })

