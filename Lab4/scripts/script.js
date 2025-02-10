
class Dictionary {
    constructor(api) {
        this.ApiURL = api
        this.initEventListeners();

    }

    initEventListeners() {
        document.addEventListener("DOMContentLoaded", () => {
            const addbutton = document.getElementById("addBtn");
            const searchbutton = document.getElementById("searchBtn");

            if (addbutton) {
                addbutton.addEventListener("click", () => this.addWord());
            }

            if (searchbutton) {
                addbutton.addEventListener("click", () => this.searchWord());
            }
        });
    }

    async addWord() {
        const word = document.getElementById("word").value.trim();
        const definition = document.getElementById("definition").value.trim();
        const responseElement = document.getElementById("response");

        //input validation checking
        if (!word || !definition || !/^[a-zA-Z]+$/.test(word)) {
            responseElement.innerText = "invalid input";
            return;
        }


        try {
            const response = await fetch(this.ApiURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word, definition })
            });

            const data = await response.json()
            responseElement.innerText = data.message || "Error";

        } catch (errorType) {
            responseElement.innerText = error;
        }

    }

    async searchWord() {
        const word = document.getElementById("searchWord").value.trim();
        const resultElement = document.getElementById("searchResult");

        // Input validation
        if (!word || !/^[a-zA-Z]+$/.test(word)) {
            resultElement.innerText = "Invalid input. Please provide a valid word.";
            return;
        }

        try {
            // Send GET request to the server with the word in the query string
            const response = await fetch(`${this.ApiURL}?word=${word}`);

            // Parse the response data
            const data = await response.json();

            // Handle the response from the server
            if (response.ok) {
                // If the word exists, show the definition
                resultElement.innerText = `${data.word}: ${data.definition}`;
            } else {
                // If the word doesn't exist, show the error message
                resultElement.innerText = data.message || "Word not found!";
            }
        } catch (error) {
            // Handle any errors that occur during the fetch request
            resultElement.innerText = `Error: ${error.message}`;
        }
    }


}

// Initialize the dictionary object **outside the class** so it’s globally available
const dictionary = new Dictionary(`https://comp4537groupprojects.onrender.com/api/definitions`);

// Ensure that `dictionary` is available when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log('Dictionary instance is ready to be used!');
    console.log(`${window.location.origin}/api/definitions`);
});