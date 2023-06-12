let letters=document.querySelectorAll(".scoreboard-content");
let loadingBar=document.querySelector(".info-bar")
const ANSWER_LENGTH=5;
const ROUNDS=6;
let isLoaded=false;
let haveWon=false;
let darkMode=false;

async function init() {
        let currentGuess="";
        let currentRow=0;
        
        const response= await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
        const processedResponse=await response.json();
        const word=processedResponse.word.toUpperCase();
        const wordParts=word.split("");
        setLoaded(true)
        isLoaded=true;
        let done=false;
        
        function addLetter(letter) {
                if (currentGuess.length < ANSWER_LENGTH) {
                  currentGuess += letter;
                } else {
                  //replacing the last letter so it don't exceed answer limit.
                  currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
                }
                letters[currentRow*ANSWER_LENGTH + currentGuess.length-1].innerText= letter;
              }
        
        async function commit() {
                if(currentGuess.length!=ANSWER_LENGTH) {
                        //do nothing and end here, so return statement will be used.
                        return;
                }

                isLoaded=false;
                setLoaded(false);
                const res=await fetch("https://words.dev-apis.com/validate-word", {
                        method: "POST",
                        body: JSON.stringify({word:currentGuess})
                }); 
                
                const resObj= await res.json();
                const validWord=await resObj.validWord;
                //const {validWord}=resObj;
                isLoaded=true;
                setLoaded(true);

                if (!validWord) {
                        markInvalidWord();
                        return;
                }

                const guessParts=currentGuess.split("");
                const map=makeMap(wordParts);

                for (let i=0; i<ANSWER_LENGTH; i++) {
                        if(guessParts[i]===wordParts[i]) {
                                letters[currentRow * ANSWER_LENGTH + i].classList.add("right");
                                map[guessParts[i]]--;
                        }
                }
                //close
                for (let i=0; i<ANSWER_LENGTH; i++) {
                        if (guessParts[i]===wordParts[i]) {
                                // do nothing, we already did it.
                        } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]]>0) {
                                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                                map[guessParts[i]]--;
                        } else {
                                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
                        }
                }
                currentRow++;
                
                if(currentGuess===word) {
                        //you win
                        alert("You Win!");
                        document.querySelector("h1").classList.add("winner");
                        haveWon=true;
                        done=true;
                        return;
                } else if(currentRow===ROUNDS) {
                        alert(` You lose, the word was ${word} `);
                        done=true;
                }
                currentGuess="";
        }

        function backspace() {
                currentGuess = currentGuess.substring(0, currentGuess.length - 1);
                letters[currentRow*ANSWER_LENGTH + currentGuess.length].innerText= "";
        }

        function markInvalidWord() {
                // alert ("not a valid word");
                for (let i=0;i<ANSWER_LENGTH;i++) {
                letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

                setTimeout(function() {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");   
                }, 10);
                }
        }


        document.addEventListener("keydown", function handleKeyPress(event) {
                
                if(done || !isLoaded) {
                        //do nothing
                        return;
                }


                const action=event.key;

                if (action==="Enter") {
                        commit();
                } else if (action==="Backspace") {
                        backspace();
                } else if (isLetter(action)) {
                        addLetter(action.toUpperCase());
                } else {
                        //do nothing
                }
        });

        document.getElementById("enter-btn").addEventListener("click", function(){
                if(!haveWon) {
                        commit();
                }
                return;
        });

        document.getElementById("dark-btn").addEventListener("click", function() {
                if(!darkMode) {
                        for(let i=0; i<letters.length;i++) {
                                letters[i].classList.add("dark-scoreboard");
                        }
                        document.querySelector("body").classList.add("dark-body");
                        document.querySelector("h1").classList.add("dark-h1");
                        document.getElementById("dark-btn").innerText="Light";
                        darkMode=true;
                } else if(darkMode) {
                        for(let i=0; i<letters.length;i++) {
                                letters[i].classList.remove("dark-scoreboard");
                        }
                        document.querySelector("body").classList.remove("dark-body");
                        document.querySelector("h1").classList.remove("dark-h1");
                        document.getElementById("dark-btn").innerText="Dark";
                        darkMode=false;
                }
        });
                
}

function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
}

function setLoaded(isLoaded) {
        if(isLoaded) {
                loadingBar.classList.add('hidden');
        }
}

function makeMap(array) {
        const obj={};
        for (let i=0; i<array.length;i++) {
                const letter=array[i];
                if(obj[letter]) {
                        obj[letter]++;   
                } else {
                        obj[letter]=1;
                }
        }
        return obj;
}

init();

