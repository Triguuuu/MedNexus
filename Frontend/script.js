const searchBtn = document.querySelector(".search-box button");
const searchInput = document.querySelector(".search-box input");

// Search click
searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();

    if (query === "") {
        alert("Please enter something!");
        return;
    }

    fetch(`http://localhost:3000/search?name=${query}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);

            if (data.length === 0) {
                alert("No hospitals found");
            } else {
                displayResults(data);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Server error");
        });
});

// Display results
function displayResults(data) {
    let html = "";

    data.forEach(h => {
        html += `
            <div class="card">
                <h3>${h.name}</h3>
                <p>City: ${h.city}</p>
                <p>Beds: ${h.beds}</p>
                <p>Doctors: ${h.doctors}</p>
            </div>
        `;
    });

    document.querySelector(".features").innerHTML = html;
}

// Enter key support
searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});